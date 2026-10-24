import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  DashboardData,
  PersonaType,
} from "@/app/(protected)/dashboard/data";

/* ------------------------------------------------------------------ */
/*  Peças compartilhadas pelas dashboards de cada persona.            */
/*  Tudo server component: sem estado, só daisyUI + tokens do tema.   */
/* ------------------------------------------------------------------ */

export const PERSONA_LABEL: Record<PersonaType, string> = {
  competidor: "Competidor",
  mentor_tecnico: "Mentor / Técnico",
  entusiasta: "Entusiasta",
  organizador: "Organizador",
};

export const MODE_META: Record<
  string,
  { label: string; badge: string; color: string }
> = {
  runs: {
    label: "Runs",
    badge: "badge-primary",
    color: "var(--color-primary)",
  },
  calibrabot: {
    label: "CalibraBot",
    badge: "badge-info",
    color: "var(--color-info)",
  },
  individual: {
    label: "Individual",
    badge: "badge-secondary",
    color: "var(--color-secondary)",
  },
  custom: {
    label: "Personalizado",
    badge: "badge-accent",
    color: "var(--color-accent)",
  },
};

export function formatDate(value: string | Date | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  });
}

export function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date()),
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function firstName(name: string | null | undefined) {
  return name?.split(" ")[0] || "por aqui";
}

/* ---------- Avatar ---------- */

export function Avatar({
  name,
  src,
  size = "w-10",
  ring = false,
}: {
  name: string | null;
  src?: string | null;
  size?: string;
  ring?: boolean;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`avatar ${src ? "" : "avatar-placeholder"}`}>
      <div
        className={`${size} rounded-full ${
          ring ? "ring-4 ring-base-100 ring-offset-0" : ""
        } ${src ? "" : "bg-accent text-accent-content"}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name ?? "Avatar"} />
        ) : (
          <span className="text-sm font-bold">{initials}</span>
        )}
      </div>
    </div>
  );
}

/* ---------- Cabeçalho de seção ---------- */

export function SectionHeader({
  title,
  href,
  action = "Ver tudo",
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {href && (
        <Link
          href={href}
          className="link link-hover inline-flex items-center gap-1 text-xs font-medium text-base-content/50 hover:text-primary"
        >
          {action}
          <ArrowUpRight size={12} />
        </Link>
      )}
    </div>
  );
}

/* ---------- Estado vazio ---------- */

export function EmptyState({
  icon,
  title,
  text,
  href,
  cta,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-[260px] text-xs leading-5 text-base-content/50">
        {text}
      </p>
      {href && cta && (
        <Link href={href} className="btn btn-primary btn-sm mt-4 rounded-lg">
          {cta}
        </Link>
      )}
    </div>
  );
}

/* ---------- Card do perfil (coluna direita) ---------- */

export function ProfileCard({
  data,
  stats,
}: {
  data: DashboardData;
  stats: { icon: ReactNode; value: number | string; label: string }[];
}) {
  const { currentUser, persona, activeTeamName } = data;

  return (
    <div className="card overflow-hidden border border-base-300 bg-base-100">
      {/* Faixa institucional RoboStage */}
      <div className="group relative isolate h-20 overflow-hidden bg-linear-to-r from-primary to-error sm:h-24">
        {/* Luz suave para integrar as três cores */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_15%,rgba(255,255,255,0.12)_50%,transparent_85%)]"
        />

        {/* Textura técnica discreta */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        {/* Traços geométricos inspirados em circuitos */}
        <svg
          aria-hidden="true"
          viewBox="0 0 480 96"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 size-full text-white"
          fill="none"
        >
          <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.3">
            <path d="M250 96V68H278V40H318" />
            <path d="M310 96V82H350V54H390V26H430" />
            <path d="M370 96V76H400V66H450" />
            <path d="M480 18H450V38H426" />
            <path d="M280 0V16H302V28" />
          </g>
          <g fill="currentColor" fillOpacity="0.45">
            <circle cx="318" cy="40" r="2" />
            <circle cx="390" cy="54" r="2" />
            <circle cx="450" cy="66" r="2" />
            <circle cx="426" cy="38" r="2" />
            <circle cx="302" cy="28" r="2" />
          </g>
        </svg>

        {/* Assinatura geométrica */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 size-48 rotate-45 border border-white/20 sm:-right-4 sm:-top-24 sm:size-64"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-5 -top-12 size-36 rotate-45 border border-white/15 sm:right-12 sm:-top-16 sm:size-44"
        />

        {/* Acabamento inferior */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30"
        />
      </div>

      <div className="-mt-10 flex flex-col items-center px-5 pb-5">
        <Avatar
          name={currentUser.name}
          src={currentUser.avatarUrl}
          size="w-20"
          ring
        />
        <p className="mt-3 text-base font-bold">{currentUser.name ?? "Você"}</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
          <span className="badge badge-primary badge-sm badge-soft">
            {PERSONA_LABEL[persona]}
          </span>
          {activeTeamName && (
            <span className="badge badge-ghost badge-sm">{activeTeamName}</span>
          )}
        </div>

        <div
          className="mt-5 grid w-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${stats.length}, minmax(0,1fr))`,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-base-300 bg-base-200/50 py-3"
              title={s.label}
            >
              <span className="text-base-content/50">{s.icon}</span>
              <span className="text-sm font-bold">{s.value}</span>
              <span className="text-[10px] text-base-content/45">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Faixa da semana (mini calendário) ---------- */

export function WeekStrip({
  events,
  large = false,
}: {
  events: DashboardData["upcomingEvents"];
  large?: boolean;
}) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // segunda

  const eventDays = new Set(
    events.map((e) => new Date(e.startAt).toDateString()),
  );

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const monthLabel = today.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card border border-base-300 bg-base-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/dashboard/calendar"
          className="btn btn-circle btn-ghost btn-xs border border-base-300"
          aria-label="Abrir calendário"
        >
          <ChevronLeft size={14} />
        </Link>
        <p className={`${large ? "text-lg" : "text-sm"} font-bold capitalize`}>
          {monthLabel}
        </p>
        <Link
          href="/dashboard/calendar"
          className="btn btn-circle btn-ghost btn-xs border border-base-300"
          aria-label="Abrir calendário"
        >
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const isToday = d.toDateString() === today.toDateString();
          const hasEvent = eventDays.has(d.toDateString());
          return (
            <div
              key={d.toISOString()}
              className={`flex flex-col items-center gap-1 rounded-full py-2 transition-colors ${
                isToday
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200"
              }`}
            >
              <span
                className={`text-[10px] uppercase ${
                  isToday ? "opacity-80" : "text-base-content/40"
                }`}
              >
                {d
                  .toLocaleDateString("pt-BR", { weekday: "short" })
                  .slice(0, 3)}
              </span>
              <span className={`${large ? "text-lg" : "text-xs"} font-bold`}>
                {d.getDate()}
              </span>
              <span
                className={`h-1 w-1 rounded-full ${
                  hasEvent
                    ? isToday
                      ? "bg-primary-content"
                      : "bg-primary"
                    : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Gráfico de atividade (linha suave, SVG puro) ---------- */

export function ActivityChart({
  points,
  title = "Sua atividade",
}: {
  points: DashboardData["dailyExecutions"];
  title?: string;
}) {
  const W = 300;
  const H = 110;
  const pad = 8;
  const max = Math.max(1, ...points.map((p) => p.count));
  const step = (W - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => [
    pad + i * step,
    H - pad - (p.count / max) * (H - pad * 2),
  ]);

  // Curva suave (catmull-rom → bezier)
  const path = coords.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M${x},${y}`;
    const [x0, y0] = arr[i - 1];
    const cx = (x0 + x) / 2;
    return `${acc} C${cx},${y0} ${cx},${y} ${x},${y}`;
  }, "");
  const area = `${path} L${coords.at(-1)![0]},${H} L${coords[0][0]},${H} Z`;

  const peakIdx = points.reduce(
    (best, p, i) => (p.count > points[best].count ? i : best),
    0,
  );
  const total = points.reduce((s, p) => s + p.count, 0);

  return (
    <div className="card border border-base-300 bg-base-100 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-[11px] text-base-content/45">
            Execuções nos últimos 7 dias
          </p>
        </div>
        <span className="badge badge-neutral badge-sm">{total} no total</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-28 w-full overflow-visible"
        role="img"
        aria-label={`Atividade: ${total} execuções na semana`}
      >
        <defs>
          <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.18"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#activityFill)" />
        <path
          d={path}
          fill="none"
          stroke="var(--color-base-content)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {points[peakIdx].count > 0 && (
          <>
            <line
              x1={coords[peakIdx][0]}
              x2={coords[peakIdx][0]}
              y1={coords[peakIdx][1]}
              y2={H}
              stroke="var(--color-base-content)"
              strokeOpacity="0.15"
              strokeDasharray="3 3"
            />
            <circle
              cx={coords[peakIdx][0]}
              cy={coords[peakIdx][1]}
              r="4.5"
              fill="var(--color-primary)"
              stroke="var(--color-base-100)"
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      <div className="mt-1 flex justify-between px-1 text-[10px] text-base-content/40">
        {points.map((p) => (
          <span key={p.date}>
            {new Date(p.date)
              .toLocaleDateString("pt-BR", { weekday: "short" })
              .slice(0, 3)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Donut (distribuição genérica) ---------- */

export type DonutItem = {
  key: string;
  label: string;
  count: number;
  color: string;
};

export function modeDonutItems(
  rows: DashboardData["testsByMode"],
): DonutItem[] {
  return rows.map((r) => ({
    key: r.mode,
    label: MODE_META[r.mode]?.label ?? r.mode,
    count: r.count,
    color: MODE_META[r.mode]?.color ?? "var(--color-neutral)",
  }));
}

export function Donut({
  items,
  centerLabel,
}: {
  items: DonutItem[];
  centerLabel: string;
}) {
  const total = items.reduce((s, r) => s + r.count, 0);
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--color-base-200)"
            strokeWidth="11"
          />
          {total > 0 &&
            items.map((r) => {
              const len = (r.count / total) * C;
              const seg = (
                <circle
                  key={r.key}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={r.color}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(len - 3, 0.1)} ${C}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return seg;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-base-content/45">
            {centerLabel}
          </span>
          <span className="text-3xl font-black tracking-tight">{total}</span>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5">
          {items.map((r) => (
            <li key={r.key} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: r.color }}
              />
              <span className="truncate capitalize text-base-content/60">
                {r.label}
              </span>
              <span className="ml-auto font-semibold">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
