"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { journalEntries, journalEntryLinks, journalTemplates } from "@/db/schema";
import {
  JOURNAL_LINK_KINDS,
  JOURNAL_MAX_LINKS,
  JOURNAL_LIMITS,
  JOURNAL_TEMPLATE_ICONS,
  findBuiltinTemplate,
  isIsoDate,
  journalToPlainText,
  normalizeJournalContent,
  templateFromContent,
  type JournalLink,
  type JournalLinkKind,
  type JournalLinkTarget,
  type JournalTemplateIcon,
} from "@/features/stagebook/types/journal";
import { requireMilestoneInScope } from "../lib/labels-core";
import { listJournalLinks } from "../lib/journal-queries";
import { searchWorkspaceItems, workspaceItemsByIds } from "../lib/pins-core";
import { runAction } from "@/lib/action-result";
import { scopeWhere } from "../lib/permissions";
import { resolveStagebookScope, scopeOwnership, StagebookAuthError, type StagebookScope } from "../lib/scope";
import { recordTeamActivity } from "../lib/team-activity";
import { canDeleteResource } from "../lib/team-permissions";
import { ValidationError, optionalText, requireOneOf, requireText, requireUuid } from "../lib/validation";

/**
 * Diário. Opera sempre no espaço ATIVO (cookie), como Kanban e StageBook:
 *  - pessoal: só a própria pessoa vê e escreve;
 *  - equipe: todos os membros leem as entradas de todos; cada um edita só as
 *    suas; excluir é do autor ou de técnico/mentor (`tool.delete.any`).
 */

const PATH = "/dashboard/diario";

const entryScope = (scope: StagebookScope) =>
  scopeWhere(scope, { userId: journalEntries.userId, teamId: journalEntries.teamId });
const templateScope = (scope: StagebookScope) =>
  scopeWhere(scope, { userId: journalTemplates.userId, teamId: journalTemplates.teamId });

function requireDate(value: unknown): string {
  if (!isIsoDate(value)) throw new ValidationError("Data inválida.");
  const year = Number(value.slice(0, 4));
  if (year < 2000 || year > 2100) throw new ValidationError("Data fora do intervalo permitido.");
  return value;
}

const cleanTitle = (value: unknown) => optionalText(typeof value === "string" ? value.replace(/\s+/g, " ") : value, JOURNAL_LIMITS.title);

/** Template de origem: chave de um pronto ou uuid de um salvo NESTE espaço. */
async function resolveTemplateKey(scope: StagebookScope, key: unknown): Promise<string | null> {
  if (typeof key !== "string" || !key) return null;
  if (findBuiltinTemplate(key)) return key;
  if (!/^[0-9a-f-]{36}$/i.test(key)) return null;
  const [row] = await db
    .select({ id: journalTemplates.id })
    .from(journalTemplates)
    .where(and(eq(journalTemplates.id, key), templateScope(scope)))
    .limit(1);
  return row?.id ?? null;
}

/** Carrega uma entrada do espaço atual e confere se quem pede é o autor. */
async function loadOwnEntry(scope: StagebookScope, id: string) {
  const [row] = await db
    .select({ id: journalEntries.id, authorId: journalEntries.authorId, entryDate: journalEntries.entryDate, title: journalEntries.title, content: journalEntries.content })
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), entryScope(scope)))
    .limit(1);
  if (!row) throw new StagebookAuthError("Entrada não encontrada neste espaço.");
  if (row.authorId !== scope.userId) {
    throw new StagebookAuthError("Só quem escreveu pode editar esta entrada.");
  }
  return row;
}

export type JournalEntryInput = {
  entryDate: string;
  title?: string | null;
  templateKey?: string | null;
  /** Marco (meta) do espaço, ex.: ao abrir "Registrar no diário" a partir de uma meta. */
  milestoneId?: string | null;
  content: unknown;
};

/** Cria uma entrada (o editor só chama na primeira alteração, para não sobrar entrada vazia). */
export async function createJournalEntry(input: JournalEntryInput) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const entryDate = requireDate(input?.entryDate);
    const title = cleanTitle(input?.title);
    const content = normalizeJournalContent(input?.content);
    const templateKey = await resolveTemplateKey(scope, input?.templateKey);
    const milestoneId = input?.milestoneId
      ? (await requireMilestoneInScope(scope, requireUuid(input.milestoneId, "marco"))).id
      : null;

    const [created] = await db
      .insert(journalEntries)
      .values({
        ...scopeOwnership(scope),
        authorId: scope.userId,
        entryDate,
        title,
        templateKey,
        milestoneId,
        content,
        searchText: journalToPlainText({ title, entryDate, content }),
      })
      .returning({ id: journalEntries.id, updatedAt: journalEntries.updatedAt });

    if (scope.type === "team") {
      await recordTeamActivity({
        teamId: scope.teamId,
        actorId: scope.userId,
        verb: "journal.created",
        entityType: "journal",
        entityId: created.id,
        data: { name: title, entryDate, milestoneId },
        aggregate: false,
      });
    }

    revalidatePath(PATH);
    return { id: created.id, updatedAt: created.updatedAt.toISOString() };
  });
}

export type JournalEntryPatch = {
  entryDate?: string;
  title?: string | null;
  content?: unknown;
};

/** Salva alterações (autosave do editor). Só o autor. */
export async function updateJournalEntry(id: string, patch: JournalEntryPatch) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const entryId = requireUuid(id, "entrada");
    const current = await loadOwnEntry(scope, entryId);

    const entryDate = patch?.entryDate !== undefined ? requireDate(patch.entryDate) : current.entryDate;
    const title = patch?.title !== undefined ? cleanTitle(patch.title) : current.title;
    const content = patch?.content !== undefined ? normalizeJournalContent(patch.content) : normalizeJournalContent(current.content);

    const [saved] = await db
      .update(journalEntries)
      .set({
        entryDate,
        title,
        content,
        searchText: journalToPlainText({ title, entryDate, content }),
        updatedAt: new Date(),
      })
      .where(and(eq(journalEntries.id, entryId), entryScope(scope), eq(journalEntries.authorId, scope.userId)))
      .returning({ updatedAt: journalEntries.updatedAt });

    if (patch?.entryDate !== undefined && entryDate !== current.entryDate) revalidatePath(PATH);
    return { updatedAt: saved.updatedAt.toISOString(), entryDate };
  });
}

/** Exclui uma entrada: o autor, ou técnico/mentor no espaço da equipe. */
export async function deleteJournalEntry(id: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const entryId = requireUuid(id, "entrada");
    const [row] = await db
      .select({ authorId: journalEntries.authorId })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), entryScope(scope)))
      .limit(1);
    if (!row) throw new StagebookAuthError("Entrada não encontrada neste espaço.");

    const allowed =
      scope.type === "personal" ? row.authorId === scope.userId : canDeleteResource(scope.role, row.authorId, scope.userId);
    if (!allowed) {
      throw new StagebookAuthError("Só quem escreveu, ou técnicos e mentores, podem excluir esta entrada.");
    }

    await db.delete(journalEntries).where(and(eq(journalEntries.id, entryId), entryScope(scope)));
    revalidatePath(PATH);
  });
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export type JournalTemplateInput = {
  id?: string | null;
  name: string;
  description?: string | null;
  icon?: string | null;
  content: unknown;
};

/**
 * Cria (ou, com `id`, atualiza) um template do espaço atual. O conteúdo vira
 * esqueleto: títulos, dicas, categorias e as tarefas fixas, sem o que foi
 * escrito no dia.
 */
export async function saveJournalTemplate(input: JournalTemplateInput) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const name = requireText(input?.name, "o nome do template", { maxLength: JOURNAL_LIMITS.templateName });
    const description = optionalText(input?.description, JOURNAL_LIMITS.templateDescription);
    const icon: JournalTemplateIcon = (JOURNAL_TEMPLATE_ICONS as readonly string[]).includes(input?.icon ?? "")
      ? (input.icon as JournalTemplateIcon)
      : "NotebookPen";
    const content = templateFromContent(normalizeJournalContent(input?.content));
    if (content.sections.length === 0) throw new ValidationError("O template precisa de ao menos uma seção.");

    if (input?.id) {
      const id = requireUuid(input.id, "template");
      const [row] = await db
        .select({ createdBy: journalTemplates.createdBy })
        .from(journalTemplates)
        .where(and(eq(journalTemplates.id, id), templateScope(scope)))
        .limit(1);
      if (!row) throw new StagebookAuthError("Template não encontrado neste espaço.");
      if (scope.type === "team" && !canDeleteResource(scope.role, row.createdBy, scope.userId)) {
        throw new StagebookAuthError("Só quem criou, ou técnicos e mentores, podem alterar este template.");
      }
      await db
        .update(journalTemplates)
        .set({ name, description, icon, content, updatedAt: new Date() })
        .where(and(eq(journalTemplates.id, id), templateScope(scope)));
      revalidatePath(PATH, "layout");
      return { id };
    }

    const [created] = await db
      .insert(journalTemplates)
      .values({ ...scopeOwnership(scope), name, description, icon, content, createdBy: scope.userId })
      .returning({ id: journalTemplates.id });
    revalidatePath(PATH, "layout");
    return { id: created.id };
  });
}

export async function deleteJournalTemplate(id: string) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const templateId = requireUuid(id, "template");
    const [row] = await db
      .select({ createdBy: journalTemplates.createdBy })
      .from(journalTemplates)
      .where(and(eq(journalTemplates.id, templateId), templateScope(scope)))
      .limit(1);
    if (!row) throw new StagebookAuthError("Template não encontrado neste espaço.");
    if (scope.type === "team" && !canDeleteResource(scope.role, row.createdBy, scope.userId)) {
      throw new StagebookAuthError("Só quem criou, ou técnicos e mentores, podem excluir este template.");
    }
    await db.delete(journalTemplates).where(and(eq(journalTemplates.id, templateId), templateScope(scope)));
    revalidatePath(PATH, "layout");
  });
}

// ---------------------------------------------------------------------------
// Vínculos com StageBook, LabTest, QuickBrick e ThinkLab
// ---------------------------------------------------------------------------

const LINK_COLUMN = {
  stagebook: "documentId",
  labtest: "testId",
  quickbrick: "quickbrickId",
  thinklab: "thinklabId",
} as const satisfies Record<JournalLinkKind, keyof typeof journalEntryLinks.$inferInsert>;

/** Itens do espaço atual que podem ser vinculados (busca pelo título). */
export async function searchJournalLinkTargets(input: { q?: string; kind?: string | null }) {
  return runAction(async (): Promise<JournalLinkTarget[]> => {
    const scope = await resolveStagebookScope();
    const kinds = input?.kind ? [requireOneOf(input.kind, JOURNAL_LINK_KINDS, "Tipo de item")] : [...JOURNAL_LINK_KINDS];
    const items = await searchWorkspaceItems(scope, {
      q: typeof input?.q === "string" ? input.q : "",
      kinds,
      perKind: kinds.length === 1 ? 20 : 6,
    });
    return items.map(({ kind, id, title, icon, href, updatedAt }) => ({ kind, id, title, icon, href, updatedAt }));
  });
}

/** Vincula um item (do MESMO espaço) à entrada. Só o autor. Devolve os vínculos atuais. */
export async function addJournalLink(entryId: string, kind: string, resourceId: string) {
  return runAction(async (): Promise<JournalLink[]> => {
    const scope = await resolveStagebookScope();
    const id = requireUuid(entryId, "entrada");
    await loadOwnEntry(scope, id);
    const linkKind = requireOneOf(kind, JOURNAL_LINK_KINDS, "Tipo de item");
    const targetId = requireUuid(resourceId, "item");

    const [target] = await workspaceItemsByIds(scope, linkKind, [targetId]);
    if (!target) throw new ValidationError("Item não encontrado neste espaço.");

    const current = await listJournalLinks(scope, id);
    if (current.some((l) => l.kind === linkKind && l.id === targetId)) return current;
    if (current.length >= JOURNAL_MAX_LINKS) {
      throw new ValidationError(`Uma entrada pode ter no máximo ${JOURNAL_MAX_LINKS} vínculos.`);
    }

    await db
      .insert(journalEntryLinks)
      .values({ entryId: id, [LINK_COLUMN[linkKind]]: targetId, createdBy: scope.userId })
      .onConflictDoNothing();
    return listJournalLinks(scope, id);
  });
}

export async function removeJournalLink(entryId: string, linkId: string) {
  return runAction(async (): Promise<JournalLink[]> => {
    const scope = await resolveStagebookScope();
    const id = requireUuid(entryId, "entrada");
    await loadOwnEntry(scope, id);
    await db
      .delete(journalEntryLinks)
      .where(and(eq(journalEntryLinks.id, requireUuid(linkId, "vínculo")), eq(journalEntryLinks.entryId, id)));
    return listJournalLinks(scope, id);
  });
}
