"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Expand,
  Flower2,
  Hexagon,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  Sprout,
  X,
  type LucideIcon,
} from "lucide-react";

import { RANKING_POINTS } from "@/utils/competitions/ftc/biobuzz";

/* ------------------------------------------------------------ regras */

// Competition Manual, tabela 10-2
const PTS = { leave: 3, autoPark: 5, autoTip: 20, tip: 20, park: 5, cell: 2, flower: 2, nectar: 5, garden: 1 };

type Role = "tip" | "flower" | "garden" | "defense" | "park";

const ROLES: Record<Role, { label: string; Icon: LucideIcon; on: string }> = {
  tip: { label: "TIP", Icon: Hexagon, on: "bg-primary text-primary-content border-primary" },
  flower: { label: "FLOWER", Icon: Flower2, on: "bg-accent text-accent-content border-accent" },
  garden: { label: "GARDEN", Icon: Sprout, on: "bg-success text-success-content border-success" },
  defense: { label: "Defesa", Icon: Shield, on: "bg-error text-error-content border-error" },
  park: { label: "PARK", Icon: MapPin, on: "bg-neutral text-neutral-content border-neutral" },
};
const ROLE_KEYS = Object.keys(ROLES) as Role[];

const PHASES = [
  { key: "cycles", time: "2:00 → 1:00", label: "Ciclos" },
  { key: "flowers", time: "1:00 → 0:20", label: "FLOWERS" },
  { key: "final", time: "0:20 → 0:00", label: "Fechamento" },
] as const;
type PhaseKey = (typeof PHASES)[number]["key"];

type Robot = {
  team: string;
  leave: boolean;
  autoPark: boolean;
  autoTips: number;
  tips: number;
  roles: Record<PhaseKey, Role>;
};

type Extras = { cell: number; flower: number; nectar: number; garden: number };

const newRobot = (): Robot => ({
  team: "",
  leave: true,
  autoPark: true,
  autoTips: 0,
  tips: 0,
  roles: { cycles: "tip", flowers: "flower", final: "park" },
});

const PRESETS: { label: string; roles: [Robot["roles"], Robot["roles"]] }[] = [
  {
    label: "Equilibrado",
    roles: [
      { cycles: "tip", flowers: "flower", final: "park" },
      { cycles: "tip", flowers: "garden", final: "park" },
    ],
  },
  {
    label: "Tudo em TIP",
    roles: [
      { cycles: "tip", flowers: "tip", final: "park" },
      { cycles: "tip", flowers: "tip", final: "park" },
    ],
  },
  {
    label: "Parceiro defende",
    roles: [
      { cycles: "tip", flowers: "flower", final: "park" },
      { cycles: "defense", flowers: "defense", final: "park" },
    ],
  },
];

/* ------------------------------------------------------------ partes */

function Stepper({ label, value, onChange, max = 20 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-1">
        <button type="button" className="btn btn-square btn-sm sm:btn-md" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Menos ${label}`}>
          <Minus size={16} />
        </button>
        <span className="w-9 text-center font-mono text-lg font-bold tabular-nums">{value}</span>
        <button type="button" className="btn btn-square btn-sm sm:btn-md" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Mais ${label}`}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function Chip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-tl-lg rounded-br-lg border text-sm font-bold transition-colors ${
        checked ? "border-primary bg-primary text-primary-content" : "border-base-300 text-base-content/50"
      }`}
    >
      {checked ? <Check size={15} /> : <X size={15} />}
      {label}
    </button>
  );
}

function RolePicker({ value, onChange, name }: { value: Role; onChange: (r: Role) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-5 gap-1">
      {ROLE_KEYS.map((r) => {
        const { label, Icon, on } = ROLES[r];
        const active = value === r;
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r)}
            className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-tl-lg rounded-br-lg border text-[10px] font-bold uppercase transition-colors ${
              active ? on : "border-base-300 text-base-content/45 hover:border-base-content/30"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ principal */

function useStrategyBuilder() {
  const [alliance, setAlliance] = useState<"red" | "blue">("red");
  const [match, setMatch] = useState("");
  const [robots, setRobots] = useState<[Robot, Robot]>(() => [newRobot(), newRobot()]);
  const [extras, setExtras] = useState<Extras>({ cell: 0, flower: 0, nectar: 0, garden: 0 });
  const [queue, setQueue] = useState(false);

  const setRobot = (i: 0 | 1, patch: Partial<Robot>) =>
    setRobots((rs) => {
      const next = [...rs] as [Robot, Robot];
      next[i] = { ...next[i], ...patch };
      return next;
    });

  const reset = () => {
    setRobots([newRobot(), newRobot()]);
    setExtras({ cell: 0, flower: 0, nectar: 0, garden: 0 });
    setMatch("");
  };

  const score = useMemo(() => {
    let auto = 0;
    let teleop = 0;
    let tips = 0;
    let swarm = 0;
    for (const r of robots) {
      const endPark = r.roles.final === "park";
      auto += (r.leave ? PTS.leave : 0) + (r.autoPark ? PTS.autoPark : 0) + r.autoTips * PTS.autoTip;
      teleop += r.tips * PTS.tip + (endPark ? PTS.park : 0);
      tips += r.autoTips + r.tips;
      swarm += (r.leave ? PTS.leave : 0) + (r.autoPark ? PTS.autoPark : 0) + (endPark ? PTS.park : 0);
    }
    teleop += extras.cell * PTS.cell + extras.flower * PTS.flower + extras.nectar * PTS.nectar + extras.garden * PTS.garden;
    return {
      auto,
      teleop,
      total: auto + teleop,
      tips,
      rp: [
        { label: "SWARM", ok: swarm >= RANKING_POINTS.swarmThreshold, detail: `${swarm}/${RANKING_POINTS.swarmThreshold} pts de LEAVE+PARK` },
        { label: "POLL 1", ok: tips >= RANKING_POINTS.pollinator1Tips, detail: `${tips}/${RANKING_POINTS.pollinator1Tips} TIPs` },
        { label: "POLL 2", ok: tips >= RANKING_POINTS.pollinator2Tips, detail: `${tips}/${RANKING_POINTS.pollinator2Tips} TIPs` },
      ],
    };
  }, [robots, extras]);

  const hints = useMemo(() => {
    const out: string[] = [];
    if (robots.every((r) => r.roles.final !== "park")) out.push("Ninguém estaciona no fim.");
    for (const p of PHASES) {
      if (robots.every((r) => r.roles[p.key] === "defense")) out.push(`Os dois defendem em ${p.label}: ninguém pontua.`);
    }
    const missing = RANKING_POINTS.pollinator1Tips - score.tips;
    if (missing > 0) out.push(`Faltam ${missing} TIP${missing > 1 ? "s" : ""} para o POLLINATOR.`);
    return out;
  }, [robots, score.tips]);

  const red = alliance === "red";
  const tint = red ? "border-error" : "border-info";

  return {
    alliance,
    setAlliance,
    match,
    setMatch,
    robots,
    setRobots,
    extras,
    setExtras,
    queue,
    setQueue,
    setRobot,
    reset,
    score,
    hints,
    red,
    tint,
  };
}

export default function StrategyBuilder() {
  const {
    alliance,
    setAlliance,
    match,
    setMatch,
    robots,
    setRobots,
    extras,
    setExtras,
    queue,
    setQueue,
    setRobot,
    reset,
    score,
    hints,
    red,
    tint,
  } = useStrategyBuilder();

  return (
    <div className="space-y-4">
      {/* ---------------------------------------------- placar */}
      <div className={`sticky top-2 z-30 rounded-tl-2xl rounded-br-2xl border-t-4 ${tint} border-x border-b border-x-base-300 border-b-base-300 bg-base-100/95 px-4 py-3 shadow-lg backdrop-blur`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="font-mono text-4xl font-bold tabular-nums leading-none">
            {score.total}
            <span className="ml-1 text-sm text-base-content/45">pts</span>
          </p>
          <p className="font-mono text-xs text-base-content/55">
            AUTO <b className="text-base-content">{score.auto}</b> · TELEOP <b className="text-base-content">{score.teleop}</b> · TIPs{" "}
            <b className="text-base-content">{score.tips}</b>
          </p>
          <div className="flex gap-1.5">
            {score.rp.map((rp) => (
              <span key={rp.label} title={rp.detail} className={`badge gap-1 font-mono text-[11px] ${rp.ok ? "badge-success" : "badge-ghost text-base-content/45"}`}>
                {rp.ok && <Check size={11} />}
                {rp.label}
              </span>
            ))}
          </div>
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={reset} className="btn btn-ghost btn-sm btn-square" aria-label="Zerar plano" title="Zerar">
              <RotateCcw size={16} />
            </button>
            <button type="button" onClick={() => setQueue(true)} className="btn btn-primary btn-sm gap-1">
              <Expand size={15} /> Fila
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------- partida */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="join">
          {(["red", "blue"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAlliance(c)}
              className={`btn join-item btn-sm sm:btn-md ${alliance === c ? (c === "red" ? "btn-error" : "btn-info") : ""}`}
            >
              {c === "red" ? "Vermelha" : "Azul"}
            </button>
          ))}
        </div>
        <input
          value={match}
          onChange={(e) => setMatch(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="Partida (Q12)"
          className="input input-bordered input-sm w-32 font-mono sm:input-md"
        />
        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setRobots((rs) => [{ ...rs[0], roles: p.roles[0] }, { ...rs[1], roles: p.roles[1] }])}
              className="btn btn-outline btn-sm rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------- robôs */}
      <div className="grid gap-4 md:grid-cols-2">
        {([0, 1] as const).map((i) => {
          const r = robots[i];
          const who = i === 0 ? "Nós" : "Parceiro";
          return (
            <article key={i} className="space-y-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-base-content/45">{who}</span>
                <input
                  value={r.team}
                  onChange={(e) => setRobot(i, { team: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  inputMode="numeric"
                  placeholder="nº da equipe"
                  className="input input-bordered input-sm min-w-0 flex-1 font-mono font-bold"
                />
              </div>

              <section className="space-y-2">
                <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-secondary">AUTO · 0:30</p>
                <div className="flex gap-2">
                  <Chip label="LEAVE" checked={r.leave} onChange={(v) => setRobot(i, { leave: v })} />
                  <Chip label="PARK" checked={r.autoPark} onChange={(v) => setRobot(i, { autoPark: v })} />
                </div>
                <Stepper label="TIPs no AUTO" value={r.autoTips} onChange={(v) => setRobot(i, { autoTips: v })} max={5} />
              </section>

              <section className="space-y-3">
                <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-primary">TELEOP · 2:00</p>
                {PHASES.map((p) => (
                  <div key={p.key}>
                    <p className="mb-1 flex justify-between text-xs">
                      <span className="font-bold">{p.label}</span>
                      <span className="font-mono text-base-content/50">{p.time}</span>
                    </p>
                    <RolePicker
                      name={`${who} — ${p.label}`}
                      value={r.roles[p.key]}
                      onChange={(role) => setRobot(i, { roles: { ...r.roles, [p.key]: role } })}
                    />
                  </div>
                ))}
                <Stepper label="TIPs no TELEOP" value={r.tips} onChange={(v) => setRobot(i, { tips: v })} max={15} />
              </section>
            </article>
          );
        })}
      </div>

      {/* ---------------------------------------------- extras + avisos */}
      <details className="group rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-4">
        <summary className="cursor-pointer list-none font-mono text-[11px] font-bold tracking-[0.18em] text-base-content/55">
          <span className="group-open:hidden">+ </span>
          <span className="hidden group-open:inline">− </span>
          MAIS PONTOS DA ALIANÇA (opcional)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Stepper label="Na CELL de cima · 2" value={extras.cell} onChange={(v) => setExtras((e) => ({ ...e, cell: v }))} />
          <Stepper label="Em FLOWERS nossas · 2" value={extras.flower} onChange={(v) => setExtras((e) => ({ ...e, flower: v }))} />
          <Stepper label="NECTAR mais baixo · 5" value={extras.nectar} onChange={(v) => setExtras((e) => ({ ...e, nectar: v }))} max={4} />
          <Stepper label="No GARDEN · 1" value={extras.garden} onChange={(v) => setExtras((e) => ({ ...e, garden: v }))} max={30} />
        </div>
      </details>

      {hints.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {hints.map((h) => (
            <li key={h} className="badge badge-warning badge-outline h-auto py-1 text-xs">
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* ---------------------------------------------- modo fila */}
      {queue && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#141109] p-5 text-white sm:p-10" role="dialog" aria-modal="true" aria-label="Modo fila">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between">
              <p className={`font-mono text-sm font-bold tracking-[0.2em] ${red ? "text-error" : "text-info"}`}>
                {match ? `PARTIDA ${match}` : "PARTIDA"} · {red ? "VERMELHA" : "AZUL"}
              </p>
              <button type="button" onClick={() => setQueue(false)} className="btn btn-circle btn-ghost" aria-label="Fechar modo fila">
                <X size={24} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {robots.map((r, i) => (
                <div key={i} className="rounded-tl-3xl rounded-br-3xl bg-white/5 p-6">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-60">{i === 0 ? "Nós" : "Parceiro"}</p>
                  <p className="font-mono text-4xl font-bold">{r.team || `Robô ${i + 1}`}</p>
                  <ol className="mt-5 space-y-3">
                    <li className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
                      <span className="font-mono text-sm opacity-60">AUTO</span>
                      <span className="text-right text-xl font-bold">
                        {[r.leave && "LEAVE", r.autoTips > 0 && `${r.autoTips} TIP`, r.autoPark && "PARK"].filter(Boolean).join(" + ") || "—"}
                      </span>
                    </li>
                    {PHASES.map((p) => {
                      const { label, Icon } = ROLES[r.roles[p.key]];
                      return (
                        <li key={p.key} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                          <span className="font-mono text-sm opacity-60">{p.time}</span>
                          <span className="flex items-center gap-2 text-2xl font-bold">
                            <Icon size={22} /> {label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  {r.tips > 0 && <p className="mt-3 font-mono text-lg opacity-80">Meta: {r.tips} TIPs no TELEOP</p>}
                </div>
              ))}
            </div>

            <p className="mt-6 font-mono">
              <span className="text-5xl font-bold">{score.total} pts</span>
              <span className="ml-4 text-xl opacity-70">{score.tips} TIPs</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}