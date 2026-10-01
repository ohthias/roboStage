import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { tests, testExecutions } from "@/db/schema";
import type { FieldDefinition } from "@/types/labtest.types";

// ---------------------------------------------------------------------------
// Limites de entrada — os objetos internos continuam flexíveis por modo, mas
// não podem crescer sem limite antes de chegar ao jsonb do banco.
// ---------------------------------------------------------------------------

const MAX_BODY_BYTES = 256 * 1024;
const MAX_JSON_DEPTH = 8;
const MAX_JSON_NODES = 1_000;
const MAX_JSON_KEYS = 100;
const MAX_JSON_ARRAY_ITEMS = 100;
const MAX_JSON_STRING_LENGTH = 4_000;
const MAX_ENTRIES_PER_REQUEST = 100;
const MAX_TEXT_LENGTH = 2_000;

class PayloadTooLargeError extends Error {}

async function readJsonBody(req: NextRequest): Promise<unknown> {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new PayloadTooLargeError();
  }

  const reader = req.body?.getReader();
  if (!reader) return {};

  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  try {
    return JSON.parse(text);
  } catch {
    throw new SyntaxError("JSON inválido");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasBoundedJsonStructure(value: unknown): boolean {
  const state = { nodes: 0 };

  function visit(current: unknown, depth: number): boolean {
    state.nodes += 1;
    if (state.nodes > MAX_JSON_NODES || depth > MAX_JSON_DEPTH) return false;
    if (typeof current === "string") return current.length <= MAX_JSON_STRING_LENGTH;
    if (current === null || typeof current === "number" || typeof current === "boolean") {
      return true;
    }
    if (Array.isArray(current)) {
      return (
        current.length <= MAX_JSON_ARRAY_ITEMS &&
        current.every((item) => visit(item, depth + 1))
      );
    }
    if (!isRecord(current)) return false;

    const keys = Object.keys(current);
    return (
      keys.length <= MAX_JSON_KEYS &&
      keys.every(
        (key) =>
          key.length <= MAX_JSON_STRING_LENGTH && visit(current[key], depth + 1),
      )
    );
  }

  return visit(value, 0);
}

function isBoundedRecord(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && hasBoundedJsonStructure(value);
}

function isBoundedText(value: unknown, nullable = false): value is string | null | undefined {
  return (
    (nullable && (value === null || value === undefined)) ||
    (typeof value === "string" && value.length <= MAX_TEXT_LENGTH)
  );
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

type TestMode = "runs" | "calibrabot" | "individual" | "custom";

type CreateTestBody = {
  name: string;
  description?: string | null;
  mode: TestMode;
  season?: string | null;
  config: Record<string, unknown>;
  fields?: FieldDefinition[];
};

type ExecutionEntry = {
  notes?: string | null;
  results: Record<string, unknown>;
};

type CreateEntriesBody = {
  testId: string;
  entries: ExecutionEntry[];
};

// ---------------------------------------------------------------------------
// GET /api/labtest              -> lista de testes do usuário (useTests)
// GET /api/labtest?testId=...   -> teste + execuções (useTest)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const testId = req.nextUrl.searchParams.get("testId");

  try {
    if (testId) {
      const test = await db.query.tests.findFirst({
        where: and(eq(tests.id, testId), eq(tests.userId, userId)),
      });
      if (!test) {
        return NextResponse.json({ error: "Teste não encontrado" }, { status: 404 });
      }

      const executionRows = await db
        .select()
        .from(testExecutions)
        .where(eq(testExecutions.testId, testId))
        .orderBy(testExecutions.executionNumber);

      const executions = executionRows.map((exec) => ({
        id: exec.id,
        executionNumber: exec.executionNumber,
        notes: exec.notes,
        results: exec.results,
        createdAt: exec.createdAt.toISOString(),
      }));

      return NextResponse.json({
        test: {
          id: test.id,
          name: test.name,
          description: test.description,
          mode: test.mode,
          season: test.season,
          status: test.status,
          config: test.config,
          createdAt: test.createdAt.toISOString(),
          updatedAt: test.updatedAt.toISOString(),
        },
        executions,
      });
    }

    const rows = await db
      .select({
        id: tests.id,
        name: tests.name,
        description: tests.description,
        mode: tests.mode,
        season: tests.season,
        status: tests.status,
        config: tests.config,
        createdAt: tests.createdAt,
        updatedAt: tests.updatedAt,
        executionsCount: sql<number>`count(${testExecutions.id})`.mapWith(Number),
      })
      .from(tests)
      .leftJoin(testExecutions, eq(testExecutions.testId, tests.id))
      .where(eq(tests.userId, userId))
      .groupBy(tests.id)
      .orderBy(desc(tests.updatedAt));

    return NextResponse.json(
      rows.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error("[GET /api/labtest]", err);
    return NextResponse.json({ error: "Erro ao carregar testes" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/labtest  { action: "create" | "entries", ... }
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: "Payload excede o limite de 256 KB" }, { status: 413 });
    }
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    if (!isRecord(body) || typeof body.action !== "string") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    if (body.action === "create") {
      const { name, description, mode, season, config, fields } = body as Partial<CreateTestBody>;

      if (typeof name !== "string" || !name.trim() || name.length > MAX_TEXT_LENGTH) {
        return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
      }
      if (!mode || !["runs", "calibrabot", "individual", "custom"].includes(mode)) {
        return NextResponse.json({ error: "Modo é obrigatório" }, { status: 400 });
      }
      if (!isBoundedText(description, true) || !isBoundedText(season, true)) {
        return NextResponse.json({ error: "Texto excede o limite permitido" }, { status: 400 });
      }
      if (config !== undefined && !isBoundedRecord(config)) {
        return NextResponse.json({ error: "Configuração inválida ou excede os limites" }, { status: 400 });
      }
      if (fields !== undefined && (!Array.isArray(fields) || fields.length > MAX_JSON_ARRAY_ITEMS || !hasBoundedJsonStructure(fields))) {
        return NextResponse.json({ error: "Campos inválidos ou excedem os limites" }, { status: 400 });
      }

      const [created] = await db
        .insert(tests)
        .values({
          userId,
          name: name.trim(),
          description: description ?? null,
          mode: mode as (typeof tests.$inferInsert)["mode"],
          // "season: se tiver a da fll registra o nome da temporada em minúsculo"
          season: season ? season.toLowerCase() : null,
          status: "planejamento",
          config: config ?? (mode === "runs"
            ? { missions: (fields ?? []).map((field) => field.fieldKey) }
            : {}),
        })
        .returning({ id: tests.id });

      return NextResponse.json({ id: created.id });
    }

    if (body.action === "entries") {
      const { testId, entries } = body as Partial<CreateEntriesBody>;

      if (!isUuid(testId) || !Array.isArray(entries) || entries.length > MAX_ENTRIES_PER_REQUEST) {
        return NextResponse.json({ error: "Lançamentos inválidos ou excedem o limite de 100 por requisição" }, { status: 400 });
      }
      if (
        !entries.length ||
        !entries.every(
          (entry) =>
            isRecord(entry) &&
            isBoundedRecord(entry.results) &&
            isBoundedText(entry.notes, true),
        )
      ) {
        return NextResponse.json({ error: "Lançamentos inválidos ou excedem os limites" }, { status: 400 });
      }

      const test = await db.query.tests.findFirst({
        where: and(eq(tests.id, testId), eq(tests.userId, userId)),
      });
      if (!test) {
        return NextResponse.json({ error: "Teste não encontrado" }, { status: 404 });
      }
      if (!entries.length) {
        return NextResponse.json({ error: "Nenhum lançamento para salvar" }, { status: 400 });
      }

      // Próximo número de execução calculado no servidor (evita corrida entre
      // abas/usuários e dispensa o client enviar `startingExecutionNumber`).
      const [lastExecution] = await db
        .select({ executionNumber: testExecutions.executionNumber })
        .from(testExecutions)
        .where(eq(testExecutions.testId, testId))
        .orderBy(desc(testExecutions.executionNumber))
        .limit(1);

      let nextNumber = (lastExecution?.executionNumber ?? 0) + 1;

      const created = await db
        .insert(testExecutions)
        .values(
          entries.map((entry) => ({
            testId,
            executionNumber: nextNumber++,
            notes: entry.notes ?? null,
            results: entry.results ?? {},
          })),
        )
        .returning({ id: testExecutions.id, executionNumber: testExecutions.executionNumber });

      await db
        .update(tests)
        .set({ updatedAt: new Date(), lastAccessAt: new Date() })
        .where(eq(tests.id, testId));

      return NextResponse.json({ ok: true, created });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/labtest]", err);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}