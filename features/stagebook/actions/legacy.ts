"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { teamLegacyChapters, teamLegacyItems, teamMembers } from "@/db/schema";
import { runAction, type ActionResult } from "@/lib/action-result";
import { requireCapability } from "../lib/permissions";
import { requireTeamAccess, StagebookAuthError, type TeamScope } from "../lib/scope";
import { recordTeamActivity } from "../lib/team-activity";
import { canDeleteResource } from "../lib/team-permissions";
import { chapterLeague, getTeamLegacy, legacyItemTarget, legacyItemValues, legacySource, legacySuggestions } from "../lib/legacy-core";
import { ValidationError, optionalText, requireText, requireUuid } from "../lib/validation";
import {
  LEGACY_ITEM_KINDS,
  LEGACY_LIMITS,
  isHexColor,
  isIsoDate,
  isLegacyChapterKind,
  isLegacyItemKind,
  isLegacyLeague,
  isLegacyStage,
  legacyItemHref,
  normalizeLegacyContent,
  seasonPreset,
  type LegacyCandidateDTO,
  type LegacyChapterDTO,
  type LegacyChapterKind,
  type LegacyContent,
  type LegacyItemKind,
} from "@/features/stagebook/types/legacy";

/**
 * Legado da equipe: abas por temporada e competição com o que foi feito.
 *
 * Regras (mesma ideia das ferramentas da equipe):
 *  - qualquer membro cria abas, escreve nelas e guarda/remove itens;
 *  - excluir uma aba: quem criou, ou técnico/mentor;
 *  - só itens DA EQUIPE podem ser guardados (o que estiver no pessoal precisa
 *    ser transferido antes — ver `actions/transfer.ts`);
 *  - competição pode ficar dentro de uma temporada da mesma equipe.
 */

type ChapterInput = {
  kind?: string;
  title?: string;
  parentId?: string | null;
  seasonKey?: string | null;
  league?: string | null;
  stage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  color?: string | null;
  content?: unknown;
};

function refresh(teamId: string) {
  revalidatePath(`/dashboard/team/${teamId}`);
}

async function memberScope(teamId: string): Promise<TeamScope> {
  const scope = await requireTeamAccess(teamId);
  requireCapability(scope, "tool.create");
  return scope;
}

async function loadChapter(scope: TeamScope, id: unknown) {
  const chapterId = requireUuid(id, "aba do legado");
  const [row] = await db
    .select()
    .from(teamLegacyChapters)
    .where(and(eq(teamLegacyChapters.id, chapterId), eq(teamLegacyChapters.teamId, scope.teamId)))
    .limit(1);
  if (!row) throw new ValidationError("Essa aba do legado não existe (ou não é desta equipe).");
  return row;
}

const optionalDate = (value: unknown, label: string): string | null => {
  if (value === null || value === undefined || value === "") return null;
  if (!isIsoDate(value)) throw new ValidationError(`Data inválida em ${label}.`);
  return value;
};

/** Valida um pai (só temporadas desta equipe). */
async function resolveParent(scope: TeamScope, kind: LegacyChapterKind, value: unknown, selfId?: string): Promise<string | null> {
  if (value === null || value === undefined || value === "") return null;
  if (kind !== "competition") throw new ValidationError("Só uma competição pode ficar dentro de uma temporada.");
  const id = requireUuid(value, "temporada");
  if (id === selfId) throw new ValidationError("Uma aba não pode ficar dentro dela mesma.");
  const parent = await loadChapter(scope, id);
  if (parent.kind !== "season") throw new ValidationError("Uma competição só pode ficar dentro de uma temporada.");
  return parent.id;
}

/** Quem participou: só quem é (ou já foi, se já estava guardado) membro. */
async function cleanMembers(scope: TeamScope, content: LegacyContent, previous: LegacyContent | null): Promise<LegacyContent> {
  if (!content.members?.length) return content;
  const kept = new Set(previous?.members ?? []);
  const asked = content.members.filter((id) => !kept.has(id));
  const valid = asked.length
    ? new Set(
        (
          await db
            .select({ userId: teamMembers.userId })
            .from(teamMembers)
            .where(and(eq(teamMembers.teamId, scope.teamId), inArray(teamMembers.userId, asked)))
        ).map((m) => m.userId),
      )
    : new Set<string>();
  const members = content.members.filter((id) => kept.has(id) || valid.has(id));
  const out = { ...content };
  if (members.length) out.members = members;
  else delete out.members;
  return out;
}

function parseLeague(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (!isLegacyLeague(value)) throw new ValidationError("Liga inválida.");
  return value;
}

function parseStage(kind: LegacyChapterKind, value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (kind !== "competition") throw new ValidationError("Só competições têm etapa.");
  if (!isLegacyStage(value)) throw new ValidationError("Etapa inválida.");
  return value;
}

function checkDates(start: string | null, end: string | null) {
  if (start && end && start > end) throw new ValidationError("A data de fim vem antes da data de início.");
  if (end && !start) throw new ValidationError("Informe a data de início antes da data de fim.");
}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

export async function listTeamLegacy(teamId: string): Promise<ActionResult<LegacyChapterDTO[]>> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    return getTeamLegacy(scope.teamId);
  });
}

// ---------------------------------------------------------------------------
// Abas
// ---------------------------------------------------------------------------

export async function createLegacyChapter(teamId: string, input: ChapterInput): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const scope = await memberScope(teamId);
    if (!isLegacyChapterKind(input.kind)) throw new ValidationError("Escolha se é uma temporada ou uma competição.");
    const kind = input.kind;
    const preset = kind === "season" ? seasonPreset(input.seasonKey) : null;
    const title = requireText(input.title ?? preset?.title ?? "", "o nome da aba", { maxLength: LEGACY_LIMITS.title });
    const startDate = optionalDate(input.startDate ?? preset?.start, "início");
    const endDate = optionalDate(input.endDate ?? preset?.end, "fim");
    checkDates(startDate, endDate);
    const parentId = await resolveParent(scope, kind, input.parentId);
    // Liga: a escolhida, a do preset, ou (competição) a da temporada-mãe.
    let league = parseLeague(input.league) ?? preset?.league ?? null;
    if (!league && parentId) {
      const [parent] = await db.select().from(teamLegacyChapters).where(eq(teamLegacyChapters.id, parentId)).limit(1);
      league = chapterLeague(parent);
    }
    const stage = parseStage(kind, input.stage);
    const color = input.color ? (isHexColor(input.color) ? input.color.toLowerCase() : null) : null;
    if (input.color && !color) throw new ValidationError("Cor inválida.");

    const clash = await db
      .select({ id: teamLegacyChapters.id })
      .from(teamLegacyChapters)
      .where(and(eq(teamLegacyChapters.teamId, scope.teamId), sql`lower(trim(${teamLegacyChapters.title})) = ${title.toLowerCase()}`))
      .limit(1);
    if (clash.length) throw new ValidationError("Já existe uma aba com esse nome no legado da equipe.");

    const content = await cleanMembers(scope, normalizeLegacyContent(input.content), null);
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${teamLegacyChapters.position}), 0) + 1` })
      .from(teamLegacyChapters)
      .where(eq(teamLegacyChapters.teamId, scope.teamId));

    const [created] = await db
      .insert(teamLegacyChapters)
      .values({
        teamId: scope.teamId,
        kind,
        parentId,
        title,
        seasonKey: kind === "season" ? (seasonPreset(input.seasonKey)?.key ?? null) : null,
        league,
        stage,
        startDate,
        endDate,
        location: optionalText(input.location, LEGACY_LIMITS.location),
        color,
        content,
        position: Number(next),
        createdBy: scope.userId,
        updatedBy: scope.userId,
      })
      .returning({ id: teamLegacyChapters.id });

    await recordTeamActivity({
      teamId: scope.teamId,
      actorId: scope.userId,
      verb: "legacy.chapter_created",
      entityType: "legacy_chapter",
      entityId: created.id,
      data: { name: title, kind },
    });
    refresh(scope.teamId);
    return created;
  });
}

export async function updateLegacyChapter(teamId: string, chapterId: string, patch: ChapterInput): Promise<ActionResult<{ updatedAt: string }>> {
  return runAction(async () => {
    const scope = await memberScope(teamId);
    const chapter = await loadChapter(scope, chapterId);
    const kind = chapter.kind as LegacyChapterKind;
    const values: Partial<typeof teamLegacyChapters.$inferInsert> = { updatedBy: scope.userId, updatedAt: new Date() };

    if (patch.title !== undefined) {
      const title = requireText(patch.title, "o nome da aba", { maxLength: LEGACY_LIMITS.title });
      const clash = await db
        .select({ id: teamLegacyChapters.id })
        .from(teamLegacyChapters)
        .where(
          and(
            eq(teamLegacyChapters.teamId, scope.teamId),
            sql`lower(trim(${teamLegacyChapters.title})) = ${title.toLowerCase()}`,
            sql`${teamLegacyChapters.id} <> ${chapter.id}`,
          ),
        )
        .limit(1);
      if (clash.length) throw new ValidationError("Já existe uma aba com esse nome no legado da equipe.");
      values.title = title;
    }
    const start = patch.startDate !== undefined ? optionalDate(patch.startDate, "início") : chapter.startDate;
    const end = patch.endDate !== undefined ? optionalDate(patch.endDate, "fim") : chapter.endDate;
    if (patch.startDate !== undefined || patch.endDate !== undefined) {
      checkDates(start, end);
      values.startDate = start;
      values.endDate = end;
    }
    if (patch.parentId !== undefined) values.parentId = await resolveParent(scope, kind, patch.parentId, chapter.id);
    if (patch.seasonKey !== undefined) values.seasonKey = kind === "season" ? (seasonPreset(patch.seasonKey)?.key ?? null) : null;
    if (patch.league !== undefined) values.league = parseLeague(patch.league);
    if (patch.stage !== undefined) values.stage = parseStage(kind, patch.stage);
    if (patch.location !== undefined) values.location = optionalText(patch.location, LEGACY_LIMITS.location);
    if (patch.color !== undefined) {
      if (patch.color && !isHexColor(patch.color)) throw new ValidationError("Cor inválida.");
      values.color = patch.color ? patch.color.toLowerCase() : null;
    }
    if (patch.content !== undefined) {
      values.content = await cleanMembers(scope, normalizeLegacyContent(patch.content), normalizeLegacyContent(chapter.content));
    }

    const [row] = await db
      .update(teamLegacyChapters)
      .set(values)
      .where(and(eq(teamLegacyChapters.id, chapter.id), eq(teamLegacyChapters.teamId, scope.teamId)))
      .returning({ updatedAt: teamLegacyChapters.updatedAt });
    refresh(scope.teamId);
    return { updatedAt: row.updatedAt.toISOString() };
  });
}

export async function deleteLegacyChapter(teamId: string, chapterId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    const chapter = await loadChapter(scope, chapterId);
    if (!canDeleteResource(scope.role, chapter.createdBy, scope.userId)) {
      throw new StagebookAuthError("Só quem criou a aba, técnicos e mentores podem excluí-la.");
    }
    // Itens guardados caem em cascata (os arquivos continuam nas ferramentas);
    // competições dentro da temporada viram "outras competições" (set null).
    await db.delete(teamLegacyChapters).where(and(eq(teamLegacyChapters.id, chapter.id), eq(teamLegacyChapters.teamId, scope.teamId)));
    refresh(scope.teamId);
  });
}

// ---------------------------------------------------------------------------
// Itens guardados (sincronizados com as ferramentas)
// ---------------------------------------------------------------------------

export async function searchLegacyCandidates(
  teamId: string,
  chapterId: string,
  input: { q?: string; kind?: string | null } = {},
): Promise<ActionResult<LegacyCandidateDTO[]>> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    const chapter = await loadChapter(scope, chapterId);
    const kinds: LegacyItemKind[] = isLegacyItemKind(input.kind) ? [input.kind] : [...LEGACY_ITEM_KINDS];
    const q = typeof input.q === "string" ? input.q.trim().slice(0, 80) : "";
    const existing = await db.select().from(teamLegacyItems).where(eq(teamLegacyItems.chapterId, chapter.id));
    const lists = await Promise.all(
      kinds.map(async (kind) => {
        const exclude = existing.flatMap((l) => {
          const t = legacyItemTarget(l);
          return t?.kind === kind ? [t.id] : [];
        });
        return (await legacySource(kind).search(scope.teamId, q, kinds.length === 1 ? 30 : 8, exclude)).map(
          (row): LegacyCandidateDTO => ({ kind, id: row.id, title: row.title, icon: row.icon, href: legacyItemHref(kind, row.id, scope.teamId), reason: row.meta ?? undefined, date: row.date }),
        );
      }),
    );
    return lists.flat().sort((a, b) => b.date.localeCompare(a.date));
  });
}

export async function getLegacySuggestions(teamId: string, chapterId: string): Promise<ActionResult<LegacyCandidateDTO[]>> {
  return runAction(async () => {
    const scope = await requireTeamAccess(teamId);
    const chapter = await loadChapter(scope, chapterId);
    const parent = chapter.parentId ? await loadChapter(scope, chapter.parentId).catch(() => null) : null;
    return legacySuggestions(scope.teamId, { ...chapter, league: chapterLeague(chapter, parent ? [parent] : []) });
  });
}

export async function addLegacyItems(
  teamId: string,
  chapterId: string,
  items: { kind: string; id: string }[],
): Promise<ActionResult<{ added: number }>> {
  return runAction(async () => {
    const scope = await memberScope(teamId);
    const chapter = await loadChapter(scope, chapterId);
    if (!Array.isArray(items) || !items.length) throw new ValidationError("Escolha ao menos um item.");
    if (items.length > LEGACY_LIMITS.items) throw new ValidationError(`Guarde no máximo ${LEGACY_LIMITS.items} itens de uma vez.`);

    const refs = items.map((item) => {
      if (!item || !isLegacyItemKind(item.kind)) throw new ValidationError("Tipo de item inválido.");
      return { kind: item.kind, id: requireUuid(item.id, "item") };
    });

    // Todos precisam ser da equipe (o que estiver no pessoal: transferir antes).
    const byKind = new Map<LegacyItemKind, string[]>();
    for (const r of refs) byKind.set(r.kind, [...new Set([...(byKind.get(r.kind) ?? []), r.id])]);
    for (const [kind, ids] of byKind) {
      const found = new Set((await legacySource(kind).byIds(scope.teamId, ids)).map((r) => r.id));
      if (ids.some((id) => !found.has(id))) {
        throw new ValidationError("Só dá para guardar no legado itens que são da equipe. Transfira do seu espaço pessoal antes.");
      }
    }

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(teamLegacyItems)
      .where(eq(teamLegacyItems.chapterId, chapter.id));
    const [{ maxPos }] = await db
      .select({ maxPos: sql<number>`coalesce(max(${teamLegacyItems.position}), 0)` })
      .from(teamLegacyItems)
      .where(eq(teamLegacyItems.chapterId, chapter.id));
    let position = Number(maxPos);

    let added = 0;
    for (const [kind, ids] of byKind) {
      for (const id of ids) {
        if (Number(total) + added >= LEGACY_LIMITS.items) {
          throw new ValidationError(`Cada aba guarda até ${LEGACY_LIMITS.items} itens.`);
        }
        const inserted = await db
          .insert(teamLegacyItems)
          .values({ chapterId: chapter.id, ...legacyItemValues(kind, id), position: ++position, createdBy: scope.userId })
          .onConflictDoNothing()
          .returning({ id: teamLegacyItems.id });
        added += inserted.length;
      }
    }

    if (added) {
      await db.update(teamLegacyChapters).set({ updatedAt: new Date(), updatedBy: scope.userId }).where(eq(teamLegacyChapters.id, chapter.id));
      await recordTeamActivity({
        teamId: scope.teamId,
        actorId: scope.userId,
        verb: "legacy.items_added",
        entityType: "legacy_chapter",
        entityId: chapter.id,
        data: { name: chapter.title, count: added },
      });
    }
    refresh(scope.teamId);
    return { added };
  });
}

export async function removeLegacyItem(teamId: string, chapterId: string, itemId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await memberScope(teamId);
    const chapter = await loadChapter(scope, chapterId);
    const id = requireUuid(itemId, "item");
    const removed = await db
      .delete(teamLegacyItems)
      .where(and(eq(teamLegacyItems.id, id), eq(teamLegacyItems.chapterId, chapter.id)))
      .returning({ id: teamLegacyItems.id });
    if (!removed.length) throw new ValidationError("Esse item não está nesta aba.");
    refresh(scope.teamId);
  });
}

export async function updateLegacyItemNote(teamId: string, chapterId: string, itemId: string, note: string | null): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await memberScope(teamId);
    const chapter = await loadChapter(scope, chapterId);
    const id = requireUuid(itemId, "item");
    const updated = await db
      .update(teamLegacyItems)
      .set({ note: optionalText(note, LEGACY_LIMITS.note) })
      .where(and(eq(teamLegacyItems.id, id), eq(teamLegacyItems.chapterId, chapter.id)))
      .returning({ id: teamLegacyItems.id });
    if (!updated.length) throw new ValidationError("Esse item não está nesta aba.");
    refresh(scope.teamId);
  });
}
