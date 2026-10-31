import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { testExecutions } from "@/db/schema";
import {
  createTest,
  createTestExecution,
  deleteTest,
  listTests,
} from "@/app/(protected)/dashboard/labtest/new/actions";
import { getLabTestViewData } from "@/app/(protected)/dashboard/labtest/actions";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

const customTest = {
  mode: "custom" as const,
  name: "Sensor de cor",
  params: [{ id: "p1", name: "leitura", type: "number" }],
};

let teamId: string;

beforeAll(async () => {
  await applySchema();
  await createUser("user_ana");
  teamId = await createTeam("Equipe Alfa", [
    { userId: "user_tecnico", role: "owner" },
    { userId: "user_bia", role: "competidor" },
    { userId: "user_caio", role: "competidor" },
  ]);
});

describe("createTestExecution", () => {
  it("numera em sequência mesmo com lançamentos simultâneos", async () => {
    actAs("user_ana");
    const test = await call(createTest(customTest));

    await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        call(createTestExecution({ testId: test.id, results: { leitura: i } })),
      ),
    );

    const rows = await db
      .select({ n: testExecutions.executionNumber })
      .from(testExecutions)
      .where(eq(testExecutions.testId, test.id));
    expect(rows.map((row) => row.n).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("a constraint única rejeita número repetido", async () => {
    actAs("user_ana");
    const test = await call(createTest(customTest));
    await db.insert(testExecutions).values({ testId: test.id, executionNumber: 1, results: {} });
    await expect(
      db.insert(testExecutions).values({ testId: test.id, executionNumber: 1, results: {} }),
    ).rejects.toThrow();
  });
});

describe("escopo de equipe nos testes", () => {
  it("membros da equipe veem e lançam nos testes da equipe", async () => {
    actAs("user_bia", teamId);
    const test = await call(createTest(customTest));

    actAs("user_caio", teamId);
    expect((await listTests()).map((t) => t.id)).toContain(test.id);
    const created = await call(createTestExecution({ testId: test.id, results: { leitura: 3 } }));
    expect(created.executionNumber).toBe(1);
    const view = await getLabTestViewData(test.id);
    expect(view.entries).toHaveLength(1);
  });

  it("teste pessoal não aparece no espaço da equipe", async () => {
    actAs("user_bia");
    const personal = await call(createTest(customTest));

    actAs("user_bia", teamId);
    expect((await listTests()).map((t) => t.id)).not.toContain(personal.id);
    await expect(call(createTestExecution({ testId: personal.id }))).rejects.toThrow(
      "Teste não encontrado",
    );
  });

  it("só o criador ou técnicos/mentores excluem um teste da equipe", async () => {
    actAs("user_bia", teamId);
    const test = await call(createTest(customTest));

    actAs("user_caio", teamId);
    await expect(call(deleteTest(test.id))).rejects.toThrow("Só técnicos e mentores");

    actAs("user_tecnico", teamId);
    await call(deleteTest(test.id));
    expect((await listTests()).map((t) => t.id)).not.toContain(test.id);
  });

  it("quem não é da equipe não acessa o teste", async () => {
    actAs("user_bia", teamId);
    const test = await call(createTest(customTest));

    actAs("user_ana", teamId); // cookie de uma equipe da qual não é membro → espaço pessoal
    await expect(getLabTestViewData(test.id)).rejects.toThrow("Teste não encontrado");
  });
});
