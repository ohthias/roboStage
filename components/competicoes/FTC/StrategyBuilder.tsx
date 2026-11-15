"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  Expand,
  Info,
  Minus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { RANKING_POINTS } from "@/utils/competitions/ftc/biobuzz";
import {
  PHASES,
  PRESETS,
  ROLES,
  applyPreset,
  briefing,
  newPlan,
  planWarnings,
  robotFromStats,
  scorePlan,
  type PresetKey,
  type RobotPlan,
  type Role,
  type StrategyPlan,
} from "@/utils/competitions/ftc/strategy";
import { allTeamStats, emptyScouting, parseScouting, type ScoutingData } from "@/utils/competitions/ftc/scouting";
import { STORAGE_KEYS, usePersistentState } from "@/utils/competitions/ftc/storage";

type Store = { current: StrategyPlan; saved: StrategyPlan[] };

const ROLE_STYLE: Record<Role, string> = {
  hive: "bg-primary text-primary-content border-primary",
  feed: "bg-secondary/15 text-secondary border-secondary/40",
  flower: "bg-accent text-accent-content border-accent",
  garden: "bg-success/15 text-success border-success/40",
  defense: "bg-error/15 text-error border-error/40",
  park: "bg-base-content text-base-100 border-base-content",
  idle: "bg-base-200 text-base-content/50 border-base-300",
};

function parseStore(raw: unknown): Store | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<Store>;
  if (!s.current || !Array.isArray(s.current.robots)) return null;
  return { current: s.current, saved: Array.isArray(s.saved) ? s.saved : [] };
}

/* ------------------------------------------------------------- partes */

function Stepper({
  label,
  value,
  onChange,
  max = 20,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0 text-sm">
        {label}
        {hint && <span className="block text-[11px] text-base-content/45">{hint}</span>}
      </span>
      <div className="join shrink-0">
        <button type="button" className="btn join-item btn-sm btn-square" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Menos ${label}`}>
          <Minus size={14} />
        </button>
        <span className="join-item grid w-10 place-items-center border-y border-base-300 bg-base-100 font-mono text-sm font-bold tabular-nums">{value}</span>
        <button type="button" className="btn join-item btn-sm btn-square" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Mais ${label}`}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-1.5 rounded-tl-lg rounded-br-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
        checked ? "border-primary bg-primary text-primary-content" : "border-base-300 bg-base-100 text-base-content/60 hover:border-primary/40"
      }`}
    >
      {checked ? <Check size={13} /> : <X size={13} />}
      {label}
    </button>
  );
}

/* ---------------------------------------------------------- principal */

export default function StrategyBuilder() {
  const [store, setStore, loaded] = usePersistentState<Store>(STORAGE_KEYS.strategy, () => ({ current: newPlan(), saved: [] }), parseStore);
  const [scouting] = usePersistentState<ScoutingData>(STORAGE_KEYS.scouting, emptyScouting, parseScouting);
  const [copied, setCopied] = useState(false);
  const [queueMode, setQueueMode] = useState(false);

  const plan = store.current;
  const score = useMemo(() => scorePlan(plan), [plan]);
  const warnings = useMemo(() => planWarnings(plan), [plan]);
  const text = useMemo(() => briefing(plan), [plan]);
  const scoutStats = useMemo(() => allTeamStats(scouting).filter((t) => t.matches > 0), [scouting]);
  const ourTeam = scouting.event.teamNumber;

  const update = (patch: Partial<StrategyPlan>) =>
    setStore((s) => ({ ...s, current: { ...s.current, ...patch, updatedAt: Date.now() } }));

  const updateRobot = (i: 0 | 1, patch: Partial<RobotPlan>) =>
    setStore((s) => {
      const robots = [...s.current.robots] as [RobotPlan, RobotPlan];
      robots[i] = { ...robots[i], ...patch };
      return { ...s, current: { ...s.current, robots, updatedAt: Date.now() } };
    });

  const setRole = (i: 0 | 1, phase: keyof RobotPlan["roles"], role: Role) =>
    updateRobot(i, { roles: { ...plan.robots[i].roles, [phase]: role } });

  const savePlan = () => {
    const partner = plan.robots[1].team;
    const name = plan.name.trim() || [plan.match && `Partida ${plan.match}`, partner && `com ${partner}`].filter(Boolean).join(" ") || "Plano sem nome";
    const saved = { ...plan, name, updatedAt: Date.now() };
    setStore((s) => ({
      current: saved,
      saved: [saved, ...s.saved.filter((p) => p.id !== saved.id)].slice(0, 30),
    }));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const margin = plan.opponent ? score.total - plan.opponent : null;

  return (
    <div className="space-y-8">
      {/* ================================================ placar fixo */}
      <div className="sticky top-16 z-30 -mx-2 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100/95 px-4 py-3 shadow-lg backdrop-blur sm:mx-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-base-content/45">Estimativa</p>
            <p className="font-mono text-3xl font-bold tabular-nums">{score.total}<span className="ml-1 text-sm text-base-content/45">pts</span></p>
          </div>
          <div className="flex gap-4 font-mono text-sm">
            <span><span className="text-base-content/45">AUTO</span> <b>{score.auto}</b></span>
            <span><span className="text-base-content/45">TELEOP</span> <b>{score.teleop}</b></span>
            <span><span className="text-base-content/45">TIPs</span> <b>{score.tips}</b></span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              ["SWARM", score.rp.swarm, `${score.swarm}/${RANKING_POINTS.swarmThreshold}`],
              ["POLL 1", score.rp.pollinator1, `${score.tips}/${RANKING_POINTS.pollinator1Tips}`],
              ["POLL 2", score.rp.pollinator2, `${score.tips}/${RANKING_POINTS.pollinator2Tips}`],
            ].map(([label, ok, detail]) => (
              <span
                key={String(label)}
                className={`badge gap-1 font-mono text-[11px] ${ok ? "badge-success" : "badge-ghost text-base-content/50"}`}
                title={String(detail)}
              >
                {ok ? <Check size={11} /> : null}
                {label}
              </span>
            ))}
          </div>
          {margin != null && (
            <span className={`font-mono text-sm font-bold ${margin >= 0 ? "text-success" : "text-error"}`}>
              {margin >= 0 ? "+" : ""}
              {margin} vs adversário
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => setQueueMode(true)} className="btn btn-sm btn-ghost gap-1">
              <Expand size={15} /> Modo fila
            </button>
            <button type="button" onClick={savePlan} className="btn btn-sm btn-primary gap-1 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none">
              <Save size={15} /> Salvar
            </button>
          </div>
        </div>
      </div>

      {/* ================================================ partida + presets */}
      <section className="grid gap-5 lg:grid-cols-[1fr_1.3fr] [&>*]:min-w-0">
        <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
          <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-base-content/45">PARTIDA</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="label-text text-xs">Número</span>
              <input value={plan.match} onChange={(e) => update({ match: e.target.value })} placeholder="Q12" className="input input-bordered input-sm" />
            </label>
            <div>
              <span className="label-text text-xs">Aliança</span>
              <div className="join mt-1 w-full">
                {(["red", "blue"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update({ alliance: c })}
                    className={`btn join-item btn-sm flex-1 ${plan.alliance === c ? (c === "red" ? "btn-error" : "btn-info") : ""}`}
                  >
                    {c === "red" ? "Vermelha" : "Azul"}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1 col-span-2">
              <span className="label-text text-xs">Pontos esperados do adversário (opcional)</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={plan.opponent ?? ""}
                onChange={(e) => update({ opponent: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })}
                placeholder="ex.: 140"
                className="input input-bordered input-sm"
              />
            </label>
          </div>
        </div>

        <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] text-base-content/45">
            <Sparkles size={13} /> PLANO RÁPIDO
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setStore((s) => ({ ...s, current: { ...applyPreset(s.current, k), updatedAt: Date.now() } }))}
                className="group rounded-tl-xl rounded-br-xl border border-base-300 p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="block text-sm font-bold group-hover:text-primary">{PRESETS[k].label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-base-content/55">{PRESETS[k].description}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================ quadro de fases */}
      <section className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-primary">QUADRO DO TELEOP</p>
            <p className="mt-1 text-sm text-base-content/60">Escolha a função de cada robô em cada fase.</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="grid min-w-[560px] grid-cols-[120px_repeat(3,1fr)] gap-2">
            <div />
            {PHASES.map((p) => (
              <div key={p.key} className={`rounded-tl-lg rounded-br-lg px-3 py-2 ${p.key === "flowers" ? "bg-accent/25" : p.key === "final" ? "bg-error/10" : "bg-base-200"}`}>
                <p className="text-sm font-bold">{p.label}</p>
                <p className="font-mono text-[11px] text-base-content/55">{p.time}</p>
              </div>
            ))}
            {([0, 1] as const).map((i) => {
              const r = plan.robots[i];
              return (
                <div key={i} className="contents">
                  <div className="flex flex-col justify-center rounded-tl-lg rounded-br-lg bg-base-200/60 px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/45">{i === 0 ? "Nós" : "Parceiro"}</span>
                    <span className="truncate font-mono text-sm font-bold">{r.team || `Robô ${i + 1}`}</span>
                  </div>
                  {PHASES.map((p) => (
                    <label key={p.key} className={`relative flex items-center rounded-tl-lg rounded-br-lg border ${ROLE_STYLE[r.roles[p.key]]}`}>
                      <span className="sr-only">{`${r.team || `Robô ${i + 1}`} — ${p.label}`}</span>
                      <select
                        value={r.roles[p.key]}
                        onChange={(e) => setRole(i, p.key, e.target.value as Role)}
                        className="w-full cursor-pointer appearance-none bg-transparent px-3 py-3 text-sm font-bold outline-none"
                      >
                        {(Object.keys(ROLES) as Role[]).map((role) => (
                          <option key={role} value={role} className="bg-base-100 text-base-content">
                            {ROLES[role].label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-xs text-base-content/50">
          {ROLES[plan.robots[0].roles.cycles].hint}
        </p>
      </section>

      {/* ================================================ robôs */}
      <section className="grid gap-5 md:grid-cols-2">
        {([0, 1] as const).map((i) => {
          const r = plan.robots[i];
          return (
            <article key={i} className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="label-text text-xs">{i === 0 ? "Nossa equipe" : "Equipe parceira"}</span>
                  <input
                    value={r.team}
                    onChange={(e) => updateRobot(i, { team: e.target.value.replace(/[^\d]/g, "").slice(0, 6) })}
                    inputMode="numeric"
                    placeholder={i === 0 ? ourTeam || "12345" : "nº da equipe"}
                    className="input input-bordered input-sm font-mono"
                  />
                </label>
                {scoutStats.length > 0 && (
                  <label className="flex flex-col gap-1">
                    <span className="label-text text-xs">Puxar do scouting</span>
                    <select
                      className="select select-bordered select-sm"
                      value=""
                      onChange={(e) => {
                        const st = scoutStats.find((t) => t.number === e.target.value);
                        if (st) updateRobot(i, robotFromStats(st, r));
                      }}
                    >
                      <option value="">Escolher…</option>
                      {scoutStats.map((t) => (
                        <option key={t.number} value={t.number}>
                          {t.number} {t.name ? `· ${t.name}` : ""} · {Math.round(t.avg)} pts
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <p className="mt-5 font-mono text-[11px] font-bold tracking-[0.18em] text-secondary">AUTO</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Toggle label="LEAVE" checked={r.autoLeave} onChange={(v) => updateRobot(i, { autoLeave: v })} />
                <Toggle label="PARK" checked={r.autoPark} onChange={(v) => updateRobot(i, { autoPark: v })} />
              </div>
              <Stepper label="TIPs no AUTO" value={r.autoTips} onChange={(v) => updateRobot(i, { autoTips: v })} max={5} />

              <p className="mt-4 font-mono text-[11px] font-bold tracking-[0.18em] text-primary">METAS DO TELEOP</p>
              <div className="divide-y divide-base-200">
                <Stepper label="TIPs" hint="20 pts cada" value={r.tips} onChange={(v) => updateRobot(i, { tips: v })} max={15} />
                <Stepper label="Na CELL de cima no fim" hint="2 pts cada" value={r.cell} onChange={(v) => updateRobot(i, { cell: v })} />
                <Stepper label="Em FLOWERS" hint="2 pts se a FLOWER for nossa" value={r.flower} onChange={(v) => updateRobot(i, { flower: v })} />
                <Stepper label="NECTAR mais baixo" hint="5 pts por FLOWER" value={r.bottomNectar} onChange={(v) => updateRobot(i, { bottomNectar: v })} max={4} />
                <Stepper label="No GARDEN" hint="1 pt cada" value={r.garden} onChange={(v) => updateRobot(i, { garden: v })} max={30} />
              </div>
              <div className="mt-3">
                <Toggle label="PARK no fim" checked={r.park} onChange={(v) => updateRobot(i, { park: v })} />
              </div>
            </article>
          );
        })}
      </section>

      {/* ================================================ aliança + avisos */}
      <section className="grid gap-5 lg:grid-cols-[1fr_1.3fr] [&>*]:min-w-0">
        <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
          <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent-content/80">FLOWERS DA ALIANÇA</p>
          <Stepper label="FLOWERS que vamos possuir" hint="NECTAR mais alto da nossa cor" value={plan.flowersOwned} onChange={(v) => update({ flowersOwned: v })} max={4} />
          <Stepper label="POLLEN que sobra em cada uma" hint="começam com 4" value={plan.pollenPerFlower} onChange={(v) => update({ pollenPerFlower: v })} max={4} />
          <label className="flex flex-col gap-1 mt-3">
            <span className="label-text text-xs">Observações para o técnico</span>
            <textarea
              value={plan.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={3}
              placeholder="ex.: adversário 2 defende forte, sair pela direita"
              className="textarea textarea-bordered text-sm"
            />
          </label>
        </div>

        <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
          <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-base-content/45">CHECAGEM DO PLANO</p>
          {warnings.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-success">
              <Check size={16} /> Plano redondo: RP no alcance e ninguém sobrando.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {warnings.map((w) => (
                <li key={w.text} className={`flex gap-2 text-sm leading-6 ${w.level === "warn" ? "text-warning-content" : "text-base-content/70"}`}>
                  {w.level === "warn" ? <AlertTriangle size={16} className="mt-1 shrink-0 text-warning" /> : <Info size={16} className="mt-1 shrink-0 text-info" />}
                  <span>{w.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ================================================ briefing */}
      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr] [&>*]:min-w-0">
        <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-[#141109] p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] font-bold tracking-[0.18em] opacity-60">BRIEFING DO TÉCNICO</p>
            <button type="button" onClick={copy} className="btn btn-xs gap-1">
              {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-5 opacity-90">{text}</pre>
        </div>

        <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-base-content/45">PLANOS SALVOS</p>
            <button
              type="button"
              onClick={() => setStore((s) => ({ ...s, current: newPlan(ourTeam) }))}
              className="btn btn-ghost btn-xs"
            >
              <Plus size={13} /> Novo plano
            </button>
          </div>
          {!loaded ? null : store.saved.length === 0 ? (
            <p className="mt-3 text-sm text-base-content/55">
              Nenhum plano salvo. Use <b>Salvar</b> para guardar o plano de cada partida neste aparelho.
            </p>
          ) : (
            <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto">
              {store.saved.map((p) => {
                const s = scorePlan(p);
                return (
                  <li key={p.id} className={`flex items-center gap-2 rounded-tl-lg rounded-br-lg border px-3 py-2 ${p.id === plan.id ? "border-primary bg-primary/5" : "border-base-300"}`}>
                    <button type="button" onClick={() => setStore((st) => ({ ...st, current: p }))} className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-bold">{p.name}</span>
                      <span className="font-mono text-[11px] text-base-content/50">
                        {s.total} pts · {s.tips} TIPs · {new Date(p.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStore((st) => ({ ...st, saved: st.saved.filter((x) => x.id !== p.id) }))}
                      className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error"
                      aria-label={`Excluir ${p.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ================================================ modo fila */}
      {queueMode && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#141109] p-5 text-white sm:p-10" role="dialog" aria-modal="true" aria-label="Modo fila">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm tracking-[0.2em] opacity-60">
                {plan.match ? `PARTIDA ${plan.match}` : "PARTIDA"} · {plan.alliance === "red" ? "VERMELHA" : "AZUL"}
              </p>
              <button type="button" onClick={() => setQueueMode(false)} className="btn btn-circle btn-ghost" aria-label="Fechar modo fila">
                <X size={22} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {plan.robots.map((r, i) => (
                <div key={i} className="rounded-tl-3xl rounded-br-3xl bg-white/5 p-6">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-60">{i === 0 ? "Nós" : "Parceiro"}</p>
                  <p className="font-mono text-4xl font-bold">{r.team || `Robô ${i + 1}`}</p>
                  <ol className="mt-5 space-y-3">
                    <li className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
                      <span className="font-mono text-sm opacity-60">AUTO</span>
                      <span className="text-right text-xl font-bold">
                        {[r.autoLeave && "LEAVE", r.autoTips > 0 && `${r.autoTips} TIP`, r.autoPark && "PARK"].filter(Boolean).join(" + ") || "—"}
                      </span>
                    </li>
                    {PHASES.map((p) => (
                      <li key={p.key} className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
                        <span className="font-mono text-sm opacity-60">{p.time}</span>
                        <span className="text-right text-xl font-bold">{ROLES[r.roles[p.key]].label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-baseline gap-6 font-mono">
              <span className="text-5xl font-bold">{score.total} pts</span>
              <span className="text-xl opacity-70">{score.tips} TIPs · {plan.flowersOwned} FLOWERS</span>
            </div>
            {plan.notes.trim() && <p className="mt-4 text-xl leading-8 opacity-90">{plan.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
