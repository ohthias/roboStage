import { redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  users,
  leagues,
  userLeagueInterests,
  testExecutions,
  tests,
  documents,
  calendarEvents,
  boardCards,
  boardColumns,
  boards,
  teams,
} from "@/db/schema";
import {
  requireAuthenticatedUser,
  resolveStagebookScope,
} from "@/utils/stagebook/scope";
import { scopeWhere } from "@/utils/stagebook/permissions";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  KanbanSquare,
  Play,
  Trophy,
  Users,
} from "lucide-react";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  runs: { label: "Runs", className: "badge-primary" },
  calibrabot: { label: "CalibraBot", className: "badge-info" },
  individual: { label: "Individual", className: "badge-secondary" },
  custom: {
    label: "Personalizado",
    className: "badge-secondary badge-outline",
  },
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
  const userId = await requireAuthenticatedUser();

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!currentUser?.onboardingCompletedAt) redirect("/onboarding");

  const scope = await resolveStagebookScope();
  const activeTeamName =
    scope.type === "team"
      ? ((
          await db
            .select({ name: teams.name })
            .from(teams)
            .where(eq(teams.id, scope.teamId))
            .limit(1)
        )[0]?.name ?? null)
      : null;
  const documentScope = scopeWhere(scope, {
    userId: documents.userId,
    teamId: documents.teamId,
  });
  const eventScope = scopeWhere(scope, {
    userId: calendarEvents.userId,
    teamId: calendarEvents.teamId,
  });
  const boardScope = scopeWhere(scope, {
    userId: boards.userId,
    teamId: boards.teamId,
  });

  const [
    leagueInterests,
    recentTests,
    activeTestsCount,
    totalExecutionsCount,
    executionsThisWeek,
    recentDocuments,
    upcomingEvents,
    pendingCards,
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
        executionCount: sql<number>`count(${testExecutions.id})`.mapWith(
          Number,
        ),
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
      .where(
        and(
          eq(tests.userId, userId),
          gte(testExecutions.createdAt, startOfWeek()),
        ),
      ),

    db
      .select({
        id: documents.id,
        title: documents.title,
        icon: documents.icon,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(documentScope)
      .orderBy(desc(documents.updatedAt))
      .limit(4),

    db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        startAt: calendarEvents.startAt,
        type: calendarEvents.type,
      })
      .from(calendarEvents)
      .where(and(eventScope, gte(calendarEvents.startAt, new Date())))
      .orderBy(asc(calendarEvents.startAt))
      .limit(4),

    db
      .select({
        id: boardCards.id,
        title: boardCards.title,
        dueAt: boardCards.dueAt,
        priority: boardCards.priority,
        boardId: boardCards.boardId,
        boardName: boards.name,
        columnName: boardColumns.name,
      })
      .from(boardCards)
      .innerJoin(boards, eq(boards.id, boardCards.boardId))
      .innerJoin(boardColumns, eq(boardColumns.id, boardCards.columnId))
      .where(and(boardScope, isNotNull(boardCards.dueAt)))
      .orderBy(asc(boardCards.dueAt))
      .limit(4),
  ]);

  const totalExecutions = totalExecutionsCount[0]?.count ?? 0;
  const weeklyExecutions = executionsThisWeek[0]?.count ?? 0;

  const firstName = currentUser.name?.split(" ")[0] || "por aqui";

  return (
    <div className="min-h-full">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 p-4 sm:p-6 lg:gap-10 lg:p-8">
        <section className="relative overflow-hidden rounded-[30px] border border-base-300 bg-base-100">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-base-content sm:text-5xl lg:text-6xl">
                Bom trabalho,{" "}
                <span className="relative inline-block">
                  {firstName}
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-primary/80" />
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-base-content/55 sm:text-base">
                Seu espaço para acompanhar testes, competições, calendário,
                tarefas e conhecimento da equipe.
              </p>
            </div>

            <Link
              href="/dashboard/team"
              className="btn btn-outline btn-sm h-10 gap-2 rounded-lg border-base-300 bg-base-100 px-4 normal-case hover:border-base-content/30 hover:bg-base-200"
            >
              <Users size={16} strokeWidth={1.8} />

              <span>
                {scope.type === "team"
                  ? (activeTeamName ?? "Espaço da equipe")
                  : "Ver equipes"}
              </span>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/45">
                Ligas
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Trophy size={15} />
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold tracking-tight">
              {leagueInterests.length}
            </p>

            <p className="mt-1 text-xs text-base-content/40">acompanhadas</p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/45">
                Eventos
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-200 text-base-content/55">
                <CalendarDays size={15} />
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold tracking-tight">
              {upcomingEvents.length}
            </p>

            <p className="mt-1 text-xs text-base-content/40">próximos</p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/45">
                Tarefas
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-200 text-base-content/55">
                <KanbanSquare size={15} />
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold tracking-tight">
              {pendingCards.length}
            </p>

            <p className="mt-1 text-xs text-base-content/40">com prazo</p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/45">
                Páginas
              </span>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-200 text-base-content/55">
                <FileText size={15} />
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold tracking-tight">
              {recentDocuments.length}
            </p>

            <p className="mt-1 text-xs text-base-content/40">atualizadas</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 xl:col-span-8">
            <div className="border-b border-base-300">
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">Testes recentes</h2>
                    <span className="badge badge-primary badge-xs">
                      LabTest
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-base-content/45">
                    Acompanhe seus testes e o volume de execuções
                  </p>
                </div>
                <Link
                  href="/dashboard/labtest"
                  className="btn btn-ghost btn-xs gap-1.5 normal-case"
                >
                  Abrir LabTest
                  <ArrowUpRight size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-2 border-t border-base-300">
                <div className="border-r border-base-300 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Play size={13} />
                    </span>
                    <span className="text-[11px] font-medium text-base-content/45">
                      Execuções
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold tracking-tight">
                    {totalExecutions}
                  </p>
                </div>

                <div className="px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10 text-info">
                      <BarChart3 size={14} />
                    </span>
                    <span className="text-[11px] font-medium text-base-content/45">
                      Esta semana
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold tracking-tight">
                    {weeklyExecutions}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-[280px]">
              {recentTests.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <Clock size={21} strokeWidth={1.8} />
                  </div>
                  <p className="text-sm font-semibold">Nenhum teste recente</p>
                  <p className="mt-1.5 max-w-[280px] text-xs leading-5 text-base-content/45">
                    Crie e execute um teste para acompanhar seus resultados
                    aqui.
                  </p>
                  <Link
                    href="/dashboard/labtest"
                    className="btn btn-primary btn-sm mt-5 rounded-lg px-4"
                  >
                    Abrir LabTest
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-base-300">
                  {recentTests.map((test) => {
                    const typeBadge = TYPE_BADGE[test.type] ?? {
                      label: test.type,
                      className: "badge-ghost",
                    };
                    return (
                      <li
                        key={test.id}
                        className="group transition-colors hover:bg-base-200/50"
                      >
                        <Link
                          href={`/dashboard/labtest/${test.id}`}
                          className="block px-5 py-4 sm:px-6"
                        >
                          <div className="flex items-center gap-4">
                            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary sm:flex">
                              <BarChart3 size={17} strokeWidth={1.8} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                                  {test.name}
                                </p>
                                <p
                                  className={`badge badge-xs badge-outline ${typeBadge.className}`}
                                >
                                  {typeBadge.label}
                                </p>
                              </div>
                              {test.description && (
                                <p className="mt-1 truncate text-xs text-base-content/40">
                                  {test.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-3 text-[11px] text-base-content/40">
                                <p className="inline-flex items-center gap-1">
                                  <Play size={11} />
                                  {test.executionCount}{" "}
                                  {test.executionCount === 1
                                    ? "execução"
                                    : "execuções"}
                                </p>

                                {test.executionCount > 0 && (
                                  <p className="inline-flex items-center gap-1 text-success/70">
                                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                    Com atividade
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="hidden text-xs font-medium text-base-content/35 transition-colors group-hover:text-primary sm:inline">
                                Abrir
                              </span>
                              <ArrowUpRight
                                size={15}
                                className="text-base-content/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                              />
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
          <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 xl:col-span-4">
            <div className="flex items-center justify-between border-b border-base-300 px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold">Páginas recentes</h2>
              <Link
                href="/dashboard/documents"
                className="btn btn-ghost btn-xs gap-1.5 normal-case"
              >
                Abrir páginas
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center px-6 py-10">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-base-200 text-base-content/45">
                    <FileText size={19} />
                  </div>

                  <p className="text-sm font-semibold">Nenhuma página ainda</p>

                  <p className="mt-1 text-xs leading-5 text-base-content/45">
                    Crie documentação, anotações e materiais para sua equipe.
                  </p>

                  <Link
                    href="/dashboard/documents"
                    className="btn btn-primary btn-sm mt-5 rounded-lg"
                  >
                    Criar página
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-5">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/dashboard/documents/${doc.id}`}
                    className="group rounded-xl border border-base-300 bg-base-100 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.02]">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base">
                        {doc.icon ?? "📝"}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-base-content/30">
                        {formatDate(doc.updatedAt)}
                      </span>
                    </div>
                    <div className="mt-5">
                      <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                        {doc.title}
                      </p>

                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-base-content/40 transition-colors group-hover:text-primary">
                        Abrir documento
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 xl:col-span-4">
            <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Próximos eventos</h2>

                <p className="mt-1 text-xs text-base-content/45">
                  Calendário do Stagebook
                </p>
              </div>

              <Link
                href="/dashboard/calendar"
                className="btn btn-ghost btn-xs normal-case"
              >
                Ver tudo
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                <CalendarDays
                  size={24}
                  strokeWidth={1.6}
                  className="mb-4 text-base-content/25"
                />

                <p className="text-sm font-semibold">Nada agendado</p>

                <p className="mt-1 text-xs text-base-content/45">
                  Organize seus próximos compromissos.
                </p>

                <Link
                  href="/dashboard/calendar"
                  className="btn btn-outline btn-xs mt-4"
                >
                  Abrir calendário
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-base-300">
                {upcomingEvents.map((event) => (
                  <li
                    key={event.id}
                    className="px-5 py-4 transition-colors hover:bg-base-200/60"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {event.title}
                        </p>

                        <p className="mt-1 text-xs text-base-content/45">
                          {formatDate(event.startAt)}
                          {" · "}
                          {event.type}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 xl:col-span-4">
            <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Com prazo próximo</h2>

                <p className="mt-1 text-xs text-base-content/45">
                  Cards prioritários do Kanban
                </p>
              </div>

              <Link
                href="/dashboard/kanban"
                className="btn btn-ghost btn-xs normal-case"
              >
                Ver boards
              </Link>
            </div>

            {pendingCards.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                <KanbanSquare
                  size={24}
                  strokeWidth={1.6}
                  className="mb-4 text-base-content/25"
                />

                <p className="text-sm font-semibold">Tudo em dia</p>

                <p className="mt-1 text-xs leading-5 text-base-content/45">
                  Nenhum card possui prazo próximo.
                </p>

                <Link
                  href="/dashboard/kanban"
                  className="btn btn-outline btn-xs mt-4"
                >
                  Abrir Kanban
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-base-300">
                {pendingCards.map((card) => (
                  <li
                    key={card.id}
                    className="px-5 py-4 transition-colors hover:bg-base-200/60"
                  >
                    <Link
                      href={`/dashboard/kanban/${card.boardId}`}
                      className="group block"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-medium group-hover:text-primary">
                          {card.title}
                        </p>

                        <ArrowUpRight
                          size={14}
                          className="shrink-0 text-base-content/25 transition-colors group-hover:text-primary"
                        />
                      </div>

                      <p className="mt-1 text-xs text-base-content/45">
                        {formatDate(card.dueAt)}
                        {" · "}
                        {card.boardName}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 xl:col-span-4">
            <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Suas ligas</h2>

                <p className="mt-1 text-xs text-base-content/45">
                  Competições acompanhadas
                </p>
              </div>
            </div>

            {leagueInterests.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <Trophy size={21} strokeWidth={1.8} />
                </div>

                <p className="text-sm font-semibold">Nenhuma liga adicionada</p>

                <p className="mt-1.5 max-w-[260px] text-xs leading-5 text-base-content/45">
                  Adicione competições que você participa ou deseja acompanhar.
                </p>

                <Link
                  href="/dashboard/leagues"
                  className="btn btn-primary btn-sm mt-5 rounded-lg px-4"
                >
                  Configurar ligas
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-base-300">
                {leagueInterests.map((interest) => (
                  <li
                    key={interest.id}
                    className="group px-5 py-4 transition-colors hover:bg-base-200/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {interest.leagueName}
                        </p>

                        {(interest.teamName || interest.season) && (
                          <p className="mt-1 text-xs text-base-content/45">
                            {interest.teamName}

                            {interest.teamName && interest.season ? " · " : ""}

                            {interest.season}
                          </p>
                        )}
                      </div>

                      <span
                        className={`badge badge-sm shrink-0 ${
                          interest.relationType === "participante"
                            ? "badge-primary"
                            : "badge-outline"
                        }`}
                      >
                        {interest.relationType === "participante"
                          ? "Participo"
                          : "Acompanhando"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
