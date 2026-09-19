"use client";

import { useState, useTransition } from "react";
import {
  Gauge,
  ListChecks,
  Settings2,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import { useCreateTest, type CreateTestMode } from "./Usecreatetest";
import { createTest, type CreateTestInput } from "./actions";
import { TestDetailsSection } from "./components/TestDetailsSection";
import { RunsSection } from "./components/RunsSection";
import { CalibrabotSection } from "./components/CalibrabotSection";
import { CustomSection } from "./components/CustomSection";
import { GenerateSection } from "./components/GenerateSection";

type CustomParamMeta = { required: boolean; description: string };

export default function CreateTest() {
  const t = useCreateTest();
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
        competitionName: t.selectedCompetition?.name ?? null,
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

  const tabs: Array<{
    value: CreateTestMode;
    label: string;
    icon: LucideIcon;
  }> = [
    { value: "runs", label: "Runs", icon: ListChecks },
    { value: "calibrabot", label: "Calibrabot", icon: Gauge },
    { value: "custom", label: "Customizado", icon: SlidersHorizontal },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      {/* Cabeçalho */}
      <header className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Settings2 className="size-5" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-base-content">
              Criar teste
            </h1>

            <span className="badge badge-ghost badge-sm">
              Nova configuração
            </span>
          </div>

          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-base-content/55">
            Configure os parâmetros do teste e gere uma nova rotina de execução.
          </p>
        </div>
      </header>

      {/* Informações básicas */}
      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
        <div className="border-b border-base-300 bg-base-200/30 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-base-content">
              Informações do teste
            </h2>
            <p className="mt-0.5 text-xs text-base-content/45">
              Defina um nome e uma descrição para identificar este teste.
            </p>
          </div>
        </div>

        <div className="p-5">
          <TestDetailsSection
            testName={testName}
            testDescription={testDescription}
            setTestName={setTestName}
            setTestDescription={setTestDescription}
          />
        </div>
      </section>

      {/* Tipo de teste */}
      <section className="rounded-2xl border border-base-300 bg-base-100">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-base-content">
              Tipo de teste
            </h2>
            <p className="mt-0.5 text-xs text-base-content/45">
              Escolha o tipo de rotina que deseja configurar.
            </p>
          </div>

          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-base-content/30">
            Etapa 2
          </span>
        </div>

        <div className="border-t border-base-300 p-3">
          <div
            role="tablist"
            aria-label="Tipo de teste"
            className="grid w-full grid-cols-1 gap-1 rounded-xl bg-base-200/60 p-1 sm:grid-cols-3"
          >
            {tabs.map(({ value, label, icon: Icon }) => {
              const active = t.mode === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`
                  flex min-h-10 items-center justify-center gap-2 rounded-lg px-4
                  text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-base-100 text-base-content shadow-sm"
                      : "text-base-content/50 hover:bg-base-100/60 hover:text-base-content/75"
                  }
                `}
                  onClick={() => t.setMode(value)}
                >
                  <Icon
                    className={`size-4 ${
                      active ? "text-primary" : "text-base-content/40"
                    }`}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Configuração específica */}
      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-semibold text-base-content">
              Configuração
            </h2>
            <p className="mt-0.5 text-xs text-base-content/45">
              Ajuste os parâmetros específicos deste tipo de teste.
            </p>
          </div>

          <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-base-content/30 sm:block">
            Etapa 3
          </span>
        </div>

        {t.mode === "runs" && (
          <RunsSection
            competitions={t.competitions}
            competition={t.competition}
            setCompetition={t.setCompetition}
            selectedCompetition={t.selectedCompetition}
            selectedCompetitionConfig={t.selectedCompetitionConfig}
            missionEndpoint={t.missionEndpoint}
            loadingMissions={t.loadingMissions}
            missionsError={t.missionsError}
            needsSeasonPick={t.needsSeasonPick}
            season={t.season}
            setSeason={t.setSeason}
            seasonOptions={t.seasonOptions}
            readyToFetchMissions={t.readyToFetchMissions}
            missions={t.missions}
            availableMissions={t.availableMissions}
            orderedSelected={t.orderedSelected}
            answers={t.answers}
            toggleMission={t.toggleMission}
            moveMission={t.moveMission}
            updateAnswerValue={t.updateAnswerValue}
            updateSubAnswer={t.updateSubAnswer}
            updateObjectiveAnswer={t.updateObjectiveAnswer}
          />
        )}

        {t.mode === "calibrabot" && (
          <CalibrabotSection
            calibraMode={t.calibraMode}
            setCalibraMode={t.setCalibraMode}
            motorInput={t.motorInput}
            setMotorInput={t.setMotorInput}
            addMotor={t.addMotor}
            removeMotor={t.removeMotor}
            motors={t.motors}
            motorTestType={t.motorTestType}
            setMotorTestType={t.setMotorTestType}
            motorPairs={t.motorPairs}
            giroAngle={t.giroAngle}
            setGiroAngle={t.setGiroAngle}
            giroAnalysis={t.giroAnalysis}
            toggleGiroAnalysis={t.toggleGiroAnalysis}
            pidDistance={t.pidDistance}
            setPidDistance={t.setPidDistance}
            pidParams={t.pidParams}
            togglePidParam={t.togglePidParam}
          />
        )}

        {t.mode === "custom" && (
          <CustomSection
            customParams={t.customParams}
            addCustomParam={t.addCustomParam}
            updateCustomParam={t.updateCustomParam}
            removeCustomParam={t.removeCustomParam}
            customMeta={customMeta}
            updateCustomMeta={updateCustomMeta}
          />
        )}
      </section>

      {/* Geração */}
      <section className="rounded-2xl border border-base-300 bg-base-100">
        <div className="border-b border-base-300 bg-base-200/30 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-base-content">
                Gerar teste
              </h2>
              <p className="mt-0.5 text-xs text-base-content/45">
                Revise a configuração e gere a rotina para execução.
              </p>
            </div>

            <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-base-content/30 sm:block">
              Etapa 4
            </span>
          </div>
        </div>

        <div className="p-5">
          <GenerateSection
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            generated={t.generated}
            copyLabel={t.copyLabel}
            onGenerate={t.handleGenerate}
            onSave={handleSave}
            onCopyGenerated={t.copyGenerated}
          />
        </div>
      </section>
    </div>
  );
}