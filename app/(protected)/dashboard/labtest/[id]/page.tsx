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
import { LabTestDetailActions } from "./labtest-detail-actions";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Code2,
  Gauge,
  ListChecks,
  Play,
  Settings2,
  Users,
} from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  run: "Run",
  calibrabot: "CalibraBot",
  personalizado: "Personalizado",
};

const TYPE_ICON: Record<string, typeof ClipboardCheck> = {
  run: ClipboardCheck,
  calibrabot: Gauge,
  personalizado: Settings2,
};

const STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  ativo: {
    label: "Ativo",
    className: "badge-success",
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

const parseDate = (value: string | Date | null) =>
  value instanceof Date ? value : value ? new Date(value) : null;

function formatDate(value: string | Date | null) {
  const date = parseDate(value);
  return date?.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) ?? "—";
}

function formatDateTime(value: string | Date | null) {
  const date = parseDate(value);
  return date?.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) ?? "—";
}

export default async function LabTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const test = await db.query.labTests.findFirst({
    where: eq(labTests.id, id),
  });

  if (!test) {
    notFound();
  }

  if (test.userId !== userId) {
    notFound();
  }

  if (test.status === "rascunho") {
    redirect(
      `/dashboard/labtest/${test.id}/setup`
    );
  }

  const [team, executions, userTeams] =
    await Promise.all([
      test.teamId
        ? db
            .select({
              name: teams.name,
            })
            .from(teams)
            .where(eq(teams.id, test.teamId))
            .then((r) => r[0])
        : Promise.resolve(null),

      db
        .select()
        .from(labTestExecutions)
        .where(
          eq(
            labTestExecutions.testId,
            test.id
          )
        )
        .orderBy(
          desc(
            labTestExecutions.attemptNumber
          )
        )
        .limit(20),

      db
        .select({
          id: teams.id,
          name: teams.name,
        })
        .from(teams)
        .where(eq(teams.createdBy, userId)),
    ]);

  const status = STATUS_BADGE[test.status];

  const TypeIcon =
    TYPE_ICON[test.type] ?? ClipboardCheck;

  const totalExecutions = executions.length;

  const latestExecution =
    executions[0] ?? null;

  const totalDuration = executions.reduce(
    (sum, execution) =>
      sum + (Number(execution.durationSeconds) ?? 0),
    0
  );

  const averageDuration =
    totalExecutions > 0
      ? Math.round(totalDuration / totalExecutions)
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-8">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/labtest"
          className="group inline-flex items-center gap-1.5 text-base-content/45 transition hover:text-base-content"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          LabTest
        </Link>

        <span className="text-base-content/20">
          /
        </span>

        <span className="max-w-60 truncate text-base-content/60">
          {test.name}
        </span>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-info/5" />

        <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Informações */}
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="badge badge-warning badge-outline gap-1.5">
                  <TypeIcon size={13} />
                  {TYPE_LABEL[test.type]}
                </span>

                <span
                  className={`badge gap-1.5 ${status.className}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {status.label}
                </span>

                {team && (
                  <span className="badge badge-ghost gap-1.5">
                    <Users size={13} />
                    {team.name}
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {test.name}
              </h1>

              {test.description ? (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-base-content/55">
                  {test.description}
                </p>
              ) : (
                <p className="mt-3 text-sm italic text-base-content/35">
                  Este teste não possui uma descrição.
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-base-content/40">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  Criado em {formatDate(test.createdAt)}
                </span>

                {latestExecution && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} />
                    Última execução{" "}
                    {formatDate(
                      latestExecution.executedAt
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
              <Link
                href={`/dashboard/labtest/${test.id}/execute`}
                className="btn btn-warning gap-2 shadow-sm"
              >
                <Play
                  size={16}
                  fill="currentColor"
                />
                Nova execução
              </Link>

              <LabTestDetailActions
                testId={test.id}
                testName={test.name}
                testDescription={
                  test.description || undefined
                }
                teamId={
                  test.teamId || undefined
                }
                teams={userTeams}
              />
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={ListChecks}
          label="Execuções"
          value={totalExecutions}
          description="Últimas 20 registradas"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Última tentativa"
          value={
            latestExecution
              ? `#${latestExecution.attemptNumber}`
              : "—"
          }
          description={
            latestExecution
              ? formatDate(
                  latestExecution.executedAt
                )
              : "Nenhuma execução"
          }
        />

        <MetricCard
          icon={Clock3}
          label="Duração média"
          value={
            averageDuration
              ? `${averageDuration}s`
              : "—"
          }
          description="Tempo médio por execução"
        />

        <MetricCard
          icon={BarChart3}
          label="Tipo"
          value={TYPE_LABEL[test.type]}
          description="Modalidade do teste"
        />
      </section>

      {/* Navegação */}
      <div className="sticky top-0 z-10 -mx-4 border-y border-base-300 bg-base-100/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <nav
          role="tablist"
          className="tabs tabs-boxed w-fit bg-base-200"
        >
          <a
            href="#geral"
            role="tab"
            className="tab tab-active"
          >
            Geral
          </a>

          <a
            href="#insights"
            role="tab"
            className="tab"
          >
            Insights
          </a>

          <a
            href="#historico"
            role="tab"
            className="tab"
          >
            Histórico
          </a>
        </nav>
      </div>

      {/* Conteúdo */}
      <div
        id="geral"
        className="scroll-mt-20 flex flex-col gap-6"
      >
        {test.type === "run" && (
          <RunPlanSummary testId={test.id} />
        )}

        {test.type === "calibrabot" && (
          <CalibrationPlanSummary
            testId={test.id}
          />
        )}

        {test.type === "personalizado" && (
          <ParametersSummary
            testId={test.id}
          />
        )}
      </div>

      {/* Insights */}
      <section
        id="insights"
        className="scroll-mt-20 flex flex-col gap-3"
      >
        <SectionHeading
          icon={BarChart3}
          eyebrow="ANÁLISE"
          title="Insights"
          description="Indicadores derivados das execuções deste teste."
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <InsightCard
            title="Consistência"
            value="—"
            description="Ainda não há dados suficientes."
          />

          <InsightCard
            title="Taxa de sucesso"
            value="—"
            description="Será calculada após as execuções."
          />

          <InsightCard
            title="Tendência"
            value="—"
            description="Sem histórico suficiente."
          />
        </div>
      </section>

      {/* Histórico */}
      <section
        id="historico"
        className="scroll-mt-20 flex flex-col gap-3"
      >
        <SectionHeading
          icon={ListChecks}
          eyebrow="HISTÓRICO"
          title="Execuções"
          description="Registro das últimas execuções realizadas."
        />

        {executions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Execução</th>
                    <th>Operador</th>
                    <th>Duração</th>
                    <th>Resumo</th>
                  </tr>
                </thead>

                <tbody>
                  {executions.map((execution) => (
                    <tr
                      key={execution.id}
                      className="hover"
                    >
                      <td>
                        <span className="font-mono text-xs text-base-content/45">
                          #{execution.attemptNumber}
                        </span>
                      </td>

                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            Execução{" "}
                            {execution.attemptNumber}
                          </span>

                          <span className="text-xs text-base-content/40">
                            {formatDateTime(
                              execution.executedAt
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="text-sm text-base-content/60">
                        {execution.operatorId}
                      </td>

                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {execution.durationSeconds
                            ? `${execution.durationSeconds}s`
                            : "—"}
                        </span>
                      </td>

                      <td className="max-w-md">
                        <span className="block truncate text-sm text-base-content/55">
                          {execution.resultSummary ??
                            "Sem resumo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-base-300 md:hidden">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex flex-col gap-3 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Execução #
                        {execution.attemptNumber}
                      </p>

                      <p className="mt-1 text-xs text-base-content/40">
                        {formatDateTime(
                          execution.executedAt
                        )}
                      </p>
                    </div>

                    <span className="badge badge-ghost badge-sm">
                      {execution.durationSeconds
                        ? `${execution.durationSeconds}s`
                        : "—"}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-base-content/35">
                      Operador
                    </p>

                    <p className="mt-1 text-xs text-base-content/60">
                      {execution.operatorId}
                    </p>
                  </div>

                  {execution.resultSummary && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-base-content/35">
                        Resumo
                      </p>

                      <p className="mt-1 text-xs leading-5 text-base-content/55">
                        {execution.resultSummary}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof ListChecks;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-200 p-4">
      <div className="flex items-center gap-2 text-base-content/40">
        <Icon size={15} />
        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <div className="mt-3 truncate text-xl font-bold tracking-tight sm:text-2xl">
        {value}
      </div>

      <p className="mt-1 truncate text-[11px] text-base-content/40">
        {description}
      </p>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof BarChart3;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-300/60 text-base-content/50">
        <Icon size={17} />
      </div>

      <div>
        <span className="font-mono text-[10px] font-medium tracking-[0.15em] text-base-content/35">
          {eyebrow}
        </span>

        <h2 className="text-base font-semibold">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-base-content/40">
          {description}
        </p>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-200 p-5">
      <p className="text-xs font-medium text-base-content/50">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-base-content/40">
        {description}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-300/60 text-base-content/40">
        <ListChecks size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        Nenhuma execução ainda
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-base-content/45">
        Execute este teste para começar a
        construir seu histórico e gerar insights.
      </p>
    </div>
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
      eq(
        fllMissions.id,
        labTestRunPlan.missionId
      )
    )
    .where(
      eq(labTestRunPlan.testId, testId)
    )
    .orderBy(
      asc(labTestRunPlan.orderIndex)
    );

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        icon={ClipboardCheck}
        eyebrow="CONFIGURAÇÃO"
        title="Plano de missões"
        description={`${plan.length} missão${plan.length === 1 ? "" : "ões"} configurada${plan.length === 1 ? "" : "s"} para este teste.`}
      />

      {plan.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-200 p-8 text-center text-sm text-base-content/45">
          Nenhuma missão configurada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
          <ol className="divide-y divide-base-300">
            {plan.map((mission) => (
              <li
                key={mission.missionId}
                className="flex flex-col gap-3 p-4 transition hover:bg-base-300/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-300/70 font-mono text-xs font-semibold">
                    {String(
                      mission.orderIndex + 1
                    ).padStart(2, "0")}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-base-content/35">
                        {mission.missionCode}
                      </span>

                      <h3 className="truncate text-sm font-medium">
                        {mission.missionName}
                      </h3>
                    </div>

                    {mission.maxScore != null && (
                      <p className="mt-1 text-xs text-base-content/40">
                        Máximo:{" "}
                        {mission.maxScore} pontos
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`badge badge-sm shrink-0 ${
                    mission.fullAttempt
                      ? "badge-warning"
                      : "badge-ghost"
                  }`}
                >
                  {mission.fullAttempt
                    ? "Tentativa completa"
                    : "Tentativa parcial"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
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
    .where(
      eq(
        labTestCalibrationPlan.testId,
        testId
      )
    )
    .orderBy(
      desc(
        labTestCalibrationPlan.createdAt
      )
    )
    .limit(1)
    .then((r) => r[0]);

  const SUBTYPE_LABEL: Record<
    string,
    string
  > = {
    atuadores: "Atuadores",
    programacao: "Programação",
    sensores: "Sensores",
  };

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        icon={Gauge}
        eyebrow="CONFIGURAÇÃO"
        title="CalibraBot"
        description="Configuração utilizada pelo plano de calibração."
      />

      {!plan ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-200 p-8 text-center text-sm text-base-content/45">
          Nenhuma configuração salva.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
          <div className="flex items-center justify-between border-b border-base-300 p-4">
            <div>
              <p className="text-sm font-medium">
                Tipo de calibração
              </p>

              <p className="mt-1 text-xs text-base-content/40">
                Definido na configuração do teste.
              </p>
            </div>

            <span className="badge badge-info badge-outline">
              {SUBTYPE_LABEL[
                plan.calibrationType
              ] ?? plan.calibrationType}
            </span>
          </div>

          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs text-base-content/50 transition hover:bg-base-300/20 hover:text-base-content [&::-webkit-details-marker]:hidden">
              <Code2 size={14} />
              Ver configuração técnica
            </summary>

            <pre className="max-h-96 overflow-auto border-t border-base-300 bg-base-300/20 p-4 font-mono text-[11px] leading-5 text-base-content/60">
              {JSON.stringify(
                plan.config,
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </section>
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
    .where(
      eq(
        labTestParameters.testId,
        testId
      )
    );

  const TYPE_LABEL_LOCAL: Record<
    string,
    string
  > = {
    text: "Texto",
    number: "Número",
    boolean: "Sim/Não",
  };

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        icon={Settings2}
        eyebrow="CONFIGURAÇÃO"
        title="Parâmetros"
        description={`${parameters.length}/10 parâmetros definidos para este teste.`}
      />

      {parameters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-200 p-8 text-center text-sm text-base-content/45">
          Nenhum parâmetro configurado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
          <div className="divide-y divide-base-300 md:hidden">
            {parameters.map((parameter) => (
              <div
                key={parameter.id}
                className="flex flex-col gap-2 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {parameter.name}
                  </span>

                  <span className="badge badge-ghost badge-sm">
                    {TYPE_LABEL_LOCAL[
                      parameter.type
                    ] ?? parameter.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-base-content/45">
                  {parameter.unit && (
                    <span>
                      Unidade: {parameter.unit}
                    </span>
                  )}

                  <span>
                    {parameter.isRequired
                      ? "Obrigatório"
                      : "Opcional"}
                  </span>
                </div>

                {parameter.description && (
                  <p className="text-xs leading-5 text-base-content/45">
                    {parameter.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
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
                {parameters.map((parameter) => (
                  <tr
                    key={parameter.id}
                    className="hover"
                  >
                    <td className="font-medium">
                      {parameter.name}
                    </td>

                    <td>
                      <span className="badge badge-ghost badge-sm">
                        {TYPE_LABEL_LOCAL[
                          parameter.type
                        ] ?? parameter.type}
                      </span>
                    </td>

                    <td className="text-sm">
                      {parameter.unit ?? "—"}
                    </td>

                    <td>
                      {parameter.isRequired ? (
                        <span className="badge badge-success badge-outline badge-sm">
                          Sim
                        </span>
                      ) : (
                        <span className="text-sm text-base-content/40">
                          Não
                        </span>
                      )}
                    </td>

                    <td className="max-w-md truncate text-sm text-base-content/50">
                      {parameter.description ??
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}