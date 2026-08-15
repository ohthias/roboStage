import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  users,
  leagues,
  userLeagueInterests,
  labTests,
  labTestExecutions,
  documents,
} from "@/db/schema";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  run: { label: "Run", className: "badge-primary" },
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

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // segunda-feira
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(value: string | Date | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!currentUser?.onboardingCompletedAt) redirect("/onboarding");

  const [
    leagueInterests,
    recentTests,
    activeTestsCount,
    totalExecutionsCount,
    executionsThisWeek,
    recentDocuments,
  ] = await Promise.all([
    db
      .select({
        id: userLeagueInterests.id,
        relationType: userLeagueInterests.relationType,
        teamName: userLeagueInterests.teamName,
        season: userLeagueInterests.season,
        leagueName: leagues.name,
        leagueCode: leagues.code,
      })
      .from(userLeagueInterests)
      .innerJoin(leagues, eq(leagues.id, userLeagueInterests.leagueId))
      .where(eq(userLeagueInterests.userId, userId))
      .orderBy(desc(userLeagueInterests.relationType)),

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
      .orderBy(desc(labTests.updatedAt))
      .limit(6),

    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(labTests)
      .where(and(eq(labTests.userId, userId), eq(labTests.status, "ativo")))
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(labTestExecutions)
      .innerJoin(labTests, eq(labTests.id, labTestExecutions.testId))
      .where(eq(labTests.userId, userId))
      .then((r) => r[0]?.count ?? 0),

    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(labTestExecutions)
      .innerJoin(labTests, eq(labTests.id, labTestExecutions.testId))
      .where(
        and(
          eq(labTests.userId, userId),
          gte(labTestExecutions.executedAt, startOfWeek()),
        ),
      )
      .then((r) => r[0]?.count ?? 0),

    db
      .select({
        id: documents.id,
        title: documents.title,
        icon: documents.icon,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.updatedAt))
      .limit(4),
  ]);

  const firstName = currentUser.name?.split(" ")[0] || "por aqui";

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-info/5" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-base-content/45">
                VISÃO GERAL
              </span>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Bom trabalho, {firstName}
              </h1>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-base-content/60">
              Acompanhe seus testes, execuções, ligas e anotações em um único
              lugar.
            </p>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group rounded-2xl border border-base-300 bg-base-200 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-base-content/45">
                Testes ativos
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-primary">
                {activeTestsCount}
              </p>
            </div>

            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <span className="text-lg">◉</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Runs, CalibraBot e personalizados
          </p>
        </div>

        <div className="group rounded-2xl border border-base-300 bg-base-200 p-5 transition-all hover:-translate-y-0.5 hover:border-info/30 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-base-content/45">
                Execuções totais
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight">
                {totalExecutionsCount}
              </p>
            </div>

            <div className="rounded-xl bg-info/10 p-2.5 text-info">
              <span className="text-lg">↗</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Histórico completo, nunca sobrescrito
          </p>
        </div>

        <div className="group rounded-2xl border border-base-300 bg-base-200 p-5 transition-all hover:-translate-y-0.5 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-base-content/45">
                Esta semana
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-success">
                {executionsThisWeek}
              </p>
            </div>

            <div className="rounded-xl bg-success/10 p-2.5 text-success">
              <span className="text-lg">✓</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Execuções desde segunda-feira
          </p>
        </div>

        <div className="group rounded-2xl border border-base-300 bg-base-200 p-5 transition-all hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-base-content/45">
                Ligas
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-secondary">
                {leagueInterests.length}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/10 p-2.5 text-secondary">
              <span className="text-lg">◈</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Participando ou de olho
          </p>
        </div>
      </section>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Testes recentes */}
        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">Testes recentes</h2>
              <p className="mt-0.5 text-xs text-base-content/50">
                Últimas atividades no LabTest
              </p>
            </div>

            <Link
              href="/dashboard/labtest"
              className="link link-hover text-xs font-medium text-base-content/60"
            >
              Ver todos
            </Link>
          </div>

          {recentTests.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-base-300/60 text-xl">
                ◌
              </div>

              <p className="font-medium">Nenhum teste registrado</p>

              <p className="mt-1 max-w-sm text-sm text-base-content/50">
                Crie seu primeiro teste para começar a acompanhar suas
                execuções.
              </p>

              <Link
                href="/dashboard/labtest/new"
                className="btn btn-primary btn-sm mt-5"
              >
                Criar primeiro teste
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="border-b border-base-300">
                    <th className="bg-transparent text-[11px] uppercase tracking-wider text-base-content/40">
                      Teste
                    </th>
                    <th className="bg-transparent text-[11px] uppercase tracking-wider text-base-content/40">
                      Tipo
                    </th>
                    <th className="bg-transparent text-[11px] uppercase tracking-wider text-base-content/40">
                      Status
                    </th>
                    <th className="bg-transparent text-[11px] uppercase tracking-wider text-base-content/40">
                      Execuções
                    </th>
                    <th className="bg-transparent text-[11px] uppercase tracking-wider text-base-content/40">
                      Última
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentTests.map((test) => {
                    const type = TYPE_BADGE[test.type];
                    const status = STATUS_BADGE[test.status];

                    return (
                      <tr
                        key={test.id}
                        className="group border-b border-base-300/70 last:border-b-0 hover:bg-base-300/20"
                      >
                        <td>
                          <Link
                            href={`/dashboard/labtest/${test.id}`}
                            className="flex flex-col gap-0.5"
                          >
                            <p className="font-medium transition-colors group-hover:text-primary">
                              {test.name}
                            </p>
                            <p className="text-[11px] text-base-content/40">
                              {test.description ? test.description : "—"}
                            </p>
                          </Link>
                        </td>

                        <td>
                          <span className={`badge badge-sm ${type.className}`}>
                            {type.label}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge badge-sm ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-sm text-base-content/70">
                            {test.executionCount}
                          </span>
                        </td>

                        <td>
                          <span className="text-xs text-base-content/50">
                            {formatDate(test.lastExecutedAt ?? test.updatedAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Ligas */}
        <section className="rounded-2xl border border-base-300 bg-base-200">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <div>
              <h2 className="font-semibold">Suas ligas</h2>
              <p className="mt-0.5 text-xs text-base-content/50">
                Competições acompanhadas
              </p>
            </div>

            <Link href="/dashboard/leagues" className="btn btn-ghost btn-xs">
              Editar
            </Link>
          </div>

          {leagueInterests.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                ◈
              </div>

              <p className="text-sm font-medium">Nenhuma liga adicionada</p>

              <p className="mt-1 text-xs leading-5 text-base-content/50">
                Adicione competições que você participa ou deseja acompanhar.
              </p>

              <Link
                href="/dashboard/leagues"
                className="btn btn-outline btn-xs mt-4"
              >
                Configurar ligas
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-base-300/70">
              {leagueInterests.map((interest) => (
                <li
                  key={interest.id}
                  className="px-5 py-4 transition-colors hover:bg-base-300/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {interest.leagueName}
                      </div>

                      {(interest.teamName || interest.season) && (
                        <div className="mt-1 text-xs text-base-content/45">
                          {interest.teamName}
                          {interest.teamName && interest.season ? " · " : ""}
                          {interest.season}
                        </div>
                      )}
                    </div>

                    <span
                      className={`badge badge-sm shrink-0 ${
                        interest.relationType === "participante"
                          ? "badge-primary"
                          : "badge-outline badge-info"
                      }`}
                    >
                      {interest.relationType === "participante"
                        ? "Participo"
                        : "Quero conhecer"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Caderno */}
        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 xl:col-span-3">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">Caderno</h2>
              <p className="mt-0.5 text-xs text-base-content/50">
                Anotações atualizadas recentemente
              </p>
            </div>

            <Link href="/dashboard/documents" className="btn btn-ghost btn-xs">
              Abrir caderno
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center px-6 py-10">
              <div className="text-center">
                <p className="text-sm font-medium">Seu caderno está vazio</p>

                <p className="mt-1 text-xs text-base-content/50">
                  Crie uma anotação para ela aparecer aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {recentDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/dashboard/documents/${doc.id}`}
                  className="group rounded-xl border border-base-300 bg-base-300/20 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-base-300/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-100 text-lg">
                      {doc.icon ?? "📝"}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-base-content/35">
                      {formatDate(doc.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                      {doc.title}
                    </p>

                    <span className="mt-1 inline-flex items-center text-xs text-base-content/40">
                      Abrir anotação →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
