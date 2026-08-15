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
  personalizado: { label: "Personalizado", className: "badge-secondary badge-outline" },
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
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function LabTestIndexPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const requestedType = searchParams?.type;
  const activeType = TYPE_FILTERS.some((f) => f.value === requestedType) ? requestedType! : "all";

  const [allTests, userTeams] = await Promise.all([
    db
      .select({
        id: labTests.id,
        name: labTests.name,
        description: labTests.description,
        type: labTests.type,
        status: labTests.status,
        updatedAt: labTests.updatedAt,
        executionCount: sql<number>`count(${labTestExecutions.id})`.mapWith(Number),
        lastExecutedAt: sql<string | null>`max(${labTestExecutions.executedAt})`,
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
    activeType === "all" ? allTests : allTests.filter((t) => t.type === activeType);

  const counts = {
    all: allTests.length,
    run: allTests.filter((t) => t.type === "run").length,
    calibrabot: allTests.filter((t) => t.type === "calibrabot").length,
    personalizado: allTests.filter((t) => t.type === "personalizado").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs tracking-widest text-base-content/50">LABTEST</span>
          <h1 className="text-2xl font-bold tracking-tight">Testes</h1>
        </div>
        <NewTestModal teams={userTeams} />
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit bg-base-200">
        {TYPE_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            role="tab"
            href={filter.value === "all" ? "/dashboard/labtest" : `/dashboard/labtest?type=${filter.value}`}
            className={`tab ${activeType === filter.value ? "tab-active" : ""}`}
          >
            {filter.label}
            <span className="ml-1.5 text-xs text-base-content/50">
              {counts[filter.value as keyof typeof counts]}
            </span>
          </Link>
        ))}
      </div>

      {visibleTests.length === 0 ? (
        <div className="card border border-base-300 bg-base-200">
          <div className="card-body items-center gap-4 py-16 text-center">
            <p className="text-base-content/60">
              {allTests.length === 0
                ? "Nenhum teste criado ainda."
                : "Nenhum teste dessa modalidade por aqui."}
            </p>
            {allTests.length === 0 && <NewTestModal teams={userTeams} triggerLabel="Criar primeiro teste" />}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTests.map((test) => {
            const type = TYPE_BADGE[test.type];
            const status = STATUS_BADGE[test.status];
            // Teste ainda em rascunho: nunca configurado (ver ADR-001) — o
            // card leva direto pro setup em vez de para a página de detalhe,
            // que não teria plano/parâmetros pra mostrar ainda.
            const isDraft = test.status === "rascunho";
            const href = isDraft
              ? `/dashboard/labtest/${test.id}/setup`
              : `/dashboard/labtest/${test.id}`;

            return (
              <Link
                key={test.id}
                href={href}
                className="card border border-base-300 bg-base-200 transition-colors hover:border-base-content/30"
              >
                <div className="card-body gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`badge badge-sm ${type.className}`}>{type.label}</span>
                    <span className={`badge badge-sm ${status.className}`}>{status.label}</span>
                  </div>

                  <h2 className="card-title text-base leading-snug">{test.name}</h2>

                  {test.description && (
                    <p className="line-clamp-2 text-sm text-base-content/60">{test.description}</p>
                  )}

                  {isDraft ? (
                    <p className="mt-2 text-xs font-medium text-warning">Continuar configuração →</p>
                  ) : (
                    <div className="mt-2 flex items-center justify-between text-xs text-base-content/50">
                      <span>
                        {test.executionCount} execuç{test.executionCount === 1 ? "ão" : "ões"}
                      </span>
                      <span>{formatDate(test.lastExecutedAt ?? test.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}