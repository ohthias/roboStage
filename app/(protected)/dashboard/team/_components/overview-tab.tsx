import type { ReactNode } from "react";
import {
  ArrowRight,
  Book,
  CalendarDays,
  CheckCircle2,
  Flag,
  FlaskConical,
  KanbanSquare,
  Lightbulb,
  ListChecks,
  MapPin,
  Play,
  Plus,
  Timer,
  Trophy,
  UserCheck,
} from "lucide-react";
import type { TeamOverview } from "@/utils/stagebook/team-queries";
import { roleCan, type TeamRole } from "@/utils/stagebook/team-permissions";
import type { TeamMemberSummary } from "@/types/team-workspace";
import {
  sessionKindLabel,
  type ActiveSessionRef,
  type TeamActivityItem,
  type TrainingSessionListItem,
  type UpcomingDuty,
} from "@/types/training";
import { ActivityItem } from "./activity-item";
import { PersonAvatar } from "./team-avatar";
import { QuickStart } from "./quick-start";
import { NavLink } from "./nav-link";
import { teamToolHref } from "./team-links";
import { EVENT_TYPES } from "@/app/(protected)/dashboard/calendar/constants";
import { CORNER, SectionHead, TONE_FILL, TONE_SOFT, TrackArt, type Tone } from "./team-ui";

// ---------------------------------------------------------------------------
// Datas
// ---------------------------------------------------------------------------

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const daysUntil = (iso: string, now = new Date()) => Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / DAY);

function relDay(iso: string): string {
  const n = daysUntil(iso);
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  if (n === -1) return "ontem";
  if (n > 1 && n < 7) return `em ${n} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(/\./g, "");
}

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const minutesSince = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`);

const PRIORITY: Record<string, { label: string; tone: Tone }> = {
  baixa: { label: "Baixa", tone: "success" },
  media: { label: "Média", tone: "secondary" },
  alta: { label: "Alta", tone: "accent" },
  urgente: { label: "Urgente", tone: "primary" },
};

const eventTypeLabel = (type: string) => EVENT_TYPES.find((t) => t.value === type)?.label ?? type;

function roundsText(rounds: (number | null)[]) {
  const specific = rounds.filter((r): r is number => r !== null).sort((a, b) => a - b);
  if (rounds.includes(null) || specific.length === 0) return "";
  return ` (${specific.map((r) => `R${r}`).join(", ")})`;
}

// ---------------------------------------------------------------------------
// Card em destaque (os cards grandes e coloridos da referência)
// ---------------------------------------------------------------------------

function FeatureCard({
  href,
  tone,
  art,
  chip,
  pill,
  title,
  subtitle,
  live = false,
}: {
  href: string;
  tone: Tone;
  art: 0 | 1 | 2;
  chip: ReactNode;
  pill: ReactNode;
  title: string;
  subtitle: ReactNode;
  live?: boolean;
}) {
  return (
    <NavLink
      href={href}
      className={`group relative flex h-60 flex-col overflow-hidden p-4 sm:h-72 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-base-content/10 ${TONE_FILL[tone]} ${CORNER.lg}`}
    >
      <TrackArt
        variant={art}
        className="absolute -right-10 top-6 size-64 opacity-60 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110"
      />
      <div className="relative flex items-center gap-2 text-xs font-semibold">{chip}</div>
      <span
        className={`relative mt-2 inline-flex w-fit items-center gap-1.5 bg-base-100 px-2 py-0.5 font-mono text-[11px] font-bold text-base-content ${CORNER.sm}`}
      >
        {live && <span className="size-1.5 animate-pulse rounded-full bg-primary" />}
        {pill}
      </span>
      <div className={`relative mt-auto bg-black/25 p-3 backdrop-blur-sm ${CORNER.md}`}>
        <p className="line-clamp-2 text-sm font-bold leading-snug">{title}</p>
        <p className="mt-1 line-clamp-1 text-[11px] opacity-80">{subtitle}</p>
      </div>
    </NavLink>
  );
}

function EmptyFeature({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) {
  return (
    <NavLink
      href={href}
      className={`group flex h-48 flex-col items-center justify-center sm:h-72 gap-2 border-2 border-dashed border-base-300 p-6 text-center transition-colors hover:border-primary/40 ${CORNER.lg}`}
    >
      <span className={`flex size-11 items-center justify-center ${TONE_SOFT.primary} ${CORNER.md}`}>{icon}</span>
      <p className="font-semibold">{title}</p>
      <p className="max-w-56 text-xs text-base-content/55">{text}</p>
    </NavLink>
  );
}

// ---------------------------------------------------------------------------

/**
 * Aba "Geral" — painel inspirado em dashboards de cursos, no idioma do
 * RoboStage: quem está na equipe agora, dois destaques grandes (treino e
 * agenda), o que é seu para fazer e a atividade; à direita, treino rápido,
 * agenda, suas funções e a contagem para o próximo marco.
 */
export function OverviewTab({
  teamId,
  overview,
  role,
  viewerId,
  members,
  activity,
  activeSession,
  presentIds,
  sessions,
  upcomingDuties,
}: {
  teamId: string;
  overview: TeamOverview;
  role: TeamRole;
  viewerId: string;
  members: TeamMemberSummary[];
  activity: TeamActivityItem[];
  activeSession: ActiveSessionRef | null;
  presentIds: string[];
  sessions: TrainingSessionListItem[];
  upcomingDuties: UpcomingDuty[];
}) {
  const base = `/dashboard/team/${teamId}`;
  /** Ferramentas do RoboStage abertas já no espaço desta equipe. */
  const tool = (path: string) => teamToolHref(teamId, path);
  const canCreate = roleCan(role, "tool.create");
  const present = new Set(presentIds);
  // Presentes primeiro; você logo depois deles.
  const ordered = [...members].sort(
    (a, b) =>
      Number(present.has(b.userId)) - Number(present.has(a.userId)) ||
      Number(b.userId === viewerId) - Number(a.userId === viewerId),
  );

  // Destaque 1: sessão em andamento > próxima planejada > última encerrada.
  const featured =
    sessions.find((s) => s.status === "em_andamento") ??
    sessions.find((s) => s.status === "planejada") ??
    sessions.find((s) => s.status === "encerrada") ??
    null;
  // Destaque 2: próximo evento do calendário.
  const [nextEvent, ...laterEvents] = overview.upcomingEvents;
  const milestone = overview.nextMilestone;
  // Os dois destaques nunca com a mesma cor.
  const featuredTone: Tone = featured?.status === "em_andamento" ? "primary" : "secondary";
  const eventTone: Tone = featuredTone === "primary" ? "secondary" : nextEvent?.type === "competicao" ? "primary" : "accent";
  const milestoneDays = milestone ? daysUntil(milestone.dueAt) : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      {/* ================================================================ */}
      <div className="min-w-0 space-y-7">
        {/* Na equipe agora */}
        <section>
          <SectionHead
            kicker={activeSession ? "AO VIVO" : "EQUIPE"}
            title={
              activeSession ? (
                <>
                  Presentes em <span className="text-primary">{activeSession.title}</span>
                  <span className="ml-2 font-mono text-xs font-normal text-base-content/45">
                    {present.size}/{members.length}
                  </span>
                </>
              ) : (
                "Quem faz parte"
              )
            }
            href={activeSession ? `${base}/treinos/${activeSession.id}` : `${base}?tab=membros`}
            linkLabel={activeSession ? "abrir sessão" : "membros"}
          />
          <ul className="flex gap-3 pb-1">
            {ordered.map((m) => {
              const here = present.has(m.userId);
              return (
                <li key={m.userId} className="shrink-0">
                  <span className="tooltip tooltip-bottom" data-tip={`${m.name ?? "Sem nome"}${here ? " · presente" : ""}`}>
                    <span
                      className={`relative block rounded-full p-[3px] ${
                        here
                          ? "bg-gradient-to-br from-primary via-accent to-secondary"
                          : activeSession
                            ? "bg-base-300 opacity-50 grayscale"
                            : "bg-base-300"
                      }`}
                    >
                      <span className="block rounded-full bg-base-100 p-[2px]">
                        <PersonAvatar name={m.name} imageUrl={m.avatarUrl} size="size-10" />
                      </span>
                      {here && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-success text-success-content ring-2 ring-base-100">
                          <UserCheck size={9} />
                        </span>
                      )}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Em destaque */}
        <section>
          <SectionHead kicker="EM DESTAQUE" title="Nesta semana" href={`${base}?tab=treinos`} linkLabel="treinos" />
          <div className="grid gap-4 sm:grid-cols-2">
            {featured ? (
              <FeatureCard
                href={`${base}/treinos/${featured.id}`}
                tone={featuredTone}
                art={0}
                live={featured.status === "em_andamento"}
                chip={
                  <>
                    <span className={`flex size-7 items-center justify-center bg-base-100/20 ${CORNER.sm}`}>
                      <Timer size={14} />
                    </span>
                    <span>
                      {sessionKindLabel(featured.kind)}
                      <span className="block text-[10px] font-normal opacity-75">
                        {featured.status === "em_andamento"
                          ? "em andamento"
                          : featured.status === "planejada"
                            ? "próximo"
                            : "último encerrado"}
                      </span>
                    </span>
                  </>
                }
                pill={
                  <span suppressHydrationWarning>
                    {featured.status === "em_andamento" && featured.startedAt
                      ? `AO VIVO · ${fmtMin(minutesSince(featured.startedAt))}`
                      : featured.status === "planejada"
                        ? featured.scheduledFor
                          ? `${relDay(featured.scheduledFor)} · ${hhmm(featured.scheduledFor)}`
                          : "sem data"
                        : `${featured.summary.executions ?? featured.executionCount} execuções`}
                  </span>
                }
                title={featured.title}
                subtitle={
                  featured.status === "encerrada" && featured.summary.tests?.[0]
                    ? `${featured.summary.tests[0].name}${
                        featured.summary.tests[0].best !== null ? ` · melhor ${featured.summary.tests[0].best} pts` : ""
                      }`
                    : [
                        featured.location,
                        `${featured.attendeeCount} ${featured.attendeeCount === 1 ? "presente" : "presentes"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                }
              />
            ) : (
              <EmptyFeature
                href={`${base}?tab=treinos`}
                icon={<Timer size={20} />}
                title="Nenhum treino ainda"
                text="Inicie um treino para juntar presença, execuções e escala num lugar só."
              />
            )}

            {nextEvent ? (
              <FeatureCard
                href={tool("/dashboard/calendar")}
                tone={eventTone}
                art={1}
                chip={
                  <>
                    <span className={`flex size-7 items-center justify-center bg-base-100/25 ${CORNER.sm}`}>
                      <CalendarDays size={14} />
                    </span>
                    <span>
                      {eventTypeLabel(nextEvent.type)}
                      <span className="block text-[10px] font-normal opacity-75">próximo evento</span>
                    </span>
                  </>
                }
                pill={<span suppressHydrationWarning>{`${relDay(nextEvent.startAt)} · ${hhmm(nextEvent.startAt)}`}</span>}
                title={nextEvent.title}
                subtitle={nextEvent.location ?? "Abrir no calendário"}
              />
            ) : milestone ? (
              <FeatureCard
                href={`${base}?tab=marcos`}
                tone="accent"
                art={2}
                chip={
                  <>
                    <span className={`flex size-7 items-center justify-center bg-base-100/25 ${CORNER.sm}`}>
                      <Flag size={14} />
                    </span>
                    <span>Marco</span>
                  </>
                }
                pill={<span suppressHydrationWarning>{relDay(milestone.dueAt)}</span>}
                title={milestone.name}
                subtitle="Veja o que está vinculado a ele"
              />
            ) : (
              <EmptyFeature
                href={tool("/dashboard/calendar")}
                icon={<CalendarDays size={20} />}
                title="Agenda vazia"
                text="Marque treinos e competições no calendário para vê-los aqui."
              />
            )}
          </div>
        </section>

        {/* Para você */}
        <section>
          <SectionHead kicker="PARA VOCÊ" title="Atribuído a você" href={`${base}?tab=kanban`} linkLabel="kanban" />
          {overview.myCards.length === 0 ? (
            <div className={`flex items-center gap-3 bg-base-200/60 p-4 text-sm text-base-content/60 ${CORNER.md}`}>
              <CheckCircle2 size={18} className="shrink-0 text-success" />
              Nada atribuído a você agora. Cards em que você for responsável aparecem aqui.
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {overview.myCards.map((card) => {
                const p = PRIORITY[card.priority] ?? { label: card.priority, tone: "secondary" as Tone };
                return (
                  <li key={card.id}>
                    <NavLink
                      href={tool(`/dashboard/kanban/${card.boardId}`)}
                      className={`group flex items-center gap-3 bg-base-200/60 p-2.5 transition-colors hover:bg-base-200 ${CORNER.md}`}
                    >
                      <span className={`flex size-9 shrink-0 items-center justify-center ${TONE_SOFT[p.tone]} ${CORNER.sm}`}>
                        <KanbanSquare size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{card.title}</span>
                        <span className="block truncate text-[11px] text-base-content/50" suppressHydrationWarning>
                          {card.columnName} · {p.label}
                          {card.dueAt && ` · ${relDay(card.dueAt)}`}
                        </span>
                      </span>
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center bg-base-100 text-base-content/50 shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-content ${CORNER.sm}`}
                      >
                        <ArrowRight size={13} />
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Atividade */}
        <section>
          <SectionHead kicker="LINHA DO TEMPO" title="Atividade recente" href={`${base}?tab=geral&feed=all`} />
          <div className={`bg-base-200/40 px-4 ${CORNER.md}`}>
            {activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-base-content/50">
                Quando a equipe criar, testar ou treinar, aparece aqui.
              </p>
            ) : (
              <ul className="divide-y divide-base-300/60">
                {activity.map((item) => (
                  <ActivityItem key={item.id} teamId={teamId} item={item} compact />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ================================================================ */}
      <aside className="space-y-7 max-xl:contents">
        {/* Treino rápido (no lugar da busca da referência). No celular vem primeiro. */}
        <section className="max-xl:order-first">
          <SectionHead kicker="INICIAR" title={activeSession ? "Sessão em andamento" : "Treino rápido"} />
          {activeSession ? (
            <NavLink
              href={`${base}/treinos/${activeSession.id}`}
              className={`flex items-center gap-3 bg-success/10 p-3 transition-colors hover:bg-success/15 ${CORNER.md}`}
            >
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{activeSession.title}</span>
              <span className={`btn btn-success btn-xs gap-1 ${CORNER.sm}`}>
                <Play size={11} /> Entrar
              </span>
            </NavLink>
          ) : (
            <QuickStart teamId={teamId} />
          )}
        </section>

        {/* Agenda: um card largo + dois pequenos, como a coluna da referência */}
        {(laterEvents.length > 0 || upcomingDuties.length > 0) && (
          <section>
            <SectionHead kicker="AGENDA" title="Vem por aí" href={tool("/dashboard/calendar")} linkLabel="calendário" />
            <div className="grid grid-cols-2 gap-2.5">
              {laterEvents.slice(0, 4).map((e, i) => {
                const tone: Tone = e.type === "competicao" ? "primary" : (["secondary", "accent", "success"] as const)[i % 3];
                return (
                  <NavLink
                    key={e.id}
                    href={tool("/dashboard/calendar")}
                    className={`group relative flex min-h-28 flex-col overflow-hidden p-3 transition-transform hover:-translate-y-0.5 ${
                      i === 0 ? "col-span-2" : ""
                    } ${TONE_FILL[tone]} ${CORNER.md}`}
                  >
                    <TrackArt variant={((i + 1) % 3) as 0 | 1 | 2} className="absolute -right-8 -top-6 size-32 opacity-40" />
                    <span
                      className={`relative w-fit bg-base-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-base-content ${CORNER.sm}`}
                      suppressHydrationWarning
                    >
                      {relDay(e.startAt)}
                    </span>
                    <p className="relative mt-auto line-clamp-2 text-xs font-bold leading-snug">{e.title}</p>
                    {e.location && (
                      <p className="relative mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-80">
                        <MapPin size={9} /> {e.location}
                      </p>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {upcomingDuties.length > 0 && (
              <div className={`mt-2.5 bg-base-200/60 p-3 ${CORNER.md}`}>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                  <ListChecks size={13} className="text-primary" /> Suas próximas funções
                </p>
                <ul className="space-y-1.5">
                  {upcomingDuties.map((u) => (
                    <li key={u.sessionId}>
                      <NavLink href={`${base}/treinos/${u.sessionId}`} className="block text-xs hover:text-primary">
                        <span className="font-semibold">{u.duties.map((d) => `${d.label}${roundsText(d.rounds)}`).join(" · ")}</span>
                        <span className="block truncate text-[11px] text-base-content/50" suppressHydrationWarning>
                          {u.sessionTitle}
                          {u.when && ` · ${relDay(u.when)}`}
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Contagem para o próximo marco (o "Special Offers" da referência) */}
        <section>
          <SectionHead kicker="PRÓXIMO MARCO" title="Contagem regressiva" />
          <div className={`relative overflow-hidden bg-accent/20 p-4 ${CORNER.lg}`}>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full border-[14px] border-accent/40"
            />
            <span
              aria-hidden="true"
              className={`absolute bottom-4 right-4 flex size-14 rotate-6 items-center justify-center bg-base-100 text-primary shadow-lg ${CORNER.md}`}
            >
              {milestone ? <Flag size={24} fill="currentColor" /> : <Trophy size={24} />}
            </span>
            {milestone && milestoneDays !== null ? (
              <>
                <p className="relative pr-16 text-2xl font-black leading-none tracking-tight text-primary" suppressHydrationWarning>
                  {milestoneDays <= 0 ? "É hoje!" : `${milestoneDays} ${milestoneDays === 1 ? "dia" : "dias"}`}
                </p>
                <p className="relative mt-1 pr-16 text-xs font-medium text-base-content/70">
                  para <strong>{milestone.name}</strong>
                </p>
                <NavLink
                  href={`${base}?tab=marcos`}
                  className={`btn btn-xs relative mt-4 border-0 bg-base-100 shadow-sm ${CORNER.sm}`}
                >
                  Ver marcos
                </NavLink>
              </>
            ) : (
              <>
                <p className="relative pr-16 text-lg font-black leading-tight tracking-tight text-primary">
                  Planeje a temporada
                </p>
                <p className="relative mt-1 pr-16 text-xs text-base-content/70">
                  Marcos com prazo aparecem aqui com a contagem regressiva.
                </p>
                <NavLink
                  href={`${base}?tab=marcos`}
                  className={`btn btn-xs relative mt-4 gap-1 border-0 bg-base-100 shadow-sm ${CORNER.sm}`}
                >
                  <Plus size={11} /> Marcos
                </NavLink>
              </>
            )}
          </div>
        </section>

        {/* Atalhos: tudo abre/cria DENTRO desta equipe (ver team-links.ts) */}
        <section>
          <SectionHead kicker="ATALHOS" title="Criar na equipe" />
          {canCreate && (
            <div className="mb-2 grid grid-cols-3 gap-2">
              {[
                { href: `${base}?tab=kanban&novo=1`, Icon: KanbanSquare, label: "Kanban", count: overview.counts.boards },
                { href: `${base}?tab=thinklab&novo=1`, Icon: Lightbulb, label: "ThinkLab", count: overview.counts.thinklabs },
                { href: `${base}?tab=labtests&novo=1`, Icon: FlaskConical, label: "LabTest", count: overview.counts.tests },
              ].map(({ href, Icon, label, count }) => (
                <NavLink
                  key={label}
                  href={href}
                  title={`Novo ${label} da equipe`}
                  className={`btn btn-ghost btn-sm h-auto flex-col gap-0.5 bg-base-200/60 py-2 ${CORNER.sm}`}
                >
                  <span className="flex items-center gap-1">
                    <Plus size={11} className="text-primary" />
                    <Icon size={14} />
                  </span>
                  <span className="text-[11px]">{label}</span>
                  <span className="font-mono text-[10px] text-base-content/45">{count}</span>
                </NavLink>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <NavLink
              href={tool("/dashboard/documents")}
              title="Documentos da equipe no StageBook"
              className={`btn btn-ghost btn-sm flex-1 gap-1.5 bg-base-200/60 ${CORNER.sm}`}
            >
              <Book size={14} /> StageBook
              <span className="font-mono text-[11px] text-base-content/45">{overview.counts.pages}</span>
            </NavLink>
            <NavLink
              href={tool("/dashboard/calendar")}
              title="Agenda da equipe"
              className={`btn btn-ghost btn-sm flex-1 gap-1.5 bg-base-200/60 ${CORNER.sm}`}
            >
              <CalendarDays size={14} /> Agenda
              <span className="font-mono text-[11px] text-base-content/45">{overview.counts.upcomingEvents}</span>
            </NavLink>
          </div>
        </section>
      </aside>
    </div>
  );
}
