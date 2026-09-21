"use client";

import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Gauge,
  ListChecks,
  Plus,
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
import Link from "next/link";

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

  const canCreateTest = (() => {
    if (!testName.trim()) return false;

    if (t.mode === "runs") {
      return (
        !!t.competition &&
        t.orderedSelected.length > 0 &&
        !t.loadingMissions &&
        !t.missionsError
      );
    }

    if (t.mode === "calibrabot") {
      if (t.calibraMode === "motores") return t.motors.length > 0;
      if (t.calibraMode === "giroscópio") return t.giroAnalysis.length > 0;
      return t.pidParams.length > 0;
    }

    return (
      t.customParams.length > 0 &&
      t.customParams.every((param) => param.name.trim().length > 0)
    );
  })();

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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
      <Link href="/dashboard/labtest" className="group text-sm text-base-content hover:text-base-content/80">
        <ArrowLeft className="size-5 inline-block mr-2 group-hover:-translate-x-1 transition-transform duration-200" />Voltar
      </Link>
      <header className="flex flex-col gap-4 items-center sm:items-start sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-content uppercase tracking-wide -rotate-1 bg-primary w-fit inline-block px-2 py-1 shadow-sm">
          Criar teste
        </h1>
        <p className="mt-1 ml-2 max-w-2xl text-md leading-relaxed text-base-content/55 text-center sm:text-left">
          Escolha o tipo de teste, configure os parâmetros e gere a rotina para
          execução de acordo com a sua necessidade.
        </p>
      </header>

      {/* Informações básicas */}
      <section className="overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-100 hover:shadow-lg transition-shadow duration-200 hover:border-base-content/20">
        <div className="border-b border-base-content/10 bg-base-200/30 px-5 py-4">
          <div>
            <h2 className="text-md font-semibold text-base-content">
              Informações do teste
            </h2>
            <p className="mt-0.5 text-sm text-base-content/45">
              Defina um nome e uma descrição para identificar este teste.
            </p>
          </div>
        </div>
        <TestDetailsSection
          testName={testName}
          testDescription={testDescription}
          setTestName={setTestName}
          setTestDescription={setTestDescription}
        />
      </section>

      {/* Tipo de teste */}
      <section className="overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-100 hover:shadow-lg transition-shadow duration-200 hover:border-base-content/20">
        <div className="border-b border-base-content/10 bg-base-200/30 px-5 py-4">
          <h2 className="text-md font-semibold text-base-content">
            Tipo de teste
          </h2>
          <p className="mt-0.5 text-sm text-base-content/45">
            Escolha o tipo de rotina que deseja configurar.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Tipo de teste"
          className="grid w-full grid-cols-1 gap-4 rounded-xl p-1 sm:grid-cols-3 px-2 sm:px-3 py-2 sm:py-3"
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
                  text-sm font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 hover:shadow-sm hover:bg-base-200/60 hover:text-base-content/75
                  ${
                    active
                      ? "bg-primary/20 text-primary shadow-sm hover:bg-primary/30 hover:text-primary-content"
                      : "text-base-content/50 hover:bg-base-200/60 hover:text-base-content/75"
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
      </section>

      {/* Configuração específica */}
      <section className="overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-100 hover:shadow-lg transition-shadow duration-200 hover:border-base-content/20">
        <div className="border-b border-base-content/10 bg-base-200/30 px-5 py-4">
          <h2 className="text-md font-semibold text-base-content">
            Configuração
          </h2>
          <p className="mt-0.5 text-sm text-base-content/45">
            Ajuste os parâmetros específicos deste tipo de teste.
          </p>
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
      <section
        aria-disabled={!canCreateTest}
        className={`rounded-2xl border border-base-300 bg-base-100 ${
          !canCreateTest ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <GenerateSection
          isSaving={isSaving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          generated={t.generated}
          copyLabel={t.copyLabel}
          onGenerate={t.handleGenerate}
          onSave={() => {
            if (canCreateTest) handleSave();
          }}
          onCopyGenerated={t.copyGenerated}
        />
      </section>
    </div>
  );
}
