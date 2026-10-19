import { listEventsInRange } from "./actions";
import { CalendarView } from "./calendar-view";
import { listMyTeams } from "@/utils/stagebook/actions/teams";
import { resolveStagebookScope } from "@/utils/stagebook/scope";

function parseMonthParam(month?: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split("-").map(Number);
    return new Date(year, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthGridRange(monthStart: Date) {
  const gridStart = new Date(monthStart);
  const startWeekday = (gridStart.getDay() + 6) % 7; // segunda = 0
  gridStart.setDate(gridStart.getDate() - startWeekday);
  gridStart.setHours(0, 0, 0, 0);

  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridEnd.getDate() + 41); // 6 semanas
  gridEnd.setHours(23, 59, 59, 999);

  return { gridStart, gridEnd };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; teams?: string }>;
}) {
  const { month, teams: teamsParam } = await searchParams;
  const selectedTeamIds = teamsParam
    ? teamsParam.split(",").filter((teamId) => /^[0-9a-f-]{36}$/i.test(teamId))
    : [];
  const monthStart = parseMonthParam(month);
  const { gridStart, gridEnd } = monthGridRange(monthStart);

  const [teams, events, scope] = await Promise.all([
    listMyTeams(),
    listEventsInRange(gridStart, gridEnd, selectedTeamIds),
    resolveStagebookScope(),
  ]);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);
  const todayEvents = await listEventsInRange(
    todayStart,
    todayEnd,
    selectedTeamIds,
  );
  const teamNames = new Map(teams.map((team) => [team.id, team.name]));

  return (
    <section className="min-h-full bg-base-100 px-4 py-8 text-base-content sm:px-6 lg:px-8 space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary sm:text-4xl">
            Calendário
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/60 sm:text-base">
            Acompanhe os eventos e atividades suas ou da sua equipe, visualize
            os compromissos do mês e gerencie sua agenda de forma eficiente.
          </p>
        </div>
      </header>
      
      <CalendarView
        monthStart={monthStart.toISOString()}
        gridStart={gridStart.toISOString()}
        events={events.map((e) => ({
          ...e,
          teamName: e.teamId ? (teamNames.get(e.teamId) ?? "Equipe") : null,
          startAt: e.startAt.toISOString(),
          endAt: e.endAt ? e.endAt.toISOString() : null,
        }))}
        todayEvents={todayEvents.map((e) => ({
          ...e,
          teamName: e.teamId ? (teamNames.get(e.teamId) ?? "Equipe") : null,
          startAt: e.startAt.toISOString(),
          endAt: e.endAt ? e.endAt.toISOString() : null,
        }))}
        teams={teams.map(({ id, name }) => ({ id, name }))}
        selectedTeamIds={selectedTeamIds}
        activeTeamId={scope.type === "team" ? scope.teamId : null}
      />
    </section>
  );
}
