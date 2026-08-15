import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  labTests,
  teams,
  labTestExecutions,
  labTestRunPlan,
  fllMissions,
  labTestCalibrationPlan,
  labTestParameters,
} from "@/db/schema";

const TYPE_LABEL: Record<string, string> = {
  run: "Run",
  calibrabot: "CalibraBot",
  personalizado: "Personalizado",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "badge-success badge-outline" },
  rascunho: { label: "Rascunho", className: "badge-ghost" },
  arquivado: { label: "Arquivado", className: "badge-neutral" },
};

function formatDate(value: string | Date | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function LabTestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const test = await db.query.labTests.findFirst({ where: eq(labTests.id, id) });
  if (!test) notFound();
  if (test.userId !== userId) notFound();

  if (test.status === "rascunho") {
    redirect(`/dashboard/labtest/${test.id}/setup`);
  }

  const [team, executions] = await Promise.all([
    test.teamId
      ? db.select({ name: teams.name }).from(teams).where(eq(teams.id, test.teamId)).then((r) => r[0])
      : Promise.resolve(null),
    db
      .select()
      .from(labTestExecutions)
      .where(eq(labTestExecutions.testId, test.id))
      .orderBy(desc(labTestExecutions.attemptNumber))
      .limit(20),
  ]);

  const status = STATUS_BADGE[test.status];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-16">
      <div className="flex flex-col gap-3">
        <Link href="/dashboard/labtest" className="text-xs text-base-content/50 hover:underline">
          ← Testes
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-sm">{TYPE_LABEL[test.type]}</span>
              <span className={`badge badge-sm ${status.className}`}>{status.label}</span>
              {team && <span className="badge badge-sm badge-ghost">{team.name}</span>}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{test.name}</h1>
            {test.description && (
              <p className="mt-1 max-w-2xl text-sm text-base-content/60">{test.description}</p>
            )}
          </div>

          <Link href={`/dashboard/labtest/${test.id}/execute`} className="btn btn-warning">
            + Nova execução
          </Link>
        </div>
      </div>

      {test.type === "run" && <RunPlanSummary testId={test.id} />}
      {test.type === "calibrabot" && <CalibrationPlanSummary testId={test.id} />}
      {test.type === "personalizado" && <ParametersSummary testId={test.id} />}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
          Execuções
        </h2>

        {executions.length === 0 ? (
          <div className="card border border-base-300 bg-base-200">
            <div className="card-body items-center gap-2 py-10 text-center text-sm text-base-content/60">
              Nenhuma execução registrada ainda.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Data</th>
                  <th>Operador</th>
                  <th>Duração</th>
                  <th>Resumo</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((exec) => (
                  <tr key={exec.id} className="hover">
                    <td className="font-mono text-xs">{exec.attemptNumber}</td>
                    <td className="text-sm">{formatDate(exec.executedAt)}</td>
                    <td className="text-sm">{exec.operatorId}</td>
                    <td className="text-sm">
                      {exec.durationSeconds ? `${exec.durationSeconds}s` : "—"}
                    </td>
                    <td className="max-w-xs truncate text-sm text-base-content/60">
                      {exec.resultSummary ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

async function RunPlanSummary({ testId }: { testId: string }) {
  const plan = await db
    .select({
      orderIndex: labTestRunPlan.orderIndex,
      fullAttempt: labTestRunPlan.fullAttempt,
      notes: labTestRunPlan.notes,
      missionId: fllMissions.id,
      missionCode: fllMissions.code,
      missionName: fllMissions.name,
      maxScore: fllMissions.maxScore,
    })
    .from(labTestRunPlan)
    .innerJoin(fllMissions, eq(fllMissions.id, labTestRunPlan.missionId))
    .where(eq(labTestRunPlan.testId, testId))
    .orderBy(asc(labTestRunPlan.orderIndex));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
        Plano de missões
      </h2>
      {plan.length === 0 ? (
        <p className="text-sm text-base-content/50">Nenhuma missão configurada.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {plan.map((m) => (
            <li
              key={m.missionId}
              className="flex items-center justify-between gap-3 rounded-lg border border-base-300 px-4 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="badge badge-neutral">{m.orderIndex + 1}</span>
                <span className="font-mono text-xs text-base-content/50">{m.missionCode}</span>
                <span className="text-sm font-medium">{m.missionName}</span>
              </div>
              <span className={`badge badge-sm ${m.fullAttempt ? "badge-warning" : "badge-ghost"}`}>
                {m.fullAttempt ? "Completa" : "Parcial"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

async function CalibrationPlanSummary({ testId }: { testId: string }) {
  const plan = await db
    .select()
    .from(labTestCalibrationPlan)
    .where(eq(labTestCalibrationPlan.testId, testId))
    .orderBy(desc(labTestCalibrationPlan.createdAt))
    .limit(1)
    .then((r) => r[0]);

  const SUBTYPE_LABEL: Record<string, string> = {
    atuadores: "Atuadores",
    programacao: "Programação",
    sensores: "Sensores",
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
        Configuração de calibração
      </h2>
      {!plan ? (
        <p className="text-sm text-base-content/50">Nenhuma configuração salva.</p>
      ) : (
        <div className="card border border-base-300 bg-base-200">
          <div className="card-body gap-2">
            <span className="badge badge-info badge-outline w-fit">
              {SUBTYPE_LABEL[plan.calibrationType] ?? plan.calibrationType}
            </span>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-base-content/70">
              {JSON.stringify(plan.config, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}

async function ParametersSummary({ testId }: { testId: string }) {
  const parameters = await db
    .select()
    .from(labTestParameters)
    .where(eq(labTestParameters.testId, testId));

  const TYPE_LABEL_LOCAL: Record<string, string> = {
    text: "Texto",
    number: "Número",
    boolean: "Sim/Não",
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
        Parâmetros ({parameters.length}/10)
      </h2>
      {parameters.length === 0 ? (
        <p className="text-sm text-base-content/50">Nenhum parâmetro configurado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Unidade</th>
                <th>Obrigatório</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((p) => (
                <tr key={p.id}>
                  <td className="text-sm font-medium">{p.name}</td>
                  <td className="text-sm">{TYPE_LABEL_LOCAL[p.type] ?? p.type}</td>
                  <td className="text-sm">{p.unit ?? "—"}</td>
                  <td className="text-sm">{p.isRequired ? "Sim" : "Não"}</td>
                  <td className="max-w-xs truncate text-sm text-base-content/60">
                    {p.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}