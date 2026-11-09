import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  CalendarCheck,
  CalendarPlus,
  CircleStop,
  Cpu,
  Flag,
  FlaskConical,
  KanbanSquare,
  Lightbulb,
  ListChecks,
  Play,
  ShieldCheck,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { roleLabel } from "@/utils/stagebook/team-permissions";
import { sessionKindLabel, type TeamActivityItem } from "@/types/training";
import { PersonAvatar } from "./team-avatar";

/**
 * Um item do feed da equipe. `data` guarda um snapshot do nome do recurso:
 * se o item foi excluído, o texto continua legível (só sem link).
 */

type Ctx = { teamId: string; item: TeamActivityItem; d: Record<string, unknown> };

const str = (v: unknown) => (typeof v === "string" && v ? v : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const fmtNum = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function Res({ href, children }: { href?: string | null; children: ReactNode }) {
  return href ? (
    <Link href={href} className="font-medium hover:text-primary hover:underline">
      {children}
    </Link>
  ) : (
    <span className="font-medium">{children}</span>
  );
}

const sessionHref = ({ teamId, item }: Ctx) =>
  item.entityId ? `/dashboard/team/${teamId}/treinos/${item.entityId}` : null;

const VERBS: Record<string, { Icon: LucideIcon; tone: string; render: (c: Ctx) => ReactNode }> = {
  "board.created": {
    Icon: KanbanSquare,
    tone: "text-primary",
    render: ({ item, d }) => (
      <>criou o kanban <Res href={item.entityId ? `/dashboard/kanban/${item.entityId}` : null}>{str(d.name)}</Res></>
    ),
  },
  "board.deleted": {
    Icon: Trash2,
    tone: "text-base-content/50",
    render: ({ d }) => <>excluiu o kanban <Res>{str(d.name)}</Res></>,
  },
  "thinklab.created": {
    Icon: Lightbulb,
    tone: "text-warning",
    render: ({ item, d }) => (
      <>criou o quadro <Res href={item.entityId ? `/dashboard/thinklab/${item.entityId}` : null}>{str(d.name)}</Res></>
    ),
  },
  "thinklab.deleted": {
    Icon: Trash2,
    tone: "text-base-content/50",
    render: ({ d }) => <>excluiu o quadro <Res>{str(d.name)}</Res></>,
  },
  "test.created": {
    Icon: FlaskConical,
    tone: "text-info",
    render: ({ item, d }) => (
      <>criou o teste <Res href={item.entityId ? `/dashboard/labtest/${item.entityId}` : null}>{str(d.name)}</Res></>
    ),
  },
  "test.deleted": {
    Icon: Trash2,
    tone: "text-base-content/50",
    render: ({ d }) => <>excluiu o teste <Res>{str(d.name)}</Res></>,
  },
  "test.executed": {
    Icon: Activity,
    tone: "text-info",
    render: ({ item, d }) => {
      const best = num(d.bestScore);
      return (
        <>
          rodou {item.count === 1 ? "uma execução" : `${item.count} execuções`} de{" "}
          <Res href={item.entityId ? `/dashboard/labtest/${item.entityId}` : null}>{str(d.name)}</Res>
          {best !== null && <span className="text-base-content/55"> · melhor {fmtNum(best)} pts</span>}
        </>
      );
    },
  },
  "test.record": {
    Icon: Trophy,
    tone: "text-warning",
    render: ({ item, d }) => {
      const score = num(d.score);
      const prev = num(d.previous);
      return (
        <>
          bateu o recorde de <Res href={item.entityId ? `/dashboard/labtest/${item.entityId}` : null}>{str(d.name)}</Res>
          {score !== null && (
            <span className="text-base-content/55">
              {" "}
              · {fmtNum(score)} pts{prev !== null && ` (antes ${fmtNum(prev)})`}
            </span>
          )}
        </>
      );
    },
  },
  "milestone.created": {
    Icon: Flag,
    tone: "text-secondary",
    render: ({ teamId, d }) => (
      <>criou o marco <Res href={`/dashboard/team/${teamId}?tab=marcos`}>{str(d.name)}</Res></>
    ),
  },
  "member.joined": {
    Icon: UserPlus,
    tone: "text-success",
    render: ({ d }) => <>entrou na equipe{str(d.role) && <span className="text-base-content/55"> como {roleLabel(str(d.role)!)}</span>}</>,
  },
  "member.role_changed": {
    Icon: ShieldCheck,
    tone: "text-secondary",
    render: ({ d }) => (
      <>
        mudou o cargo de <Res>{str(d.name) ?? "um membro"}</Res> para{" "}
        <span className="font-medium">{roleLabel(str(d.to) ?? "")}</span>
      </>
    ),
  },
  "anatix.session_ended": {
    Icon: Cpu,
    tone: "text-accent",
    render: ({ d }) => {
      const frames = num(d.frames);
      return (
        <>
          gravou uma sessão Anatix em{" "}
          <Res href={str(d.labId) ? `/dashboard/labtest/anatix/${str(d.labId)}` : null}>{str(d.labName) ?? "um laboratório"}</Res>
          {(str(d.robotName) || frames !== null) && (
            <span className="text-base-content/55">
              {" "}
              · {[str(d.robotName), frames !== null ? `${fmtNum(frames)} frames` : null].filter(Boolean).join(" · ")}
            </span>
          )}
        </>
      );
    },
  },
  "session.created": {
    Icon: CalendarPlus,
    tone: "text-primary",
    render: (c) => (
      <>
        planejou <Res href={sessionHref(c)}>{str(c.d.title)}</Res>
        <span className="text-base-content/55"> · {sessionKindLabel(str(c.d.kind) ?? "treino")}</span>
      </>
    ),
  },
  "session.started": {
    Icon: Play,
    tone: "text-success",
    render: (c) => <>iniciou <Res href={sessionHref(c)}>{str(c.d.title)}</Res></>,
  },
  "session.ended": {
    Icon: CircleStop,
    tone: "text-base-content/60",
    render: (c) => {
      const minutes = num(c.d.durationMin);
      const executions = num(c.d.executions);
      const extra = [
        minutes !== null ? `${minutes} min` : null,
        executions !== null ? `${executions} ${executions === 1 ? "execução" : "execuções"}` : null,
      ].filter(Boolean);
      return (
        <>
          {c.d.auto ? "A sessão " : "encerrou "}
          <Res href={sessionHref(c)}>{str(c.d.title)}</Res>
          {c.d.auto && " foi encerrada por inatividade"}
          {extra.length > 0 && <span className="text-base-content/55"> · {extra.join(" · ")}</span>}
        </>
      );
    },
  },
  "session.deleted": {
    Icon: Trash2,
    tone: "text-base-content/50",
    render: ({ d }) => <>excluiu a sessão <Res>{str(d.title)}</Res></>,
  },
  "session.checked_in": {
    Icon: UserCheck,
    tone: "text-success",
    render: (c) => <>chegou em <Res href={sessionHref(c)}>{str(c.d.title)}</Res></>,
  },
  "roster.published": {
    Icon: ListChecks,
    tone: "text-primary",
    render: (c) => <>publicou a escala de <Res href={sessionHref(c)}>{str(c.d.title)}</Res></>,
  },
  "roster.updated": {
    Icon: CalendarCheck,
    tone: "text-primary",
    render: (c) => <>atualizou a escala de <Res href={sessionHref(c)}>{str(c.d.title)}</Res></>,
  },
};

const FALLBACK = { Icon: Activity, tone: "text-base-content/50", render: ({ item }: Ctx) => <>{item.verb}</> };

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function ActivityItem({ teamId, item, compact = false }: { teamId: string; item: TeamActivityItem; compact?: boolean }) {
  const meta = VERBS[item.verb] ?? FALLBACK;
  const { Icon } = meta;
  // Eventos automáticos (sem ator) não começam com um nome.
  const systemEvent = item.actor === null;
  return (
    <li className="flex items-start gap-3 py-2.5">
      <div className="relative shrink-0">
        {item.actor ? (
          <PersonAvatar name={item.actor.name} imageUrl={item.actor.avatarUrl} size="size-8" />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-base-200 text-base-content/50">
            <Icon size={14} />
          </span>
        )}
        {item.actor && (
          <span className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-base-100 ${meta.tone}`}>
            <Icon size={10} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-sm leading-snug">
        <p className={compact ? "line-clamp-2" : ""}>
          {!systemEvent && <span className="font-semibold">{item.actor?.name ?? "Alguém"} </span>}
          {meta.render({ teamId, item, d: item.data })}
        </p>
        <p className="mt-0.5 text-xs text-base-content/45" suppressHydrationWarning>
          {fmtTime(item.updatedAt)}
        </p>
      </div>
    </li>
  );
}

/** Rótulo do dia: "Hoje", "Ontem" ou "seg, 2 nov". */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return d
    .toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" })
    .replace(/\./g, "");
}

export function groupByDay(items: TeamActivityItem[]): { label: string; items: TeamActivityItem[] }[] {
  const groups: { label: string; items: TeamActivityItem[] }[] = [];
  for (const item of items) {
    const label = dayLabel(item.updatedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}
