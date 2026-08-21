import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { tests, testFields, testExecutions, testFieldValues } from "@/db/schema";
import type { FieldDefinition, FieldValue } from "@/types/labtest.types";

// ---------------------------------------------------------------------------
// GET /api/labtest              -> lista de testes do usuário (useTests)
// GET /api/labtest?testId=...   -> teste + fields + entries (useTest)
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

      const fieldRows = await db
        .select()
        .from(testFields)
        .where(eq(testFields.testId, testId))
        .orderBy(testFields.fieldOrder);

      const fields: FieldDefinition[] = fieldRows.map((f) => ({
        fieldKey: f.fieldKey,
        label: f.label,
        type: f.fieldType,
        unit: f.unit,
        targetValue: f.targetValue,
        order: f.fieldOrder,
        options: (f.options as FieldDefinition["options"]) ?? null,
        required: f.required,
        source: f.source,
      }));

      const executionRows = await db
        .select()
        .from(testExecutions)
        .where(eq(testExecutions.testId, testId))
        .orderBy(testExecutions.executionNumber);

      const executionIds = executionRows.map((e) => e.id);
      const valueRows = executionIds.length
        ? await db
            .select()
            .from(testFieldValues)
            .where(inArray(testFieldValues.executionId, executionIds))
        : [];

      const entries = executionRows.map((exec) => ({
        id: exec.id,
        executionNumber: exec.executionNumber,
        notes: exec.notes,
        createdAt: exec.createdAt.toISOString(),
        values: valueRows
          .filter((v) => v.executionId === exec.id)
          .map((v) => ({ fieldKey: v.fieldKey, value: v.value as FieldValue["value"] })),
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
        fields,
        entries,
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
      const {
        name,
        description,
        mode,
        season,
        fields,
        config,
      }: {
        name: string;
        description?: string | null;
        mode: string;
        season?: string | null;
        fields: FieldDefinition[];
        config?: Record<string, unknown>;
      } = body;

      if (!name?.trim()) {
        return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
      }
      if (!fields?.length) {
        return NextResponse.json(
          { error: "É necessário ao menos um campo" },
          { status: 400 },
        );
      }

      const [created] = await db
        .insert(tests)
        .values({
          userId,
          name: name.trim(),
          description: description ?? null,
          mode: mode as (typeof tests.$inferInsert)["mode"],
          season: season ?? null,
          status: "ativo",
          config: config ?? {},
        })
        .returning({ id: tests.id });

      await db.insert(testFields).values(
        fields.map((f, i) => ({
          testId: created.id,
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.type,
          unit: f.unit ?? null,
          targetValue: f.targetValue ?? null,
          fieldOrder: f.order ?? i,
          options: f.options ?? null,
          required: f.required ?? false,
          source: f.source ?? "manual",
        })),
      );

      return NextResponse.json({ id: created.id });
    }

    if (body.action === "entries") {
      const {
        testId,
        entries,
        startingExecutionNumber,
      }: {
        testId: string;
        entries: { values: FieldValue[]; notes?: string | null }[];
        startingExecutionNumber: number;
      } = body;

      const test = await db.query.tests.findFirst({
        where: and(eq(tests.id, testId), eq(tests.userId, userId)),
      });
      if (!test) {
        return NextResponse.json({ error: "Teste não encontrado" }, { status: 404 });
      }
      if (!entries?.length) {
        return NextResponse.json({ error: "Nenhum lançamento para salvar" }, { status: 400 });
      }

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const [exec] = await db
          .insert(testExecutions)
          .values({
            testId,
            executionNumber: startingExecutionNumber + i,
            notes: entry.notes ?? null,
          })
          .returning({ id: testExecutions.id });

        const values = (entry.values ?? []).filter(
          (v) => v.value !== null && v.value !== "",
        );
        if (values.length) {
          await db.insert(testFieldValues).values(
            values.map((v) => ({
              executionId: exec.id,
              fieldKey: v.fieldKey,
              value: v.value,
            })),
          );
        }
      }

      await db
        .update(tests)
        .set({ updatedAt: new Date(), lastAccessAt: new Date() })
        .where(eq(tests.id, testId));

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    console.error("[POST /api/labtest]", err);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
