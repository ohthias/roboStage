"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  leagues,
  userLeagueInterests,
} from "@/db/schema";
import { supportsQuickbrick } from "@/utils/stagebook/league-features";
import { resolveStagebookScope, type StagebookScope } from "@/utils/stagebook/scope";
import { creatorScopeWhere, requireRole } from "@/utils/stagebook/permissions";
import { runAction, type ActionResult } from "@/utils/stagebook/action-result";
import {
  ValidationError,
  optionalDate,
  optionalText,
  requireText,
  requireUuid,
} from "@/utils/stagebook/validation";
import { milestonesForResources, tagsForResources } from "@/utils/stagebook/labels-core";
import {
  deleteObject,
  deleteObjects,
  headObject,
  isR2Configured,
  presignDownload,
  presignUpload,
} from "@/utils/quickbrick/r2";
import {
  COVER_COLORS,
  DIAGRAM_META,
  NOTEBOOK_MAX_PHOTOS,
  NOTEBOOK_SEASONS,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  STUDIO_MAX_BYTES,
  isDiagramKind,
  summarizeDiagram,
  type DiagramKind,
  type NotebookCardDTO,
  type NotebookDTO,
  type NotebookDiagramDTO,
  type NotebookLeagueDTO,
  type NotebookPhotoDTO,
  type QuickbrickLeague,
} from "@/utils/quickbrick/notebook";
import { quickbrickDiagrams, quickbrickNotebooks, quickbrickPhotos } from "@/db/schema/quickbrick";

/**
 * QuickBrick Studio — caderno do robô.
 *
 * Mesmo modelo de escopo do ThinkLab/LabTest: `userId` guarda o criador e
 * `teamId` (opcional) define o espaço da equipe. Toda leitura/escrita passa
 * por `creatorScopeWhere`, então itens de outro espaço nunca vazam.
 *
 * Integração com as competições: todo caderno pertence a uma liga que o
 * usuário acompanha em "Ligas e Competições". Só ligas com o recurso
 * `quickbrick` liberado (hoje, a FLL Challenge) permitem criar cadernos e
 * diagramas — ver `utils/stagebook/league-features.ts`.
 */

const MAX_DIAGRAMS = 30;
const BASE = "/dashboard/quickbrick";

type NotebookRow = typeof quickbrickNotebooks.$inferSelect;

const notebookScope = (scope: StagebookScope) =>
  creatorScopeWhere(scope, { userId: quickbrickNotebooks.userId, teamId: quickbrickNotebooks.teamId });

async function requireNotebook(scope: StagebookScope, id: string): Promise<NotebookRow> {
  requireUuid(id, "caderno");
  const [row] = await db
    .select()
    .from(quickbrickNotebooks)
    .where(and(eq(quickbrickNotebooks.id, id), notebookScope(scope)))
    .limit(1);
  if (!row) throw new ValidationError("Caderno não encontrado.");
  return row;
}

async function touch(id: string) {
  await db.update(quickbrickNotebooks).set({ updatedAt: new Date() }).where(eq(quickbrickNotebooks.id, id));
}

function refresh(id?: string) {
  revalidatePath(BASE);
  if (id) revalidatePath(`${BASE}/${id}`);
}

function parseSeason(value: unknown) {
  if (!value) return null;
  return NOTEBOOK_SEASONS.some((s) => s.id === value) ? String(value) : null;
}

function parseColor(value: unknown) {
  return typeof value === "string" && (COVER_COLORS as readonly string[]).includes(value) ? value : COVER_COLORS[0];
}

function requireR2() {
  if (!isR2Configured()) {
    throw new ValidationError("O armazenamento de arquivos ainda não foi configurado neste servidor.");
  }
}

const iso = (d: Date | string) => new Date(d).toISOString();

// ---------------------------------------------------------------------------
// Competições
// ---------------------------------------------------------------------------

/** Ligas que o usuário acompanha, marcando quais têm o QuickBrick liberado. */
export async function listQuickbrickLeagues(): Promise<QuickbrickLeague[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select({
      id: leagues.id,
      code: leagues.code,
      name: leagues.name,
      relation: userLeagueInterests.relationType,
      season: userLeagueInterests.season,
    })
    .from(userLeagueInterests)
    .innerJoin(leagues, eq(leagues.id, userLeagueInterests.leagueId))
    .where(eq(userLeagueInterests.userId, scope.userId))
    .orderBy(asc(leagues.code));
  return rows
    .map((r) => ({ ...r, supported: supportsQuickbrick(r) }))
    .sort((a, b) => Number(b.supported) - Number(a.supported));
}

/**
 * Valida a liga escolhida para um caderno: precisa existir, estar entre as
 * competições do usuário e ter o QuickBrick liberado.
 */
async function requireSupportedLeague(scope: StagebookScope, leagueId: unknown) {
  if (!leagueId) throw new ValidationError("Escolha a competição do caderno.");
  const id = requireUuid(leagueId, "competição");
  const [row] = await db
    .select({ id: leagues.id, code: leagues.code, name: leagues.name })
    .from(userLeagueInterests)
    .innerJoin(leagues, eq(leagues.id, userLeagueInterests.leagueId))
    .where(and(eq(userLeagueInterests.userId, scope.userId), eq(userLeagueInterests.leagueId, id)))
    .limit(1);
  if (!row) {
    throw new ValidationError("Adicione esta competição em Ligas e Competições antes de criar o caderno.");
  }
  if (!supportsQuickbrick(row)) {
    throw new ValidationError(`O QuickBrick Studio ainda não tem suporte para ${row.code}. Por enquanto só a FLL.`);
  }
  return row;
}

/** Liga de cada caderno (por id), já com a marca de suporte. */
async function leaguesById(ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((v): v is string => Boolean(v)))];
  if (!unique.length) return new Map<string, NonNullable<NotebookLeagueDTO>>();
  const rows = await db
    .select({ id: leagues.id, code: leagues.code, name: leagues.name })
    .from(leagues)
    .where(inArray(leagues.id, unique));
  return new Map(rows.map((r) => [r.id, { ...r, supported: supportsQuickbrick(r) }]));
}

/** Bloqueia escrita de conteúdo em cadernos de liga sem suporte. */
async function requireNotebookSupported(row: NotebookRow) {
  const league = (await leaguesById([row.leagueId])).get(row.leagueId ?? "");
  if (!league) throw new ValidationError("Defina a competição do caderno em “Editar” para continuar.");
  if (!league.supported) {
    throw new ValidationError(`O QuickBrick Studio ainda não tem suporte para ${league.code}.`);
  }
}

function toNotebookDTO(
  row: NotebookRow,
  extras: Pick<NotebookDTO, "tags" | "milestone" | "league">,
): NotebookDTO {
  return {
    id: row.id,
    name: row.name,
    robotName: row.robotName,
    description: row.description,
    season: row.season,
    coverColor: row.coverColor,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    studio:
      row.studioKey && row.studioFileName
        ? {
            fileName: row.studioFileName,
            size: row.studioSize ?? 0,
            uploadedAt: iso(row.studioUploadedAt ?? row.updatedAt),
          }
        : null,
    ...extras,
  };
}

async function toPhotoDTO(row: typeof quickbrickPhotos.$inferSelect): Promise<NotebookPhotoDTO> {
  return {
    id: row.id,
    url: isR2Configured() ? await presignDownload(row.objectKey, { fileName: row.fileName }) : "",
    fileName: row.fileName,
    contentType: row.contentType,
    size: row.size,
    title: row.title,
    notes: row.notes,
    takenAt: iso(row.takenAt),
    createdAt: iso(row.createdAt),
  };
}

// ---------------------------------------------------------------------------
// Cadernos
// ---------------------------------------------------------------------------

export async function listNotebooks(): Promise<NotebookCardDTO[]> {
  const scope = await resolveStagebookScope();
  const rows = await db
    .select()
    .from(quickbrickNotebooks)
    .where(notebookScope(scope))
    .orderBy(desc(quickbrickNotebooks.updatedAt));
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [leagueMap, tagMap, milestoneMap, photoStats, diagramStats, covers] = await Promise.all([
    leaguesById(rows.map((r) => r.leagueId)),
    tagsForResources("quickbrick", ids),
    milestonesForResources("quickbrick", ids),
    db
      .select({ id: quickbrickPhotos.notebookId, n: sql<number>`count(*)::int` })
      .from(quickbrickPhotos)
      .where(inArray(quickbrickPhotos.notebookId, ids))
      .groupBy(quickbrickPhotos.notebookId),
    db
      .select({ id: quickbrickDiagrams.notebookId, n: sql<number>`count(*)::int` })
      .from(quickbrickDiagrams)
      .where(inArray(quickbrickDiagrams.notebookId, ids))
      .groupBy(quickbrickDiagrams.notebookId),
    // Foto mais recente de cada caderno vira a "capa".
    db
      .selectDistinctOn([quickbrickPhotos.notebookId], {
        id: quickbrickPhotos.notebookId,
        key: quickbrickPhotos.objectKey,
      })
      .from(quickbrickPhotos)
      .where(inArray(quickbrickPhotos.notebookId, ids))
      .orderBy(quickbrickPhotos.notebookId, desc(quickbrickPhotos.takenAt)),
  ]);

  const photoCount = new Map(photoStats.map((r) => [r.id, r.n]));
  const diagramCount = new Map(diagramStats.map((r) => [r.id, r.n]));
  const coverKey = new Map(covers.map((r) => [r.id, r.key]));
  const canSign = isR2Configured();

  return Promise.all(
    rows.map(async (row) => {
      const key = coverKey.get(row.id);
      return {
        ...toNotebookDTO(row, {
          league: (row.leagueId && leagueMap.get(row.leagueId)) || null,
          tags: tagMap.get(row.id) ?? [],
          milestone: milestoneMap.get(row.id) ?? null,
        }),
        photoCount: photoCount.get(row.id) ?? 0,
        diagramCount: diagramCount.get(row.id) ?? 0,
        coverUrl: key && canSign ? await presignDownload(key, { expiresIn: 3600 }) : null,
      };
    }),
  );
}

export async function createNotebook(input: {
  leagueId: string;
  name: string;
  robotName?: string;
  description?: string;
  season?: string;
  coverColor?: string;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const league = await requireSupportedLeague(scope, input.leagueId);
    const [created] = await db
      .insert(quickbrickNotebooks)
      .values({
        userId: scope.userId,
        teamId: scope.type === "team" ? scope.teamId : null,
        leagueId: league.id,
        name: requireText(input.name, "o nome do caderno", { maxLength: 100 }),
        robotName: optionalText(input.robotName, 80),
        description: optionalText(input.description, 1000),
        season: parseSeason(input.season),
        coverColor: parseColor(input.coverColor),
      })
      .returning({ id: quickbrickNotebooks.id });
    refresh();
    return { id: created.id };
  });
}

export async function updateNotebook(
  id: string,
  input: {
    leagueId?: string;
    name?: string;
    robotName?: string | null;
    description?: string | null;
    season?: string | null;
    coverColor?: string;
  },
): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const current = await requireNotebook(scope, id);
    const patch: Partial<NotebookRow> = { updatedAt: new Date() };
    if (input.leagueId !== undefined && input.leagueId !== current.leagueId) {
      patch.leagueId = (await requireSupportedLeague(scope, input.leagueId)).id;
    }
    if (input.name !== undefined) patch.name = requireText(input.name, "o nome do caderno", { maxLength: 100 });
    if (input.robotName !== undefined) patch.robotName = optionalText(input.robotName, 80);
    if (input.description !== undefined) patch.description = optionalText(input.description, 1000);
    if (input.season !== undefined) patch.season = parseSeason(input.season);
    if (input.coverColor !== undefined) patch.coverColor = parseColor(input.coverColor);
    await db.update(quickbrickNotebooks).set(patch).where(eq(quickbrickNotebooks.id, id));
    refresh(id);
  });
}

export async function deleteNotebook(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const notebook = await requireNotebook(scope, id);
    // Na equipe, só quem criou ou owner/mentor apaga o caderno inteiro.
    if (scope.type === "team" && notebook.userId !== scope.userId) requireRole(scope, ["owner", "mentor"]);

    const photos = await db
      .select({ key: quickbrickPhotos.objectKey })
      .from(quickbrickPhotos)
      .where(eq(quickbrickPhotos.notebookId, id));
    const keys = photos.map((p) => p.key);
    if (notebook.studioKey) keys.push(notebook.studioKey);

    await db.delete(quickbrickNotebooks).where(eq(quickbrickNotebooks.id, id));
    if (keys.length && isR2Configured()) await deleteObjects(keys);
    refresh();
  });
}

export type NotebookDetail = {
  notebook: NotebookDTO;
  photos: NotebookPhotoDTO[];
  diagrams: NotebookDiagramDTO[];
  storageReady: boolean;
  /** Competições do usuário (para trocar a liga do caderno). */
  leagues: QuickbrickLeague[];
};

export async function getNotebook(id: string): Promise<NotebookDetail | null> {
  const scope = await resolveStagebookScope();
  let row: NotebookRow;
  try {
    row = await requireNotebook(scope, id);
  } catch {
    return null;
  }

  const [photos, diagrams, tagMap, milestoneMap, leagueMap] = await Promise.all([
    db
      .select()
      .from(quickbrickPhotos)
      .where(eq(quickbrickPhotos.notebookId, id))
      .orderBy(asc(quickbrickPhotos.takenAt)),
    db
      .select()
      .from(quickbrickDiagrams)
      .where(eq(quickbrickDiagrams.notebookId, id))
      .orderBy(asc(quickbrickDiagrams.createdAt)),
    tagsForResources("quickbrick", [id]),
    milestonesForResources("quickbrick", [id]),
    leaguesById([row.leagueId]),
  ]);
  await db.update(quickbrickNotebooks).set({ lastAccessAt: new Date() }).where(eq(quickbrickNotebooks.id, id));

  return {
    notebook: toNotebookDTO(row, {
      league: (row.leagueId && leagueMap.get(row.leagueId)) || null,
      tags: tagMap.get(id) ?? [],
      milestone: milestoneMap.get(id) ?? null,
    }),
    photos: await Promise.all(photos.map(toPhotoDTO)),
    diagrams: diagrams.map((d) => ({
      id: d.id,
      kind: d.kind,
      title: d.title,
      season: d.season,
      summary: summarizeDiagram(d.kind, d.data),
      updatedAt: iso(d.updatedAt),
    })),
    storageReady: isR2Configured(),
    leagues: await listQuickbrickLeagues(),
  };
}

// ---------------------------------------------------------------------------
// Fotos (versões do robô) — envio direto ao R2 por URL pré-assinada
// ---------------------------------------------------------------------------

const extFrom = (fileName: string, fallback: string) => {
  const m = /\.([a-z0-9]{1,5})$/i.exec(fileName);
  return (m?.[1] ?? fallback).toLowerCase();
};

export async function requestPhotoUpload(
  notebookId: string,
  file: { fileName: string; contentType: string; size: number },
): Promise<ActionResult<{ key: string; uploadUrl: string }>> {
  return runAction(async () => {
    requireR2();
    const scope = await resolveStagebookScope();
    await requireNotebookSupported(await requireNotebook(scope, notebookId));
    if (!(PHOTO_TYPES as readonly string[]).includes(file.contentType)) {
      throw new ValidationError("Envie uma imagem JPG, PNG ou WEBP.");
    }
    if (!(file.size > 0) || file.size > PHOTO_MAX_BYTES) {
      throw new ValidationError("A foto pode ter no máximo 12 MB.");
    }
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(quickbrickPhotos)
      .where(eq(quickbrickPhotos.notebookId, notebookId));
    if (n >= NOTEBOOK_MAX_PHOTOS) {
      throw new ValidationError(`Este caderno já tem ${NOTEBOOK_MAX_PHOTOS} fotos. Remova uma para enviar outra.`);
    }
    const key = `notebooks/${notebookId}/photos/${crypto.randomUUID()}.${extFrom(file.fileName, "jpg")}`;
    return { key, uploadUrl: await presignUpload(key) };
  });
}

export async function confirmPhotoUpload(
  notebookId: string,
  input: { key: string; fileName: string; contentType: string; title?: string; notes?: string; takenAt?: string },
): Promise<ActionResult<NotebookPhotoDTO>> {
  return runAction(async () => {
    requireR2();
    const scope = await resolveStagebookScope();
    await requireNotebook(scope, notebookId);
    if (typeof input.key !== "string" || !input.key.startsWith(`notebooks/${notebookId}/photos/`)) {
      throw new ValidationError("Arquivo inválido.");
    }
    const head = await headObject(input.key);
    if (!head) throw new ValidationError("O envio da foto não foi concluído. Tente novamente.");
    if (head.size > PHOTO_MAX_BYTES) {
      await deleteObject(input.key);
      throw new ValidationError("A foto pode ter no máximo 12 MB.");
    }

    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(quickbrickPhotos)
      .where(eq(quickbrickPhotos.notebookId, notebookId));
    if (n >= NOTEBOOK_MAX_PHOTOS) {
      await deleteObject(input.key);
      throw new ValidationError(`Este caderno já tem ${NOTEBOOK_MAX_PHOTOS} fotos.`);
    }

    const contentType = (PHOTO_TYPES as readonly string[]).includes(input.contentType) ? input.contentType : "image/jpeg";
    const [row] = await db
      .insert(quickbrickPhotos)
      .values({
        notebookId,
        userId: scope.userId,
        objectKey: input.key,
        fileName: requireText(input.fileName, "o nome do arquivo", { maxLength: 200 }),
        contentType,
        size: head.size,
        title: optionalText(input.title, 80),
        notes: optionalText(input.notes, 4000),
        takenAt: optionalDate(input.takenAt) ?? new Date(),
      })
      .returning();
    await touch(notebookId);
    refresh(notebookId);
    return toPhotoDTO(row);
  });
}

async function requirePhoto(scope: StagebookScope, photoId: string) {
  requireUuid(photoId, "foto");
  const [row] = await db
    .select({ photo: quickbrickPhotos })
    .from(quickbrickPhotos)
    .innerJoin(quickbrickNotebooks, eq(quickbrickNotebooks.id, quickbrickPhotos.notebookId))
    .where(and(eq(quickbrickPhotos.id, photoId), notebookScope(scope)))
    .limit(1);
  if (!row) throw new ValidationError("Foto não encontrada.");
  return row.photo;
}

export async function updatePhoto(
  photoId: string,
  input: { title?: string | null; notes?: string | null; takenAt?: string },
): Promise<ActionResult<NotebookPhotoDTO>> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const photo = await requirePhoto(scope, photoId);
    const patch: Partial<typeof quickbrickPhotos.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) patch.title = optionalText(input.title, 80);
    if (input.notes !== undefined) patch.notes = optionalText(input.notes, 4000);
    if (input.takenAt !== undefined) {
      const d = optionalDate(input.takenAt);
      if (!d) throw new ValidationError("Data e hora inválidas.");
      patch.takenAt = d;
    }
    const [row] = await db.update(quickbrickPhotos).set(patch).where(eq(quickbrickPhotos.id, photoId)).returning();
    await touch(photo.notebookId);
    return toPhotoDTO(row);
  });
}

export async function deletePhoto(photoId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const photo = await requirePhoto(scope, photoId);
    await db.delete(quickbrickPhotos).where(eq(quickbrickPhotos.id, photoId));
    if (isR2Configured()) await deleteObject(photo.objectKey).catch(() => undefined);
    await touch(photo.notebookId);
    refresh(photo.notebookId);
  });
}

// ---------------------------------------------------------------------------
// Projeto do BrickLink Studio 2.0 (.io)
// ---------------------------------------------------------------------------

export async function requestStudioUpload(
  notebookId: string,
  file: { fileName: string; size: number },
): Promise<ActionResult<{ key: string; uploadUrl: string }>> {
  return runAction(async () => {
    requireR2();
    const scope = await resolveStagebookScope();
    await requireNotebookSupported(await requireNotebook(scope, notebookId));
    if (!/\.io$/i.test(file.fileName)) throw new ValidationError("Envie um arquivo .io do BrickLink Studio 2.0.");
    if (!(file.size > 0) || file.size > STUDIO_MAX_BYTES) {
      throw new ValidationError("O arquivo do Studio pode ter no máximo 60 MB.");
    }
    const key = `notebooks/${notebookId}/studio/${crypto.randomUUID()}.io`;
    return { key, uploadUrl: await presignUpload(key) };
  });
}

export async function confirmStudioUpload(
  notebookId: string,
  input: { key: string; fileName: string },
): Promise<ActionResult<NonNullable<NotebookDTO["studio"]>>> {
  return runAction(async () => {
    requireR2();
    const scope = await resolveStagebookScope();
    const notebook = await requireNotebook(scope, notebookId);
    if (typeof input.key !== "string" || !input.key.startsWith(`notebooks/${notebookId}/studio/`)) {
      throw new ValidationError("Arquivo inválido.");
    }
    const head = await headObject(input.key);
    if (!head) throw new ValidationError("O envio do arquivo não foi concluído. Tente novamente.");
    if (head.size > STUDIO_MAX_BYTES) {
      await deleteObject(input.key);
      throw new ValidationError("O arquivo do Studio pode ter no máximo 60 MB.");
    }
    const now = new Date();
    const fileName = requireText(input.fileName, "o nome do arquivo", { maxLength: 200 });
    await db
      .update(quickbrickNotebooks)
      .set({ studioKey: input.key, studioFileName: fileName, studioSize: head.size, studioUploadedAt: now, updatedAt: now })
      .where(eq(quickbrickNotebooks.id, notebookId));
    // Substitui o arquivo anterior.
    if (notebook.studioKey && notebook.studioKey !== input.key) {
      await deleteObject(notebook.studioKey).catch(() => undefined);
    }
    refresh(notebookId);
    return { fileName, size: head.size, uploadedAt: now.toISOString() };
  });
}

/** URL nova (curta) para o visualizador 3D baixar o .io. */
export async function getStudioFileUrl(notebookId: string): Promise<ActionResult<{ url: string; fileName: string }>> {
  return runAction(async () => {
    requireR2();
    const scope = await resolveStagebookScope();
    const notebook = await requireNotebook(scope, notebookId);
    if (!notebook.studioKey || !notebook.studioFileName) throw new ValidationError("Nenhum arquivo do Studio enviado.");
    return {
      url: await presignDownload(notebook.studioKey, { expiresIn: 900, fileName: notebook.studioFileName }),
      fileName: notebook.studioFileName,
    };
  });
}

export async function removeStudioFile(notebookId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const notebook = await requireNotebook(scope, notebookId);
    await db
      .update(quickbrickNotebooks)
      .set({ studioKey: null, studioFileName: null, studioSize: null, studioUploadedAt: null, updatedAt: new Date() })
      .where(eq(quickbrickNotebooks.id, notebookId));
    if (notebook.studioKey && isR2Configured()) await deleteObject(notebook.studioKey).catch(() => undefined);
    refresh(notebookId);
  });
}

// ---------------------------------------------------------------------------
// Diagramas
// ---------------------------------------------------------------------------

export async function createDiagram(
  notebookId: string,
  input: { kind: string; title?: string; season?: string | null },
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const notebook = await requireNotebook(scope, notebookId);
    await requireNotebookSupported(notebook);
    if (!isDiagramKind(input.kind)) throw new ValidationError("Tipo de diagrama inválido.");
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(quickbrickDiagrams)
      .where(eq(quickbrickDiagrams.notebookId, notebookId));
    if (n >= MAX_DIAGRAMS) throw new ValidationError(`Limite de ${MAX_DIAGRAMS} diagramas por caderno.`);

    const meta = DIAGRAM_META[input.kind];
    const season = meta.needsSeason ? (parseSeason(input.season) ?? notebook.season ?? "bioglow") : null;
    const [row] = await db
      .insert(quickbrickDiagrams)
      .values({
        notebookId,
        kind: input.kind,
        title: optionalText(input.title, 80) ?? meta.label,
        season,
        data: {},
      })
      .returning({ id: quickbrickDiagrams.id });
    await touch(notebookId);
    refresh(notebookId);
    return { id: row.id };
  });
}

async function requireDiagram(scope: StagebookScope, diagramId: string) {
  requireUuid(diagramId, "diagrama");
  const [row] = await db
    .select({ diagram: quickbrickDiagrams, notebookName: quickbrickNotebooks.name })
    .from(quickbrickDiagrams)
    .innerJoin(quickbrickNotebooks, eq(quickbrickNotebooks.id, quickbrickDiagrams.notebookId))
    .where(and(eq(quickbrickDiagrams.id, diagramId), notebookScope(scope)))
    .limit(1);
  if (!row) throw new ValidationError("Diagrama não encontrado.");
  return row;
}

export type DiagramDetail = {
  id: string;
  notebookId: string;
  notebookName: string;
  kind: DiagramKind;
  title: string;
  season: string | null;
  data: unknown;
  updatedAt: string;
};

export async function getDiagram(diagramId: string): Promise<DiagramDetail | null> {
  const scope = await resolveStagebookScope();
  try {
    const { diagram, notebookName } = await requireDiagram(scope, diagramId);
    return {
      id: diagram.id,
      notebookId: diagram.notebookId,
      notebookName,
      kind: diagram.kind,
      title: diagram.title,
      season: diagram.season,
      data: diagram.data,
      updatedAt: iso(diagram.updatedAt),
    };
  } catch {
    return null;
  }
}

const MAX_DIAGRAM_BYTES = 2 * 1024 * 1024;

export async function saveDiagram(diagramId: string, data: unknown): Promise<ActionResult<{ updatedAt: string }>> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const { diagram } = await requireDiagram(scope, diagramId);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new ValidationError("Dados inválidos.");
    if (JSON.stringify(data).length > MAX_DIAGRAM_BYTES) {
      throw new ValidationError("O diagrama ficou grande demais para salvar (máx. 2 MB).");
    }
    const now = new Date();
    await db.update(quickbrickDiagrams).set({ data, updatedAt: now }).where(eq(quickbrickDiagrams.id, diagramId));
    await touch(diagram.notebookId);
    return { updatedAt: now.toISOString() };
  });
}

export async function renameDiagram(diagramId: string, title: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const { diagram } = await requireDiagram(scope, diagramId);
    await db
      .update(quickbrickDiagrams)
      .set({ title: requireText(title, "o título", { maxLength: 80 }), updatedAt: new Date() })
      .where(eq(quickbrickDiagrams.id, diagramId));
    refresh(diagram.notebookId);
  });
}

export async function deleteDiagram(diagramId: string): Promise<ActionResult> {
  return runAction(async () => {
    const scope = await resolveStagebookScope();
    const { diagram } = await requireDiagram(scope, diagramId);
    await db.delete(quickbrickDiagrams).where(eq(quickbrickDiagrams.id, diagramId));
    await touch(diagram.notebookId);
    refresh(diagram.notebookId);
  });
}
