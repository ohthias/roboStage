import Link from "next/link";
import {
  Book,
  CalendarDays,
  Check,
  CheckCircle2,
  Flag,
  FlaskConical,
  KanbanSquare,
  Lightbulb,
  Minus,
  ShieldCheck,
} from "lucide-react";
import type { TeamOverview } from "@/utils/stagebook/team-queries";
import { ROLE_META, roleCan, type TeamCapability, type TeamRole } from "@/utils/stagebook/team-permissions";
import { RoleBadge } from "./role-badge";

const PRIORITY_STYLE: Record<string, string> = {
  baixa: "badge-ghost",
  media: "badge-info badge-outline",
  alta: "badge-warning badge-outline",
  urgente: "badge-error",
};

const PRIORITY_LABEL: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const CAPABILITY_ROWS: { capability: TeamCapability; label: string }[] = [
  { capability: "tool.create", label: "Ver e criar Kanbans, ThinkLabs e LabTests" },
  { capability: "milestone.manage", label: "Criar e editar os marcos da equipe" },
  { capability: "team.edit", label: "Editar nome, foto e perfil da equipe" },
  { capability: "team.members.manage", label: "Convidar, remover e trocar cargos" },
  { capability: "team.delete", label: "Excluir a equipe" },
];

function fmtDay(iso: string, withTime = false) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** Aba "Geral": números da equipe, o que é seu para fazer, próximos eventos e o que seu cargo permite. */
export function OverviewTab({
  teamId,
  overview,
  role,
}: {
  teamId: string;
  overview: TeamOverview;
  role: TeamRole;
}) {
  const base = `/dashboard/team/${teamId}`;
  const stats = [
    { label: "Kanbans", value: overview.counts.boards, href: `${base}?tab=kanban`, Icon: KanbanSquare },
    { label: "ThinkLab", value: overview.counts.thinklabs, href: `${base}?tab=thinklab`, Icon: Lightbulb },
    { label: "LabTests", value: overview.counts.tests, href: `${base}?tab=labtests`, Icon: FlaskConical },
    { label: "Marcos", value: overview.counts.milestones, href: `${base}?tab=marcos`, Icon: Flag },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="card border border-base-300 bg-base-100 transition-colors hover:border-primary/40"
          >
            <div className="card-body flex-row items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="mt-1 text-xs text-base-content/55">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Atribuído a você */}
          <section className="card border border-base-300 bg-base-100">
            <div className="card-body gap-2 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <KanbanSquare size={15} className="text-primary" /> Atribuído a você
              </h3>
              {overview.myCards.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 size={24} className="mb-2 text-base-content/25" />
                  <p className="text-sm font-medium">Nada atribuído a você agora</p>
                  <p className="mt-1 text-xs text-base-content/50">Cards em que você for responsável aparecem aqui.</p>
                </div>
              ) : (
                <ul className="divide-y divide-base-200">
                  {overview.myCards.map((card) => (
                    <li key={card.id}>
                      <Link href={`/dashboard/kanban/${card.boardId}`} className="block py-2.5 hover:text-primary">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium">{card.title}</span>
                          <span className={`badge badge-xs shrink-0 ${PRIORITY_STYLE[card.priority] ?? "badge-ghost"}`}>
                            {PRIORITY_LABEL[card.priority] ?? card.priority}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-base-content/45" suppressHydrationWarning>
                          {card.boardName} / {card.columnName}
                          {card.dueAt && ` · prazo ${fmtDay(card.dueAt)}`}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Próximos eventos */}
          <section className="card border border-base-300 bg-base-100">
            <div className="card-body gap-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays size={15} className="text-primary" /> Próximos eventos
                </h3>
                <Link href="/dashboard/calendar" className="link link-hover text-xs text-base-content/50">
                  Abrir calendário
                </Link>
              </div>
              {overview.upcomingEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-base-content/50">Nada agendado.</p>
              ) : (
                <ul className="divide-y divide-base-200">
                  {overview.upcomingEvents.map((event) => (
                    <li key={event.id} className="py-2.5">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="mt-0.5 text-xs capitalize text-base-content/45" suppressHydrationWarning>
                        {fmtDay(event.startAt, true)} · {event.type}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {/* Atalhos */}
          <section className="card border border-base-300 bg-base-100">
            <div className="card-body gap-2 p-4">
              <h3 className="text-sm font-semibold">Atalhos</h3>
              <Link href="/dashboard/documents" className="btn btn-ghost btn-sm justify-start gap-2">
                <Book size={15} /> StageBook
                <span className="badge badge-ghost badge-sm ml-auto">{overview.counts.pages}</span>
              </Link>
              <Link href="/dashboard/calendar" className="btn btn-ghost btn-sm justify-start gap-2">
                <CalendarDays size={15} /> Calendário
                <span className="badge badge-ghost badge-sm ml-auto">{overview.counts.upcomingEvents}</span>
              </Link>
            </div>
          </section>

          {/* O que o cargo permite */}
          <section className="card border border-base-300 bg-base-100">
            <div className="card-body gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck size={15} className="text-primary" /> Seu cargo
                </h3>
                <RoleBadge role={role} />
              </div>
              <p className="text-xs text-base-content/55">{ROLE_META[role].description}</p>
              <ul className="space-y-1.5 text-xs">
                {CAPABILITY_ROWS.map(({ capability, label }) => {
                  const allowed = roleCan(role, capability);
                  return (
                    <li
                      key={capability}
                      className={`flex items-start gap-2 ${allowed ? "" : "text-base-content/35"}`}
                    >
                      {allowed ? (
                        <Check size={13} className="mt-0.5 shrink-0 text-success" />
                      ) : (
                        <Minus size={13} className="mt-0.5 shrink-0" />
                      )}
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
