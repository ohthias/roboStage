"use client";

// ---------------------------------------------------------------------------
// Execução de uma RODADA da OBR Resgate no LabTest.
//
// Usa o mesmo cronômetro (useObrRoundTimer + RoundTimer) e a mesma pontuação
// (breakdown/emptyRound) do Pontuador. Além do placar, registra:
//   - tentativas de cada perigo (taxa de sucesso);
//   - cada falha com o instante e o local (ladrilho da arena ou checkpoint);
//   - a linha do tempo da sala de resgate (entrada, capturas e depósitos).
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DoorOpen,
  Hand,
  Loader2,
  MapPin,
  Save,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import RoundTimer from "@/components/competicoes/OBR/score/RoundTimer";
import Counter from "@/components/competicoes/OBR/score/Counter";
import { useObrRoundTimer } from "@/utils/competitions/obr/roundTimer";
import {
  HAZARD_DEFS,
  MAX_MORTAS,
  MAX_VIVAS,
  ROUND_MAX_SECONDS,
  breakdown,
  checkpointRate,
  emptyRound,
  formatTime,
} from "@/utils/competitions/obr/scoring";
import type { Round } from "@/utils/competitions/obr/types";
import {
  buildObrResult,
  emptyAttempts,
  finalizeRound,
  tileKey,
  type DepositArea,
  type HazardAttempts,
  type HazardKey,
  type ObrDeposit,
  type ObrFailure,
  type TileRef,
  type VictimKind,
} from "@/utils/labtest/obr";
import type { Project } from "@/utils/quickbrick/ArenaBuilder/types";
import { createTestExecution } from "@/app/(protected)/dashboard/labtest/actions";
import { updateLabTestStatus } from "@/app/(protected)/dashboard/labtest/new/actions";
import ArenaMap from "./ArenaMap";

const MAX_DEPOSITS = MAX_VIVAS + MAX_MORTAS;

function Panel({
  kicker,
  title,
  hint,
  aside,
  children,
}: {
  kicker: string;
  title: string;
  hint?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-base-content/45">
            / {kicker}
          </p>
          <h2 className="mt-1 text-base font-semibold">{title}</h2>
          {hint && (
            <p className="mt-0.5 text-sm text-base-content/55">{hint}</p>
          )}
        </div>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const tileLabel = (t: TileRef) => `Tablado ${t.board} · ladrilho ${t.cell + 1}`;

export default function ObrRoundExecution({
  testId,
  testName,
  nextExecutionNumber,
  arena,
}: {
  testId: string;
  testName: string;
  nextExecutionNumber: number;
  arena: Project | null;
}) {
  const router = useRouter();
  const timer = useObrRoundTimer();
  const elapsed = Math.min(ROUND_MAX_SECONDS, timer.state.elapsed);

  const [round, setRound] = useState<Round>(emptyRound);
  const [attempts, setAttempts] = useState<HazardAttempts>(emptyAttempts);
  const [failures, setFailures] = useState<ObrFailure[]>([]);
  const [selectedFailure, setSelectedFailure] = useState<number | null>(null);
  const [entrySec, setEntrySec] = useState<number | null>(null);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [deposits, setDeposits] = useState<ObrDeposit[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<Round>) => setRound((cur) => ({ ...cur, ...p }));

  // Placar ao vivo com falhas e vítimas derivadas dos registros.
  const finalRound = useMemo(
    () => finalizeRound(round, failures, deposits),
    [round, failures, deposits],
  );
  const b = breakdown(finalRound);
  const currentCheckpoint = round.checkpoints.length + 1;

  /* ------------------------------- falhas ------------------------------- */
  const addFailure = (kind: ObrFailure["kind"]) => {
    // Já deixa a nova falha selecionada para marcar o local no mapa.
    setSelectedFailure(failures.length);
    setFailures((list) => [
      ...list,
      { t: elapsed, kind, tile: null, checkpoint: currentCheckpoint },
    ]);
  };
  const removeLastGiveUp = () =>
    setFailures((list) => {
      const idx = list.map((f) => f.kind).lastIndexOf("desistencia");
      return idx < 0 ? list : list.filter((_, i) => i !== idx);
    });

  // Desistência no cronômetro também vira um registro de falha (com local).
  const wrappedTimer = {
    ...timer,
    dispatch: (action: Parameters<typeof timer.dispatch>[0]) => {
      if (action.type === "GIVE_UP" && timer.state.phase === "round")
        addFailure("desistencia");
      if (action.type === "UNDO_GIVE_UP" && timer.state.giveUps.length > 0)
        removeLastGiveUp();
      timer.dispatch(action);
    },
  };

  const updateFailure = (i: number, p: Partial<ObrFailure>) =>
    setFailures((list) => list.map((f, j) => (j === i ? { ...f, ...p } : f)));

  const roundHeat = useMemo(() => {
    const m = new Map<string, number>();
    failures.forEach(
      (f) =>
        f.tile && m.set(tileKey(f.tile), (m.get(tileKey(f.tile)) ?? 0) + 1),
    );
    return m;
  }, [failures]);

  /* ------------------------------- resgate ------------------------------ */
  const correct = (kind: VictimKind) =>
    deposits.filter((d) => d.kind === kind && d.area === "correta").length;
  const canDeposit = (kind: VictimKind, area: DepositArea) =>
    deposits.length < MAX_DEPOSITS &&
    (area === "invertida" ||
      correct(kind) < (kind === "viva" ? MAX_VIVAS : MAX_MORTAS));

  const addDeposit = (kind: VictimKind, area: DepositArea) => {
    if (!canDeposit(kind, area)) return;
    if (entrySec === null) setEntrySec(elapsed);
    setDeposits((list) => [...list, { t: elapsed, kind, area }]);
    setCaptureAttempts((n) => Math.max(n, deposits.length + 1));
  };

  const sortedDeposits = [...deposits].sort((a, b2) => a.t - b2.t);

  /* -------------------------------- reset ------------------------------- */
  const resetAll = () => {
    setRound(emptyRound());
    setAttempts(emptyAttempts());
    setFailures([]);
    setSelectedFailure(null);
    setEntrySec(null);
    setCaptureAttempts(0);
    setDeposits([]);
    setError(null);
  };

  /* -------------------------------- salvar ------------------------------ */
  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const obrRound = buildObrResult({
        round,
        attempts,
        failures,
        rescue: { entrySec, captureAttempts, deposits },
        elapsedSec: elapsed,
      });
      await createTestExecution({
        testId,
        notes: notes.trim() || undefined,
        results: { obrRound },
      });
      if (nextExecutionNumber === 1) {
        await updateLabTestStatus({ testId, status: "em_andamento" }).catch(
          () => {},
        );
      }
      router.push(`/dashboard/labtest/${testId}`);
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setError(
        !raw || /failed to fetch|network/i.test(raw)
          ? "Sem conexão com o servidor. Tente de novo."
          : raw,
      );
      setSaving(false);
    }
  };

  const mm = Math.floor(round.tempo / 60);
  const ss = round.tempo % 60;
  const btnShape =
    "rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none";
  const multiplierText = b.multiplier
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, "");

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-0">
      <header>
        <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
          / OBR RESGATE · RODADA #{nextExecutionNumber}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {testName}
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          Mesma pontuação do Pontuador. Registre também as tentativas, onde o
          robô falhou e o que aconteceu na sala de resgate.
        </p>
      </header>

      <RoundTimer
        timer={wrappedTimer}
        falhas={finalRound.falhas}
        onFalha={() => addFailure("falha")}
        onResetScore={resetAll}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Perigos */}
          <Panel
            kicker="PERCURSO"
            title="Perigos do trajeto"
            hint="Superados contam pontos; tentativas mostram a taxa de sucesso de cada desafio."
          >
            <ul className="divide-y divide-base-300">
              {HAZARD_DEFS.map((d) => {
                const key = d.key as HazardKey;
                const ok = round.hazards[key];
                const tries = Math.max(attempts[key], ok);
                return (
                  <li
                    key={key}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{d.label}</p>
                      <p className="text-xs text-base-content/50">
                        {d.hint}
                        {tries > 0 && (
                          <span className="ml-2 font-mono text-base-content/70">
                            {ok} de {tries} · {Math.round((ok / tries) * 100)}%
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-base-content/60">
                        Superados
                        <Counter
                          value={ok}
                          onChange={(n) => {
                            patch({ hazards: { ...round.hazards, [key]: n } });
                            if (n > attempts[key])
                              setAttempts((a) => ({ ...a, [key]: n }));
                          }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs text-base-content/60">
                        Tentativas
                        <Counter
                          value={tries}
                          min={ok}
                          onChange={(n) =>
                            setAttempts((a) => ({ ...a, [key]: n }))
                          }
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {/* Checkpoints */}
          <Panel
            kicker="CHECKPOINTS"
            title="Início e checkpoints"
            hint="1ª tentativa = 5 pts/ladrilho, 2ª = 3, 3ª = 1, 4ª ou mais = 0."
          >
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={round.startTile}
                onChange={(e) => patch({ startTile: e.target.checked })}
              />
              Superou o ladrilho de início (+5)
            </label>
            <ol className="mt-3 flex flex-col gap-2">
              {round.checkpoints.map((c, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-tl-xl rounded-br-xl border border-base-300 p-3"
                >
                  <span className="font-mono text-xs font-bold text-primary">
                    CP {i + 1}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-base-content/60">
                    Ladrilhos
                    <Counter
                      value={c.tiles}
                      max={60}
                      onChange={(n) =>
                        patch({
                          checkpoints: round.checkpoints.map((x, j) =>
                            j === i ? { ...x, tiles: n } : x,
                          ),
                        })
                      }
                    />
                  </label>
                  <select
                    className="select select-sm w-auto"
                    value={c.attempt}
                    aria-label={`Tentativa do checkpoint ${i + 1}`}
                    onChange={(e) =>
                      patch({
                        checkpoints: round.checkpoints.map((x, j) =>
                          j === i
                            ? { ...x, attempt: Number(e.target.value) }
                            : x,
                        ),
                      })
                    }
                  >
                    <option value={1}>1ª tentativa</option>
                    <option value={2}>2ª tentativa</option>
                    <option value={3}>3ª tentativa</option>
                    <option value={4}>4ª ou mais</option>
                  </select>
                  <span className="ml-auto font-mono text-sm">
                    +{c.tiles * checkpointRate(c.attempt)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square text-base-content/45 hover:text-error"
                    aria-label={`Remover checkpoint ${i + 1}`}
                    onClick={() =>
                      patch({
                        checkpoints: round.checkpoints.filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-tl-xl rounded-br-xl border border-dashed border-base-300 py-3 text-sm text-base-content/60 transition-colors hover:border-primary hover:text-primary"
              onClick={() =>
                patch({
                  checkpoints: [...round.checkpoints, { tiles: 1, attempt: 1 }],
                })
              }
            >
              + Checkpoint alcançado
            </button>
          </Panel>

          {/* Falhas */}
          <Panel
            kicker="FALHAS"
            title="Onde o robô falhou"
            hint={
              arena
                ? "Use “Falha” ou “Desistência” no cronômetro e toque no ladrilho onde aconteceu."
                : "Use “Falha” ou “Desistência” no cronômetro. Sem arena, a falha fica ligada ao checkpoint."
            }
            aside={
              <button
                type="button"
                onClick={() => addFailure("falha")}
                className="btn btn-outline btn-warning btn-sm gap-1.5"
              >
                <TriangleAlert className="size-4" />
                Falha
              </button>
            }
          >
            {failures.length === 0 ? (
              <p className="text-sm text-base-content/50">
                Nenhuma falha registrada nesta rodada.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {failures.map((f, i) => {
                  const active = selectedFailure === i;
                  return (
                    <li
                      key={i}
                      className={`flex flex-wrap items-center gap-2 rounded-tl-xl rounded-br-xl border p-2.5 text-sm ${
                        active
                          ? "border-error/60 bg-error/5"
                          : "border-base-300"
                      }`}
                    >
                      <span className="font-mono text-xs text-base-content/50">
                        {formatTime(f.t)}
                      </span>
                      <span
                        className={`badge badge-sm ${f.kind === "falha" ? "badge-warning" : "badge-error"} badge-soft`}
                      >
                        {f.kind === "falha" ? "Falha" : "Desistência"}
                      </span>
                      <select
                        className="select select-xs w-auto"
                        aria-label={`Checkpoint da falha ${i + 1}`}
                        value={f.checkpoint ?? ""}
                        onChange={(e) =>
                          updateFailure(i, {
                            checkpoint: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      >
                        <option value="">sem checkpoint</option>
                        {Array.from(
                          {
                            length: Math.max(
                              currentCheckpoint,
                              f.checkpoint ?? 0,
                            ),
                          },
                          (_, k) => (
                            <option key={k} value={k + 1}>
                              antes do CP {k + 1}
                            </option>
                          ),
                        )}
                      </select>
                      {arena && (
                        <button
                          type="button"
                          onClick={() => setSelectedFailure(active ? null : i)}
                          className={`btn btn-xs gap-1 ${active ? "btn-error" : "btn-ghost"}`}
                        >
                          <MapPin className="size-3.5" />
                          {f.tile
                            ? tileLabel(f.tile)
                            : active
                              ? "Toque no mapa"
                              : "Marcar no mapa"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square ml-auto text-base-content/45 hover:text-error"
                        aria-label={`Remover falha ${i + 1}`}
                        onClick={() => {
                          setFailures((list) => list.filter((_, j) => j !== i));
                          setSelectedFailure(null);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {arena && (
              <div className="mt-4 rounded-tl-xl rounded-br-xl border border-base-300 p-2">
                <ArenaMap
                  arena={arena}
                  heat={roundHeat}
                  selected={
                    selectedFailure !== null
                      ? failures[selectedFailure]?.tile
                      : null
                  }
                  onTileClick={
                    selectedFailure !== null
                      ? (tile) => {
                          updateFailure(selectedFailure, { tile });
                          setSelectedFailure(null);
                        }
                      : undefined
                  }
                  label="Mapa da arena para marcar falhas"
                  className="max-h-[32rem]"
                />
                <p className="px-1 pt-2 text-xs text-base-content/50">
                  {selectedFailure !== null
                    ? "Toque no ladrilho onde a falha aconteceu."
                    : "Escolha uma falha na lista para marcar o local."}
                </p>
              </div>
            )}
          </Panel>

          {/* Sala de resgate */}
          <Panel
            kicker="RESGATE"
            title="Sala de resgate"
            hint="Os tempos usam o cronômetro do round. Cada depósito entra no multiplicador."
          >
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setEntrySec(entrySec === null ? elapsed : null)}
                className={`btn btn-sm gap-1.5 ${entrySec === null ? "btn-outline" : "btn-primary"}`}
              >
                <DoorOpen className="size-4" />
                {entrySec === null
                  ? "Entrou na sala"
                  : `Entrou aos ${formatTime(entrySec)}`}
              </button>
              <label className="flex items-center gap-2 text-xs text-base-content/60">
                <Hand className="size-4" />
                Capturas tentadas
                <Counter
                  value={captureAttempts}
                  min={deposits.length}
                  onChange={setCaptureAttempts}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["viva", "correta", "Viva na área verde", "×1,3"],
                  ["morta", "correta", "Morta na área vermelha", "×1,3"],
                  ["viva", "invertida", "Viva na área invertida", "×1,1"],
                  ["morta", "invertida", "Morta na área invertida", "×1,1"],
                ] as const
              ).map(([kind, area, label, mult]) => (
                <button
                  key={`${kind}-${area}`}
                  type="button"
                  disabled={!canDeposit(kind, area)}
                  onClick={() => addDeposit(kind, area)}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-tl-xl rounded-br-xl border border-base-300 px-3 py-2.5 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`size-3 rounded-full ${kind === "viva" ? "bg-base-300 ring-2 ring-slate-400" : "bg-neutral"}`}
                      aria-hidden
                    />
                    {label}
                  </span>
                  <span className="font-mono text-xs text-base-content/50">
                    {mult}
                  </span>
                </button>
              ))}
            </div>

            {sortedDeposits.length > 0 && (
              <ol className="mt-3 flex flex-col gap-1.5 text-sm">
                {sortedDeposits.map((d, i) => {
                  const prev = i === 0 ? entrySec : sortedDeposits[i - 1].t;
                  return (
                    <li key={`${d.t}-${i}`} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-base-content/50">
                        {formatTime(d.t)}
                      </span>
                      <span>
                        {d.kind === "viva" ? "Viva" : "Morta"} ·{" "}
                        {d.area === "correta"
                          ? d.kind === "viva"
                            ? "área verde"
                            : "área vermelha"
                          : "área invertida"}
                      </span>
                      {prev !== null && (
                        <span className="font-mono text-xs text-base-content/45">
                          +{formatTime(Math.max(0, d.t - prev))}
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square ml-auto text-base-content/45 hover:text-error"
                        aria-label={`Remover depósito ${i + 1}`}
                        onClick={() =>
                          setDeposits((list) => list.filter((x) => x !== d))
                        }
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}

            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="toggle toggle-secondary toggle-sm mt-0.5"
                checked={round.surpresa}
                onChange={(e) => patch({ surpresa: e.target.checked })}
              />
              <span>
                Desafio Surpresa demonstrado{" "}
                <span className="text-base-content/50">
                  (×1,5 — Estadual, 2ª e 3ª rodadas)
                </span>
              </span>
            </label>
          </Panel>

          {/* Chegada e tempo */}
          <Panel kicker="FIM" title="Chegada e tempo">
            <div className="flex flex-col gap-3 text-sm">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm mt-0.5"
                  checked={round.chegada}
                  onChange={(e) =>
                    patch({
                      chegada: e.target.checked,
                      desistiu: e.target.checked ? false : round.desistiu,
                      ...(e.target.checked && elapsed > 0
                        ? { tempo: elapsed }
                        : {}),
                    })
                  }
                />
                <span>
                  Parou na faixa vermelha do ladrilho de chegada por ≥ 5 s{" "}
                  <span className="text-base-content/50">
                    (60 − 5 × falhas)
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error checkbox-sm mt-0.5"
                  checked={round.desistiu}
                  onChange={(e) => {
                    patch({
                      desistiu: e.target.checked,
                      chegada: e.target.checked ? false : round.chegada,
                    });
                    if (e.target.checked) timer.dispatch({ type: "FINISH" });
                  }}
                />
                <span>
                  Capitão anunciou FIM DA RODADA{" "}
                  <span className="text-base-content/50">(tempo = 5:00)</span>
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <span>Tempo de execução</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  aria-label="Minutos"
                  className="input input-sm w-16"
                  value={mm}
                  disabled={!round.chegada}
                  onChange={(e) =>
                    patch({
                      tempo: Math.min(
                        ROUND_MAX_SECONDS,
                        Number(e.target.value) * 60 + ss,
                      ),
                    })
                  }
                />
                <span>min</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  aria-label="Segundos"
                  className="input input-sm w-16"
                  value={ss}
                  disabled={!round.chegada}
                  onChange={(e) =>
                    patch({
                      tempo: Math.min(
                        ROUND_MAX_SECONDS,
                        mm * 60 + Math.min(59, Number(e.target.value)),
                      ),
                    })
                  }
                />
                <span>s</span>
                {elapsed > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    disabled={!round.chegada}
                    onClick={() => patch({ tempo: elapsed })}
                  >
                    Usar cronômetro ({formatTime(elapsed)})
                  </button>
                )}
              </div>
            </div>
            <textarea
              rows={2}
              placeholder="Observações da rodada (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea mt-4 w-full resize-none text-sm"
            />
          </Panel>
        </div>

        {/* Placar */}
        <aside className="hidden lg:sticky lg:top-40 lg:block">
          <div className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] text-base-content/45">
              / PLACAR
            </p>
            <p className="mt-2 text-4xl font-black tabular-nums text-primary">
              {b.total}
            </p>
            <p className="text-xs text-base-content/55">
              Tempo considerado: {formatTime(b.tempo)}
            </p>
            <dl className="mt-4 space-y-1.5 text-sm">
              {(
                [
                  ["Perigos", b.hazards],
                  ["Ladrilho de início", b.start],
                  ["Checkpoints", b.checkpoints],
                  ["Chegada", b.chegada],
                ] as const
              ).map(([label, v]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-base-content/65">{label}</dt>
                  <dd className="font-mono tabular-nums">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-base-300 pt-1.5 font-medium">
                <dt>Subtotal</dt>
                <dd className="font-mono tabular-nums">{b.base}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-base-content/65">Multiplicador</dt>
                <dd className="font-mono tabular-nums">×{multiplierText}</dd>
              </div>
            </dl>
            {b.multiplierParts.length > 0 && (
              <p className="mt-1 text-xs text-base-content/50">
                {b.multiplierParts.join(" · ")}
              </p>
            )}
            <div className="my-4 h-px bg-base-300" />
            <p className="text-xs text-base-content/55">
              {failures.length} falha(s) · {deposits.length} depósito(s)
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`btn btn-primary mt-3 w-full ${btnShape}`}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Salvando…" : "Salvar rodada"}
            </button>
            {error && (
              <p
                className="mt-3 border-l-2 border-error pl-3 text-sm text-error"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Barra fixa (celular / tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p
            className={`min-w-0 flex-1 truncate text-sm ${error ? "text-error" : ""}`}
          >
            {error ?? (
              <>
                Placar{" "}
                <strong className="tabular-nums text-primary">{b.total}</strong>{" "}
                · ×{multiplierText}
              </>
            )}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`btn btn-primary shrink-0 ${btnShape}`}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar rodada
          </button>
        </div>
      </div>
    </div>
  );
}
