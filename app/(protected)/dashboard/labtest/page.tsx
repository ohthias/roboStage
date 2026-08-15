import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { labTests, labTestExecutions, teams, teamMembers } from "@/db/schema";
import { NewTestModal } from "./new-test-modal";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  run: { label: "Run", className: "badge-warning" },
  calibrabot: { label: "CalibraBot", className: "badge-info" },
  personalizado: {
    label: "Personalizado",
    className: "badge-secondary badge-outline",
  },
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "badge-success badge-outline" },
  rascunho: { label: "Rascunho", className: "badge-ghost" },
  arquivado: { label: "Arquivado", className: "badge-neutral" },
};

const TYPE_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "run", label: "Run" },
  { value: "calibrabot", label: "CalibraBot" },
  { value: "personalizado", label: "Personalizado" },
] as const;

function formatDate(value: string | Date | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function LabTestIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }> | { type?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedSearchParams: { type?: string } | undefined =
    await Promise.resolve(searchParams);

  const requestedType = resolvedSearchParams?.type;
  const activeType = TYPE_FILTERS.some((f) => f.value === requestedType)
    ? requestedType!
    : "all";

  const [allTests, userTeams] = await Promise.all([
    db
      .select({
        id: labTests.id,
        name: labTests.name,
        description: labTests.description,
        type: labTests.type,
        status: labTests.status,
        updatedAt: labTests.updatedAt,
        executionCount: sql<number>`count(${labTestExecutions.id})`.mapWith(
          Number,
        ),
        lastExecutedAt: sql<
          string | null
        >`max(${labTestExecutions.executedAt})`,
      })
      .from(labTests)
      .leftJoin(labTestExecutions, eq(labTestExecutions.testId, labTests.id))
      .where(eq(labTests.userId, userId))
      .groupBy(labTests.id)
      .orderBy(desc(labTests.updatedAt)),

    db
      .select({ id: teams.id, name: teams.name })
      .from(teamMembers)
      .innerJoin(teams, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, userId)),
  ]);

  const visibleTests =
    activeType === "all"
      ? allTests
      : allTests.filter((t) => t.type === activeType);

  const counts = {
    all: allTests.length,
    run: allTests.filter((t) => t.type === "run").length,
    calibrabot: allTests.filter((t) => t.type === "calibrabot").length,
    personalizado: allTests.filter((t) => t.type === "personalizado").length,
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-info/5" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              LabTest
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60">
              Crie, configure e acompanhe os testes realizados pelos seus times.
            </p>
          </div>

          <NewTestModal teams={userTeams} />
        </div>
      </section>

      {/* Filtros */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Seus testes</h2>
            <p className="text-xs text-base-content/45">
              Filtre por modalidade
            </p>
          </div>

          <span className="text-xs text-base-content/40">
            {visibleTests.length}{" "}
            {visibleTests.length === 1 ? "teste" : "testes"}
          </span>
        </div>

        <div
          role="tablist"
          className="flex w-full flex-wrap gap-1 rounded-xl border border-base-300 bg-base-200 p-1 sm:w-fit"
        >
          {TYPE_FILTERS.map((filter) => {
            const count = counts[filter.value as keyof typeof counts];

            const active = activeType === filter.value;

            return (
              <Link
                key={filter.value}
                role="tab"
                href={
                  filter.value === "all"
                    ? "/dashboard/labtest"
                    : `/dashboard/labtest?type=${filter.value}`
                }
                className={`
              flex h-9 items-center gap-2 rounded-lg px-3 text-sm
              font-medium transition-all
              ${
                active
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/55 hover:bg-base-300/50 hover:text-base-content"
              }
            `}
              >
                {filter.label}

                <span
                  className={`
                rounded-md px-1.5 py-0.5 font-mono text-[10px]
                ${
                  active
                    ? "bg-warning/10 text-warning"
                    : "bg-base-300/60 text-base-content/40"
                }
              `}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Conteúdo */}
      {visibleTests.length === 0 ? (
        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-base-300 bg-base-300/40 text-xl">
              ◌
            </div>

            <h2 className="mt-5 font-semibold">
              {allTests.length === 0
                ? "Nenhum teste criado"
                : "Nenhum teste encontrado"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-base-content/50">
              {allTests.length === 0
                ? "Crie seu primeiro teste para começar a registrar execuções e analisar o desempenho dos seus times."
                : "Não existem testes registrados nessa modalidade. Tente selecionar outro filtro."}
            </p>

            {allTests.length === 0 && (
              <NewTestModal
                teams={userTeams}
                triggerLabel="Criar primeiro teste"
              />
            )}
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTests.map((test) => {
            const type = TYPE_BADGE[test.type];
            const status = STATUS_BADGE[test.status];

            const isDraft = test.status === "rascunho";

            const href = isDraft
              ? `/dashboard/labtest/${test.id}/setup`
              : `/dashboard/labtest/${test.id}`;

            return (
              <Link
                key={test.id}
                href={href}
                className="border rounded-tl-2xl rounded-br-2xl border-base-300 bg-base-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_theme(colors.primary)] group opacity-90 hover:opacity-100"
              >
                {/* Indicador lateral */}
                <div className="flex min-h-55 flex-col p-5 pl-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`badge badge-sm ${type.className}`}>
                      {type.label}
                    </span>
                    <span className={`badge badge-sm ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h2 className="line-clamp-2 text-base font-semibold leading-6 transition-colors group-hover:text-primary">
                      {test.name}
                    </h2>

                    {test.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-base-content/50">
                        {test.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm italic text-base-content/30">
                        Sem descrição
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-6">
                    {isDraft ? (
                      <div className="flex items-center justify-between rounded-xl border border-warning/20 bg-warning/5 px-3 py-2.5">
                        <div>
                          <p className="text-xs font-semibold text-warning">
                            Configuração pendente
                          </p>

                          <p className="mt-0.5 text-[11px] text-base-content/45">
                            O teste ainda não está pronto
                          </p>
                        </div>

                        <span className="text-sm text-warning transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-t border-base-300 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-base-content/35">
                            Execuções
                          </span>

                          <span className="mt-1 font-mono text-sm font-medium">
                            {test.executionCount}
                          </span>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-base-content/35">
                            Última atividade
                          </span>

                          <span className="mt-1 text-xs text-base-content/50">
                            {formatDate(test.lastExecutedAt ?? test.updatedAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
