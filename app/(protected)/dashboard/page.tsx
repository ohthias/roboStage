import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users, leagues, userLeagueInterests, testExecutions, tests, documents } from "@/db/schema";
import ComingSoon from "@/components/ComingSoon";

// CORREÇÃO: as chaves precisam bater com os valores reais do enum test_mode
// ("runs" | "calibrabot" | "individual" | "custom") — antes usavam "run" e
// "personalizado", que nunca batiam com nada vindo do banco.
const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  runs: { label: "Runs", className: "badge-primary" },
  calibrabot: { label: "CalibraBot", className: "badge-info" },
  individual: { label: "Individual", className: "badge-secondary" },
  custom: { label: "Personalizado", className: "badge-secondary badge-outline" },
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
        id: tests.id,
        name: tests.name,
        description: tests.description,
        type: tests.mode,
        status: tests.status,
        executionCount: sql<number>`count(${testExecutions.id})`.mapWith(Number),
        lastExecutedAt: tests.lastAccessAt,
        updatedAt: tests.updatedAt,
      })
      .from(tests)
      .leftJoin(testExecutions, eq(testExecutions.testId, tests.id))
      .where(eq(tests.userId, userId))
      .groupBy(tests.id)
      .orderBy(desc(tests.updatedAt))
      .limit(5),

    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(tests)
      .where(and(eq(tests.userId, userId), eq(tests.status, "ativo"))),

    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(testExecutions)
      .innerJoin(tests, eq(tests.id, testExecutions.testId))
      .where(eq(tests.userId, userId)),

    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(testExecutions)
      .innerJoin(tests, eq(tests.id, testExecutions.testId))
      .where(and(eq(tests.userId, userId), gte(testExecutions.createdAt, startOfWeek()))),

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

  const activeTests = activeTestsCount[0]?.count ?? 0;
  const totalExecutions = totalExecutionsCount[0]?.count ?? 0;
  const weeklyExecutions = executionsThisWeek[0]?.count ?? 0;

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
              Acompanhe seus testes, execuções, ligas e anotações em um único lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Testes recentes */}
        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">Testes recentes</h2>
              <p className="mt-0.5 text-xs text-base-content/50">Últimas atividades no LabTest</p>
            </div>
          </div>
          <ComingSoon />
        </section>

        {/* Ligas */}
        <section className="rounded-2xl border border-base-300 bg-base-200">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <div>
              <h2 className="font-semibold">Suas ligas</h2>
              <p className="mt-0.5 text-xs text-base-content/50">Competições acompanhadas</p>
            </div>
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
              <Link href="/dashboard/leagues" className="btn btn-outline btn-xs mt-4">
                Configurar ligas
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-base-300/70">
              {leagueInterests.map((interest) => (
                <li key={interest.id} className="px-5 py-4 transition-colors hover:bg-base-300/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{interest.leagueName}</div>
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
                        interest.relationType === "participante" ? "badge-primary" : "badge-outline badge-info"
                      }`}
                    >
                      {interest.relationType === "participante" ? "Participo" : "Quero conhecer"}
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
              <p className="mt-0.5 text-xs text-base-content/50">Anotações atualizadas recentemente</p>
            </div>
            <Link href="/dashboard/documents" className="btn btn-ghost btn-xs">
              Abrir caderno
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center px-6 py-10">
              <div className="text-center">
                <p className="text-sm font-medium">Seu caderno está vazio</p>
                <p className="mt-1 text-xs text-base-content/50">Crie uma anotação para ela aparecer aqui.</p>
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
