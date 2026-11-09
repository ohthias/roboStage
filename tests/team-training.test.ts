import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  anatixLabs,
  calendarEvents,
  notifications,
  teamActivity,
  teamDutyRoles,
  testExecutions,
  tests,
  trainingSessions,
} from "@/db/schema";
import { roleCan, canEditRoster, TEAM_ROLES } from "@/utils/stagebook/team-permissions";
import { recordTeamActivity } from "@/utils/stagebook/team-activity";
import { getTeamActivity } from "@/utils/stagebook/team-queries";
import {
  getMemberDutyHistory,
  getTeamDutyRoles,
  getTeamTrainingSessions,
  getTrainingSessionDetail,
  getUpcomingDutiesFor,
} from "@/utils/stagebook/training-queries";
import { getActiveTrainingSession } from "@/utils/stagebook/training-core";
import {
  checkIn,
  createTrainingSession,
  deleteTrainingSession,
  endTrainingSession,
  linkExecution,
  sessionFromCalendarEvent,
  startTrainingSession,
  unlinkExecution,
} from "@/utils/stagebook/actions/training";
import {
  assignDuty,
  getExecutionContext,
  publishRoster,
  setCurrentRound,
  setRoundCount,
  unassignDuty,
} from "@/utils/stagebook/actions/roster";
import { createTeamBoard } from "@/utils/stagebook/actions/team-resources";
import { createTestExecution } from "@/app/(protected)/dashboard/labtest/new/actions";
import { startAnatixSession } from "@/app/(protected)/dashboard/labtest/anatix/actions";
import type { TrainingSummary } from "@/types/training";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

let teamId: string;
let otherTeamId: string;

const TECNICO = "tr_tecnico";
const MENTOR = "tr_mentor";
const BIA = "tr_bia";
const CAIO = "tr_caio";
const DANI = "tr_dani";

/** Teste "runs" genérico: o placar é a soma dos campos numéricos. */
async function createRunsTest(name: string, team: string | null, owner = BIA) {
  const [row] = await db
    .insert(tests)
    .values({
      userId: owner,
      teamId: team,
      name,
      mode: "runs",
      status: "em_andamento",
      config: { parametros: [{ nome: "pontos", tipo: "number" }] },
    })
    .returning({ id: tests.id });
  return row.id;
}

async function run(testId: string, pontos: number, operatorId?: string) {
  return call(createTestExecution({ testId, results: { pontos }, operatorId }));
}

async function newActiveSession(title = "Treino", kind = "treino") {
  actAs(BIA, teamId);
  return (await call(createTrainingSession(teamId, { title, kind, startNow: true }))).id;
}

async function closeAllSessions() {
  await db
    .update(trainingSessions)
    .set({ status: "encerrada", endedAt: new Date() })
    .where(and(eq(trainingSessions.teamId, teamId), eq(trainingSessions.status, "em_andamento")));
}

beforeAll(async () => {
  await applySchema();
  teamId = await createTeam("Equipe Treino", [
    { userId: TECNICO, role: "owner" },
    { userId: MENTOR, role: "mentor" },
    { userId: BIA, role: "competidor" },
    { userId: CAIO, role: "colaborador" },
  ]);
  otherTeamId = await createTeam("Outra equipe", [{ userId: DANI, role: "owner" }]);
  await createUser("tr_estranho");
});

beforeEach(async () => {
  vi.useRealTimers();
  await closeAllSessions();
});

// ---------------------------------------------------------------------------

describe("matriz de permissões", () => {
  it("sessões para todos; excluir de outros e escala de competição só staff", () => {
    for (const role of TEAM_ROLES) expect(roleCan(role, "session.run")).toBe(true);
    expect(roleCan("owner", "session.delete.any")).toBe(true);
    expect(roleCan("mentor", "session.delete.any")).toBe(true);
    expect(roleCan("competidor", "session.delete.any")).toBe(false);
    expect(roleCan("colaborador", "roster.manage")).toBe(false);
    expect(roleCan("mentor", "roster.manage")).toBe(true);
    expect(canEditRoster("competidor", "treino")).toBe(true);
    expect(canEditRoster("competidor", "competicao")).toBe(false);
    expect(canEditRoster("owner", "competicao")).toBe(true);
  });
});

describe("sessão de treino", () => {
  it("só uma sessão em andamento por equipe (mensagem amigável)", async () => {
    await newActiveSession("Treino A");
    actAs(CAIO, teamId);
    const second = await call(createTrainingSession(teamId, { title: "Treino B" }));
    const result = await startTrainingSession(teamId, second.id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/já existe uma sessão em andamento/i);
  });

  it("quem não é membro não acessa", async () => {
    actAs("tr_estranho");
    const result = await createTrainingSession(teamId, { title: "Invasão" });
    expect(result.ok).toBe(false);
  });

  it("membro só exclui a própria sessão; técnico exclui qualquer uma", async () => {
    actAs(BIA, teamId);
    const s = await call(createTrainingSession(teamId, { title: "Da Bia" }));
    actAs(CAIO, teamId);
    expect((await deleteTrainingSession(teamId, s.id)).ok).toBe(false);
    actAs(TECNICO, teamId);
    expect((await deleteTrainingSession(teamId, s.id)).ok).toBe(true);
  });
});

describe("vínculo automático", () => {
  it("execução de teste da equipe cai na sessão ativa; teste pessoal, não", async () => {
    const sessionId = await newActiveSession();
    const teamTest = await createRunsTest("Missão vínculo", teamId);

    actAs(BIA, teamId);
    const exec = await run(teamTest, 10);
    expect(exec.trainingSessionId).toBe(sessionId);
    expect(exec.createdBy).toBe(BIA);

    actAs(BIA);
    const personal = await createRunsTest("Pessoal", null);
    const personalExec = await run(personal, 5);
    expect(personalExec.trainingSessionId).toBeNull();
  });

  it("com a sessão encerrada, a execução fica sem sessão", async () => {
    const sessionId = await newActiveSession();
    actAs(BIA, teamId);
    await call(endTrainingSession(teamId, sessionId));
    const teamTest = await createRunsTest("Depois do treino", teamId);
    const exec = await run(teamTest, 7);
    expect(exec.trainingSessionId).toBeNull();
  });

  it("sessão Anatix de lab da equipe também é vinculada", async () => {
    const sessionId = await newActiveSession();
    const [lab] = await db
      .insert(anatixLabs)
      .values({ userId: BIA, teamId, name: "Lab" })
      .returning({ id: anatixLabs.id });
    actAs(BIA, teamId);
    const started = await call(startAnatixSession({ labId: lab.id, robotName: "Bolt" }));
    const linked = await db.query.anatixSessions.findFirst({
      where: (t, { eq }) => eq(t.id, started.sessionId),
    });
    expect(linked?.trainingSessionId).toBe(sessionId);
  });

  it("sessão parada há mais de 6 h encerra sozinha e não captura novos dados", async () => {
    const sessionId = await newActiveSession("Esquecida");
    const later = new Date(Date.now() + 7 * 60 * 60 * 1000);
    expect(await getActiveTrainingSession(teamId, later)).toBeNull();
    const [row] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, sessionId));
    expect(row.status).toBe("encerrada");
  });

  it("o operador pode ser outro membro, mas não alguém de fora", async () => {
    await newActiveSession();
    const teamTest = await createRunsTest("Operador", teamId);
    actAs(BIA, teamId);
    expect((await run(teamTest, 3, CAIO)).createdBy).toBe(CAIO);
    const bad = await createTestExecution({ testId: teamTest, results: { pontos: 1 }, operatorId: DANI });
    expect(bad.ok).toBe(false);
  });
});

describe("resumo da sessão", () => {
  it("best / avg / prevAvg com dois testes e duas sessões", async () => {
    const t1 = await createRunsTest("Resumo T1", teamId);
    const t2 = await createRunsTest("Resumo T2", teamId);

    const first = await newActiveSession("Sessão 1");
    actAs(BIA, teamId);
    await run(t1, 100);
    await run(t1, 200);
    await call(endTrainingSession(teamId, first));

    // Garante ordem temporal entre as sessões.
    await new Promise((r) => setTimeout(r, 20));
    const second = await newActiveSession("Sessão 2");
    actAs(BIA, teamId);
    await run(t1, 300);
    await run(t1, 360, CAIO);
    await run(t2, 50);
    await call(checkIn(teamId, second, CAIO));
    await call(endTrainingSession(teamId, second));

    const [row] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, second));
    const summary = row.summary as TrainingSummary;
    expect(summary.executions).toBe(3);
    expect(summary.attendees).toBe(2);
    const s1 = summary.tests.find((t) => t.testId === t1)!;
    expect(s1).toMatchObject({ runs: 2, best: 360, avg: 330, prevAvg: 150 });
    const s2 = summary.tests.find((t) => t.testId === t2)!;
    expect(s2).toMatchObject({ runs: 1, best: 50, avg: 50, prevAvg: null });
    expect(summary.byOperator.find((o) => o.userId === CAIO)).toMatchObject({ runs: 1, avg: 360 });
  });

  it("vincular/desvincular à mão recalcula o resumo de sessão encerrada", async () => {
    const t = await createRunsTest("Correção", teamId);
    actAs(BIA, teamId);
    const loose = await run(t, 40); // sem sessão ativa
    expect(loose.trainingSessionId).toBeNull();

    const sessionId = await newActiveSession("Correção");
    actAs(BIA, teamId);
    await call(endTrainingSession(teamId, sessionId));
    await call(linkExecution(teamId, sessionId, loose.id));
    let [row] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, sessionId));
    expect((row.summary as TrainingSummary).executions).toBe(1);

    await call(unlinkExecution(teamId, sessionId, loose.id));
    [row] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, sessionId));
    expect((row.summary as TrainingSummary).executions).toBe(0);
  });

  it("não vincula execução de outra equipe", async () => {
    const foreign = await createRunsTest("Alheio", otherTeamId, DANI);
    actAs(DANI, otherTeamId);
    const exec = await run(foreign, 1);
    const sessionId = await newActiveSession();
    actAs(BIA, teamId);
    expect((await linkExecution(teamId, sessionId, exec.id)).ok).toBe(false);
  });
});

describe("feed de atividade", () => {
  it("3 execuções em 10 min viram 1 linha (count 3, bestScore); após 31 min, linha nova", async () => {
    const t = await createRunsTest("Feed agregado", teamId);
    vi.useFakeTimers({ toFake: ["Date"] });
    const t0 = new Date("2026-11-01T12:00:00Z");
    vi.setSystemTime(t0);

    actAs(BIA, teamId);
    await run(t, 10);
    vi.setSystemTime(new Date(t0.getTime() + 5 * 60_000));
    await run(t, 30);
    vi.setSystemTime(new Date(t0.getTime() + 10 * 60_000));
    await run(t, 20);

    let rows = await db
      .select()
      .from(teamActivity)
      .where(and(eq(teamActivity.entityId, t), eq(teamActivity.verb, "test.executed")));
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(3);
    expect(rows[0].data.bestScore).toBe(30);

    vi.setSystemTime(new Date(t0.getTime() + 41 * 60_000));
    await run(t, 5);
    rows = await db
      .select()
      .from(teamActivity)
      .where(and(eq(teamActivity.entityId, t), eq(teamActivity.verb, "test.executed")));
    expect(rows).toHaveLength(2);
    vi.useRealTimers();

    // A segunda execução bateu o recorde anterior.
    const records = await db
      .select()
      .from(teamActivity)
      .where(and(eq(teamActivity.entityId, t), eq(teamActivity.verb, "test.record")));
    expect(records.map((r) => r.data.score)).toEqual([30]);
  });

  it("recordTeamActivity que falha não quebra createTeamBoard", async () => {
    const realInsert = db.insert.bind(db);
    const spy = vi.spyOn(db, "insert").mockImplementation(((table: unknown) => {
      if (table === teamActivity) throw new Error("feed fora do ar");
      return realInsert(table as never);
    }) as typeof db.insert);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    actAs(BIA, teamId);
    const result = await createTeamBoard(teamId, { name: `Board ${Date.now()}` });
    expect(result.ok).toBe(true);

    spy.mockRestore();
    errors.mockRestore();
  });

  it("feed lista com nome do ator e pagina por cursor", async () => {
    for (let i = 0; i < 3; i++) {
      await recordTeamActivity({
        teamId,
        actorId: TECNICO,
        verb: "milestone.created",
        entityType: "milestone",
        data: { name: `Marco ${i}` },
        aggregate: false,
      });
    }
    const page1 = await getTeamActivity(teamId, { limit: 2 });
    expect(page1).toHaveLength(2);
    expect(page1[0].actor?.name).toBeTruthy();
    const page2 = await getTeamActivity(teamId, { before: new Date(page1[1].updatedAt), limit: 2 });
    expect(page2.length).toBeGreaterThan(0);
    expect(page2.map((x) => x.id)).not.toContain(page1[0].id);
  });
});

describe("escala de funções", () => {
  it("semeia funções padrão, rejeita não-membro e respeita maxPerSlot", async () => {
    const roles = await getTeamDutyRoles(teamId);
    expect(roles.length).toBeGreaterThan(0);
    const piloto = roles[0];

    actAs(BIA, teamId);
    const s = await call(createTrainingSession(teamId, { title: "Escala", kind: "treino" }));
    await call(setRoundCount(teamId, s.id, 2));

    expect((await assignDuty(teamId, s.id, { dutyRoleId: piloto.id, userId: DANI, round: 1 })).ok).toBe(false);

    await db.update(teamDutyRoles).set({ maxPerSlot: 1 }).where(eq(teamDutyRoles.id, piloto.id));

    await call(assignDuty(teamId, s.id, { dutyRoleId: piloto.id, userId: BIA, round: 1 }));
    const full = await assignDuty(teamId, s.id, { dutyRoleId: piloto.id, userId: CAIO, round: 1 });
    expect(full.ok).toBe(false);
    if (!full.ok) expect(full.error).toMatch(/no máximo 1/);
    // Outra rodada é outra vaga.
    await call(assignDuty(teamId, s.id, { dutyRoleId: piloto.id, userId: CAIO, round: 2 }));
  });

  it("competição: só técnico/mentor monta a escala", async () => {
    const roles = await getTeamDutyRoles(teamId);
    actAs(TECNICO, teamId);
    const s = await call(createTrainingSession(teamId, { title: "Regional SP", kind: "competicao" }));
    actAs(BIA, teamId);
    expect((await assignDuty(teamId, s.id, { dutyRoleId: roles[0].id, userId: BIA })).ok).toBe(false);
    actAs(MENTOR, teamId);
    expect((await assignDuty(teamId, s.id, { dutyRoleId: roles[0].id, userId: BIA })).ok).toBe(true);
  });

  it("publicar notifica exatamente os escalados; republicar só quem mudou", async () => {
    const roles = await getTeamDutyRoles(teamId);
    actAs(TECNICO, teamId);
    const s = await call(createTrainingSession(teamId, { title: "Publicação", kind: "competicao" }));
    await call(setRoundCount(teamId, s.id, 2));
    await call(assignDuty(teamId, s.id, { dutyRoleId: roles[1].id, userId: BIA, round: 1 }));
    await call(assignDuty(teamId, s.id, { dutyRoleId: roles[1].id, userId: BIA, round: 2 }));
    const caio = await call(assignDuty(teamId, s.id, { dutyRoleId: roles[2].id, userId: CAIO }));

    const count = async (userId: string) =>
      (
        await db
          .select()
          .from(notifications)
          .where(and(eq(notifications.userId, userId), eq(notifications.type, "roster")))
      ).filter((n) => (n.data as { sessionId?: string })?.sessionId === s.id);

    const first = await call(publishRoster(teamId, s.id));
    expect(first.notified).toBe(2);
    const biaNotes = await count(BIA);
    expect(biaNotes).toHaveLength(1);
    expect(biaNotes[0].message).toMatch(/rodadas 1 e 2/);
    expect(await count(MENTOR)).toHaveLength(0);

    // Caio sai, Mentor entra; Bia não muda.
    await call(unassignDuty(teamId, s.id, caio.id));
    await call(assignDuty(teamId, s.id, { dutyRoleId: roles[2].id, userId: MENTOR }));
    const second = await call(publishRoster(teamId, s.id));
    expect(second.notified).toBe(2);
    expect(await count(BIA)).toHaveLength(1);
    expect((await count(CAIO)).at(-1)?.title).toMatch(/saiu da escala/);
    expect(await count(MENTOR)).toHaveLength(1);
  });

  it("a escala sugere o operador da rodada atual na tela de execução", async () => {
    const roles = await getTeamDutyRoles(teamId);
    actAs(TECNICO, teamId);
    const s = await call(createTrainingSession(teamId, { title: "Sugestão", kind: "treino", startNow: true }));
    await call(setRoundCount(teamId, s.id, 2));
    await call(assignDuty(teamId, s.id, { dutyRoleId: roles[0].id, userId: BIA, round: 1 }));
    await call(assignDuty(teamId, s.id, { dutyRoleId: roles[0].id, userId: CAIO, round: 2 }));
    const teamTest = await createRunsTest("Sugestão", teamId);

    await call(setCurrentRound(teamId, s.id, 2));
    const ctx = await getExecutionContext(teamTest);
    expect(ctx.session?.id).toBe(s.id);
    expect(ctx.suggestedOperatorId).toBe(CAIO);
    expect(ctx.members.map((m) => m.userId)).toContain(BIA);
  });
});

describe("leituras da página da equipe", () => {
  it("lista, detalhe, próximas funções e histórico", async () => {
    const roles = await getTeamDutyRoles(teamId);
    actAs(TECNICO, teamId);
    const s = await call(createTrainingSession(teamId, { title: "Leituras", kind: "competicao" }));
    await call(assignDuty(teamId, s.id, { dutyRoleId: roles[0].id, userId: BIA }));
    await call(publishRoster(teamId, s.id));

    const upcoming = await getUpcomingDutiesFor(teamId, BIA);
    expect(upcoming.find((u) => u.sessionId === s.id)?.duties[0].label).toBe(roles[0].label);

    await call(startTrainingSession(teamId, s.id));
    const t = await createRunsTest("Leituras T", teamId);
    actAs(BIA, teamId);
    await run(t, 42);

    const list = await getTeamTrainingSessions(teamId);
    expect(list[0].id).toBe(s.id); // em andamento vem primeiro
    expect(list[0].executionCount).toBe(1);

    const detail = await getTrainingSessionDetail(teamId, s.id);
    expect(detail?.executions[0]).toMatchObject({ score: 42, operatorId: BIA });
    expect(detail?.attendees.map((a) => a.userId)).toContain(TECNICO);
    expect(detail?.session.rosterDirty).toBe(false);

    // Outra equipe não enxerga a sessão.
    expect(await getTrainingSessionDetail(otherTeamId, s.id)).toBeNull();

    actAs(TECNICO, teamId);
    await call(endTrainingSession(teamId, s.id));
    const history = await getMemberDutyHistory(teamId);
    expect(history[BIA]?.find((h) => h.label === roles[0].label)?.count).toBeGreaterThanOrEqual(1);
    const [row] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, s.id));
    expect((row.summary as TrainingSummary).byDuty?.[0]).toMatchObject({ userId: BIA, runs: 1, avg: 42 });
  });

  it("evento de treino da equipe vira sessão (e reaproveita a mesma)", async () => {
    const [event] = await db
      .insert(calendarEvents)
      .values({
        teamId,
        title: "Treino de sábado",
        type: "treino",
        location: "Lab",
        startAt: new Date(),
        createdBy: TECNICO,
      })
      .returning({ id: calendarEvents.id });
    actAs(CAIO, teamId);
    const first = await call(sessionFromCalendarEvent(event.id));
    const again = await call(sessionFromCalendarEvent(event.id, { start: true }));
    expect(again.sessionId).toBe(first.sessionId);
    const [row] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, first.sessionId));
    expect(row).toMatchObject({ status: "em_andamento", location: "Lab", calendarEventId: event.id });
  });

  it("criar recursos da equipe publica no feed", async () => {
    actAs(CAIO, teamId);
    const board = await call(createTeamBoard(teamId, { name: "Feed board" }));
    const [row] = await db.select().from(teamActivity).where(eq(teamActivity.entityId, board.id));
    expect(row).toMatchObject({ verb: "board.created", actorId: CAIO });
    expect(row.data.name).toBe("Feed board");
  });
});
