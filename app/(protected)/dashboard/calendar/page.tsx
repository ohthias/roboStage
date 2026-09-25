import { listEventsInRange } from "./actions";
import { CalendarView } from "./calendar-view";

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
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthStart = parseMonthParam(month);
  const { gridStart, gridEnd } = monthGridRange(monthStart);

  const events = await listEventsInRange(gridStart, gridEnd);

  return (
    <div className="mx-auto w-full px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendário</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Treinos, reuniões, competições e prazos em um só lugar.
        </p>
      </div>

      <CalendarView
        monthStart={monthStart.toISOString()}
        gridStart={gridStart.toISOString()}
        events={events.map((e) => ({
          ...e,
          startAt: e.startAt.toISOString(),
          endAt: e.endAt ? e.endAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
