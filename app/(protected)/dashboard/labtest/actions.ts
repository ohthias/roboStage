"use server";

import {
  resolveStagebookScope,
} from "@/utils/stagebook/scope";
import { creatorScopeWhere, scopeWhere } from "@/utils/stagebook/permissions";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { folders } from "@/db/schema/notebook";
import { tests, testExecutions } from "@/db/schema/labtest";
import { createTestExecution as createTestExecutionAction } from "./new/actions";
import { ValidationError } from "@/utils/stagebook/validation";
import { runAction } from "@/utils/stagebook/action-result";
import type { FolderOption } from "@/types/folders";
import { buildLabTestViewData } from "@/utils/labtest/view-data";

export async function createTestExecution(input: {
  testId: string;
  notes?: string;
  results?: Record<string, unknown>;
  /** Operador da rodada (equipe): por padrão, quem lança. */
  operatorId?: string | null;
}) {
  return createTestExecutionAction(input);
}


export async function getLabTestViewData(testId: string) {
  const scope = await resolveStagebookScope();

  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.id, testId),
      creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId }),
    ),
  });

  if (!test) {
    throw new ValidationError("Teste não encontrado.");
  }

  const executionRows = await db
    .select()
    .from(testExecutions)
    .where(eq(testExecutions.testId, testId))
    .orderBy(testExecutions.executionNumber);

  return buildLabTestViewData(test, executionRows);
}

// ---------------------------------------------------------------------------
// Edição dos dados do teste (/dashboard/labtest/[id]/edit): nome, descrição e
// pasta. Tags e marco são salvos pelas actions universais de etiquetas.
// ---------------------------------------------------------------------------

/** Pastas do scope atual, com o caminho completo ("Pai / Filho") e em ordem. */
async function listFolderOptions(
  scope: Awaited<ReturnType<typeof resolveStagebookScope>>,
): Promise<FolderOption[]> {
  const rows = await db
    .select({
      id: folders.id,
      parentId: folders.parentId,
      name: folders.name,
      icon: folders.icon,
      color: folders.color,
      position: folders.position,
    })
    .from(folders)
    .where(scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }))
    .orderBy(folders.position, folders.name);

  const ids = new Set(rows.map((row) => row.id));
  const byParent = new Map<string | null, typeof rows>();
  for (const row of rows) {
    const key = row.parentId && ids.has(row.parentId) ? row.parentId : null;
    const siblings = byParent.get(key);
    if (siblings) siblings.push(row);
    else byParent.set(key, [row]);
  }

  const out: FolderOption[] = [];
  const walk = (parent: string | null, prefix: string, depth: number) => {
    if (depth > 20) return; // proteção contra ciclos
    for (const row of byParent.get(parent) ?? []) {
      const label = prefix ? `${prefix} / ${row.name}` : row.name;
      out.push({ id: row.id, label, color: row.color, icon: row.icon });
      walk(row.id, label, depth + 1);
    }
  };
  walk(null, "", 0);
  return out;
}

export async function getTestEditData(testId: string) {
  const scope = await resolveStagebookScope();

  const [test] = await db
    .select({
      id: tests.id,
      name: tests.name,
      description: tests.description,
      folderId: tests.folderId,
      mode: tests.mode,
      season: tests.season,
      status: tests.status,
      config: tests.config,
      createdAt: tests.createdAt,
      updatedAt: tests.updatedAt,
    })
    .from(tests)
    .where(
      and(eq(tests.id, testId), creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId })),
    )
    .limit(1);

  if (!test) return null;

  return {
    test: {
      ...test,
      createdAt: test.createdAt.toISOString(),
      updatedAt: test.updatedAt.toISOString(),
    },
    folders: await listFolderOptions(scope),
  };
}

export async function updateTestDetails(
  testId: string,
  input: { name: string; description?: string | null; folderId?: string | null },
) {
  return runAction(async () => {
    const scope = await resolveStagebookScope();

    const name = String(input.name ?? "").trim();
    const description = String(input.description ?? "").trim();
    const folderId = input.folderId || null;

    if (!name) throw new ValidationError("Informe um nome para o teste.");
    if (name.length > 100) throw new ValidationError("O nome deve ter no máximo 100 caracteres.");
    if (description.length > 200) {
      throw new ValidationError("A descrição deve ter no máximo 200 caracteres.");
    }

    if (folderId) {
      const [folder] = await db
        .select({ id: folders.id })
        .from(folders)
        .where(
          and(
            eq(folders.id, folderId),
            scopeWhere(scope, { userId: folders.userId, teamId: folders.teamId }),
          ),
        )
        .limit(1);
      if (!folder) throw new ValidationError("Pasta inválida ou sem permissão.");
    }

    const [previous] = await db
      .select({ folderId: tests.folderId })
      .from(tests)
      .where(
        and(eq(tests.id, testId), creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId })),
      )
      .limit(1);

    if (!previous) throw new ValidationError("Teste não encontrado ou sem permissão para editá-lo.");

    const [updated] = await db
      .update(tests)
      .set({ name, description: description || null, folderId, updatedAt: new Date() })
      .where(
        and(eq(tests.id, testId), creatorScopeWhere(scope, { userId: tests.userId, teamId: tests.teamId })),
      )
      .returning({ id: tests.id, name: tests.name });

    if (!updated) throw new ValidationError("Teste não encontrado ou sem permissão para editá-lo.");

    revalidatePath("/dashboard/labtest");
    revalidatePath(`/dashboard/labtest/${testId}`);
    revalidatePath("/dashboard/folders", "layout");
    for (const id of [previous.folderId, folderId]) {
      if (id) revalidatePath(`/dashboard/folders/${id}`);
    }

    return updated;
  });
}
