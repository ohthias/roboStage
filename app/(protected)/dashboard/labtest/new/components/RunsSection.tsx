import {
  ChevronDown,
  ChevronUp,
  GitBranch,
  Info,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  type AnyMission,
  type MissionAnswer,
  isFEMission,
} from "../Usecreatetest";

import { MissionBody } from "./LegacyMissionControls";

type Competition = {
  id: string;
  name: string;
  code?: string;
  teamName?: string | null;
  season?: string | null;
};

export function RunsSection({
  competitions,
  competition,
  setCompetition,
  selectedCompetition,
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
}: {
  competitions: Competition[];
  competition: string;
  setCompetition: (value: string) => void;
  selectedCompetition: Competition | undefined;
  selectedCompetitionConfig: { label: string } | undefined;
  isFullRun: boolean;
  missionEndpoint?: string;
  loadingMissions: boolean;
  missionsError: string | null;
  needsSeasonPick: boolean;
  season: string;
  setSeason: (value: string) => void;
  seasonOptions: Array<{
    value: string;
    label: string;
  }>;
  readyToFetchMissions: boolean;
  missions: AnyMission[];
  availableMissions: AnyMission[];
  orderedSelected: AnyMission[];
  answers: Record<string, MissionAnswer>;
  toggleMission: (id: string) => void;
  moveMission: (id: string, direction: -1 | 1) => void;
  updateAnswerValue: (missionId: string, value: number) => void;
  updateSubAnswer: (
    missionId: string,
    subId: string,
    value: number,
  ) => void;
  updateObjectiveAnswer: (
    missionId: string,
    objId: string,
    value: number,
  ) => void;
}) {
  /**
   * Future Edition não utiliza missões.
   *
   * A identificação é feita através do código/nome da competição.
   */
  const isFutureEdition =
    selectedCompetition?.code?.toLowerCase().includes("future") ||
    selectedCompetition?.name
      ?.toLowerCase()
      .includes("future edition");

  return (
    <div className="flex flex-col gap-5">
      {/* Configuração da competição */}
      <section>
        <div className="gap-5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitBranch className="size-4" />
            </div>

            <div>
              <h2 className="font-semibold">
                Configuração da competição
              </h2>

              <p className="text-sm text-base-content/60">
                Comece escolhendo a competição que será usada neste
                teste. Se houver mais de uma temporada disponível,
                selecione também a temporada desejada.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Competição */}
            <label className="form-control w-full">
              <div className="label py-1.5">
                <span className="label-text text-xs font-semibold uppercase tracking-wide">
                  Competição
                </span>
              </div>

              <select
                className="select select-bordered w-full"
                value={competition}
                onChange={(e) =>
                  setCompetition(e.target.value)
                }
              >
                <option value="">Selecione...</option>

                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.teamName
                      ? ` — ${c.teamName}`
                      : ""}
                    {c.season
                      ? ` (${c.season})`
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            {/* Temporada */}
            {needsSeasonPick && (
              <label className="form-control w-full">
                <div className="label py-1.5">
                  <span className="label-text text-xs font-semibold uppercase tracking-wide">
                    Temporada
                  </span>
                </div>

                <select
                  className="select select-bordered w-full"
                  value={season}
                  onChange={(e) =>
                    setSeason(e.target.value)
                  }
                >
                  <option value="">
                    Selecione...
                  </option>

                  {seasonOptions
                    .map((s) => (
                      <option
                        key={s.value}
                        value={s.value}
                      >
                        {s.label.toUpperCase()}
                      </option>
                    ))
                    .reverse()}
                </select>
              </label>
            )}
          </div>

          {/* Aviso Future Edition */}
          {competition && isFutureEdition && (
            <div className="alert alert-info mt-4 items-start">
              <Info className="mt-0.5 size-5 shrink-0" />

              <div className="text-sm">
                <p className="font-semibold">
                  Future Edition — configuração simplificada
                </p>

                <p className="mt-1 opacity-80">
                  A Future Edition funciona de forma semelhante às
                  competições FRC e FTC e não utiliza a configuração
                  de missões da Founders Edition.
                </p>

                <p className="mt-1 opacity-80">
                  Neste tipo de competição, o teste será vinculado
                  somente à competição e à temporada selecionadas.
                  Não é necessário configurar missões ou seus valores.
                </p>
              </div>
            </div>
          )}

          {/* Competição ainda sem implementação */}
          {competition &&
            !isFutureEdition &&
            !missionEndpoint && (
              <div className="alert alert-warning mt-4">
                <Info className="size-5 shrink-0" />

                <div className="text-sm">
                  <p className="font-medium">
                    Competição em construção!
                  </p>

                  <p className="opacity-80">
                    As missões/temporadas para{" "}
                    <code className="rounded bg-base-content/10 px-1.5 py-0.5">
                      {selectedCompetition?.code ??
                        selectedCompetition?.name}
                    </code>{" "}
                    ainda estão tomando um cafezinho nos
                    bastidores. Aguarde: em breve elas estarão
                    prontas para a ação!
                  </p>
                </div>
              </div>
            )}

          {/* Loading */}
          {!isFutureEdition && loadingMissions && (
            <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/40 p-4 text-sm">
              <span className="loading loading-spinner loading-sm text-primary" />
              <span className="text-base-content/70">
                Carregando missões...
              </span>
            </div>
          )}

          {/* Erro */}
          {!isFutureEdition && missionsError && (
            <div className="alert alert-error">
              <X className="size-5" />
              <span>{missionsError}</span>
            </div>
          )}
        </div>
      </section>

      {/* Missões */}
      {!isFutureEdition &&
        !loadingMissions &&
        readyToFetchMissions &&
        missions.length > 0 && (
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1.15fr]">
            {/* Missões disponíveis */}
            <section className="card rounded-none rounded-tl-2xl rounded-br-2xl border border-base-300 shadow-sm">
              <div className="card-body min-h-0 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      Missões disponíveis
                    </h2>

                    <p className="mt-0.5 text-xs text-base-content/50">
                      Depois de carregar as missões, selecione
                      aquelas que deseja executar nesta run.
                    </p>
                  </div>

                  <span className="badge badge-ghost">
                    {availableMissions.length}
                  </span>
                </div>

                <div className="mt-2 flex max-h-[38rem] flex-col gap-2 overflow-y-auto pr-1">
                  {availableMissions.map((m) => (
                    <label
                      key={m.id}
                      className="group flex cursor-pointer items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-3 transition hover:border-primary/40 hover:bg-base-200/50"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm mt-0.5"
                        checked={false}
                        onChange={() =>
                          toggleMission(m.id)
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-outline badge-sm font-mono">
                            {m.id}
                          </span>

                          <p className="truncate text-sm font-medium">
                            {isFEMission(m)
                              ? m.title
                              : m.name}
                          </p>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-base-content/55">
                          {isFEMission(m)
                            ? m.description
                            : m.mission}
                        </p>
                      </div>

                      <Plus className="mt-1 size-4 shrink-0 text-base-content/30 transition group-hover:text-primary" />
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Sua run */}
            <section className="card rounded-none rounded-tl-2xl rounded-br-2xl border border-primary/20 shadow-sm">
              <div className="card-body min-h-0 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ListChecks className="size-4" />
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        Sua run
                      </h2>

                      <p className="text-xs text-base-content/50">Defina a ordem de execução e, em cada missão, ative os objetivos que deseja realizar e informe o valor que pretende alcançar.</p>
                    </div>
                  </div>

                  <span className="badge badge-primary">
                    {orderedSelected.length}
                  </span>
                </div>

                <div className="mt-3 flex max-h-[38rem] flex-col gap-3 overflow-y-auto pr-1">
                  {orderedSelected.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-200/30 px-6 py-12 text-center">
                      <ListChecks className="size-8 text-base-content/20" />

                      <p className="mt-3 text-sm font-medium">
                        Nenhuma missão selecionada
                      </p>

                      <p className="mt-1 max-w-xs text-xs text-base-content/50">
                        Selecione missões na lista ao lado para
                        montar sua run.
                      </p>
                    </div>
                  )}

                  {orderedSelected.map((m, idx) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-base-300 bg-base-100 transition hover:border-base-content/20"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/30 text-xs font-bold text-primary">
                            {idx + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold">
                                {isFEMission(m)
                                  ? m.title
                                  : m.name}
                              </span>

                              <span className="badge badge-outline badge-xs font-mono">
                                {m.id}
                              </span>
                            </div>
                          </div>

                          <div className="join">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs join-item"
                              disabled={idx === 0}
                              title="Mover para cima"
                              onClick={() =>
                                moveMission(m.id, -1)
                              }
                            >
                              <ChevronUp className="size-4" />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-xs join-item"
                              disabled={
                                idx ===
                                orderedSelected.length - 1
                              }
                              title="Mover para baixo"
                              onClick={() =>
                                moveMission(m.id, 1)
                              }
                            >
                              <ChevronDown className="size-4" />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-xs join-item text-error"
                              title="Remover missão"
                              onClick={() =>
                                toggleMission(m.id)
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          {isFEMission(m) ? (
                            <div className="flex flex-col divide-y divide-base-300">
                              {m.objectives.map((o) => (
                                <div
                                  key={o.id}
                                  className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                                >
                                  <span className="text-xs font-medium">
                                    {o.label}
                                  </span>

                                  {o.type === "toggle" ? (
                                    <input
                                      type="checkbox"
                                      className="toggle toggle-primary toggle-sm"
                                      checked={
                                        !!answers[m.id]
                                          ?.objectiveAnswers?.[
                                          o.id
                                        ]
                                      }
                                      onChange={(e) =>
                                        updateObjectiveAnswer(
                                          m.id,
                                          o.id,
                                          e.target.checked
                                            ? 1
                                            : 0,
                                        )
                                      }
                                    />
                                  ) : (
                                    <input
                                      type="number"
                                      min={o.min ?? 0}
                                      max={o.max}
                                      className="input input-bordered input-sm w-24 bg-base-100 text-right"
                                      value={
                                        answers[m.id]
                                          ?.objectiveAnswers?.[
                                          o.id
                                        ] ??
                                        o.min ??
                                        0
                                      }
                                      onChange={(e) =>
                                        updateObjectiveAnswer(
                                          m.id,
                                          o.id,
                                          Number(
                                            e.target.value,
                                          ),
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
                              value={
                                answers[m.id]?.value ?? 0
                              }
                              subAnswers={
                                answers[m.id]?.subAnswers ?? {}
                              }
                              onChange={(v) =>
                                updateAnswerValue(m.id, v)
                              }
                              onSubChange={(subId, v) =>
                                updateSubAnswer(
                                  m.id,
                                  subId,
                                  v,
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

      {/* Nenhuma missão */}
      {!isFutureEdition &&
        !loadingMissions &&
        readyToFetchMissions &&
        missions.length === 0 &&
        !missionsError && (
          <div className="rounded-xl border border-dashed border-base-300 bg-base-200/30 p-8 text-center">
            <ListChecks className="mx-auto size-8 text-base-content/20" />

            <p className="mt-3 text-sm font-medium">
              Nenhuma missão encontrada
            </p>

            <p className="mt-1 text-xs text-base-content/50">
              Não existem missões disponíveis para esta
              temporada.
            </p>
          </div>
        )}
    </div>
  );
}