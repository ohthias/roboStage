"use client";

import { Check, Wrench, X } from "lucide-react";
import { cn } from "../lib";
import { PillChoice, Stepper } from "../core/Form";
import { Starburst } from "../decor/Stickers";

/* ------------------------------------------------------------------ */
/*  MissionScorer — card de missão do pontuador FLL.                   */
/*  Lê o mesmo formato de public/data/missions.json:                   */
/*   type ["switch", null, null]     → Sim / Não                       */
/*   type ["switch", "Azul", ...]    → escolha (points[i])             */
/*   type ["range", min, max]        → contador (n × pts ou points[n]) */
/* ------------------------------------------------------------------ */

export type MissionTask = {
  points: number | number[];
  type: [string, ...(string | number | null)[]];
};

export type Mission = MissionTask & {
  id: string;
  name: string;
  mission: string;
  equipaments?: boolean;
  image?: string;
  "sub-mission"?: (MissionTask & { submission: string; id?: string })[];
};

/** Valor de uma tarefa: null = não marcada; boolean (sim/não) vira 1/0. */
export type TaskValue = number | null;

export function scoreTask(task: MissionTask, value: TaskValue): number {
  if (value == null) return 0;
  const [kind, ...opts] = task.type;
  const p = task.points;
  if (kind === "switch") {
    const hasOptions = opts.some((o) => typeof o === "string");
    if (!hasOptions) return value === 1 ? (Array.isArray(p) ? p[0] : p) : 0;
    return Array.isArray(p) ? (p[value] ?? 0) : p;
  }
  // range
  return Array.isArray(p) ? (p[value] ?? 0) : value * p;
}

function TaskControl({
  task,
  value,
  onChange,
}: {
  task: MissionTask;
  value: TaskValue;
  onChange: (v: TaskValue) => void;
}) {
  const [kind, ...opts] = task.type;
  if (kind === "range") {
    const min = Number(opts[0] ?? 0);
    const max = Number(opts[1] ?? 10);
    return <Stepper value={value ?? min} min={min} max={max} onChange={onChange} />;
  }
  const options = opts.filter((o): o is string => typeof o === "string");
  if (options.length) {
    return (
      <PillChoice
        size="sm"
        options={options.map((label, i) => ({ value: i, label }))}
        value={value}
        onChange={(v) => onChange(v === value ? null : v)}
      />
    );
  }
  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-pressed={value === 1}
        onClick={() => onChange(value === 1 ? null : 1)}
        className={cn(
          "flex items-center gap-1 rounded-tl-lg rounded-br-lg border px-3.5 py-1 text-sm font-semibold transition-all",
          value === 1 ? "stage-shadow-sm -translate-y-px border-transparent bg-success text-success-content" : "border-base-300 bg-base-100 hover:border-success/50 hover:text-success",
        )}
      >
        <Check size={14} strokeWidth={2.5} /> Sim
      </button>
      <button
        type="button"
        aria-pressed={value === 0}
        onClick={() => onChange(value === 0 ? null : 0)}
        className={cn(
          "flex items-center gap-1 rounded-tl-lg rounded-br-lg border px-3.5 py-1 text-sm font-semibold transition-all",
          value === 0 ? "stage-shadow-sm -translate-y-px border-transparent bg-base-content text-base-100" : "border-base-300 bg-base-100 hover:border-base-content/40",
        )}
      >
        <X size={14} strokeWidth={2.5} /> Não
      </button>
    </div>
  );
}

export function MissionScorer({
  mission,
  values,
  onChange,
  className,
}: {
  mission: Mission;
  /** [principal, ...sub-missões] */
  values: TaskValue[];
  onChange: (index: number, v: TaskValue) => void;
  className?: string;
}) {
  const subs = mission["sub-mission"] ?? [];
  const total = scoreTask(mission, values[0] ?? null) + subs.reduce((acc, s, i) => acc + scoreTask(s, values[i + 1] ?? null), 0);
  const scored = total > 0;

  return (
    <article
      className={cn(
        "stage-paper rounded-2xl border bg-base-100 p-5 transition-all duration-300",
        scored ? "border-primary/40 shadow-[4px_4px_0_0_var(--color-primary)]" : "border-base-300 hover:border-primary/30",
        className,
      )}
    >
      {/* pontos */}
      <div className="absolute -right-4 -top-5 transition-transform" style={{ rotate: scored ? "8deg" : "0deg" }}>
        <Starburst size={60} tone={scored ? "accent" : "paper"} shadow={false}>
          <span className="text-xl leading-none">
            {total}
            <span className="block text-[0.55rem] tracking-widest">PTS</span>
          </span>
        </Starburst>
      </div>

      <header className="flex items-start gap-3 pr-12">
        <span className="grid h-10 min-w-12 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-secondary px-2 font-mono text-sm font-bold tracking-wider text-secondary-content">
          {mission.id}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-black uppercase leading-tight tracking-tight">{mission.name}</h3>
          {mission.equipaments && (
            <span className="mt-1.5 inline-flex items-center gap-1 stage-label text-base-content/60">
              <Wrench size={11} strokeWidth={3} /> Usa equipamento
            </span>
          )}
        </div>
      </header>

      <div className="mt-4 space-y-3">
        <div className="space-y-2">
          <p className="text-sm leading-snug text-base-content/80">{mission.mission}</p>
          <TaskControl task={mission} value={values[0] ?? null} onChange={(v) => onChange(0, v)} />
        </div>
        {subs.map((s, i) => (
          <div key={s.submission} className="space-y-2 border-t border-dashed border-base-300 pt-3">
            <p className="text-sm leading-snug text-base-content/80">{s.submission}</p>
            <TaskControl task={s} value={values[i + 1] ?? null} onChange={(v) => onChange(i + 1, v)} />
          </div>
        ))}
      </div>
    </article>
  );
}

/** Barra de total fixa no rodapé do pontuador. */
export function ScoreBar({
  total,
  max,
  onReset,
  onSave,
  className,
}: {
  total: number;
  max?: number;
  onReset?: () => void;
  onSave?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("stage-texture stage-shadow flex items-center gap-4 stage-night rounded-tl-2xl rounded-br-2xl py-2.5 pl-6 pr-2.5", className)}>
      <span className="stage-kicker opacity-70">Total</span>
      <span className="stage-display text-4xl leading-none text-accent">{total}</span>
      {max != null && <span className="stage-display text-lg opacity-50">/ {max}</span>}
      <div className="ml-auto flex gap-2">
        {onReset && (
          <button type="button" onClick={onReset} className="btn btn-ghost btn-sm text-inherit hover:bg-white/10">
            Zerar
          </button>
        )}
        {onSave && (
          <button type="button" onClick={onSave} className="btn btn-sm btn-primary rounded-[0.75rem_0_0.75rem_0]!">
            Salvar round
          </button>
        )}
      </div>
    </div>
  );
}
