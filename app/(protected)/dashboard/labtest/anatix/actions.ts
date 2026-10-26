"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  ANATIX_MAX_LABS,
  anatixFrames,
  anatixLabs,
  anatixSessions,
} from "@/db/schema/anatix";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { normalizeAnatixConfig } from "@/utils/labtest/anatix/protocol";
import type {
  AnatixFrame,
  AnatixLabRecord,
  AnatixSessionRecord,
  AnatixSessionSummary,
} from "@/types/anatix.types";

const BASE_PATH = "/dashboard/labtest/anatix";
const MAX_FRAMES_PER_BATCH = 2000;
const MAX_BATCHES_PER_SESSION = 5000;
const FRAME_KINDS = new Set(["H", "V", "E", "S", "T", "L", "M"]);

// ---------------------------------------------------------------------------
// Escopo: o laboratório pertence à equipe selecionada ou ao espaço pessoal.
// ---------------------------------------------------------------------------

async function scopeFilter() {
  const scope = await resolveStagebookScope();
  const where =
    scope.type === "team"
      ? eq(anatixLabs.teamId, scope.teamId)
      : and(eq(anatixLabs.userId, scope.userId), isNull(anatixLabs.teamId));
  return { scope, where };
}

async function requireLab(labId: string) {
  const { scope, where } = await scopeFilter();
  const [lab] = await db
    .select()
    .from(anatixLabs)
    .where(and(eq(anatixLabs.id, labId), where))
    .limit(1);
  if (!lab) throw new Error("Laboratório Anatix não encontrado.");
  return { scope, lab };
}

async function requireSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(anatixSessions)
    .where(eq(anatixSessions.id, sessionId))
    .limit(1);
  if (!session) throw new Error("Sessão Anatix não encontrada.");
  const { scope, lab } = await requireLab(session.labId);
  return { scope, lab, session };
}

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, max);
  return v || null;
}

/** jsonb não aceita NaN/Infinity: troca por null e remove campos estranhos. */
function sanitizeFrames(raw: unknown): AnatixFrame[] {
  if (!Array.isArray(raw)) throw new Error("Lote de frames inválido.");
  if (raw.length > MAX_FRAMES_PER_BATCH) {
    throw new Error(`Lote maior que ${MAX_FRAMES_PER_BATCH} frames.`);
  }
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const obj = item as Record<string, unknown>;
    if (typeof obj.k !== "string" || !FRAME_KINDS.has(obj.k)) return [];
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "number") out[key] = Number.isFinite(value) ? value : null;
      else if (typeof value === "string") out[key] = value.slice(0, 200);
    }
    return [out as AnatixFrame];
  });
}

function toLabRecord(
  lab: typeof anatixLabs.$inferSelect,
  sessionCount = 0,
): AnatixLabRecord {
  return {
    id: lab.id,
    name: lab.name,
    description: lab.description,
    robotName: lab.robotName,
    board: lab.board,
    config: normalizeAnatixConfig(lab.config),
    lastConnectedAt: lab.lastConnectedAt?.toISOString() ?? null,
    createdAt: lab.createdAt.toISOString(),
    sessionCount,
  };
}

function toSessionRecord(
  s: typeof anatixSessions.$inferSelect,
): AnatixSessionRecord {
  return {
    id: s.id,
    robotName: s.robotName,
    board: s.board,
    baudRate: s.baudRate,
    frameCount: s.frameCount,
    invalidFrames: s.invalidFrames,
    droppedFrames: s.droppedFrames,
    summary: (s.summary ?? {}) as AnatixSessionSummary,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// Laboratórios
// ---------------------------------------------------------------------------

export async function listAnatixLabs(): Promise<AnatixLabRecord[]> {
  const { where } = await scopeFilter();
  const labs = await db
    .select()
    .from(anatixLabs)
    .where(where)
    .orderBy(asc(anatixLabs.createdAt));

  if (labs.length === 0) return [];

  const counts = await db
    .select({ labId: anatixSessions.labId, total: count() })
    .from(anatixSessions)
    .where(inArray(anatixSessions.labId, labs.map((l) => l.id)))
    .groupBy(anatixSessions.labId);
  const byLab = new Map(counts.map((c) => [c.labId, Number(c.total)]));

  return labs.map((lab) => toLabRecord(lab, byLab.get(lab.id) ?? 0));
}

export async function createAnatixLab(input: {
  name: string;
  description?: string | null;
  config?: unknown;
}) {
  const { scope, where } = await scopeFilter();
  const name = cleanText(input.name, 80);
  if (!name) throw new Error("Dê um nome ao laboratório.");

  const [{ total }] = await db
    .select({ total: count() })
    .from(anatixLabs)
    .where(where);
  if (Number(total) >= ANATIX_MAX_LABS) {
    throw new Error(`Limite de ${ANATIX_MAX_LABS} laboratórios Anatix atingido.`);
  }

  const [lab] = await db
    .insert(anatixLabs)
    .values({
      userId: scope.userId,
      teamId: scope.type === "team" ? scope.teamId : null,
      name,
      description: cleanText(input.description, 400),
      config: normalizeAnatixConfig(input.config),
    })
    .returning();

  revalidatePath(BASE_PATH);
  return toLabRecord(lab);
}

export async function updateAnatixLab(input: {
  labId: string;
  name?: string;
  description?: string | null;
  config?: unknown;
}) {
  const { lab } = await requireLab(input.labId);
  const name = input.name !== undefined ? cleanText(input.name, 80) : lab.name;
  if (!name) throw new Error("Dê um nome ao laboratório.");

  const [updated] = await db
    .update(anatixLabs)
    .set({
      name,
      description:
        input.description !== undefined
          ? cleanText(input.description, 400)
          : lab.description,
      config:
        input.config !== undefined
          ? normalizeAnatixConfig(input.config)
          : lab.config,
      updatedAt: new Date(),
    })
    .where(eq(anatixLabs.id, lab.id))
    .returning();

  revalidatePath(BASE_PATH);
  revalidatePath(`${BASE_PATH}/${lab.id}`);
  return toLabRecord(updated);
}

export async function deleteAnatixLab(labId: string) {
  const { lab } = await requireLab(labId);
  await db.delete(anatixLabs).where(eq(anatixLabs.id, lab.id));
  revalidatePath(BASE_PATH);
}

export async function getAnatixLab(labId: string) {
  const { lab } = await requireLab(labId);
  const sessions = await db
    .select()
    .from(anatixSessions)
    .where(eq(anatixSessions.labId, lab.id))
    .orderBy(desc(anatixSessions.startedAt))
    .limit(20);

  return {
    lab: toLabRecord(lab, sessions.length),
    sessions: sessions.map(toSessionRecord),
  };
}

// ---------------------------------------------------------------------------
// Sessões e frames
// ---------------------------------------------------------------------------

/** Chamado quando a conexão é confirmada (frame H recebido). */
export async function startAnatixSession(input: {
  labId: string;
  robotName?: string | null;
  board?: string | null;
  protocolVersion?: number | null;
  baudRate?: number | null;
}) {
  const { scope, lab } = await requireLab(input.labId);
  const robotName = cleanText(input.robotName, 80);
  const board = cleanText(input.board, 80);
  const now = new Date();

  const [session] = await db
    .insert(anatixSessions)
    .values({
      labId: lab.id,
      userId: scope.userId,
      robotName,
      board,
      protocolVersion: Number.isFinite(input.protocolVersion)
        ? Number(input.protocolVersion)
        : null,
      baudRate: Number.isFinite(input.baudRate) ? Number(input.baudRate) : null,
      startedAt: now,
    })
    .returning();

  await db
    .update(anatixLabs)
    .set({
      robotName: robotName ?? lab.robotName,
      board: board ?? lab.board,
      lastConnectedAt: now,
      updatedAt: now,
    })
    .where(eq(anatixLabs.id, lab.id));

  return { sessionId: session.id };
}

export async function appendAnatixFrames(input: {
  sessionId: string;
  batch: number;
  frames: unknown;
}) {
  const { session } = await requireSession(input.sessionId);
  if (session.endedAt) throw new Error("Sessão já encerrada.");
  const batch = Math.trunc(Number(input.batch));
  if (!Number.isFinite(batch) || batch < 0 || batch >= MAX_BATCHES_PER_SESSION) {
    throw new Error("Número de lote inválido.");
  }

  const frames = sanitizeFrames(input.frames);
  if (frames.length === 0) return { saved: 0 };

  await db.insert(anatixFrames).values({ sessionId: session.id, batch, frames });
  return { saved: frames.length };
}

export async function endAnatixSession(input: {
  sessionId: string;
  frameCount: number;
  invalidFrames: number;
  droppedFrames: number;
  summary: AnatixSessionSummary;
}) {
  const { lab, session } = await requireSession(input.sessionId);
  const int = (v: unknown) =>
    Number.isFinite(Number(v)) ? Math.max(0, Math.trunc(Number(v))) : 0;

  // Passa o resumo pelo JSON para descartar NaN/Infinity.
  const summary = JSON.parse(
    JSON.stringify(input.summary ?? {}, (_k, v) =>
      typeof v === "number" && !Number.isFinite(v) ? null : v,
    ),
  );

  await db
    .update(anatixSessions)
    .set({
      frameCount: int(input.frameCount),
      invalidFrames: int(input.invalidFrames),
      droppedFrames: int(input.droppedFrames),
      summary,
      endedAt: new Date(),
    })
    .where(eq(anatixSessions.id, session.id));

  revalidatePath(`${BASE_PATH}/${lab.id}`);
}

/** Recarrega os frames de uma sessão salva para reanalisar nos gráficos. */
export async function getAnatixSessionFrames(sessionId: string) {
  const { session } = await requireSession(sessionId);
  const rows = await db
    .select({ frames: anatixFrames.frames })
    .from(anatixFrames)
    .where(eq(anatixFrames.sessionId, session.id))
    .orderBy(asc(anatixFrames.batch));

  return {
    session: toSessionRecord(session),
    frames: rows.flatMap((r) => (Array.isArray(r.frames) ? r.frames : [])) as AnatixFrame[],
  };
}

export async function deleteAnatixSession(sessionId: string) {
  const { lab, session } = await requireSession(sessionId);
  await db.delete(anatixSessions).where(eq(anatixSessions.id, session.id));
  revalidatePath(`${BASE_PATH}/${lab.id}`);
}
