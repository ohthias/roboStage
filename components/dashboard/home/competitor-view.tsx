import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Clock,
  FileText,
  FlaskConical,
  MoreHorizontal,
  Trophy,
} from "lucide-react";
import type { DashboardData } from "@/app/(protected)/dashboard/data";
import { DocIcon } from "@/components/editor/doc-icon";
import {
  EmptyState,
  MODE_META,
  SectionHeader,
  WeekStrip,
  firstName,
  formatDate,
  greeting,
} from "./shared";

const PROGRESS_TONES = [
  { card: "bg-secondary/15", bar: "progress-secondary", dot: "bg-secondary" },
  { card: "bg-accent/40", bar: "progress-warning", dot: "bg-warning" },
  { card: "bg-primary/15", bar: "progress-primary", dot: "bg-primary" },
];

const DOC_TONES = ["bg-secondary/12", "bg-accent/25"];

/**
 * Competidor — inspirado no layout "progresso + artigos":
 * foco em treinar, ver a própria evolução e o que vem pela frente.
 */
export function CompetitorDashboard({ data }: { data: DashboardData }) {
  const {
    currentUser,
    recentTests,
    weeklyExecutions,
    recentDocuments,
    upcomingEvents,
    leagueInterests,
  } = data;

  const nextLeague = leagueInterests.find(
    (l) => l.relationType === "participante",
  );

  return (
    <div className="grid gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* ---------------- Coluna principal ---------------- */}
      <div className="min-w-0 space-y-8">
        {/* Banner */}
        <section className="relative overflow-hidden rounded-tl-2xl rounded-br-2xl bg-secondary/12 p-6 sm:p-8">
          <div className="relative z-10 max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              {greeting()}, {firstName(currentUser.name)}
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
              {nextLeague
                ? `Pronto para treinar para a ${nextLeague.leagueName}?`
                : "Que tal começar um novo treino hoje?"}
            </h1>
            <p className="mt-2 text-sm text-base-content/55">
              Você fez {weeklyExecutions}{" "}
              {weeklyExecutions === 1 ? "execução" : "execuções"} nesta semana.
            </p>
            <Link
              href="/dashboard/labtest/new"
              className="btn btn-neutral btn-sm mt-5 rounded-full px-5"
            >
              Começar treino
            </Link>
          </div>
        </section>

        {/* Seu progresso */}
        <section>
          <SectionHeader
            title="Seu progresso"
            href="/dashboard/labtest"
          />
          {recentTests.length === 0 ? (
            <EmptyState
              icon={<FlaskConical size={20} />}
              title="Nenhum treino registrado"
              text="Crie um teste e registre execuções para ver sua evolução."
              href="/dashboard/labtest/new"
              cta="Criar teste"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {recentTests.slice(0, 3).map((test, i) => {
                const tone = PROGRESS_TONES[i % PROGRESS_TONES.length];
                const progress = Math.min(100, test.executionCount * 10);
                return (
                  <Link
                    key={test.id}
                    href={`/dashboard/labtest/${test.id}`}
                    className={`card ${tone.card} p-4 transition-transform hover:-translate-y-1`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-base-100">
                        <span className={`h-4 w-4 rounded-full ${tone.dot}`} />
                      </span>
                      <MoreHorizontal size={16} className="text-base-content/40" />
                    </div>
                    <p className="mt-6 line-clamp-1 text-sm font-bold">
                      {test.name}
                    </p>
                    <span className="mt-1 text-[11px] text-base-content/55">
                      {MODE_META[test.type]?.label ?? test.type}
                    </span>
                    <progress
                      className={`progress ${tone.bar} mt-3 h-1.5 w-full bg-base-100/70`}
                      value={progress}
                      max={100}
                    />
                    <div className="mt-1.5 flex justify-between text-[11px] text-base-content/55">
                      <span>Progresso</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Páginas para você (tipo "artigos") */}
        <section>
          <SectionHeader
            title="Anotações para você"
            href="/dashboard/documents"
          />
          {recentDocuments.length === 0 ? (
            <EmptyState
              icon={<FileText size={20} />}
              title="Nenhuma página ainda"
              text="Registre estratégias, ajustes do robô e aprendizados."
              href="/dashboard/documents"
              cta="Criar página"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {recentDocuments.slice(0, 2).map((doc, i) => (
                <Link
                  key={doc.id}
                  href={`/dashboard/documents/${doc.id}`}
                  className="card group border border-base-300 bg-base-100 p-3 transition-shadow hover:shadow-lg"
                >
                  <div
                    className={`relative flex h-36 items-center justify-center overflow-hidden rounded-xl ${DOC_TONES[i % 2]}`}
                  >
                    <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full border-[14px] border-base-100/60" />
                    <div className="absolute -bottom-8 right-6 h-20 w-20 rotate-12 rounded-2xl bg-base-100/50" />
                    <span className="relative transition-transform group-hover:scale-110">
                      <DocIcon value={doc.icon} size={64} />
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 px-1 text-sm font-bold group-hover:text-primary">
                    {doc.title}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 px-1 text-[11px] text-base-content/45">
                    <Clock size={11} />
                    Atualizada {formatDate(doc.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ---------------- Coluna lateral ---------------- */}
      <aside className="space-y-6">
        <WeekStrip events={upcomingEvents} large />

        <section>
          <SectionHeader title="Próximos eventos" href="/dashboard/calendar" />
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={20} />}
              title="Nada agendado"
              text="Adicione treinos, torneios e reuniões ao calendário."
              href="/dashboard/calendar"
              cta="Abrir calendário"
            />
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event, i) => (
                <li
                  key={event.id}
                  className="card border border-base-300 bg-base-100 p-4"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`badge badge-sm badge-soft ${
                        i % 2 === 0 ? "badge-secondary" : "badge-warning"
                      } capitalize`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-bold">{event.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-base-content/55">
                      <Clock size={12} />
                      {formatDate(event.startAt)}
                    </span>
                    <Link
                      href="/dashboard/calendar"
                      className="btn btn-neutral btn-sm rounded-full"
                    >
                      Detalhes
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader title="Suas ligas" />
          {leagueInterests.length === 0 ? (
            <EmptyState
              icon={<Trophy size={20} />}
              title="Nenhuma liga"
              text="Adicione as competições que você participa."
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {leagueInterests.map((l) => (
                <span
                  key={l.id}
                  className={`badge badge-lg gap-1.5 ${
                    l.relationType === "participante"
                      ? "badge-primary"
                      : "badge-outline"
                  }`}
                >
                  <Trophy size={12} />
                  {l.leagueName}
                </span>
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
