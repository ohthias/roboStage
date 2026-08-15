import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Clock3,
  FileText,
  Play,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

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

const STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  ativo: {
    label: "Ativo",
    className: "badge-success badge-outline",
  },
  rascunho: {
    label: "Rascunho",
    className: "badge-ghost",
  },
  arquivado: {
    label: "Arquivado",
    className: "badge-neutral",
  },
};

function formatDate(value: string | Date | null) {
  if (!value) return "—";

  const date = typeof value === "string" ? new Date(value) : value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | Date | null) {
  if (!value) return "—";

  const date = typeof value === "string" ? new Date(value) : value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ` às ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default async function LabTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const test = await db.query.labTests.findFirst({
    where: eq(labTests.id, id),
  });

  if (!test) notFound();
  if (test.userId !== userId) notFound();

  if (test.status === "rascunho") {
    redirect(`/dashboard/labtest/${test.id}/setup`);
  }

  const [team, executions] = await Promise.all([
    test.teamId
      ? db
          .select({ name: teams.name })
          .from(teams)
          .where(eq(teams.id, test.teamId))
          .then((r) => r[0])
      : Promise.resolve(null),

    db
      .select()
      .from(labTestExecutions)
      .where(eq(labTestExecutions.testId, test.id))
      .orderBy(desc(labTestExecutions.attemptNumber))
      .limit(20),
  ]);

  const status = STATUS_BADGE[test.status] ?? {
    label: test.status,
    className: "badge-ghost",
  };

  const totalExecutions = executions.length;

  const totalDuration = executions.reduce(
    (total, execution) =>
      total + Number(execution.durationSeconds ?? 0),
    0,
  );

  const averageDuration =
    totalExecutions > 0
      ? Math.round(totalDuration / totalExecutions)
      : 0;

  const latestExecution = executions[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="pt-2">
        <Link
          href="/dashboard/labtest"
          className="inline-flex items-center gap-2 text-sm text-base-content/50 transition-colors hover:text-base-content"
        >
          <ArrowLeft className="size-4" />
          Voltar para Testes
        </Link>
      </div>

      {/* Header */}
      <header className="rounded-2xl border border-base-300 bg-base-200/50 p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="badge badge-sm badge-primary">
                  {TYPE_LABEL[test.type] ?? test.type}
                </span>

                <span
                  className={`badge badge-sm ${status.className}`}
                >
                  {status.label}
                </span>

                {team && (
                  <span className="badge badge-sm badge-ghost">
                    {team.name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {test.name}
              </h1>

              {test.description && (
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-base-content/60">
                  {test.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-base-content/50">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  Criado em {formatDate(test.createdAt)}
                </span>

                {latestExecution && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />
                    Última execução{" "}
                    {formatDateTime(latestExecution.executedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/dashboard/labtest/${test.id}/setup`}
                className="btn btn-ghost"
              >
                <Settings2 className="size-4" />
                Configurar
              </Link>

              <Link
                href={`/dashboard/labtest/${test.id}/execute`}
                className="btn btn-primary"
              >
                <Play className="size-4" />
                Nova execução
              </Link>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricCard
              label="Execuções"
              value={totalExecutions}
              icon={<Play className="size-4" />}
            />

            <MetricCard
              label="Duração média"
              value={averageDuration ? `${averageDuration}s` : "—"}
              icon={<Clock3 className="size-4" />}
            />

            <MetricCard
              label="Última tentativa"
              value={
                latestExecution
                  ? `#${latestExecution.attemptNumber}`
                  : "—"
              }
              icon={<Target className="size-4" />}
            />

            <MetricCard
              label="Tipo"
              value={TYPE_LABEL[test.type] ?? test.type}
              icon={<BarChart3 className="size-4" />}
            />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-4 z-20">
        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-200/95 p-1 shadow-sm backdrop-blur">
          <div className="tabs tabs-boxed min-w-max bg-transparent">
            <a
              href="#geral"
              className="tab tab-active gap-2"
            >
              <Target className="size-4" />
              Geral
            </a>

            <a
              href="#insights"
              className="tab gap-2"
            >
              <Sparkles className="size-4" />
              Insights
            </a>

            <a
              href="#relatorios"
              className="tab gap-2"
            >
              <FileText className="size-4" />
              Relatórios
            </a>
          </div>
        </div>
      </nav>

      {/* Geral */}
      <section id="geral" className="scroll-mt-24 space-y-8">
        <section className="space-y-3">
          <SectionHeading
            icon={<Target className="size-4" />}
            title="Configuração"
            description="Resumo da configuração atual deste teste."
          />

          {test.type === "run" && (
            <RunPlanSummary testId={test.id} />
          )}

          {test.type === "calibrabot" && (
            <CalibrationPlanSummary testId={test.id} />
          )}

          {test.type === "personalizado" && (
            <ParametersSummary testId={test.id} />
          )}
        </section>

        <section className="space-y-3">
          <SectionHeading
            icon={<Play className="size-4" />}
            title="Execuções"
            description="Histórico das últimas execuções realizadas."
            action={
              <Link
                href={`/dashboard/labtest/${test.id}/execute`}
                className="btn btn-sm btn-primary"
              >
                <Play className="size-3.5" />
                Executar
              </Link>
            }
          />

          {executions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 p-12 text-center">
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-base-300/60">
                <Play className="size-5 text-base-content/50" />
              </div>

              <h3 className="font-semibold">
                Nenhuma execução ainda
              </h3>

              <p className="mt-1 text-sm text-base-content/50">
                Execute o teste para começar a gerar dados.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-base-300 bg-base-200/30">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="text-xs uppercase text-base-content/50">
                      <th>#</th>
                      <th>Data</th>
                      <th>Operador</th>
                      <th>Duração</th>
                      <th>Resumo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {executions.map((exec) => (
                      <tr
                        key={exec.id}
                        className="transition-colors hover:bg-base-200"
                      >
                        <td>
                          <span className="font-mono text-xs font-semibold">
                            #{exec.attemptNumber}
                          </span>
                        </td>

                        <td className="text-sm">
                          {formatDateTime(exec.executedAt)}
                        </td>

                        <td className="text-sm">
                          {exec.operatorId}
                        </td>

                        <td className="text-sm">
                          {exec.durationSeconds != null
                            ? `${exec.durationSeconds}s`
                            : "—"}
                        </td>

                        <td className="max-w-sm truncate text-sm text-base-content/60">
                          {exec.resultSummary ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </section>

      {/* Insights */}
      <section
        id="insights"
        className="scroll-mt-24 space-y-4"
      >
        <SectionHeading
          icon={<Sparkles className="size-4" />}
          title="Insights"
          description="Indicadores derivados das execuções deste teste."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            icon={<TrendingUp className="size-5" />}
            title="Consistência"
            description="Analise a variação entre as execuções e identifique padrões de desempenho."
          />

          <InsightCard
            icon={<Target className="size-5" />}
            title="Padrões de falha"
            description="Detecte problemas recorrentes e pontos que merecem investigação."
          />

          <InsightCard
            icon={<BarChart3 className="size-5" />}
            title="Desempenho"
            description="Compare duração, resultados e evolução das tentativas."
          />
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200/40 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>

            <div>
              <h3 className="font-semibold">
                Motor de insights
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-base-content/60">
                Esta área pode concentrar análises automáticas do
                LabTest, como consistência, índice de autonomia,
                padrões de falha, melhores execuções e evolução de
                desempenho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Relatórios */}
      <section
        id="relatorios"
        className="scroll-mt-24 space-y-4"
      >
        <SectionHeading
          icon={<FileText className="size-4" />}
          title="Relatórios"
          description="Gere e consulte relatórios derivados deste teste."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <ReportCard
            title="Relatório completo"
            description="Resumo do teste, configuração, execuções e principais métricas."
          />

          <ReportCard
            title="Relatório de desempenho"
            description="Comparativo das execuções e evolução dos resultados."
          />

          <ReportCard
            title="Relatório de falhas"
            description="Agrupamento de falhas e padrões encontrados durante os testes."
          />

          <ReportCard
            title="Exportar dados"
            description="Disponibilize os dados do LabTest para análise externa."
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-base-content/50">
          {label}
        </span>

        <span className="text-base-content/40">
          {icon}
        </span>
      </div>

      <div className="truncate text-xl font-bold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/50">
            {icon}
          </span>

          <h2 className="text-lg font-bold tracking-tight">
            {title}
          </h2>
        </div>

        <p className="mt-1 text-sm text-base-content/50">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-base-300 bg-base-200/40 p-5 transition-colors hover:bg-base-200">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-base-content/55">
        {description}
      </p>
    </div>
  );
}

function ReportCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="group rounded-xl border border-base-300 bg-base-200/40 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-base-content/20 hover:bg-base-200"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-base-300/60">
          <FileText className="size-5 text-base-content/60" />
        </div>

        <span className="text-xs text-base-content/30 transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>

      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-base-content/55">
        {description}
      </p>
    </button>
  );
}

async function RunPlanSummary({
  testId,
}: {
  testId: string;
}) {
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
    .innerJoin(
      fllMissions,
      eq(fllMissions.id, labTestRunPlan.missionId),
    )
    .where(eq(labTestRunPlan.testId, testId))
    .orderBy(asc(labTestRunPlan.orderIndex));

  return (
    <div className="rounded-xl border border-base-300 bg-base-200/30 p-4">
      {plan.length === 0 ? (
        <p className="text-sm text-base-content/50">
          Nenhuma missão configurada.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {plan.map((m) => (
            <li
              key={m.missionId}
              className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="badge badge-neutral">
                  {m.orderIndex + 1}
                </span>

                <span className="font-mono text-xs text-base-content/40">
                  {m.missionCode}
                </span>

                <span className="truncate text-sm font-medium">
                  {m.missionName}
                </span>
              </div>

              <span
                className={`badge badge-sm shrink-0 ${
                  m.fullAttempt
                    ? "badge-primary"
                    : "badge-ghost"
                }`}
              >
                {m.fullAttempt ? "Completa" : "Parcial"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

async function CalibrationPlanSummary({
  testId,
}: {
  testId: string;
}) {
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
    <div className="rounded-xl border border-base-300 bg-base-200/30 p-4">
      {!plan ? (
        <p className="text-sm text-base-content/50">
          Nenhuma configuração salva.
        </p>
      ) : (
        <div className="space-y-4">
          <span className="badge badge-info badge-outline">
            {SUBTYPE_LABEL[plan.calibrationType] ??
              plan.calibrationType}
          </span>

          <pre className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-4 whitespace-pre-wrap break-words font-mono text-xs text-base-content/70">
            {JSON.stringify(plan.config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

async function ParametersSummary({
  testId,
}: {
  testId: string;
}) {
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
    <div className="rounded-xl border border-base-300 bg-base-200/30">
      {parameters.length === 0 ? (
        <div className="p-4">
          <p className="text-sm text-base-content/50">
            Nenhum parâmetro configurado.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase text-base-content/50">
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
                  <td className="text-sm font-medium">
                    {p.name}
                  </td>

                  <td className="text-sm">
                    {TYPE_LABEL_LOCAL[p.type] ?? p.type}
                  </td>

                  <td className="text-sm">
                    {p.unit ?? "—"}
                  </td>

                  <td className="text-sm">
                    {p.isRequired ? "Sim" : "Não"}
                  </td>

                  <td className="max-w-xs truncate text-sm text-base-content/60">
                    {p.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}