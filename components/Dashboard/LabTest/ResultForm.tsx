"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  FlaskConical,
  ListOrdered,
  SlidersHorizontal,
  Target,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = "runs" | "calibrabot" | "individual";

interface Mission {
  id: string;
  name: string;
  maxValue?: number; // pontuação máxima possível
}

interface CalibVariable {
  id: number;
  name: string;
}

interface CalibCombo {
  index: number;
  components: string[]; // ex: ["Motor A", "Motor B"]
}

// --- Runs ---
interface MissionResult {
  missionId: string;
  completed: boolean | null; // null = não avaliado ainda
  score: number | string;
}

interface RunEntry {
  id: number;
  results: MissionResult[];
  collapsed: boolean;
}

// --- CalibraBot ---
interface CalibRunEntry {
  id: number;
  combo: CalibCombo;
  variables: { varId: number; value: string }[];
  notes: string;
  collapsed: boolean;
}

// --- Individual ---
interface IndividualAttempt {
  id: number;
  success: boolean | null;
  score: number | string;
  notes: string;
}

interface LabTestResponseFormProps {
  mode: Mode;
  testName: string;
  // Runs / Individual
  missions?: Mission[];
  // CalibraBot
  calibVariables?: CalibVariable[];
  calibCombos?: CalibCombo[];
  onSubmit?: (data: unknown) => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _uid = 1;
const uid = () => _uid++;

function totalScore(results: MissionResult[]) {
  return results.reduce((acc, r) => acc + (r.completed ? Number(r.score) || 0 : 0), 0);
}

const MODE_META: Record<Mode, { icon: React.FC<{ className?: string }>; label: string; color: string }> = {
  runs: { icon: ListOrdered, label: "Criação de Runs", color: "text-primary" },
  calibrabot: { icon: SlidersHorizontal, label: "CalibraBot", color: "text-secondary" },
  individual: { icon: Target, label: "Missão Individual", color: "text-accent" },
};

// ---------------------------------------------------------------------------
// Shared UI
// ---------------------------------------------------------------------------

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px flex-1 bg-base-content/10" />
      <span className="text-xs text-base-content/40 font-medium uppercase tracking-widest">{label}</span>
      <div className="h-px flex-1 bg-base-content/10" />
    </div>
  );
}

function CompletedToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`btn btn-xs gap-1 rounded-lg transition-all ${
          value === true
            ? "btn-success text-success-content"
            : "btn-ghost text-base-content/40 hover:text-success hover:bg-success/10"
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Sim
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`btn btn-xs gap-1 rounded-lg transition-all ${
          value === false
            ? "btn-error text-error-content"
            : "btn-ghost text-base-content/40 hover:text-error hover:bg-error/10"
        }`}
      >
        <XCircle className="w-3.5 h-3.5" />
        Não
      </button>
    </div>
  );
}

function CardShell({
  header,
  children,
  collapsed,
  onToggle,
  accent,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  accent?: string;
}) {
  return (
    <div
      className={`rounded-2xl border transition-all ${
        accent ?? "border-base-content/12 bg-base-100"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        {header}
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-base-content/40 shrink-0" />
        ) : (
          <ChevronUp className="w-4 h-4 text-base-content/40 shrink-0" />
        )}
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-base-content/8 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel: Runs
// ---------------------------------------------------------------------------

function RunsResponsePanel({ missions }: { missions: Mission[] }) {
  const makeRun = (): RunEntry => ({
    id: uid(),
    collapsed: false,
    results: missions.map((m) => ({ missionId: m.id, completed: null, score: "" })),
  });

  const [runs, setRuns] = useState<RunEntry[]>([makeRun()]);

  const addRun = () => setRuns((r) => [...r, makeRun()]);
  const removeRun = (id: number) => setRuns((r) => r.filter((x) => x.id !== id));
  const toggleCollapse = (id: number) =>
    setRuns((r) => r.map((x) => (x.id === id ? { ...x, collapsed: !x.collapsed } : x)));

  const updateResult = (
    runId: number,
    missionId: string,
    field: "completed" | "score",
    value: boolean | string | number
  ) => {
    setRuns((r) =>
      r.map((run) =>
        run.id === runId
          ? {
              ...run,
              results: run.results.map((res) =>
                res.missionId === missionId ? { ...res, [field]: value } : res
              ),
            }
          : run
      )
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {runs.map((run, i) => {
        const score = totalScore(run.results);
        const done = run.results.filter((r) => r.completed === true).length;
        const total = run.results.length;
        return (
          <CardShell
            key={run.id}
            collapsed={run.collapsed}
            onToggle={() => toggleCollapse(run.id)}
            accent={
              run.collapsed
                ? "border-base-content/10 bg-base-200/40"
                : "border-primary/20 bg-primary/3"
            }
            header={
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">Run #{i + 1}</p>
                  {run.collapsed && (
                    <p className="text-xs text-base-content/45 mt-0.5">
                      {done}/{total} missões · {score} pts
                    </p>
                  )}
                </div>
                {runs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeRun(run.id); }}
                    className="btn btn-ghost btn-xs ml-2 text-base-content/30 hover:text-error hover:bg-error/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              {run.results.map((res, j) => {
                const mission = missions[j];
                return (
                  <div
                    key={res.missionId}
                    className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 rounded-xl border transition-all ${
                      res.completed === true
                        ? "border-success/30 bg-success/5"
                        : res.completed === false
                        ? "border-error/25 bg-error/4"
                        : "border-base-content/10 bg-base-200/50"
                    }`}
                  >
                    {/* Ordem */}
                    <span className="w-5 h-5 rounded-full bg-base-content/10 text-base-content/50 text-xs font-semibold flex items-center justify-center">
                      {j + 1}
                    </span>

                    {/* Nome */}
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {mission?.id} — {mission?.name}
                      </p>
                      {res.completed && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <input
                            type="number"
                            min={0}
                            max={mission?.maxValue}
                            placeholder="Pontuação"
                            value={res.score}
                            onChange={(e) =>
                              updateResult(run.id, res.missionId, "score", e.target.value)
                            }
                            className="input input-bordered input-xs w-28 focus:input-primary"
                          />
                          {mission?.maxValue && (
                            <span className="text-xs text-base-content/40">
                              / {mission.maxValue}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Toggle */}
                    <CompletedToggle
                      value={res.completed}
                      onChange={(v) => updateResult(run.id, res.missionId, "completed", v)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Totalizador */}
            <div className="flex items-center justify-between bg-base-200/60 rounded-xl px-4 py-2.5 border border-base-content/8">
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {done}/{total} missões concluídas
                </span>
              </div>
              <span className="text-base font-bold text-primary">{score} pts</span>
            </div>
          </CardShell>
        );
      })}

      <button
        type="button"
        onClick={addRun}
        className="btn btn-ghost btn-sm gap-2 self-start text-primary hover:bg-primary/10 mt-1"
      >
        <Plus className="w-4 h-4" />
        Adicionar run
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel: CalibraBot
// ---------------------------------------------------------------------------

function CalibrabotResponsePanel({
  variables,
  combos,
}: {
  variables: CalibVariable[];
  combos: CalibCombo[];
}) {
  const makeEntry = (combo: CalibCombo): CalibRunEntry => ({
    id: uid(),
    combo,
    collapsed: false,
    variables: variables.map((v) => ({ varId: v.id, value: "" })),
    notes: "",
  });

  const [entries, setEntries] = useState<CalibRunEntry[]>(combos.map(makeEntry));

  const toggleCollapse = (id: number) =>
    setEntries((e) => e.map((x) => (x.id === id ? { ...x, collapsed: !x.collapsed } : x)));

  const updateVar = (entryId: number, varId: number, value: string) =>
    setEntries((e) =>
      e.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              variables: entry.variables.map((v) =>
                v.varId === varId ? { ...v, value } : v
              ),
            }
          : entry
      )
    );

  const updateNotes = (id: number, notes: string) =>
    setEntries((e) => e.map((x) => (x.id === id ? { ...x, notes } : x)));

  const filledCount = (entry: CalibRunEntry) =>
    entry.variables.filter((v) => v.value !== "").length;

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => (
        <CardShell
          key={entry.id}
          collapsed={entry.collapsed}
          onToggle={() => toggleCollapse(entry.id)}
          accent={
            entry.collapsed
              ? "border-base-content/10 bg-base-200/40"
              : "border-secondary/20 bg-secondary/3"
          }
          header={
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-7 h-7 rounded-xl bg-secondary/15 text-secondary text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">
                  Combinação #{entry.combo.index}
                </p>
                <p className="text-xs text-base-content/45 mt-0.5">
                  {entry.combo.components.join(" + ")}
                  {entry.collapsed && (
                    <span className="ml-2">
                      · {filledCount(entry)}/{variables.length} variáveis
                    </span>
                  )}
                </p>
              </div>
            </div>
          }
        >
          {/* Variáveis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variables.map((v) => {
              const current = entry.variables.find((x) => x.varId === v.id);
              return (
                <div key={v.id} className="form-control gap-1">
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">{v.name}</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Valor numérico"
                    value={current?.value ?? ""}
                    onChange={(e) => updateVar(entry.id, v.id, e.target.value)}
                    className="input input-bordered input-sm focus:input-secondary"
                  />
                </div>
              );
            })}
          </div>

          {/* Notas */}
          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-xs font-medium">Observações</span>
              <span className="label-text-alt text-base-content/35">opcional</span>
            </label>
            <textarea
              rows={2}
              placeholder="Comportamento observado, anomalias, contexto..."
              value={entry.notes}
              onChange={(e) => updateNotes(entry.id, e.target.value)}
              className="textarea textarea-bordered textarea-sm focus:textarea-secondary resize-none text-sm"
            />
          </div>
        </CardShell>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel: Missão Individual
// ---------------------------------------------------------------------------

function IndividualResponsePanel({ missions }: { missions: Mission[] }) {
  const makeAttempt = (): IndividualAttempt => ({
    id: uid(),
    success: null,
    score: "",
    notes: "",
  });

  const [attempts, setAttempts] = useState<IndividualAttempt[]>([makeAttempt()]);

  const add = () => setAttempts((a) => [...a, makeAttempt()]);
  const remove = (id: number) => setAttempts((a) => a.filter((x) => x.id !== id));
  const update = <K extends keyof IndividualAttempt>(
    id: number,
    field: K,
    value: IndividualAttempt[K]
  ) => setAttempts((a) => a.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const mission = missions[0];
  const best = attempts
    .filter((a) => a.success === true)
    .reduce((max, a) => Math.max(max, Number(a.score) || 0), 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Missão alvo */}
      {mission && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-accent/8 border border-accent/20">
          <Target className="w-4 h-4 text-accent shrink-0" />
          <div>
            <p className="text-sm font-semibold text-accent">
              {mission.id} — {mission.name}
            </p>
            {mission.maxValue && (
              <p className="text-xs text-base-content/45">Pontuação máxima: {mission.maxValue}</p>
            )}
          </div>
          {best > 0 && (
            <div className="ml-auto text-right">
              <p className="text-xs text-base-content/45">Melhor resultado</p>
              <p className="text-base font-bold text-accent">{best} pts</p>
            </div>
          )}
        </div>
      )}

      {attempts.map((att, i) => (
        <div
          key={att.id}
          className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
            att.success === true
              ? "border-success/30 bg-success/4"
              : att.success === false
              ? "border-error/25 bg-error/3"
              : "border-base-content/12 bg-base-100"
          }`}
        >
          {/* Header da tentativa */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm font-medium">Tentativa #{i + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <CompletedToggle
                value={att.success}
                onChange={(v) => update(att.id, "success", v)}
              />
              {attempts.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(att.id)}
                  className="btn btn-ghost btn-xs text-base-content/30 hover:text-error hover:bg-error/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Pontuação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text text-xs font-medium">Pontuação obtida</span>
                {mission?.maxValue && (
                  <span className="label-text-alt text-base-content/35">
                    máx {mission.maxValue}
                  </span>
                )}
              </label>
              <input
                type="number"
                min={0}
                max={mission?.maxValue}
                placeholder="0"
                value={att.score}
                onChange={(e) => update(att.id, "score", e.target.value)}
                className="input input-bordered input-sm focus:input-accent"
              />
            </div>
          </div>

          {/* Observação */}
          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-xs font-medium">Observação</span>
              <span className="label-text-alt text-base-content/35">opcional</span>
            </label>
            <textarea
              rows={2}
              placeholder="O que aconteceu nessa tentativa? Ponto de falha, ajuste feito..."
              value={att.notes}
              onChange={(e) => update(att.id, "notes", e.target.value)}
              className="textarea textarea-bordered textarea-sm focus:textarea-accent resize-none text-sm"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="btn btn-ghost btn-sm gap-2 self-start text-accent hover:bg-accent/10 mt-1"
      >
        <Plus className="w-4 h-4" />
        Nova tentativa
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function LabTestResponseForm({
  mode,
  testName,
  missions = [],
  calibVariables = [],
  calibCombos = [],
  onSubmit,
  onCancel,
}: LabTestResponseFormProps) {
  const meta = MODE_META[mode];
  const Icon = meta.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: coletar estado dos painéis e enviar via Supabase
    onSubmit?.({});
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center shrink-0 mt-0.5">
          <FlaskConical className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-base-content/45 font-medium uppercase tracking-widest mb-0.5">
            Registrar resultado
          </p>
          <h2 className="font-semibold text-base leading-tight truncate">{testName}</h2>
        </div>
        <div
          className={`flex items-center gap-1.5 badge badge-outline gap-2 py-3 ${meta.color}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{meta.label}</span>
        </div>
      </div>

      <div className="divider my-0" />

      {/* Painéis por modo */}
      {mode === "runs" && (
        <>
          <SectionDivider label="Lançamentos" />
          <RunsResponsePanel missions={missions} />
        </>
      )}

      {mode === "calibrabot" && (
        <>
          <SectionDivider label="Combinações" />
          <CalibrabotResponsePanel variables={calibVariables} combos={calibCombos} />
        </>
      )}

      {mode === "individual" && (
        <>
          <SectionDivider label="Tentativas" />
          <IndividualResponsePanel missions={missions} />
        </>
      )}

      <div className="divider my-0" />

      {/* Footer */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost gap-2 text-base-content/50"
        >
          <RotateCcw className="w-4 h-4" />
          Descartar
        </button>
        <button type="submit" className="btn btn-primary gap-2">
          <Save className="w-4 h-4" />
          Salvar resultados
        </button>
      </div>
    </form>
  );
}