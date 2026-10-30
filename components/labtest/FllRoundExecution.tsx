"use client";

// ---------------------------------------------------------------------------
// Execução do modo "Round 2:30" (FLL Challenge).
// O teste guarda só a estratégia (lista de missões). Aqui a equipe roda o
// round com cronômetro e pontua cada missão, como no pontuador oficial:
// missões da estratégia + inspeção de equipamentos + tokens de precisão.
// O formato salvo é o mesmo das outras runs (answers/missions/precisionDiscs),
// então os gráficos da tela do teste continuam funcionando.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Save,
  TimerReset,
} from "lucide-react";

import { MissionCard } from "@/components/FormMission/MissionCard";
import { computeMissionBreakdown, computePoints } from "@/utils/scores";
import { getSubMissionKey } from "@/utils/labtest/fll";
import { createTestExecution } from "@/app/(protected)/dashboard/labtest/actions";
import { updateLabTestStatus } from "@/app/(protected)/dashboard/labtest/new/actions";
import { loadSeasonMissions } from "@/utils/data/missions-client";
import { LabTestModels } from "./LabTestModels";

import { unwrapAction } from "@/utils/stagebook/action-result";
const ROUND_SECONDS = 150;
const DISCS = 6;
const INSPECTION_ID = "EL";

type Responses = Record<string, Record<number, number>>;

interface FllRoundExecutionProps {
  testId: string;
  testName: string;
  season: string;
  missionIds: string[];
  nextExecutionNumber: number;
}

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function FllRoundExecution({
  testId,
  testName,
  season,
  missionIds,
  nextExecutionNumber,
}: FllRoundExecutionProps) {
  const router = useRouter();

  const [catalog, setCatalog] = useState<Mission[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [responses, setResponses] = useState<Responses>({});
  const [inspection, setInspection] = useState<number | undefined>(undefined);
  const [discsRemaining, setDiscsRemaining] = useState(DISCS);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------- catálogo da temporada ------------------------- */
  useEffect(() => {
    let active = true;
    loadSeasonMissions<Mission>(season)
      .then((list) => {
        if (!active) return;
        if (!list.length) throw new Error();
        setCatalog(list);
      })
      .catch(() => {
        if (active) setLoadError("Não foi possível carregar as missões da temporada.");
      });
    return () => {
      active = false;
    };
  }, [season]);

  // EL (inspeção) é tratada à parte, no "Fim do round".
  const strategy = useMemo(
    () =>
      (catalog ?? []).length
        ? missionIds
            .filter((id) => id !== INSPECTION_ID)
            .map((id) => catalog!.find((m) => m.id === id))
            .filter((m): m is Mission => Boolean(m))
        : [],
    [catalog, missionIds],
  );
  const inspectionMission = catalog?.find((m) => m.id === INSPECTION_ID);
  const inspectionMissing = Boolean(inspectionMission) && inspection === undefined;
  const precisionMission = catalog?.find((m) => m.id === "PT");

  /* ------------------------------- pontuação ------------------------------- */
  const perMission = strategy.map((m) => ({
    id: m.id,
    name: m.name,
    points: computeMissionBreakdown(m, responses[m.id]).total,
  }));
  const missionsTotal = perMission.reduce((sum, m) => sum + m.points, 0);
  const inspectionPoints = inspectionMission
    ? computePoints(inspectionMission.type, inspectionMission.points, inspection)
    : 0;
  const precisionPoints = precisionMission
    ? computePoints(precisionMission.type, precisionMission.points, discsRemaining)
    : 0;
  const total = missionsTotal + inspectionPoints + precisionPoints;

  const onSelect = (missionId: string, index: number, idx: number) =>
    setResponses((prev) => ({
      ...prev,
      [missionId]: { ...prev[missionId], [index]: idx },
    }));

  /* ------------------------------- cronômetro ------------------------------ */
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startAudio = useRef<HTMLAudioElement | null>(null);
  const endAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startAudio.current = new Audio("/sounds/start.mp3");
    endAudio.current = new Audio("/sounds/end.mp3");
  }, []);

  const finished = elapsed >= ROUND_SECONDS;
  const ticking = running && !finished;

  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(
      () => setElapsed((e) => Math.min(e + 1, ROUND_SECONDS)),
      1000,
    );
    return () => clearInterval(id);
  }, [ticking]);

  // Fim dos 2:30: toca o som.
  useEffect(() => {
    if (finished) endAudio.current?.play().catch(() => {});
  }, [finished]);

  const toggleTimer = () => {
    if (finished) return;
    if (!running && elapsed === 0) startAudio.current?.play().catch(() => {});
    setRunning((r) => !r);
  };
  const resetTimer = () => {
    setRunning(false);
    setElapsed(0);
  };
  const remaining = ROUND_SECONDS - elapsed;

  const resetScore = () => {
    setResponses({});
    setInspection(undefined);
    setDiscsRemaining(DISCS);
  };

  /* --------------------------------- salvar -------------------------------- */
  const handleSave = async () => {
    if (inspectionMissing) {
      setError("Responda a inspeção de equipamentos antes de salvar.");
      document
        .getElementById("inspection")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    setError(null);
    setRunning(false);
    try {
      const answers = Object.fromEntries(
        strategy.map((mission, order) => {
          const r = responses[mission.id] ?? {};
          return [
            mission.id,
            {
              missionId: mission.id,
              order,
              value: r[0] ?? 0,
              subAnswers: Object.fromEntries(
                (mission["sub-mission"] ?? []).map((sub, i) => [
                  getSubMissionKey(mission, sub, i),
                  r[i + 1] ?? 0,
                ]),
              ),
              objectiveAnswers: {},
            },
          ];
        }),
      );
      // Inspeção entra nas respostas quando o teste já a inclui (testes novos).
      if (missionIds.includes(INSPECTION_ID) && inspection !== undefined) {
        Object.assign(answers, {
          [INSPECTION_ID]: {
            missionId: INSPECTION_ID,
            order: -1,
            value: inspection,
            subAnswers: {},
            objectiveAnswers: {},
          },
        });
      }

      unwrapAction(await createTestExecution({
        testId,
        notes: notes.trim() || undefined,
        results: {
          answers,
          missions: [
            ...(missionIds.includes(INSPECTION_ID) ? [INSPECTION_ID] : []),
            ...strategy.map((m) => m.id),
          ],
          precisionDiscs: {
            total: DISCS,
            remaining: discsRemaining,
            used: DISCS - discsRemaining,
          },
          round: {
            total,
            missionsTotal,
            inspectionPoints,
            precisionPoints,
            perMission: Object.fromEntries(perMission.map((m) => [m.id, m.points])),
            seconds: elapsed,
          },
        },
      }));

      if (nextExecutionNumber === 1) {
        // Melhor esforço: falhar aqui não impede o lançamento já salvo.
          await updateLabTestStatus({ testId, status: "em_andamento" }).catch(() => undefined);
      }

      router.push(`/dashboard/labtest/${testId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar o round.");
      setSaving(false);
    }
  };

  /* ---------------------------------- tela --------------------------------- */
  if (loadError) {
    return (
      <div className="rounded-tl-3xl rounded-br-3xl border border-error/30 bg-base-100 p-6 text-sm text-error">
        {loadError}
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="flex items-center justify-center rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-10">
        <span className="loading loading-spinner" />
      </div>
    );
  }

  const timeTone =
    remaining <= 10 ? "text-error" : remaining <= 30 ? "text-warning" : "";

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-0">
      {/* Cabeçalho */}
      <header>
        <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
          / ROUND 2:30 · EXECUÇÃO #{nextExecutionNumber}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{testName}</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Rode o round com o cronômetro e marque o que ficou no tapete. A
          pontuação soma sozinha.
        </p>
      </header>

      {/* Placar + cronômetro (fixo no topo) */}
      <div className="sticky top-16 z-20 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100/95 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-24">
            <p className="font-mono text-[10px] tracking-[0.2em] text-base-content/45">
              PONTOS
            </p>
            <p className="text-4xl font-black tabular-nums text-primary">
              {total}
            </p>
          </div>

          <div className="h-10 w-px bg-base-300" aria-hidden />

          <div className="min-w-20">
            <p className="font-mono text-[10px] tracking-[0.2em] text-base-content/45">
              TEMPO
            </p>
            <p
              className={`font-mono text-3xl font-bold tabular-nums ${timeTone}`}
              aria-live="off"
            >
              {formatTime(remaining)}
            </p>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={toggleTimer}
              disabled={finished}
              className="btn btn-primary btn-sm rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none"
            >
              {ticking ? <Pause className="size-4" /> : <Play className="size-4" />}
              {ticking ? "Pausar" : finished ? "Fim" : elapsed > 0 ? "Continuar" : "Iniciar"}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Zerar cronômetro"
              title="Zerar cronômetro"
            >
              <TimerReset className="size-4" />
            </button>
            <button
              type="button"
              onClick={resetScore}
              className="btn btn-ghost btn-sm btn-square"
              aria-label="Limpar pontuação"
              title="Limpar pontuação"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-base-300">
          <div
            className={`h-full transition-all duration-1000 ${
              remaining <= 10 ? "bg-error" : remaining <= 30 ? "bg-warning" : "bg-primary"
            }`}
            style={{ width: `${(remaining / ROUND_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex flex-col gap-6">
          {/* Estratégia */}
          <section aria-labelledby="strategy-title">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="strategy-title" className="text-base font-semibold">
                Missões da estratégia
              </h2>
              <span className="font-mono text-xs text-base-content/45">
                {strategy.length} missões
              </span>
            </div>
            <div className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-2 sm:p-4 [&_.card]:mb-3 [&_.card:last-child]:mb-0">
              {strategy.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  responses={responses[mission.id]}
                  onSelect={onSelect}
                  imagesEnabled={false}
                />
              ))}
            </div>
          </section>

          {/* Fim do round */}
          <section aria-labelledby="end-title" className="flex flex-col gap-3">
            <h2 id="end-title" className="text-base font-semibold">
              Fim do round
            </h2>

            {inspectionMission && (
              <div
                id="inspection"
                className={`rounded-tl-2xl rounded-br-2xl border bg-base-100 p-4 ${
                  inspectionMissing && error ? "border-error" : "border-base-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      Inspeção de equipamentos
                      <span className="badge badge-error badge-sm">Obrigatório</span>
                    </p>
                    <p className="mt-0.5 text-xs text-base-content/55">
                      {inspectionMission.mission}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-base-content/50">
                    {inspectionPoints} pts
                  </span>
                </div>
                <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Inspeção de equipamentos">
                  {["Não", "Sim"].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      role="radio"
                      aria-checked={inspection === idx}
                      onClick={() => {
                        setInspection(idx);
                        setError(null);
                      }}
                      className={`btn btn-sm min-w-20 ${
                        inspection === idx ? "btn-primary" : "btn-outline border-base-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <LabTestModels
              total={DISCS}
              value={discsRemaining}
              onChange={setDiscsRemaining}
            />
            {precisionMission && (
              <p className="-mt-1 text-right font-mono text-xs text-base-content/50">
                Tokens de precisão: {precisionPoints} pts
              </p>
            )}

            <textarea
              rows={2}
              placeholder="Observações do round (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea w-full resize-none text-sm"
            />
          </section>
        </div>

        {/* Resumo */}
        <aside className="hidden lg:sticky lg:top-44 lg:block">
          <div className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-5">
            <p className="font-mono text-[11px] tracking-[0.2em] text-base-content/45">
              / PLACAR
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {perMission.map((m) => (
                <li key={m.id} className="flex justify-between gap-2">
                  <span className="truncate text-base-content/70">
                    <span className="font-mono text-xs text-base-content/45">{m.id}</span>{" "}
                    {m.name.toLowerCase()}
                  </span>
                  <span className="font-mono tabular-nums">{m.points}</span>
                </li>
              ))}
              <li className="flex justify-between gap-2 border-t border-base-300 pt-1.5">
                <span className="text-base-content/70">
                  <span className="font-mono text-xs text-base-content/45">EL</span>{" "}
                  inspeção
                </span>
                <span
                  className={`font-mono tabular-nums ${inspectionMissing ? "text-error" : ""}`}
                  title={inspectionMissing ? "Falta responder" : undefined}
                >
                  {inspectionMissing ? "—" : inspectionPoints}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-base-content/70">Tokens de precisão</span>
                <span className="font-mono tabular-nums">{precisionPoints}</span>
              </li>
            </ul>
            <div className="my-4 h-px bg-base-300" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-black tabular-nums text-primary">{total}</span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary mt-4 w-full rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Salvando…" : "Salvar round"}
            </button>
            {error && <p className="mt-3 text-sm text-error">{error}</p>}
          </div>
        </aside>
      </div>

      {/* Barra fixa (celular / tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className={`min-w-0 flex-1 truncate text-sm ${error ? "text-error" : ""}`}>
            {error ?? (
              <>
                Total <strong className="tabular-nums text-primary">{total}</strong> pts
              </>
            )}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar round
          </button>
        </div>
      </div>
    </div>
  );
}
