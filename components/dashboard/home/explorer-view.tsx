import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  FileText,
  FlaskConical,
  KanbanSquare,
  Lightbulb,
  Trophy,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import type { DashboardData } from "@/app/(protected)/dashboard/data";
import {
  Donut,
  EmptyState,
  ProfileCard,
  SectionHeader,
  firstName,
  formatDate,
  greeting,
  modeDonutItems,
  type DonutItem,
} from "./shared";

const EVENT_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-info)",
];

const CARD_TONES = [
  { top: "bg-success/20", icon: "text-success" },
  { top: "bg-info/20", icon: "text-info" },
];

type Chip = { href: string; label: string; icon: ReactNode; tone: string };
type Row = {
  id: string;
  href: string;
  title: string;
  tag: string;
  icon: ReactNode;
  tone: string;
  meta: { label: string; value: ReactNode }[];
  action: string;
};

/**
 * Entusiasta e Organizador — inspirado no layout "categorias + aulas":
 * entusiasta explora conteúdo; organizador coordena eventos e tarefas.
 */
export function ExplorerDashboard({
  data,
  variant,
}: {
  data: DashboardData;
  variant: "entusiasta" | "organizador";
}) {
  const {
    currentUser,
    leagueInterests,
    upcomingEvents,
    pendingCards,
    recentDocuments,
    recentTests,
    testsByMode,
    totalExecutions,
  } = data;
  const isOrg = variant === "organizador";

  /* -------- Chips do topo -------- */
  const chips: Chip[] = isOrg
    ? [
        { href: "/dashboard/calendar", label: "Calendário", icon: <CalendarDays size={14} />, tone: "bg-primary/12 text-primary" },
        { href: "/dashboard/kanban", label: "Tarefas", icon: <KanbanSquare size={14} />, tone: "bg-secondary/12 text-secondary" },
        { href: "/dashboard/team", label: "Equipes", icon: <Users size={14} />, tone: "bg-accent/30 text-accent-content" },
        { href: "/dashboard/documents", label: "Páginas", icon: <FileText size={14} />, tone: "bg-success/15 text-success" },
      ]
    : [
        { href: "/dashboard/thinklab", label: "ThinkLab", icon: <Lightbulb size={14} />, tone: "bg-accent/30 text-accent-content" },
        { href: "/dashboard/documents", label: "Páginas", icon: <BookOpen size={14} />, tone: "bg-secondary/12 text-secondary" },
        { href: "/dashboard/labtest", label: "LabTest", icon: <FlaskConical size={14} />, tone: "bg-primary/12 text-primary" },
        ...leagueInterests.slice(0, 3).map((l) => ({
          href: "/dashboard/calendar",
          label: l.leagueName,
          icon: <Trophy size={14} />,
          tone: "bg-success/15 text-success",
        })),
      ];

  /* -------- Lista "em andamento" -------- */
  const rows: Row[] = isOrg
    ? pendingCards.map((c) => ({
        id: c.id,
        href: `/dashboard/kanban/${c.boardId}`,
        title: c.title,
        tag: c.columnName,
        icon: <KanbanSquare size={18} />,
        tone: "bg-primary/12 text-primary",
        meta: [
          { label: "Board", value: c.boardName },
          { label: "Prioridade", value: c.priority ?? "—" },
          { label: "Prazo", value: formatDate(c.dueAt) },
        ],
        action: "Abrir",
      }))
    : recentDocuments.map((d) => ({
        id: d.id,
        href: `/dashboard/documents/${d.id}`,
        title: d.title,
        tag: "Página",
        icon: <span className="text-lg">{d.icon ?? "📝"}</span>,
        tone: "bg-secondary/12",
        meta: [
          { label: "Tipo", value: "Anotação" },
          { label: "Atualizada", value: formatDate(d.updatedAt) },
        ],
        action: "Continuar",
      }));

  /* -------- Donut -------- */
  const donutItems: DonutItem[] = isOrg
    ? Object.entries(
        upcomingEvents.reduce<Record<string, number>>((acc, e) => {
          acc[e.type] = (acc[e.type] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([type, count], i) => ({
        key: type,
        label: type,
        count,
        color: EVENT_COLORS[i % EVENT_COLORS.length],
      }))
    : modeDonutItems(testsByMode);

  return (
    <div className="grid gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* ---------------- Coluna principal ---------------- */}
      <div className="min-w-0 space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-mono uppercase text-3xl font-bold tracking-tight text-base-content font-regular sm:text-4xl">
            {greeting()}, {firstName(currentUser.name)} 👋
          </h1>
          <Link
            href={isOrg ? "/dashboard/calendar" : "/dashboard/thinklab"}
            className="btn btn-sm rounded-full border-primary/40 bg-base-100 text-primary shadow-sm hover:bg-primary hover:text-primary-content"
          >
            {isOrg ? <CalendarPlus size={14} /> : <Lightbulb size={14} />}
            {isOrg ? "Novo evento" : "Explorar ideias"}
          </Link>
        </header>

        {/* Chips */}
        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Atalhos">
          {chips.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="flex shrink-0 items-center gap-2 rounded-2xl border border-base-300 bg-base-100 py-2 pl-2 pr-4 text-sm font-medium shadow-sm transition-colors hover:border-primary/40"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.tone}`}>
                {c.icon}
              </span>
              {c.label}
            </Link>
          ))}
        </nav>

        {/* Próximos eventos (tipo "aulas") */}
        <section>
          <SectionHeader
            title={isOrg ? "Próximos eventos" : "O que vem por aí"}
            href="/dashboard/calendar"
          />
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={20} />}
              title="Nada agendado"
              text={
                isOrg
                  ? "Crie o primeiro microevento ou reunião da sua organização."
                  : "Acompanhe torneios e encontros adicionando-os ao calendário."
              }
              href="/dashboard/calendar"
              cta="Abrir calendário"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingEvents.slice(0, 2).map((e, i) => {
                const tone = CARD_TONES[i % 2];
                return (
                  <div key={e.id} className="card border border-base-300 bg-base-100 p-3">
                    <div className={`relative h-28 overflow-hidden rounded-xl ${tone.top}`}>
                      <span className="badge badge-sm absolute left-2 top-2 border-none bg-base-100">
                        {formatDate(e.startAt)}
                      </span>
                      <CalendarDays
                        size={90}
                        strokeWidth={1}
                        className={`absolute -bottom-4 right-4 rotate-[-12deg] opacity-40 ${tone.icon}`}
                      />
                    </div>
                    <div className="px-1 pt-3">
                      <span className="badge badge-ghost badge-sm capitalize">{e.type}</span>
                      <p className="mt-1.5 line-clamp-1 text-sm font-bold">{e.title}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="avatar-group -space-x-3">
                          {["bg-primary", "bg-accent", "bg-secondary"].map((bg) => (
                            <div key={bg} className="avatar avatar-placeholder">
                              <div className={`w-6 rounded-full ${bg}`} />
                            </div>
                          ))}
                        </div>
                        <Link
                          href="/dashboard/calendar"
                          className="btn btn-outline btn-xs rounded-full border-base-300 px-4"
                        >
                          Ver
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Em andamento */}
        <section>
          <SectionHeader
            title={isOrg ? "Tarefas em andamento" : "Continue de onde parou"}
            href={isOrg ? "/dashboard/kanban" : "/dashboard/documents"}
          />
          {rows.length === 0 ? (
            <EmptyState
              icon={isOrg ? <KanbanSquare size={20} /> : <BookOpen size={20} />}
              title={isOrg ? "Tudo em dia" : "Nada em andamento"}
              text={
                isOrg
                  ? "Nenhum card com prazo próximo."
                  : "Crie uma página para guardar o que você está aprendendo."
              }
              href={isOrg ? "/dashboard/kanban" : "/dashboard/documents"}
              cta={isOrg ? "Abrir Kanban" : "Criar página"}
            />
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-3 sm:flex-nowrap"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${r.tone}`}>
                    {r.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="badge badge-outline badge-xs">{r.tag}</span>
                    <p className="mt-1 truncate text-sm font-semibold">{r.title}</p>
                  </div>
                  <dl className="hidden gap-6 md:flex">
                    {r.meta.map((m) => (
                      <div key={m.label} className="w-24">
                        <dt className="text-[10px] text-base-content/40">{m.label}</dt>
                        <dd className="truncate text-xs font-semibold capitalize">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link href={r.href} className="btn btn-outline btn-sm rounded-full border-base-300">
                    {r.action}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ---------------- Coluna lateral ---------------- */}
      <aside className="space-y-4">
        <ProfileCard
          data={data}
          stats={
            isOrg
              ? [
                  { icon: <CalendarDays size={14} />, value: upcomingEvents.length, label: "Eventos" },
                  { icon: <KanbanSquare size={14} />, value: pendingCards.length, label: "Tarefas" },
                  { icon: <FileText size={14} />, value: recentDocuments.length, label: "Páginas" },
                ]
              : [
                  { icon: <Trophy size={14} />, value: leagueInterests.length, label: "Ligas" },
                  { icon: <FlaskConical size={14} />, value: recentTests.length, label: "Testes" },
                  { icon: <FileText size={14} />, value: recentDocuments.length, label: "Páginas" },
                ]
          }
        />

        <div className="card border border-base-300 bg-base-100 p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] text-base-content/45">
                {isOrg ? "Agenda" : "Atividade"}
              </p>
              <p className="text-xl font-black">
                {isOrg ? upcomingEvents.length : totalExecutions}
                <span className="ml-1 text-xs font-medium text-base-content/45">
                  {isOrg ? "eventos" : "execuções"}
                </span>
              </p>
            </div>
            <span className="badge badge-success badge-soft badge-sm">
              {isOrg ? "Por tipo" : "Por modo"}
            </span>
          </div>
          <Donut items={donutItems} centerLabel={isOrg ? "Eventos" : "Testes"} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(isOrg
            ? [
                { icon: <Users size={16} />, label: "Equipes", href: "/dashboard/team", tone: "bg-primary/12 text-primary" },
                { icon: <KanbanSquare size={16} />, label: "Boards", href: "/dashboard/kanban", tone: "bg-secondary/12 text-secondary" },
              ]
            : [
                { icon: <Lightbulb size={16} />, label: "ThinkLab", href: "/dashboard/thinklab", tone: "bg-accent/30 text-accent-content" },
                { icon: <FlaskConical size={16} />, label: "LabTest", href: "/dashboard/labtest", tone: "bg-primary/12 text-primary" },
              ]
          ).map((q) => (
            <div key={q.label} className="card items-center gap-3 border border-base-300 bg-base-100 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${q.tone}`}>
                {q.icon}
              </span>
              <p className="text-sm font-bold">{q.label}</p>
              <Link href={q.href} className="btn btn-outline btn-xs w-full rounded-full border-base-300">
                Abrir
                <ArrowUpRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
