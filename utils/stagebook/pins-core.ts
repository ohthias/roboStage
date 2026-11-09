import "server-only";

import { and, asc, desc, eq, inArray, isNull, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, quickbrickNotebooks, tests, thinklab, userPins } from "@/db/schema";
import { creatorScopeWhere, isOwnedByScope } from "./permissions";
import type { StagebookScope } from "./scope";
import { pinHref, type PinCandidate, type PinDTO, type PinKind } from "@/types/pins";

/**
 * Leitura dos itens fixados e busca de candidatos. Cada tipo de item vira uma
 * "fonte" com a mesma forma (id, título, ícone, dono, atualização) para que o
 * resto do código não precise saber de que tabela o item vem.
 */

type Row = {
  id: string;
  title: string;
  icon: string | null;
  userId: string | null;
  teamId: string | null;
  updatedAt: Date;
};

type Source = {
  /** Busca linhas por id (sem filtro de escopo; o chamador confere o dono). */
  byIds(ids: string[]): Promise<Row[]>;
  /** Itens do espaço, mais recentes primeiro, filtrando pelo título. */
  search(scope: StagebookScope, q: string, limit: number): Promise<Row[]>;
};

const like = (column: AnyColumn, q: string): SQL | undefined =>
  q ? sql`${column} ilike ${`%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`}` : undefined;

const SOURCES: Record<PinKind, Source> = {
  labtest: {
    byIds: (ids) =>
      db
        .select({ id: tests.id, title: tests.name, icon: sql<null>`null`, userId: tests.userId, teamId: tests.teamId, updatedAt: tests.updatedAt })
        .from(tests)
        .where(inArray(tests.id, ids)),
    search: (scope, q, limit) =>
      db
        .select({ id: tests.id, title: tests.name, icon: sql<null>`null`, userId: tests.userId, teamId: tests.teamId, updatedAt: tests.updatedAt })
        .from(tests)
        .where(and(creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId }), like(tests.name, q)))
        .orderBy(desc(tests.updatedAt))
        .limit(limit),
  },
  thinklab: {
    byIds: (ids) =>
      db
        .select({ id: thinklab.id, title: thinklab.name, icon: sql<null>`null`, userId: thinklab.userId, teamId: thinklab.teamId, updatedAt: thinklab.updatedAt })
        .from(thinklab)
        .where(inArray(thinklab.id, ids)),
    search: (scope, q, limit) =>
      db
        .select({ id: thinklab.id, title: thinklab.name, icon: sql<null>`null`, userId: thinklab.userId, teamId: thinklab.teamId, updatedAt: thinklab.updatedAt })
        .from(thinklab)
        .where(and(creatorScopeWhere(scope, { userId: thinklab.userId, teamId: thinklab.teamId }), like(thinklab.name, q)))
        .orderBy(desc(thinklab.updatedAt))
        .limit(limit),
  },
  quickbrick: {
    byIds: (ids) =>
      db
        .select({ id: quickbrickNotebooks.id, title: quickbrickNotebooks.name, icon: sql<null>`null`, userId: quickbrickNotebooks.userId, teamId: quickbrickNotebooks.teamId, updatedAt: quickbrickNotebooks.updatedAt })
        .from(quickbrickNotebooks)
        .where(inArray(quickbrickNotebooks.id, ids)),
    search: (scope, q, limit) =>
      db
        .select({ id: quickbrickNotebooks.id, title: quickbrickNotebooks.name, icon: sql<null>`null`, userId: quickbrickNotebooks.userId, teamId: quickbrickNotebooks.teamId, updatedAt: quickbrickNotebooks.updatedAt })
        .from(quickbrickNotebooks)
        .where(
          and(
            creatorScopeWhere(scope, { userId: quickbrickNotebooks.userId, teamId: quickbrickNotebooks.teamId }),
            like(quickbrickNotebooks.name, q),
          ),
        )
        .orderBy(desc(quickbrickNotebooks.updatedAt))
        .limit(limit),
  },
  stagebook: {
    // Páginas: pessoal = user_id; equipe = team_id (user_id null). Lixeira não conta.
    byIds: (ids) =>
      db
        .select({ id: documents.id, title: documents.title, icon: documents.icon, userId: documents.userId, teamId: documents.teamId, updatedAt: documents.updatedAt })
        .from(documents)
        .where(and(inArray(documents.id, ids), isNull(documents.deletedAt))),
    search: (scope, q, limit) =>
      db
        .select({ id: documents.id, title: documents.title, icon: documents.icon, userId: documents.userId, teamId: documents.teamId, updatedAt: documents.updatedAt })
        .from(documents)
        .where(
          and(
            scope.type === "personal"
              ? and(eq(documents.userId, scope.userId), isNull(documents.teamId))
              : eq(documents.teamId, scope.teamId),
            isNull(documents.deletedAt),
            like(documents.title, q),
          ),
        )
        .orderBy(desc(documents.updatedAt))
        .limit(limit),
  },
};

/** Dono do item, se ele existir (para validar antes de fixar). */
export async function pinTarget(kind: PinKind, id: string): Promise<Row | null> {
  const [row] = await SOURCES[kind].byIds([id]);
  return row ?? null;
}

export function pinSpaceWhere(scope: StagebookScope) {
  return and(
    eq(userPins.userId, scope.userId),
    scope.type === "team" ? eq(userPins.teamId, scope.teamId) : isNull(userPins.teamId),
  );
}

/**
 * Fixados do espaço ativo, na ordem escolhida. Itens excluídos (ou que não
 * pertencem mais ao espaço) são removidos da lista — e do banco.
 */
export async function getPinsForScope(scope: StagebookScope): Promise<PinDTO[]> {
  const pins = await db
    .select()
    .from(userPins)
    .where(pinSpaceWhere(scope))
    .orderBy(asc(userPins.position), asc(userPins.createdAt));
  if (pins.length === 0) return [];

  const byKind = new Map<PinKind, string[]>();
  for (const p of pins) {
    const kind = p.kind as PinKind;
    if (!SOURCES[kind]) continue;
    byKind.set(kind, [...(byKind.get(kind) ?? []), p.resourceId]);
  }
  const found = new Map<string, Row>();
  await Promise.all(
    [...byKind.entries()].map(async ([kind, ids]) => {
      for (const row of await SOURCES[kind].byIds(ids)) found.set(`${kind}:${row.id}`, row);
    }),
  );

  const out: PinDTO[] = [];
  const stale: string[] = [];
  for (const p of pins) {
    const kind = p.kind as PinKind;
    const row = found.get(`${kind}:${p.resourceId}`);
    if (!row || !isOwnedByScope(scope, row)) {
      stale.push(p.id);
      continue;
    }
    out.push({
      id: p.id,
      kind,
      resourceId: row.id,
      title: row.title || "Sem título",
      icon: row.icon,
      href: pinHref(kind, row.id),
    });
  }
  if (stale.length) await db.delete(userPins).where(inArray(userPins.id, stale));
  return out;
}

/** Itens do espaço que podem ser fixados (até `perKind` de cada tipo). */
export async function searchPinCandidates(
  scope: StagebookScope,
  { q = "", kinds, perKind = 6 }: { q?: string; kinds: PinKind[]; perKind?: number },
): Promise<PinCandidate[]> {
  const query = q.trim().slice(0, 80);
  const pinned = new Set(
    (await db.select({ kind: userPins.kind, id: userPins.resourceId }).from(userPins).where(pinSpaceWhere(scope))).map(
      (p) => `${p.kind}:${p.id}`,
    ),
  );
  const lists = await Promise.all(
    kinds.map(async (kind) =>
      (await SOURCES[kind].search(scope, query, perKind)).map(
        (row): PinCandidate => ({
          kind,
          id: row.id,
          title: row.title || "Sem título",
          icon: row.icon,
          href: pinHref(kind, row.id),
          updatedAt: row.updatedAt.toISOString(),
          pinned: pinned.has(`${kind}:${row.id}`),
        }),
      ),
    ),
  );
  return lists.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
