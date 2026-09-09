import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { tests, testExecutions } from "@/db/schema";

// ---------------------------------------------------------------------------
// Tipos de entrada/saída — o `config` e o `results` são jsonb livre;
// a forma exata de cada um depende do `mode` do teste (runs | calibrabot |
// individual | custom), montada no client (ver actions/hook useCreateTest).
// ---------------------------------------------------------------------------

type TestMode = "runs" | "calibrabot" | "individual" | "custom";

type CreateTestBody = {
  name: string;
  description?: string | null;
  mode: TestMode;
  season?: string | null;
  config: Record<string, unknown>;
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

  const body = await req.json();

  try {
    if (body.action === "create") {
      const { name, description, mode, season, config }: CreateTestBody = body;

      if (!name?.trim()) {
        return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
      }
      if (!mode) {
        return NextResponse.json({ error: "Modo é obrigatório" }, { status: 400 });
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
          config: config ?? {},
        })
        .returning({ id: tests.id });

      return NextResponse.json({ id: created.id });
    }

    if (body.action === "entries") {
      const { testId, entries }: CreateEntriesBody = body;

      const test = await db.query.tests.findFirst({
        where: and(eq(tests.id, testId), eq(tests.userId, userId)),
      });
      if (!test) {
        return NextResponse.json({ error: "Teste não encontrado" }, { status: 404 });
      }
      if (!entries?.length) {
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