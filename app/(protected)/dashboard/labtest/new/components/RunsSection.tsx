import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ListChecks,
  Plus,
  Search,
  Timer,
  X,
} from "lucide-react";

import {
  type AnyMission,
  type MissionAnswer,
  type RunModeConfig,
  isFEMission,
} from "../Usecreatetest";

import { MissionBody } from "./LegacyMissionControls";
import { FieldLabel, Note, Segmented } from "./FormBits";
import { ObrRoundSetup } from "./ObrRoundSetup";
import type { Project } from "@/utils/quickbrick/ArenaBuilder/types";

type Competition = {
  id: string;
  name: string;
  code?: string;
  teamName?: string | null;
  season?: string | null;
};

const missionTitle = (m: AnyMission) => (isFEMission(m) ? m.title : m.name);
const missionText = (m: AnyMission) =>
  isFEMission(m) ? m.description : m.mission;

export function RunsSection({
  competitions,
  competition,
  setCompetition,
  selectedCompetition,
  runModes,
  runMode,
  setRunMode,
  requiredMissionIds = [],
  isFullRun,
  missionEndpoint,
  loadingMissions,
  missionsError,
  needsSeasonPick,
  season,
  setSeason,
  seasonOptions,
  readyToFetchMissions,
  missions,
  availableMissions,
  orderedSelected,
  answers,
  toggleMission,
  moveMission,
  updateAnswerValue,
  updateSubAnswer,
  updateObjectiveAnswer,
  matchDuration,
  setMatchDuration,
  isObr = false,
  arena = null,
  setArena,
}: {
  isObr?: boolean;
  arena?: Project | null;
  setArena?: (arena: Project | null) => void;
  matchDuration: number;
  setMatchDuration: (value: number) => void;
  competitions: Competition[];
  competition: string;
  setCompetition: (value: string) => void;
  selectedCompetition: Competition | undefined;
  selectedCompetitionConfig: { label: string } | undefined;
  runModes: RunModeConfig[];
  runMode: string;
  requiredMissionIds?: string[];
  setRunMode: (value: string) => void;
  isFullRun: boolean;
  missionEndpoint?: string;
  loadingMissions: boolean;
  missionsError: string | null;
  needsSeasonPick: boolean;
  season: string;
  setSeason: (value: string) => void;
  seasonOptions: Array<{ value: string; label: string }>;
  readyToFetchMissions: boolean;
  missions: AnyMission[];
  availableMissions: AnyMission[];
  orderedSelected: AnyMission[];
  answers: Record<string, MissionAnswer>;
  toggleMission: (id: string) => void;
  moveMission: (id: string, direction: -1 | 1) => void;
  updateAnswerValue: (missionId: string, value: number) => void;
  updateSubAnswer: (missionId: string, subId: string, value: number) => void;
  updateObjectiveAnswer: (
    missionId: string,
    objId: string,
    value: number,
  ) => void;
}) {
  const [query, setQuery] = useState("");

  // Future Edition não usa missões; identificada pelo código/nome.
  const isFutureEdition =
    selectedCompetition?.code?.toLowerCase().includes("future") ||
    selectedCompetition?.name?.toLowerCase().includes("future edition");

  const strategyOnly = Boolean(
    runModes.find((m) => m.value === runMode)?.strategyOnly,
  );

  const lockedCount = orderedSelected.filter((m) =>
    requiredMissionIds.includes(m.id),
  ).length;
  const chosenCount = orderedSelected.length - lockedCount;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? availableMissions.filter((m) =>
        `${m.id} ${missionTitle(m)} ${missionText(m)}`
          .toLowerCase()
          .includes(q),
      )
    : availableMissions;

  const showPicker =
    !isFutureEdition &&
    !loadingMissions &&
    readyToFetchMissions &&
    missions.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Competição e temporada */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="competition">Competição</FieldLabel>
          <select
            id="competition"
            className="select w-full"
            value={competition}
            onChange={(e) => {
              setQuery("");
              setCompetition(e.target.value);
            }}
          >
            <option value="">Selecione…</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.teamName ? ` — ${c.teamName}` : ""}
                {c.season ? ` (${c.season})` : ""}
              </option>
            ))}
          </select>
        </div>

        {needsSeasonPick && (
          <div>
            <FieldLabel htmlFor="season">Temporada</FieldLabel>
            <select
              id="season"
              className="select w-full"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="">Selecione…</option>
              {[...seasonOptions].reverse().map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Modo dentro da competição */}
      {competition && runModes.length > 1 && (
        <div>
          <FieldLabel>Modo</FieldLabel>
          <Segmented
            label="Modo da run"
            value={runMode}
            options={runModes}
            onChange={(v) => {
              setQuery("");
              setRunMode(v);
            }}
          />
          <p className="mt-2 text-xs text-base-content/50">
            {runModes.find((m) => m.value === runMode)?.description}
          </p>
        </div>
      )}

      {/* Future Edition: partida cronometrada */}
      {competition && isFutureEdition && (
        <div className="rounded-tl-2xl rounded-br-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Timer className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">Future Edition · partida cronometrada</p>
              <p className="mt-1 text-base-content/65">
                Todas as missões e a tabela de penalidades da temporada já vêm
                prontas. Na execução você inicia o cronômetro, pontua durante a
                partida e recebe a soma final e a análise em gráficos.
              </p>
            </div>
          </div>

          <div className="mt-4 max-w-56">
            <FieldLabel htmlFor="match-duration">Duração da partida</FieldLabel>
            <label className="input w-full">
              <input
                id="match-duration"
                type="number"
                min={30}
                max={600}
                step={5}
                className="grow"
                value={matchDuration}
                onChange={(e) =>
                  setMatchDuration(
                    Math.min(600, Math.max(30, Number(e.target.value) || 150)),
                  )
                }
              />
              <span className="text-xs text-base-content/45">segundos</span>
            </label>
            <p className="mt-1.5 text-xs text-base-content/50">
              Padrão: 150 s (2:30). Mude se sua liga usar outro tempo.
            </p>
          </div>

          {missions.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Missões da partida">
              {missions.map((m) => (
                <li
                  key={m.id}
                  className="rounded-tl-md rounded-br-md border border-base-300 bg-base-100 px-2 py-1 text-xs"
                >
                  <span className="font-mono text-base-content/50">
                    {isFEMission(m) ? m.code : m.id}
                  </span>{" "}
                  {missionTitle(m)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* OBR Resgate: rodada pontuada como no Pontuador */}
      {competition && isObr && setArena && (
        <ObrRoundSetup arena={arena} setArena={setArena} />
      )}

      {competition && !isFutureEdition && !isObr && !missionEndpoint && (
        <Note tone="warning">
          As missões de{" "}
          <code className="font-mono text-xs">
            {selectedCompetition?.code ?? selectedCompetition?.name}
          </code>{" "}
          ainda estão sendo preparadas. Em breve estarão disponíveis.
        </Note>
      )}

      {!isFutureEdition && loadingMissions && (
        <p className="flex items-center gap-2 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-xs text-primary" />
          Carregando missões…
        </p>
      )}

      {!isFutureEdition && missionsError && (
        <Note tone="error">{missionsError}</Note>
      )}

      {!isFutureEdition &&
        !loadingMissions &&
        readyToFetchMissions &&
        missions.length === 0 &&
        !missionsError && (
          <Note>Não há missões cadastradas para esta temporada.</Note>
        )}

      {showPicker && (
        <div className="flex flex-col gap-6">
          {/* Missões disponíveis */}
          <section aria-labelledby="available-title" className="min-w-0">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 id="available-title" className="text-sm font-medium">
                Missões
              </h3>
              <span className="font-mono text-xs text-base-content/45">
                {availableMissions.length} disponíveis
              </span>
            </div>

            <label className="input input-sm mb-2 w-full">
              <Search className="size-3.5 text-base-content/40" />
              <input
                type="search"
                className="grow"
                placeholder="Buscar missão"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <ul className="max-h-[20rem] divide-y divide-base-300 overflow-y-auto rounded-tl-xl rounded-br-xl border border-base-300">
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggleMission(m.id)}
                    className="group flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-base-200/60 focus-visible:bg-base-200/60 focus-visible:outline-none"
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] text-base-content/45">
                      {m.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {missionTitle(m)}
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-xs text-base-content/50">
                        {missionText(m)}
                      </span>
                    </span>
                    <Plus
                      className="mt-0.5 size-4 shrink-0 text-base-content/30 transition-colors group-hover:text-primary"
                      aria-label="Adicionar"
                    />
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-base-content/45">
                  {availableMissions.length === 0
                    ? "Todas as missões já estão na run."
                    : "Nenhuma missão encontrada."}
                </li>
              )}
            </ul>
          </section>

          {/* Sua run */}
          <section aria-labelledby="run-title" className="min-w-0">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 id="run-title" className="text-sm font-medium">
                {strategyOnly ? "Sua estratégia" : "Sua run"}
              </h3>
              <span className="font-mono text-xs text-base-content/45">
                {chosenCount} na ordem
              </span>
            </div>
            {strategyOnly && (
              <p className="mb-2 text-xs text-base-content/50">
                Coloque todas as missões que o robô faz no round, na ordem das
                saídas. Você pontua em cada execução.
              </p>
            )}
            {isFullRun && orderedSelected.length > 0 && (
              <p className="mb-2 text-xs text-base-content/50">
                Ordem da temporada. Use as setas para mudar.
              </p>
            )}

            {chosenCount === 0 && lockedCount === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-tl-xl rounded-br-xl border border-dashed border-base-300 px-6 py-12 text-center">
                <ListChecks className="size-6 text-base-content/25" />
                <p className="mt-2 text-sm text-base-content/55">
                  Clique numa missão para adicionar.
                </p>
              </div>
            ) : (
              <>
                <ol className="flex flex-col gap-2">
                  {orderedSelected.map((m, idx) => {
                    const locked = requiredMissionIds.includes(m.id);
                    const pos = idx - lockedCount; // posição entre as escolhidas
                    return (
                      <li
                        key={m.id}
                        className={`rounded-tl-xl rounded-br-xl border p-3 ${
                          locked
                            ? "border-dashed border-base-300 bg-base-200/40"
                            : "border-base-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-tl-md rounded-br-md bg-primary/15 font-mono text-[11px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-sm font-medium">
                            {missionTitle(m)}{" "}
                            <span className="font-mono text-[11px] font-normal text-base-content/40">
                              {m.id}
                            </span>
                          </p>
                          {locked ? (
                            <span
                              className="badge badge-sm shrink-0 border-primary/30 bg-primary/10 text-primary"
                              title="Faz parte de todo round e não pode ser removida."
                            >
                              Obrigatória
                            </span>
                          ) : (
                            <div className="flex shrink-0">
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-square"
                                disabled={pos === 0}
                                aria-label={`Subir ${m.id}`}
                                onClick={() => moveMission(m.id, -1)}
                              >
                                <ChevronUp className="size-4" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-square"
                                disabled={idx === orderedSelected.length - 1}
                                aria-label={`Descer ${m.id}`}
                                onClick={() => moveMission(m.id, 1)}
                              >
                                <ChevronDown className="size-4" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-square text-base-content/45 hover:text-error"
                                aria-label={`Remover ${m.id}`}
                                onClick={() => toggleMission(m.id)}
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!strategyOnly && (
                          <div className="mt-3 pl-9">
                            {isFEMission(m) ? (
                              <div className="flex flex-col divide-y divide-base-300">
                                {m.objectives.map((o) => (
                                  <div
                                    key={o.id}
                                    className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                                  >
                                    <span className="text-xs text-base-content/75">
                                      {o.label}
                                    </span>
                                    {o.type === "toggle" ? (
                                      <input
                                        type="checkbox"
                                        className="toggle toggle-primary toggle-sm"
                                        aria-label={o.label}
                                        checked={
                                          !!answers[m.id]?.objectiveAnswers?.[
                                            o.id
                                          ]
                                        }
                                        onChange={(e) =>
                                          updateObjectiveAnswer(
                                            m.id,
                                            o.id,
                                            e.target.checked ? 1 : 0,
                                          )
                                        }
                                      />
                                    ) : (
                                      <input
                                        type="number"
                                        min={o.min ?? 0}
                                        max={o.max}
                                        aria-label={o.label}
                                        className="input input-sm w-20 text-right"
                                        value={
                                          answers[m.id]?.objectiveAnswers?.[
                                            o.id
                                          ] ??
                                          o.min ??
                                          0
                                        }
                                        onChange={(e) =>
                                          updateObjectiveAnswer(
                                            m.id,
                                            o.id,
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <MissionBody
                                mission={m}
                                value={answers[m.id]?.value ?? 0}
                                subAnswers={answers[m.id]?.subAnswers ?? {}}
                                onChange={(v) => updateAnswerValue(m.id, v)}
                                onSubChange={(subId, v) =>
                                  updateSubAnswer(m.id, subId, v)
                                }
                              />
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {chosenCount === 0 && (
                  <p className="mt-2 rounded-tl-xl rounded-br-xl border border-dashed border-base-300 px-4 py-6 text-center text-sm text-base-content/55">
                    Clique numa missão para adicionar.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
