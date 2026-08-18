import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  testExecutions,
  testFields,
  testFieldValues,
  tests,
} from "@/db/schema";

function serializeTest(test: typeof tests.$inferSelect) {
  return {
    id: test.id,
    userId: test.userId,
    name: test.name,
    description: test.description,
    mode: test.mode,
    season: test.season,
    status: test.status,
    config: test.config ?? {},
    createdAt: test.createdAt.toISOString(),
    updatedAt: test.updatedAt.toISOString(),
    lastAccessAt: test.lastAccessAt?.toISOString() ?? null,
  };
}

async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Usuário não autenticado");
  return userId;
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const testId = new URL(request.url).searchParams.get("testId");

    if (!testId) {
      const rows = await db.query.tests.findMany({
        where: eq(tests.userId, userId),
        orderBy: [desc(tests.updatedAt)],
        with: { executions: true },
      });

      return NextResponse.json(
        rows.map(({ executions, ...test }) => ({
          ...serializeTest(test),
          executionsCount: executions.length,
        })),
      );
    }

    const test = await db.query.tests.findFirst({
      where: and(eq(tests.id, testId), eq(tests.userId, userId)),
      with: {
        fields: { orderBy: [asc(testFields.fieldOrder)] },
        executions: {
          orderBy: [asc(testExecutions.executionNumber)],
          with: { fieldValues: true },
        },
      },
    });

    if (!test) return NextResponse.json({ error: "Teste não encontrado" }, { status: 404 });

    return NextResponse.json({
      test: serializeTest(test),
      fields: test.fields.map((field) => ({
        fieldKey: field.fieldKey,
        label: field.label,
        type: field.fieldType,
        unit: field.unit,
        targetValue: field.targetValue,
        order: field.fieldOrder,
        options: field.options ?? undefined,
        required: field.required,
        source: field.source,
      })),
      entries: test.executions.map((execution) => ({
        id: execution.id,
        executionNumber: execution.executionNumber,
        createdAt: execution.createdAt.toISOString(),
        notes: execution.notes,
        values: execution.fieldValues.map((value) => ({
          fieldKey: value.fieldKey,
          value: value.value,
        })),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar testes";
    return NextResponse.json({ error: message }, { status: message === "Usuário não autenticado" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();

    if (body.action === "create") {
      const [test] = await db
        .insert(tests)
        .values({
          userId,
          name: String(body.name).trim(),
          description: body.description ?? null,
          mode: body.mode,
          season: body.season ?? null,
          status: "draft",
          config: body.config ?? {},
          lastAccessAt: new Date(),
        })
        .returning({ id: tests.id });

      if (body.fields?.length) {
        await db.insert(testFields).values(
          body.fields.map((field: any, index: number) => ({
            testId: test.id,
            fieldKey: field.fieldKey,
            label: field.label,
            fieldType: field.type,
            unit: field.unit ?? null,
            targetValue: field.targetValue ?? null,
            fieldOrder: index,
            options: field.options ?? null,
            required: field.required ?? false,
            source: field.source ?? "manual",
          })),
        );
      }

      return NextResponse.json({ id: test.id }, { status: 201 });
    }

    if (body.action === "entries") {
      const test = await db.query.tests.findFirst({
        where: and(eq(tests.id, body.testId), eq(tests.userId, userId)),
        columns: { id: true },
      });
      if (!test) return NextResponse.json({ error: "Teste não encontrado" }, { status: 404 });

      for (const [index, entry] of body.entries.entries()) {
        const [execution] = await db
          .insert(testExecutions)
          .values({
            testId: test.id,
            executionNumber: body.startingExecutionNumber + index,
            notes: entry.notes ?? null,
          })
          .returning({ id: testExecutions.id });

        const values = entry.values
          .filter((value: any) => value.value !== null && value.value !== "")
          .map((value: any) => ({
            executionId: execution.id,
            fieldKey: value.fieldKey,
            value: value.value,
          }));
        if (values.length) await db.insert(testFieldValues).values(values);
      }

      await db.update(tests).set({ updatedAt: new Date(), lastAccessAt: new Date() }).where(eq(tests.id, test.id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Operação inválida" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o teste";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
