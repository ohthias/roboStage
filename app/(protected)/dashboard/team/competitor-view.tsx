import Link from "next/link";
import { CalendarDays, CheckCircle2, KanbanSquare, Users } from "lucide-react";

const PRIORITY_STYLE: Record<string, string> = {
  baixa: "badge-ghost",
  media: "badge-info badge-outline",
  alta: "badge-warning badge-outline",
  urgente: "badge-error",
};

type AssignedCard = {
  id: string;
  title: string;
  priority: string;
  dueAt: string | null;
  boardId: string;
  boardName: string;
  columnName: string;
};
type UpcomingEvent = { id: string; title: string; startAt: string; type: string };
type TeammateSummary = { userId: string; name: string | null; role: string };

/**
 * Dashboard do competidor (seção pedida: "tudo que precisa ser feito").
 * Deliberadamente sem o painel de gestão de membros/administração — isso é
 * só pra quem é técnico (owner) da equipe.
 */
export function CompetitorTeamView({
  teamName,
  assignedCards,
  upcomingEvents,
  teammates,
}: {
  teamName: string;
  assignedCards: AssignedCard[];
  upcomingEvents: UpcomingEvent[];
  teammates: TeammateSummary[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">O que você precisa fazer — {teamName}</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Cards atribuídos a você e os próximos eventos da equipe.
        </p>
      </div>

      <section className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="flex items-center gap-2 border-b border-base-300 px-5 py-4">
          <KanbanSquare size={16} className="text-primary" />
          <h2 className="font-semibold">Seus cards</h2>
        </div>

        {assignedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <CheckCircle2 size={26} className="mb-3 text-base-content/25" />
            <p className="text-sm font-medium">Nada atribuído a você agora</p>
            <p className="mt-1 text-xs text-base-content/50">Quando um técnico ou mentor te atribuir um card, ele aparece aqui.</p>
          </div>
        ) : (
          <ul className="divide-y divide-base-300/70">
            {assignedCards.map((card) => (
              <li key={card.id} className="px-5 py-3">
                <Link href={`/dashboard/kanban/${card.boardId}`} className="block hover:text-primary">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium">{card.title}</span>
                    <span className={`badge badge-xs shrink-0 ${PRIORITY_STYLE[card.priority] ?? "badge-ghost"}`}>
                      {card.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-base-content/45">
                    {card.boardName} / {card.columnName}
                    {card.dueAt && ` · prazo ${new Date(card.dueAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6 overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="flex items-center gap-2 border-b border-base-300 px-5 py-4">
          <CalendarDays size={16} className="text-primary" />
          <h2 className="font-semibold">Próximos eventos</h2>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-base-content/50">Nada agendado.</div>
        ) : (
          <ul className="divide-y divide-base-300/70">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="px-5 py-3">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="mt-0.5 text-xs text-base-content/45">
                  {new Date(event.startAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · {event.type}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="flex items-center gap-2 border-b border-base-300 px-5 py-4">
          <Users size={16} className="text-primary" />
          <h2 className="font-semibold">Equipe</h2>
        </div>
        <ul className="divide-y divide-base-300/70">
          {teammates.map((mate) => (
            <li key={mate.userId} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span>{mate.name ?? "Sem nome"}</span>
              <span className="badge badge-ghost badge-xs capitalize">{mate.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
