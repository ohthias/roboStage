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

const PERSONA_LABEL: Record<string, string> = {
  competidor: "Competidor",
  mentor_tecnico: "Mentor / Técnico",
  entusiasta: "Entusiasta",
  organizador: "Organizador",
};

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

  const currentUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
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
        and(eq(labTests.userId, userId), gte(labTestExecutions.executedAt, startOfWeek()))
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
  const personaLabel = currentUser.personaType ? PERSONA_LABEL[currentUser.personaType] : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs tracking-widest text-base-content/50">
            VISÃO GERAL
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Bom trabalho, {firstName}</h1>
            {personaLabel && <span className="badge badge-outline badge-warning">{personaLabel}</span>}
          </div>
        </div>
        <Link href="/dashboard/labtest/new" className="btn btn-warning">
          + Novo teste
        </Link>
      </div>

      {/* Stats */}
      <div className="stats stats-vertical w-full border border-base-300 bg-base-200 shadow sm:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Testes ativos</div>
          <div className="stat-value text-warning">{activeTestsCount}</div>
          <div className="stat-desc">Runs, CalibraBot e Personalizados</div>
        </div>
        <div className="stat">
          <div className="stat-title">Execuções totais</div>
          <div className="stat-value">{totalExecutionsCount}</div>
          <div className="stat-desc">Histórico completo, nunca sobrescrito</div>
        </div>
        <div className="stat">
          <div className="stat-title">Essa semana</div>
          <div className="stat-value text-info">{executionsThisWeek}</div>
          <div className="stat-desc">Execuções desde segunda-feira</div>
        </div>
        <div className="stat">
          <div className="stat-title">Ligas</div>
          <div className="stat-value text-secondary">{leagueInterests.length}</div>
          <div className="stat-desc">Participando ou de olho</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Testes recentes */}
        <div className="card border border-base-300 bg-base-200 lg:col-span-2">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">Testes recentes</h2>
              <Link href="/dashboard/labtest" className="link link-hover text-sm text-base-content/60">
                Ver todos
              </Link>
            </div>

            {recentTests.length === 0 ? (
              <div className="py-10 text-center text-base-content/60">
                <p>Nenhum teste registrado ainda.</p>
                <Link href="/dashboard/labtest/new" className="btn btn-warning btn-sm mt-4">
                  Criar primeiro teste
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Teste</th>
                      <th>Tipo</th>
                      <th>Status</th>
                      <th>Execuções</th>
                      <th>Última</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTests.map((test) => {
                      const type = TYPE_BADGE[test.type];
                      const status = STATUS_BADGE[test.status];
                      return (
                        <tr key={test.id} className="hover">
                          <td>
                            <Link
                              href={`/dashboard/labtest/${test.id}`}
                              className="link link-hover font-medium"
                            >
                              {test.name}
                            </Link>
                          </td>
                          <td>
                            <span className={`badge badge-sm ${type.className}`}>{type.label}</span>
                          </td>
                          <td>
                            <span className={`badge badge-sm ${status.className}`}>{status.label}</span>
                          </td>
                          <td className="text-sm text-base-content/70">{test.executionCount}</td>
                          <td className="text-sm text-base-content/60">
                            {formatDate(test.lastExecutedAt ?? test.updatedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Ligas */}
        <div className="card border border-base-300 bg-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">Suas ligas</h2>
              <Link href="/dashboard/leagues" className="link link-hover text-sm text-base-content/60">
                Editar
              </Link>
            </div>

            {leagueInterests.length === 0 ? (
              <p className="py-4 text-sm text-base-content/60">
                Você ainda não marcou nenhuma liga.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {leagueInterests.map((interest) => (
                  <li
                    key={interest.id}
                    className="flex items-center justify-between rounded bg-base-300/40 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-medium">{interest.leagueName}</div>
                      {interest.teamName && (
                        <div className="text-xs text-base-content/50">
                          {interest.teamName}
                          {interest.season ? ` · ${interest.season}` : ""}
                        </div>
                      )}
                    </div>
                    <span
                      className={`badge badge-sm ${
                        interest.relationType === "participante"
                          ? "badge-warning"
                          : "badge-outline badge-info"
                      }`}
                    >
                      {interest.relationType === "participante" ? "Participo" : "Quero conhecer"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Caderno */}
        <div className="card border border-base-300 bg-base-200 lg:col-span-3">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">Caderno</h2>
              <Link href="/dashboard/notebook" className="link link-hover text-sm text-base-content/60">
                Abrir
              </Link>
            </div>

            {recentDocuments.length === 0 ? (
              <p className="py-4 text-sm text-base-content/60">Nenhuma anotação ainda.</p>
            ) : (
              <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {recentDocuments.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/dashboard/notebook/${doc.id}`}
                      className="flex items-center gap-2 rounded bg-base-300/40 px-3 py-2 hover:bg-base-300/70"
                    >
                      <span className="text-lg leading-none">{doc.icon ?? "📝"}</span>
                      <span className="flex-1 truncate text-sm">{doc.title}</span>
                      <span className="text-xs text-base-content/50">{formatDate(doc.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}