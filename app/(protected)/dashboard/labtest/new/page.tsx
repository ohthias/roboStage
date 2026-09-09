"use client";

import { useState, useTransition } from "react";
import {
  useCreateTest,
  isFEMission,
  CALIBRA_OPTIONS,
  GIRO_ANALYSIS_OPTIONS,
  PID_PARAM_OPTIONS,
  CUSTOM_PARAM_TYPES,
  type LegacyType,
  type LegacyMission,
} from "./Usecreatetest";
import { createTest, type CreateTestInput } from "./actions"; // ajuste o caminho para onde ficou testActions.ts
import {
  ChevronDown, ChevronUp, Copy, Gauge, GitBranch, Info, ListChecks, Play, Plus, Save, Settings2, SlidersHorizontal, Trash2, X, Zap, ListTree, Target, CheckCircle2, CircleDot, Loader2,} from "lucide-react";

type CustomParamMeta = { required: boolean; description: string };

export default function CreateTest() {
  const t = useCreateTest();

  // ---------------------------------------------------------------------
  // Campos do teste (name/description) — não existiam no form original,
  // mas são obrigatórios/úteis na tabela `tests`.
  // ---------------------------------------------------------------------
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [customMeta, setCustomMeta] = useState<Record<string, CustomParamMeta>>(
    {},
  );

  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  function updateCustomMeta(id: string, patch: Partial<CustomParamMeta>) {
    setCustomMeta((prev) => ({
      ...prev,
      [id]: {
        required: prev[id]?.required ?? false,
        description: prev[id]?.description ?? "",
        ...patch,
      },
    }));
  }

  // ---------------------------------------------------------------------
  // Monta o payload esperado pela action `createTest`, validando o
  // mínimo necessário para cada modo antes de enviar.
  // ---------------------------------------------------------------------
  function buildPayload(): CreateTestInput | null {
    if (!testName.trim()) {
      setSaveError("Informe um nome para o teste.");
      return null;
    }

    const base = {
      name: testName.trim(),
      description: testDescription.trim() || undefined,
    };

    if (t.mode === "runs") {
      if (!t.competition) {
        setSaveError("Selecione uma competição.");
        return null;
      }

      if (t.orderedSelected.length === 0) {
        setSaveError("Selecione ao menos uma missão para a run.");
        return null;
      }

      return {
        ...base,
        mode: "runs",
        competitionId: t.competition,
        season: t.season || null,
        missionOrder: t.orderedSelected.map((m) => m.id),
        answers: t.answers,
      };
    }

    if (t.mode === "calibrabot") {
      if (t.calibraMode === "motores") {
        if (t.motors.length === 0) {
          setSaveError("Adicione ao menos um motor.");
          return null;
        }

        return {
          ...base,
          mode: "calibrabot",
          calibraMode: "motores",
          motores: t.motors,
          motorTestType: t.motorTestType,
        };
      }

      if (t.calibraMode === "giroscópio") {
        if (t.giroAnalysis.length === 0) {
          setSaveError("Selecione ao menos um indicador.");
          return null;
        }

        return {
          ...base,
          mode: "calibrabot",
          calibraMode: "giroscópio",
          giroAngle: t.giroAngle,
          giroAnalysis: t.giroAnalysis,
        };
      }

      // pid
      if (t.pidParams.length === 0) {
        setSaveError("Selecione ao menos um parâmetro do PID.");
        return null;
      }

      return {
        ...base,
        mode: "calibrabot",
        calibraMode: "pid",
        pidDistance: t.pidDistance,
        pidParams: t.pidParams,
      };
    }

    // custom
    if (t.customParams.length === 0) {
      setSaveError("Adicione ao menos um parâmetro.");
      return null;
    }

    if (t.customParams.some((p) => !p.name.trim())) {
      setSaveError("Todo parâmetro precisa de um nome.");
      return null;
    }

    return {
      ...base,
      mode: "custom",
      params: t.customParams.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        min: p.min,
        max: p.max,
        required: customMeta[p.id]?.required ?? false,
        description: customMeta[p.id]?.description ?? "",
      })),
    };
  }

  function handleSave() {
    setSaveError(null);
    setSaveSuccess(null);

    const payload = buildPayload();
    if (!payload) return;

    startSaving(async () => {
      try {
        const created = await createTest(payload);
        setSaveSuccess(`Teste "${created.name}" salvo com sucesso.`);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Erro ao salvar o teste.",
        );
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings2 className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Criar teste</h1>
            <p className="text-sm text-base-content/60">
              Configure os parâmetros e gere uma nova rotina de testes.
            </p>
          </div>
        </div>
      </header>

      {/* Mode selector */}
      <section className="rounded-2xl border border-base-300 bg-base-100 p-2 shadow-sm">
        <div
          role="tablist"
          className="tabs tabs-boxed grid w-full grid-cols-3 bg-base-200/60 p-1 md:w-fit"
        >
          <button
            type="button"
            role="tab"
            className={`tab gap-2 px-5 ${
              t.mode === "runs" ? "tab-active bg-base-100 shadow-sm" : ""
            }`}
            onClick={() => t.setMode("runs")}
          >
            <ListChecks className="size-4" />
            Runs
          </button>

          <button
            type="button"
            role="tab"
            className={`tab gap-2 px-5 ${
              t.mode === "calibrabot" ? "tab-active bg-base-100 shadow-sm" : ""
            }`}
            onClick={() => t.setMode("calibrabot")}
          >
            <Gauge className="size-4" />
            Calibrabot
          </button>

          <button
            type="button"
            role="tab"
            className={`tab gap-2 px-5 ${
              t.mode === "custom" ? "tab-active bg-base-100 shadow-sm" : ""
            }`}
            onClick={() => t.setMode("custom")}
          >
            <SlidersHorizontal className="size-4" />
            Customizado
          </button>
        </div>
      </section>

      {/* ========================================================== */}
      {/* RUNS */}
      {/* ========================================================== */}
      {t.mode === "runs" && (
        <div className="flex flex-col gap-5">
          {/* Competition */}
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GitBranch className="size-4" />
                </div>

                <div>
                  <h2 className="font-semibold">Configuração da competição</h2>
                  <p className="text-sm text-base-content/60">
                    Selecione a competição e, quando necessário, a temporada.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <label className="form-control w-full">
                  <div className="label py-1.5">
                    <span className="label-text text-xs font-semibold uppercase tracking-wide">
                      Competição
                    </span>
                  </div>

                  <select
                    className="select select-bordered w-full"
                    value={t.competition}
                    onChange={(e) => t.setCompetition(e.target.value)}
                  >
                    <option value="">Selecione...</option>

                    {t.competitions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.teamName ? ` — ${c.teamName}` : ""}
                        {c.season ? ` (${c.season})` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {t.needsSeasonPick && (
                  <label className="form-control w-full">
                    <div className="label py-1.5">
                      <span className="label-text text-xs font-semibold uppercase tracking-wide">
                        Temporada
                      </span>
                    </div>

                    <select
                      className="select select-bordered w-full"
                      value={t.season}
                      onChange={(e) => t.setSeason(e.target.value)}
                    >
                      <option value="">Selecione...</option>

                      {t.seasonOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {t.competition && !t.missionEndpoint && (
                <div className="alert alert-warning">
                  <Info className="size-5 shrink-0" />

                  <div className="text-sm">
                    <p className="font-medium">
                      Conjunto de missões indisponível
                    </p>

                    <p className="opacity-80">
                      Nenhum conjunto de missões está configurado para o código{" "}
                      <code className="rounded bg-base-content/10 px-1.5 py-0.5">
                        {t.selectedCompetition?.code}
                      </code>
                      .
                    </p>
                  </div>
                </div>
              )}

              {t.loadingMissions && (
                <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/40 p-4 text-sm">
                  <span className="loading loading-spinner loading-sm text-primary" />
                  <span className="text-base-content/70">
                    Carregando missões...
                  </span>
                </div>
              )}

              {t.missionsError && (
                <div className="alert alert-error">
                  <X className="size-5" />
                  <span>{t.missionsError}</span>
                </div>
              )}
            </div>
          </section>

          {/* Missions */}
          {!t.loadingMissions &&
            t.readyToFetchMissions &&
            t.missions.length > 0 && (
              <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
                {/* Available */}
                <section className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body min-h-0 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">Missões disponíveis</h2>
                        <p className="mt-0.5 text-xs text-base-content/50">
                          Selecione as missões que farão parte da run.
                        </p>
                      </div>

                      <span className="badge badge-ghost">
                        {t.availableMissions.length}
                      </span>
                    </div>

                    <div className="mt-2 flex max-h-[38rem] flex-col gap-2 overflow-y-auto pr-1">
                      {t.availableMissions.map((m) => (
                        <label
                          key={m.id}
                          className="group flex cursor-pointer items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-3 transition hover:border-primary/40 hover:bg-base-200/50"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm mt-0.5"
                            checked={false}
                            onChange={() => t.toggleMission(m.id)}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="badge badge-outline badge-sm font-mono">
                                {m.id}
                              </span>

                              <p className="truncate text-sm font-medium">
                                {isFEMission(m) ? m.title : m.name}
                              </p>
                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-base-content/55">
                              {isFEMission(m) ? m.description : m.mission}
                            </p>
                          </div>

                          <Plus className="mt-1 size-4 shrink-0 text-base-content/30 transition group-hover:text-primary" />
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Selected */}
                <section className="card border border-primary/20 bg-base-100 shadow-sm">
                  <div className="card-body min-h-0 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ListChecks className="size-4" />
                        </div>

                        <div>
                          <h2 className="font-semibold">Sua run</h2>
                          <p className="text-xs text-base-content/50">
                            Ordem de execução das missões
                          </p>
                        </div>
                      </div>

                      <span className="badge badge-primary">
                        {t.orderedSelected.length}
                      </span>
                    </div>

                    <div className="mt-3 flex max-h-[38rem] flex-col gap-3 overflow-y-auto pr-1">
                      {t.orderedSelected.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-200/30 px-6 py-12 text-center">
                          <ListChecks className="size-8 text-base-content/20" />

                          <p className="mt-3 text-sm font-medium">
                            Nenhuma missão selecionada
                          </p>

                          <p className="mt-1 max-w-xs text-xs text-base-content/50">
                            Selecione missões na lista ao lado para montar sua
                            run.
                          </p>
                        </div>
                      )}

                      {t.orderedSelected.map((m, idx) => (
                        <div
                          key={m.id}
                          className="rounded-xl border border-base-300 bg-base-100 transition hover:border-base-content/20"
                        >
                          <div className="p-4">
                            {/* Mission header */}
                            <div className="flex items-start gap-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-content">
                                {idx + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="badge badge-outline badge-sm font-mono">
                                    {m.id}
                                  </span>

                                  <span className="text-sm font-semibold">
                                    {isFEMission(m) ? m.title : m.name}
                                  </span>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="join">
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs join-item"
                                  disabled={idx === 0}
                                  title="Mover para cima"
                                  onClick={() => t.moveMission(m.id, -1)}
                                >
                                  <ChevronUp className="size-4" />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs join-item"
                                  disabled={
                                    idx === t.orderedSelected.length - 1
                                  }
                                  title="Mover para baixo"
                                  onClick={() => t.moveMission(m.id, 1)}
                                >
                                  <ChevronDown className="size-4" />
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs join-item text-error"
                                  title="Remover missão"
                                  onClick={() => t.toggleMission(m.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Mission controls */}
                            <div className="mt-4 rounded-lg bg-base-200/50 p-3">
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
                                            !!t.answers[m.id]
                                              ?.objectiveAnswers?.[o.id]
                                          }
                                          onChange={(e) =>
                                            t.updateObjectiveAnswer(
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
                                          className="input input-bordered input-sm w-24 bg-base-100 text-right"
                                          value={
                                            t.answers[m.id]?.objectiveAnswers?.[
                                              o.id
                                            ] ??
                                            o.min ??
                                            0
                                          }
                                          onChange={(e) =>
                                            t.updateObjectiveAnswer(
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
                                <LegacyMissionControls
                                  mission={m}
                                  value={t.answers[m.id]?.value ?? 0}
                                  subAnswers={t.answers[m.id]?.subAnswers ?? {}}
                                  onChange={(v) => t.updateAnswerValue(m.id, v)}
                                  onSubChange={(subId, v) =>
                                    t.updateSubAnswer(m.id, subId, v)
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

          {!t.loadingMissions &&
            t.readyToFetchMissions &&
            t.missions.length === 0 &&
            !t.missionsError && (
              <div className="rounded-xl border border-dashed border-base-300 bg-base-200/30 p-8 text-center">
                <ListChecks className="mx-auto size-8 text-base-content/20" />
                <p className="mt-3 text-sm font-medium">
                  Nenhuma missão encontrada
                </p>
                <p className="mt-1 text-xs text-base-content/50">
                  Não existem missões disponíveis para esta temporada.
                </p>
              </div>
            )}
        </div>
      )}

      {/* ========================================================== */}
      {/* CALIBRABOT */}
      {/* ========================================================== */}
      {t.mode === "calibrabot" && (
        <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
          {/* Sidebar */}
          <section className="card h-fit border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="size-4" />
                </div>

                <div>
                  <h2 className="font-semibold">Calibrabot</h2>
                  <p className="text-xs text-base-content/50">
                    Tipo de calibração
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {CALIBRA_OPTIONS.map((o) => {
                  const active = t.calibraMode === o.value;

                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() =>
                        t.setCalibraMode(o.value as typeof t.calibraMode)
                      }
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-primary text-primary-content shadow-sm"
                          : "hover:bg-base-200"
                      }`}
                    >
                      <Gauge className="size-4" />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5 md:p-6">
              {t.calibraMode === "motores" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Settings2 className="size-5" />
                      </div>

                      <div>
                        <h2 className="font-semibold">Teste de motores</h2>
                        <p className="text-sm text-base-content/60">
                          Configure os motores que serão avaliados.
                        </p>
                      </div>
                    </div>

                    <div className="alert mt-4 border border-info/20 bg-info/10 text-info">
                      <Info className="size-5 shrink-0" />
                      <p className="text-sm">
                        No modo <strong>individual</strong>, cada motor é
                        testado separadamente. Em <strong>duplas</strong>, todas
                        as combinações possíveis serão geradas.
                      </p>
                    </div>
                  </div>

                  <div className="flex max-w-xl gap-2">
                    <input
                      type="text"
                      placeholder="ex: motor_esquerdo"
                      className="input input-bordered input-sm flex-1"
                      value={t.motorInput}
                      onChange={(e) => t.setMotorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          t.addMotor();
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={t.addMotor}
                    >
                      <Plus className="size-4" />
                      Adicionar
                    </button>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Motores adicionados
                    </p>

                    <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-dashed border-base-300 p-3">
                      {t.motors.map((m) => (
                        <span
                          key={m}
                          className="badge badge-outline h-8 gap-2 px-3"
                        >
                          {m}

                          <button
                            type="button"
                            className="hover:text-error"
                            onClick={() => t.removeMotor(m)}
                            title={`Remover ${m}`}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}

                      {t.motors.length === 0 && (
                        <span className="self-center text-xs text-base-content/40">
                          Nenhum motor adicionado.
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Estratégia de teste
                    </p>

                    <div className="join">
                      <input
                        type="radio"
                        name="motorTestType"
                        aria-label="Individual"
                        className="join-item btn btn-sm"
                        checked={t.motorTestType === "individual"}
                        onChange={() => t.setMotorTestType("individual")}
                      />

                      <input
                        type="radio"
                        name="motorTestType"
                        aria-label="Duplas"
                        className="join-item btn btn-sm"
                        checked={t.motorTestType === "duplas"}
                        onChange={() => t.setMotorTestType("duplas")}
                      />
                    </div>
                  </div>

                  {t.motorTestType === "duplas" && t.motors.length >= 2 && (
                    <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          Combinações geradas
                        </p>

                        <span className="badge badge-primary">
                          {t.motorPairs().length}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.motorPairs().map(([a, b]) => (
                          <span
                            key={`${a}-${b}`}
                            className="badge badge-ghost gap-1.5 py-3"
                          >
                            {a}
                            <Plus className="size-3" />
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {t.calibraMode === "giroscópio" && (
                <div className="flex max-w-2xl flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Gauge className="size-5" />
                      </div>

                      <div>
                        <h2 className="font-semibold">Teste de giroscópio</h2>
                        <p className="text-sm text-base-content/60">
                          Configure o ângulo e os indicadores que deseja
                          analisar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="form-control">
                      <div className="label py-1.5">
                        <span className="label-text text-xs font-semibold uppercase tracking-wide">
                          Ângulo alvo
                        </span>
                      </div>

                      <div className="join">
                        <input
                          type="number"
                          className="input input-bordered join-item w-full"
                          value={t.giroAngle}
                          onChange={(e) =>
                            t.setGiroAngle(Number(e.target.value))
                          }
                        />

                        <span className="btn btn-disabled join-item">°</span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Indicadores
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {GIRO_ANALYSIS_OPTIONS.map((o) => (
                        <label
                          key={o.value}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3 hover:bg-base-200"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={t.giroAnalysis.includes(o.value)}
                            onChange={() => t.toggleGiroAnalysis(o.value)}
                          />

                          <span className="text-sm">{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {t.calibraMode === "pid" && (
                <div className="flex max-w-3xl flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <SlidersHorizontal className="size-5" />
                      </div>

                      <div>
                        <h2 className="font-semibold">Teste PID</h2>
                        <p className="text-sm text-base-content/60">
                          Configure a distância e os parâmetros utilizados pelo
                          controlador.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-info/20 bg-info/10 p-4 text-sm text-info">
                    O PID mantém o robô andando reto. Com base na distância
                    alvo, o sistema gera testes usando os parâmetros
                    selecionados.
                  </div>

                  <label className="form-control max-w-xs">
                    <div className="label py-1.5">
                      <span className="label-text text-xs font-semibold uppercase tracking-wide">
                        Distância alvo
                      </span>
                    </div>

                    <div className="join">
                      <input
                        type="number"
                        className="input input-bordered join-item w-full"
                        value={t.pidDistance}
                        onChange={(e) =>
                          t.setPidDistance(Number(e.target.value))
                        }
                      />

                      <span className="btn btn-disabled join-item">cm</span>
                    </div>
                  </label>

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Parâmetros
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {PID_PARAM_OPTIONS.map((p) => (
                        <label
                          key={p}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3 hover:bg-base-200"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={t.pidParams.includes(p)}
                            onChange={() => t.togglePidParam(p)}
                          />

                          <span className="font-mono text-xs">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================== */}
      {/* CUSTOM */}
      {/* ========================================================== */}
      {t.mode === "custom" && (
        <section className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SlidersHorizontal className="size-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Teste customizado</h2>
                  <p className="text-sm text-base-content/60">
                    Defina os parâmetros que serão utilizados no teste.
                  </p>
                </div>
              </div>

              <span className="badge badge-neutral">
                {t.customParams.length} parâmetros
              </span>
            </div>

            <div className="alert mt-4 bg-base-200/60">
              <Info className="size-4 shrink-0" />

              <p className="text-xs text-base-content/70">
                Cada parâmetro pode possuir um tipo diferente. Parâmetros
                numéricos permitem definir limites mínimo e máximo.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {t.customParams.map((p, index) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-base-300 bg-base-100 p-4 transition hover:border-base-content/20"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary badge-sm">
                        {index + 1}
                      </span>

                      <span className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                        Parâmetro
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => t.removeCustomParam(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Remover
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_0.7fr_0.7fr]">
                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text text-xs">Nome</span>
                      </div>

                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={p.name}
                        placeholder="ex: velocidade"
                        onChange={(e) =>
                          t.updateCustomParam(p.id, {
                            name: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text text-xs">Tipo</span>
                      </div>

                      <select
                        className="select select-bordered select-sm"
                        value={p.type}
                        onChange={(e) =>
                          t.updateCustomParam(p.id, {
                            type: e.target.value,
                          })
                        }
                      >
                        {CUSTOM_PARAM_TYPES.map((tp) => (
                          <option key={tp.value} value={tp.value}>
                            {tp.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {p.type === "number" && (
                      <>
                        <label className="form-control">
                          <div className="label py-1">
                            <span className="label-text text-xs">Mínimo</span>
                          </div>

                          <input
                            type="number"
                            className="input input-bordered input-sm"
                            value={p.min ?? 0}
                            onChange={(e) =>
                              t.updateCustomParam(p.id, {
                                min: Number(e.target.value),
                              })
                            }
                          />
                        </label>

                        <label className="form-control">
                          <div className="label py-1">
                            <span className="label-text text-xs">Máximo</span>
                          </div>

                          <input
                            type="number"
                            className="input input-bordered input-sm"
                            value={p.max ?? 100}
                            onChange={(e) =>
                              t.updateCustomParam(p.id, {
                                max: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>

                  {/* Metadados extras: descrição e obrigatoriedade do parâmetro */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text text-xs">
                          Descrição (opcional)
                        </span>
                      </div>

                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={customMeta[p.id]?.description ?? ""}
                        placeholder="ex: velocidade do motor durante o teste"
                        onChange={(e) =>
                          updateCustomMeta(p.id, {
                            description: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 self-end pb-1.5">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={customMeta[p.id]?.required ?? false}
                        onChange={(e) =>
                          updateCustomMeta(p.id, {
                            required: e.target.checked,
                          })
                        }
                      />
                      <span className="text-xs">Obrigatório</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm mt-2 w-fit"
              onClick={t.addCustomParam}
            >
              <Plus className="size-4" />
              Adicionar parâmetro
            </button>
          </div>
        </section>
      )}

      {/* ========================================================== */}
      {/* DETALHES DO TESTE (nome/descrição) */}
      {/* ========================================================== */}
      <section className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Info className="size-4" />
            </div>

            <div>
              <h2 className="font-semibold">Detalhes do teste</h2>
              <p className="text-sm text-base-content/60">
                Nome e descrição que identificam este teste.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="form-control w-full">
              <div className="label py-1.5">
                <span className="label-text text-xs font-semibold uppercase tracking-wide">
                  Nome do teste *
                </span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="ex: Run completa - qualificatória"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </label>

            <label className="form-control w-full">
              <div className="label py-1.5">
                <span className="label-text text-xs font-semibold uppercase tracking-wide">
                  Descrição (opcional)
                </span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="ex: Testes antes da competição regional"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* GENERATE / SAVE */}
      {/* ========================================================== */}
      <section className="card border border-primary/20 bg-base-100 shadow-sm">
        <div className="card-body p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-content">
                <Play className="size-5" />
              </div>

              <div>
                <h2 className="font-semibold">Gerar teste</h2>
                <p className="text-xs text-base-content/50">
                  Revise as configurações, confira o payload e salve no banco.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={t.handleGenerate}
              >
                <Play className="size-4" />
                Pré-visualizar
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Salvar teste
              </button>
            </div>
          </div>

          {saveError && (
            <div className="alert alert-error mt-4">
              <X className="size-5" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="alert alert-success mt-4">
              <CheckCircle2 className="size-5" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {t.generated && (
            <div className="mt-4 overflow-hidden rounded-xl border border-base-300 bg-base-200">
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-success" />
                  <span className="font-mono text-xs text-base-content/60">
                    generated.json
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={t.copyGenerated}
                >
                  <Copy className="size-3.5" />
                  {t.copyLabel}
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  <code>{JSON.stringify(t.generated, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Controles para missões no formato "legado"                          */
/* ------------------------------------------------------------------ */

function LegacyMissionControls({
  mission,
  value,
  subAnswers,
  onChange,
  onSubChange,
}: {
  mission: LegacyMission;
  value: number;
  subAnswers: Record<string, number>;
  onChange: (v: number) => void;
  onSubChange: (subId: string, v: number) => void;
}) {
  const subMissions = mission["sub-mission"] ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* ========================================================= */}
      {/* RESULTADO PRINCIPAL */}
      {/* ========================================================= */}
      <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Resultado principal</p>

                <span className="badge badge-primary badge-sm">Principal</span>
              </div>

              <p className="mt-0.5 text-xs text-base-content/55">
                Defina o resultado geral desta missão.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-lg bg-base-200/60 p-1">
            <TypeControl
              type={mission.type}
              value={value}
              onChange={onChange}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBMISSÕES */}
      {/* ========================================================= */}
      {subMissions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-base-300 bg-base-200/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-base-200 text-base-content/60">
                <ListTree className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold">Submissões</p>

                <p className="text-xs text-base-content/50">
                  Critérios adicionais da missão
                </p>
              </div>
            </div>

            <span className="badge badge-neutral badge-sm">
              {subMissions.length}
            </span>
          </div>

          {/* Lista */}
          <div className="divide-y divide-base-300">
            {subMissions.map((s, i) => {
              const subId = s.id ?? `${mission.id}-sub-${i}`;

              return (
                <div
                  key={subId}
                  className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-base-200/40"
                >
                  {/* Informação */}
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Número */}
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-base-300 bg-base-100 text-[11px] font-semibold text-base-content/50 transition group-hover:border-primary/40 group-hover:text-primary">
                      {i + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-base-content/80">
                        {s.submission}
                      </p>

                      {s.id && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <CircleDot className="size-3 text-base-content/35" />

                          <code className="font-mono text-[10px] text-base-content/40">
                            {s.id}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controle */}
                  <div className="shrink-0 rounded-lg bg-base-200/50 p-1">
                    <TypeControl
                      type={s.type}
                      value={subAnswers[subId] ?? 0}
                      onChange={(v) => onSubChange(subId, v)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado visual */}
      {subMissions.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-base-300 bg-base-200/20 p-4">
          <CheckCircle2 className="size-5 text-base-content/30" />

          <div>
            <p className="text-sm font-medium">Sem submissões adicionais</p>

            <p className="text-xs text-base-content/50">
              Esta missão utiliza apenas o resultado principal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TypeControl({
  type,
  value,
  onChange,
}: {
  type: LegacyType;
  value: number;
  onChange: (v: number) => void;
}) {
  if (type[0] === "range") {
    const [, min, max] = type;
    return (
      <input
        type="number"
        min={min}
        max={max}
        className="input input-bordered input-xs w-20"
        value={value}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, Number(e.target.value))))
        }
      />
    );
  }

  const labels = [type[1], type[2]].filter((v): v is string => Boolean(v));

  if (labels.length === 0) {
    // switch binário simples (sim/não)
    return (
      <input
        type="checkbox"
        className="toggle toggle-sm"
        checked={value === 1}
        onChange={(e) => onChange(e.target.checked ? 1 : 0)}
      />
    );
  }

  return (
    <select
      className="select select-bordered select-xs"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {labels.map((l, idx) => (
        <option key={l} value={idx}>
          {l}
        </option>
      ))}
    </select>
  );
}