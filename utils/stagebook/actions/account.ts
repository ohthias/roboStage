"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, inArray, isNull } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import {
  boards,
  calendarEvents,
  documents,
  folders,
  milestones,
  notifications,
  tags,
  teamMembers,
  teams,
  tests,
  thinklab,
  users,
} from "@/db/schema";
import { requireAuthenticatedUser } from "../scope";
import { runAction, type ActionResult } from "../action-result";
import { PERSONA_META, PERSONA_TYPES, type PersonaType } from "../persona";
import { ValidationError, requireOneOf } from "../validation";
import { CLEANUP_CATEGORIES, type CleanupCategory, type CleanupResult } from "../cleanup-categories";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

/** Equipes em que o usuário é técnico (`owner`), com quantas pessoas elas têm. */
async function ownedTeams(userId: string) {
  const owned = await db
    .select({ id: teams.id, name: teams.name, clerkOrgId: teams.clerkOrgId })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.role, "owner")));

  return Promise.all(
    owned.map(async (team) => {
      const [{ value }] = await db
        .select({ value: count() })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));
      return { ...team, members: value };
    }),
  );
}

// ---------------------------------------------------------------------------
// Tipo de conta
// ---------------------------------------------------------------------------

/**
 * Troca o tipo de conta entre os quatro perfis. Regra: competidor não cria
 * equipes, então quem ainda é técnico de alguma equipe não vira competidor —
 * senão teria uma equipe que a regra do perfil não permitiria ter criado.
 */
export async function updatePersonaType(persona: PersonaType): Promise<ActionResult<PersonaType>> {
  return runAction(async () => {
    const userId = await requireAuthenticatedUser();
    const next = requireOneOf(persona, PERSONA_TYPES, "Tipo de conta");

    if (next === "competidor") {
      const owned = await ownedTeams(userId);
      if (owned.length > 0) {
        throw new ValidationError(
          `Você é técnico em ${owned.length} equipe${owned.length > 1 ? "s" : ""} (${owned
            .map((t) => t.name)
            .join(", ")}). ${PERSONA_META.competidor.label} não cria equipes: passe o cargo de técnico para outra pessoa ou exclua a equipe antes de trocar.`,
        );
      }
    }

    await db.update(users).set({ personaType: next, updatedAt: new Date() }).where(eq(users.id, userId));
    refresh();
    return next;
  });
}

// ---------------------------------------------------------------------------
// Limpeza de dados
// ---------------------------------------------------------------------------

const CLEANUP_CONFIRMATION = "limpar";

/**
 * Apaga dados do ESPAÇO PESSOAL do usuário, por categoria, sem excluir a
 * conta. Nunca toca em conteúdo de equipe: aquilo é da equipe, mesmo quando
 * foi o usuário que criou. Tudo numa transação — ou apaga tudo ou nada.
 */
export async function clearPersonalData(input: {
  categories: CleanupCategory[];
  confirmation: string;
}): Promise<ActionResult<CleanupResult>> {
  return runAction(async () => {
    const userId = await requireAuthenticatedUser();

    if (!Array.isArray(input.categories) || input.categories.length === 0) {
      throw new ValidationError("Escolha ao menos uma categoria para limpar.");
    }
    const categories = [
      ...new Set(input.categories.map((c) => requireOneOf(c, CLEANUP_CATEGORIES, "Categoria"))),
    ];
    if (String(input.confirmation ?? "").trim().toLowerCase() !== CLEANUP_CONFIRMATION) {
      throw new ValidationError(`Digite “${CLEANUP_CONFIRMATION}” para confirmar.`);
    }

    const result: CleanupResult = {};
    const wants = (c: CleanupCategory) => categories.includes(c);

    await db.transaction(async (tx) => {
      if (wants("documents")) {
        const docs = await tx
          .delete(documents)
          .where(and(eq(documents.userId, userId), isNull(documents.teamId)))
          .returning({ id: documents.id });
        const dirs = await tx
          .delete(folders)
          .where(and(eq(folders.userId, userId), isNull(folders.teamId)))
          .returning({ id: folders.id });
        result.documents = docs.length + dirs.length;
      }
      if (wants("kanban")) {
        // Colunas, cards e vínculos caem em cascata.
        result.kanban = (
          await tx
            .delete(boards)
            .where(and(eq(boards.userId, userId), isNull(boards.teamId)))
            .returning({ id: boards.id })
        ).length;
      }
      if (wants("thinklab")) {
        result.thinklab = (
          await tx
            .delete(thinklab)
            .where(and(eq(thinklab.userId, userId), isNull(thinklab.teamId)))
            .returning({ id: thinklab.id })
        ).length;
      }
      if (wants("tests")) {
        // Execuções e valores caem em cascata.
        result.tests = (
          await tx
            .delete(tests)
            .where(and(eq(tests.userId, userId), isNull(tests.teamId)))
            .returning({ id: tests.id })
        ).length;
      }
      if (wants("calendar")) {
        result.calendar = (
          await tx
            .delete(calendarEvents)
            .where(and(eq(calendarEvents.userId, userId), isNull(calendarEvents.teamId)))
            .returning({ id: calendarEvents.id })
        ).length;
      }
      if (wants("labels")) {
        const t = await tx.delete(tags).where(and(eq(tags.userId, userId), isNull(tags.teamId))).returning({ id: tags.id });
        const m = await tx
          .delete(milestones)
          .where(and(eq(milestones.userId, userId), isNull(milestones.teamId)))
          .returning({ id: milestones.id });
        result.labels = t.length + m.length;
      }
      if (wants("notifications")) {
        result.notifications = (
          await tx.delete(notifications).where(eq(notifications.userId, userId)).returning({ id: notifications.id })
        ).length;
      }
    });

    refresh();
    return result;
  });
}

// ---------------------------------------------------------------------------
// Exclusão da conta
// ---------------------------------------------------------------------------

/** Equipes que impedem a exclusão: o usuário é técnico e há outras pessoas nelas. */
export async function getAccountDeletionBlockers(): Promise<{ id: string; name: string; members: number }[]> {
  const userId = await requireAuthenticatedUser();
  return (await ownedTeams(userId))
    .filter((t) => t.members > 1)
    .map(({ id, name, members }) => ({ id, name, members }));
}

/**
 * Exclui a conta no servidor (em vez de `user.delete()` no navegador) para
 * validar antes: técnico de equipe com outros membros não pode sumir e deixar
 * a equipe sem responsável. Equipes em que ele é o único membro são excluídas
 * junto — inclusive a Organização no Clerk, que ficaria órfã.
 */
export async function deleteMyAccount(confirmation: string): Promise<ActionResult> {
  return runAction(async () => {
    const userId = await requireAuthenticatedUser();

    if (String(confirmation ?? "").trim().toLowerCase() !== "excluir") {
      throw new ValidationError("Digite “excluir” para confirmar.");
    }

    const owned = await ownedTeams(userId);
    const blockers = owned.filter((t) => t.members > 1);
    if (blockers.length > 0) {
      throw new ValidationError(
        `Você ainda é técnico de ${blockers.map((t) => t.name).join(", ")}, que tem outros membros. Passe o cargo de técnico para outra pessoa ou exclua a equipe antes.`,
      );
    }

    const client = await clerkClient();
    const soloTeams = owned.filter((t) => t.members <= 1);
    for (const team of soloTeams) {
      if (team.clerkOrgId) await client.organizations.deleteOrganization(team.clerkOrgId).catch(() => {});
    }
    if (soloTeams.length) {
      await db.delete(teams).where(inArray(teams.id, soloTeams.map((t) => t.id)));
    }

    await client.users.deleteUser(userId);
    // O webhook user.deleted também faz isto; fazemos aqui para não depender da entrega.
    await db.delete(users).where(eq(users.id, userId));
  });
}
