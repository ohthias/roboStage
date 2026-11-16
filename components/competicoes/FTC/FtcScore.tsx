"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";

import { playSound } from "@/utils/audio";
import { FIELD_COUNTS, POINTS, RANKING_POINTS } from "@/utils/competitions/ftc/biobuzz";
import {
  formatClock,
  initialMatchTimer,
  matchTimerReducer,
  type MatchPhase,
} from "@/utils/competitions/ftc/matchTimer";
import {
  emptySheet,
  makeRun,
  runSummary,
  runsToCsv,
  scoreMatch,
  sheetWarnings,
  type AllianceSheet,
  type SideResult,
  type TrainingRun,
} from "@/utils/competitions/ftc/score";
import { STORAGE_KEYS, downloadFile, usePersistentState } from "@/utils/competitions/ftc/storage";
import Header from "@/components/UI/Header";

type Mode = "treino" | "partida";
type Color = "red" | "blue";
type Store = { mode: Mode; red: AllianceSheet; blue: AllianceSheet; runs: TrainingRun[] };

const initialStore = (): Store => ({ mode: "treino", red: emptySheet(), blue: emptySheet(), runs: [] });

function parseStore(raw: unknown): Store | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<Store>;
  const base = initialStore();
  return {
    mode: s.mode === "partida" ? "partida" : "treino",
    red: { ...base.red, ...(s.red ?? {}) },
    blue: { ...base.blue, ...(s.blue ?? {}) },
    runs: Array.isArray(s.runs) ? s.runs : [],
  };
}

const COLORS: Record<Color, { label: string; ring: string; soft: string; text: string; btn: string }> = {
  red: { label: "Aliança vermelha", ring: "border-error/50", soft: "bg-error/5", text: "text-error", btn: "btn-error" },
  blue: { label: "Aliança azul", ring: "border-info/50", soft: "bg-info/5", text: "text-info", btn: "btn-info" },
};

/* ------------------------------------------------------------ peças */

function Tally({
  label,
  hint,
  value,
  onChange,
  max = 60,
  points,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  points?: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-tl-xl rounded-br-xl bg-base-200/60 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        {hint && <p className="text-[11px] leading-tight text-base-content/50">{hint}</p>}
      </div>
      {points != null && value > 0 && <span className="font-mono text-xs text-base-content/45">+{value * points}</span>}
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="btn btn-circle btn-ghost btn-sm" aria-label={`Menos ${label}`}>
        <Minus size={16} />
      </button>
      <span className="w-9 text-center font-mono text-2xl font-bold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="btn btn-circle btn-primary" aria-label={`Mais ${label}`}>
        <Plus size={18} />
      </button>
    </div>
  );
}

function RobotToggles({ label, value, onChange, points }: { label: string; value: [boolean, boolean]; onChange: (v: [boolean, boolean]) => void; points: number }) {
  return (
    <div className="rounded-tl-xl rounded-br-xl bg-base-200/60 px-3 py-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{label}</p>
        <span className="font-mono text-[11px] text-base-content/45">{points} pts por robô</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            role="switch"
            aria-checked={value[i]}
            onClick={() => onChange((i === 0 ? [!value[0], value[1]] : [value[0], !value[1]]) as [boolean, boolean])}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-tl-lg rounded-br-lg border text-sm font-bold transition-colors ${
              value[i] ? "border-primary bg-primary text-primary-content" : "border-base-300 bg-base-100 text-base-content/55"
            }`}
          >
            {value[i] && <Check size={15} />} Robô {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, subtitle, active, children }: { title: string; subtitle: string; active?: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-tl-2xl rounded-br-2xl border p-4 transition-colors ${active ? "border-primary bg-primary/5" : "border-base-300"}`}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-mono text-[11px] font-bold tracking-[0.18em]">
          {title}
          {active && <span className="badge badge-primary badge-xs ml-2 align-middle">AGORA</span>}
        </h3>
        <span className="text-[11px] text-base-content/45">{subtitle}</span>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function AllianceCard({
  color,
  sheet,
  onChange,
  result,
  phase,
  showColor,
}: {
  color: Color;
  sheet: AllianceSheet;
  onChange: (patch: Partial<AllianceSheet>) => void;
  result: SideResult;
  phase: MatchPhase;
  showColor: boolean;
}) {
  const c = COLORS[color];
  const warnings = sheetWarnings(sheet);
  const isAuto = phase === "auto" || phase === "countdown";
  const isTele = phase === "teleop" || phase === "transition";

  return (
    <article className={`rounded-tl-3xl rounded-br-3xl border bg-base-100 p-4 sm:p-5 ${showColor ? `${c.ring} ${c.soft}` : "border-base-300"}`}>
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className={`font-mono text-[11px] font-bold tracking-[0.18em] ${showColor ? c.text : "text-base-content/50"}`}>
            {showColor ? c.label.toUpperCase() : "NOSSA ALIANÇA"}
          </p>
          <p className="font-mono text-4xl font-bold tabular-nums">
            {result.final}
            <span className="ml-1 text-sm text-base-content/45">pts</span>
          </p>
        </div>
        <div className="text-right font-mono text-xs text-base-content/60">
          <p>AUTO <b className="text-base-content">{result.auto}</b></p>
          <p>TELEOP <b className="text-base-content">{result.teleop}</b></p>
          {result.foulsReceived > 0 && <p>Faltas recebidas <b className="text-base-content">+{result.foulsReceived}</b></p>}
        </div>
      </header>

      <div className="space-y-3">
        <Section title="AUTO" subtitle="primeiros 0:30" active={isAuto}>
          <RobotToggles label="LEAVE — saiu da parede" value={sheet.leave} onChange={(v) => onChange({ leave: v })} points={POINTS.auto.leave} />
          <Tally label="TIPs no AUTO" hint="HIVE virou com lançamento" value={sheet.autoTips} onChange={(v) => onChange({ autoTips: v })} max={10} points={POINTS.auto.tip} />
          <RobotToggles label="PARK no fim do AUTO" value={sheet.autoPark} onChange={(v) => onChange({ autoPark: v })} points={POINTS.auto.park} />
        </Section>

        <Section title="TELEOP" subtitle="2:00 com os pilotos" active={isTele}>
          <Tally label="TIPs no TELEOP" hint="20 pts cada" value={sheet.tips} onChange={(v) => onChange({ tips: v })} max={30} points={POINTS.teleop.tip} />
        </Section>

        <Section title="FIM DA PARTIDA" subtitle="conte quando o relógio zerar" active={phase === "finished"}>
          <Tally label="Na CELL de cima" hint="POLLEN/NECTAR · 2 pts" value={sheet.cell} onChange={(v) => onChange({ cell: v })} points={POINTS.teleop.cell} />
          <Tally label="FLOWERS possuídas" hint="NECTAR mais alto da sua cor" value={sheet.flowersOwned} onChange={(v) => onChange({ flowersOwned: v })} max={FIELD_COUNTS.flowers} />
          <Tally label="Elementos nas FLOWERS possuídas" hint="todos dentro delas · 2 pts" value={sheet.flowerElements} onChange={(v) => onChange({ flowerElements: v })} max={80} points={sheet.flowersOwned > 0 ? POINTS.teleop.flower : 0} />
          <Tally label="NECTAR mais baixo" hint="bônus por FLOWER · 5 pts" value={sheet.bottomNectar} onChange={(v) => onChange({ bottomNectar: v })} max={FIELD_COUNTS.flowers} points={POINTS.teleop.bottomNectar} />
          <Tally label="No seu GARDEN" hint="1 pt cada" value={sheet.garden} onChange={(v) => onChange({ garden: v })} max={60} points={POINTS.teleop.garden} />
          <RobotToggles label="PARK no LOADING ZONE" value={sheet.park} onChange={(v) => onChange({ park: v })} points={POINTS.teleop.park} />
        </Section>

        <Section title="FALTAS COMETIDAS" subtitle="viram pontos para o adversário">
          <Tally label="MINOR FOUL" hint={`+${POINTS.foul.minor} para o adversário`} value={sheet.minorFouls} onChange={(v) => onChange({ minorFouls: v })} max={20} />
          <Tally label="MAJOR FOUL" hint={`+${POINTS.foul.major} para o adversário`} value={sheet.majorFouls} onChange={(v) => onChange({ majorFouls: v })} max={20} />
        </Section>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {[
          ["SWARM", result.rp.swarm, `LEAVE + PARK ${result.swarm}/${RANKING_POINTS.swarmThreshold}`],
          ["POLLINATOR 1", result.rp.pollinator1, `${result.tips}/${RANKING_POINTS.pollinator1Tips} TIPs`],
          ["POLLINATOR 2", result.rp.pollinator2, `${result.tips}/${RANKING_POINTS.pollinator2Tips} TIPs`],
        ].map(([label, ok, detail]) => (
          <span key={String(label)} className={`badge h-auto gap-1 py-1 font-mono text-[11px] ${ok ? "badge-success" : "badge-ghost text-base-content/55"}`}>
            {ok ? <Check size={11} /> : null}
            {label} <span className="opacity-70">· {detail}</span>
          </span>
        ))}
      </div>

      {warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {warnings.map((w) => (
            <li key={w} className="flex gap-1.5 text-xs leading-5 text-warning">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {w}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/* --------------------------------------------------------- principal */

export default function FtcScore() {
  const [store, setStore, loaded] = usePersistentState<Store>(STORAGE_KEYS.score, initialStore, parseStore);
  const [clock, dispatch] = useReducer(matchTimerReducer, undefined, () => initialMatchTimer("full", true));
  const [showClock, setShowClock] = useState(false);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const prevPhase = useRef<MatchPhase>(clock.phase);

  const { mode, red, blue, runs } = store;
  const result = useMemo(() => scoreMatch(red, mode === "partida" ? blue : emptySheet()), [red, blue, mode]);
  const summary = useMemo(() => runSummary(runs), [runs]);

  useEffect(() => {
    if (!clock.isRunning) return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [clock.isRunning]);

  useEffect(() => {
    const before = prevPhase.current;
    prevPhase.current = clock.phase;
    if (clock.muted || before === clock.phase) return;
    if (clock.phase === "auto" || clock.phase === "teleop") playSound("go");
    if (clock.phase === "transition" || clock.phase === "finished") playSound("end");
  }, [clock.phase, clock.muted]);

  const patch = (color: Color) => (p: Partial<AllianceSheet>) => setStore((s) => ({ ...s, [color]: { ...s[color], ...p } }));

  const resetSheets = () => {
    setStore((s) => ({ ...s, red: emptySheet(), blue: emptySheet() }));
    dispatch({ type: "RESET" });
    setNotes("");
  };

  const saveRun = () => {
    const run = makeRun(red, label.trim() || `Tentativa ${runs.length + 1}`, notes.trim());
    setStore((s) => ({ ...s, runs: [run, ...s.runs].slice(0, 200), red: emptySheet() }));
    setLabel("");
    setNotes("");
    dispatch({ type: "RESET" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const phaseLabel: Record<MatchPhase, string> = {
    idle: "Pronto",
    countdown: "Preparar",
    auto: "AUTO",
    transition: "Transição",
    teleop: "TELEOP",
    finished: "Fim — conte o campo",
  };

  const lastRuns = runs.slice(0, 15).reverse();
  const maxTotal = Math.max(1, ...lastRuns.map((r) => r.total));

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-3 py-5 sm:space-y-8 sm:px-5 sm:py-8 lg:px-6 lg:py-12">
      <Header
        type="FTC"
        name="Pontuador"
        description="Conte a partida de treino da BIOBUZZ com os valores do Competition Manual: AUTO, TIPs, FLOWERS, GARDEN, PARK, faltas e RP. No modo treino, salve cada tentativa e acompanhe a evolução da aliança."
        highlight="FTC"
      />
      {/* ================================================ barra de controle */}
      <div className="sticky top-2 z-30 -mx-2 rounded-xl border border-base-300 bg-base-100/95 px-4 py-3 shadow-lg backdrop-blur sm:mx-0">
        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label="Modo do pontuador" className="flex flex-row gap-1">
            {(
              [
                ["treino", "Treino da aliança"],
                ["partida", "Partida completa"],
              ] as const
            ).map(([key, text]) => (
              <button
                key={key}
                role="radio"
                aria-checked={mode === key}
                type="button"
                onClick={() => setStore((s) => ({ ...s, mode: key }))}
                className={`btn btn-sm ${mode === key ? "btn-neutral" : ""}`}
              >
                {text}
              </button>
            ))}
          </div>

          {mode === "partida" ? (
            <p className="font-mono text-sm">
              <b className="text-error">{result.red.final}</b> × <b className="text-info">{result.blue.final}</b>
              <span className="ml-2 text-base-content/55">
                {result.winner === "tie" ? "empate" : result.winner === "red" ? "vitória vermelha" : "vitória azul"}
              </span>
            </p>
          ) : (
            <p className="font-mono text-sm">
              <b className="text-2xl">{result.red.final}</b> pts · {result.red.tips} TIPs · {result.red.rp.bonus} RP bônus
            </p>
          )}

          <div className="ml-auto flex items-center gap-2">
            {showClock && (
              <div className="flex items-center gap-1.5 rounded-full border border-base-300 px-2 py-1">
                <span className="font-mono text-xs uppercase text-base-content/55">{phaseLabel[clock.phase]}</span>
                <span className="w-12 text-center font-mono font-bold tabular-nums">
                  {clock.phase === "countdown" ? clock.timeLeft : clock.phase === "finished" ? "0:00" : formatClock(clock.timeLeft)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: clock.phase === "idle" || clock.phase === "finished" ? "START" : clock.isRunning ? "PAUSE" : "RESUME" })
                  }
                  className="btn btn-circle btn-primary btn-xs"
                  aria-label={clock.isRunning ? "Pausar cronômetro" : "Iniciar cronômetro"}
                >
                  {clock.isRunning ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
                  className="btn btn-ghost btn-xs"
                  aria-label={clock.muted ? "Ativar som" : "Desativar som"}
                  title={clock.muted ? "Ativar som" : "Desativar som"}
                >
                  {clock.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            )}
            <button type="button" onClick={() => setShowClock((v) => !v)} className={`btn btn-sm ${showClock ? "btn-ghost" : ""}`}>
              <Timer size={15} /> {showClock ? "Ocultar relógio" : "Cronometrar"}
            </button>
            <button type="button" onClick={resetSheets} className="btn btn-ghost btn-sm">
              <RotateCcw size={15} /> Zerar
            </button>
          </div>
        </div>
      </div>

      {/* ================================================ folhas */}
      {mode === "partida" ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <AllianceCard color="red" sheet={red} onChange={patch("red")} result={result.red} phase={showClock ? clock.phase : "idle"} showColor />
            <AllianceCard color="blue" sheet={blue} onChange={patch("blue")} result={result.blue} phase={showClock ? clock.phase : "idle"} showColor />
          </div>
          <section className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] text-base-content/50">
              <Trophy size={13} /> RESULTADO DA QUALIFICAÇÃO
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["red", "blue"] as const).map((c) => {
                const r = result[c];
                const won = result.winner === c;
                return (
                  <div key={c} className={`rounded-tl-xl rounded-br-xl border p-4 ${won ? "border-success bg-success/10" : "border-base-300"}`}>
                    <p className={`text-sm font-bold ${COLORS[c].text}`}>{COLORS[c].label}</p>
                    <p className="mt-1 font-mono text-3xl font-bold">{r.final} pts</p>
                    <p className="text-xs text-base-content/60">
                      {r.total} próprios{r.foulsReceived ? ` + ${r.foulsReceived} de faltas do adversário` : ""}
                    </p>
                    <p className="mt-2 font-mono text-sm">
                      <b>{r.rpTotal} RP</b>{" "}
                      <span className="text-base-content/55">
                        ({result.winner === "tie" ? `${RANKING_POINTS.tie} empate` : won ? `${RANKING_POINTS.win} vitória` : "0 derrota"} + {r.rp.bonus} bônus)
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr] [&>*]:min-w-0">
          <AllianceCard color="red" sheet={red} onChange={patch("red")} result={result.red} phase={showClock ? clock.phase : "idle"} showColor={false} />

          {/* ============================================ tentativas */}
          <aside className="space-y-5">
            <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
              <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-primary">SALVAR TENTATIVA</p>
              <div className="mt-3 grid gap-2">
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`Tentativa ${runs.length + 1}`} className="input input-bordered input-sm w-full" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="O que mudou nesta tentativa? (rota, piloto, mecanismo)"
                  className="textarea textarea-bordered text-sm w-full"
                />
                <button type="button" onClick={saveRun} className="btn btn-primary rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none">
                  {saved ? <Check size={16} /> : <Save size={16} />} {saved ? "Salva!" : `Salvar ${result.red.total} pts e zerar`}
                </button>
              </div>
            </div>

            <div className="rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-base-content/50">EVOLUÇÃO DO TREINO</p>
                {runs.length > 0 && (
                  <button type="button" onClick={() => downloadFile("treino-ftc-biobuzz.csv", runsToCsv(runs), "text/csv;charset=utf-8")} className="btn btn-ghost btn-xs">
                    <Download size={13} /> CSV
                  </button>
                )}
              </div>
              {!loaded ? null : !summary ? (
                <p className="mt-3 text-sm leading-6 text-base-content/60">
                  Salve cada tentativa para acompanhar média, melhor resultado e tendência do treino. Fica tudo neste aparelho.
                </p>
              ) : (
                <>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                    {[
                      [summary.avg.toFixed(0), "média"],
                      [String(summary.best), "melhor"],
                      [summary.tips.toFixed(1), "TIPs/tent."],
                    ].map(([v, l]) => (
                      <div key={l} className="rounded-lg bg-base-200/70 py-2">
                        <dd className="font-mono text-xl font-bold">{v}</dd>
                        <dt className="text-[10px] text-base-content/50">{l}</dt>
                      </div>
                    ))}
                  </dl>
                  {summary.trend != null && (
                    <p className={`mt-2 flex items-center gap-1.5 text-xs ${summary.trend >= 0 ? "text-success" : "text-error"}`}>
                      {summary.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      Últimas 5: {summary.trend >= 0 ? "+" : ""}
                      {summary.trend.toFixed(0)} pts em relação às 5 anteriores
                    </p>
                  )}
                  <div className="mt-4 flex h-24 items-end gap-1" aria-label="Total das últimas tentativas">
                    {lastRuns.map((r) => (
                      <div key={r.id} className="group relative max-w-8 flex-1">
                        <div className="rounded-t bg-primary/70 group-hover:bg-primary" style={{ height: `${Math.max(4, (r.total / maxTotal) * 96)}px` }} />
                        <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-base-content px-1.5 py-0.5 font-mono text-[10px] text-base-100 group-hover:block">
                          {r.total}
                        </span>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-4 max-h-60 space-y-1 overflow-y-auto">
                    {runs.map((r) => (
                      <li key={r.id} className="flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 px-3 py-1.5 text-sm" title={r.notes}>
                        <span className="min-w-0 flex-1 truncate">{r.label}</span>
                        <span className="font-mono text-xs text-base-content/50">A{r.auto} · {r.tips}T</span>
                        <b className="w-10 text-right font-mono tabular-nums">{r.total}</b>
                        <button
                          type="button"
                          onClick={() => setStore((s) => ({ ...s, runs: s.runs.filter((x) => x.id !== r.id) }))}
                          className="btn btn-ghost btn-square btn-xs text-base-content/40 hover:text-error"
                          aria-label={`Excluir ${r.label}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
