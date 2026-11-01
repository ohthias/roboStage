"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Gauge,
  ListChecks,
  Loader2,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import {
  CALIBRA_OPTIONS,
  useCreateTest,
  type CreateTestMode,
} from "./Usecreatetest";
import { createTest, type CreateTestInput } from "./actions";
import { getKitPreset } from "@/utils/labtest/kit-ia";
import { getObrPreset } from "@/utils/labtest/obr-presets";
import { TestDetailsSection } from "./components/TestDetailsSection";
import { RunsSection } from "./components/RunsSection";
import { CalibrabotSection } from "./components/CalibrabotSection";
import { CustomSection } from "./components/CustomSection";
import { Note, Step } from "./components/FormBits";

import { unwrapAction } from "@/utils/stagebook/action-result";
type CustomParamMeta = {
  required: boolean;
  description: string;
};

const TYPES: Array<{
  value: CreateTestMode;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: "runs",
    label: "Runs",
    description: "Missões de uma competição, na ordem que você quiser.",
    icon: ListChecks,
  },
  {
    value: "calibrabot",
    label: "Calibrabot",
    description: "Calibrar motores, giroscópio ou PID.",
    icon: Gauge,
  },
  {
    value: "custom",
    label: "Customizado",
    description: "Seus próprios parâmetros e limites.",
    icon: SlidersHorizontal,
  },
];

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export default function CreateTest() {
  const t = useCreateTest();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");

  const [customMeta, setCustomMeta] = useState<
    Record<string, CustomParamMeta>
  >({});

  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const { addToast } = useToast();
  const router = useRouter();

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

  /* ------------------------------------------------------------ */
  /* O que falta para criar o teste                                */
  /* ------------------------------------------------------------ */

  const configMissing: string[] = (() => {
    if (t.mode === "runs") {
      if (!t.competition) return ["Escolha a competição"];
      // OBR: a rodada não tem missões; a arena é opcional.
      if (t.isObr) return [];
      if (t.needsSeasonPick && !t.season) return ["Escolha a temporada"];
      if (t.loadingMissions) return ["Aguarde as missões carregarem"];
      if (t.missionsError) return ["Não foi possível carregar as missões"];
      const chosen = t.orderedSelected.filter(
        (m) => !t.requiredMissionIds.includes(m.id),
      );
      if (chosen.length === 0)
        return ["Adicione ao menos uma missão à run"];
      return [];
    }

    if (t.mode === "calibrabot") {
      if (t.calibraMode === "motores") {
        if (t.motors.length === 0) return ["Adicione ao menos um motor"];
        if (t.motorTestType === "duplas" && t.motors.length < 2)
          return ["Duplas precisam de 2 motores ou mais"];
        return [];
      }
      if (t.calibraMode === "obr") {
        if (!t.obrPreset) return ["Escolha um teste da OBR"];
        return t.obrParams.length === 0 ? ["Marque ao menos uma medição"] : [];
      }
      if (t.calibraMode === "kit-ia") {
        if (!t.kitPreset) return ["Escolha um teste do kit"];
        return t.kitParams.length === 0
          ? ["Marque ao menos uma medição"]
          : [];
      }
      if (t.calibraMode === "giroscópio") {
        return t.giroAnalysis.length === 0
          ? ["Marque ao menos um indicador"]
          : [];
      }
      return t.pidParams.length === 0
        ? ["Marque ao menos um parâmetro do PID"]
        : [];
    }

    if (t.customParams.length === 0) return ["Adicione ao menos um parâmetro"];
    if (t.customParams.some((p) => !p.name.trim()))
      return ["Dê nome a todos os parâmetros"];
    const names = t.customParams.map((p) => p.name.trim().toLowerCase());
    if (new Set(names).size !== names.length)
      return ["Use nomes diferentes nos parâmetros"];
    return [];
  })();

  const nameMissing = testName.trim() ? [] : ["Dê um nome ao teste"];
  const missing = [...nameMissing, ...configMissing];
  const canCreateTest = missing.length === 0;

  /* ------------------------------------------------------------ */
  /* Payload e envio (mesma lógica de antes)                       */
  /* ------------------------------------------------------------ */

  function buildPayload(): CreateTestInput | null {
    const base = {
      name: testName.trim(),
      description: testDescription.trim() || undefined,
      folderId,
    };

    if (t.mode === "runs") {
      return {
        ...base,
        mode: "runs",
        competitionId: t.competition,
        competitionName: t.selectedCompetition?.name ?? null,
        season: t.season || null,
        runMode: t.runMode || null,
        competitionCode: t.selectedCompetition?.code ?? null,
        ...(t.isFutureEdition
          ? { edition: "future-edition", matchDuration: t.matchDuration }
          : {}),
        ...(t.isObr
          ? { edition: "obr-resgate", missionOrder: [], answers: {}, arena: t.arena ?? undefined }
          : {}),
        missionOrder: t.orderedSelected.map((m) => m.id),
        answers: t.answers,
      };
    }

    if (t.mode === "calibrabot") {
      if (t.calibraMode === "motores") {
        return {
          ...base,
          mode: "calibrabot",
          calibraMode: "motores",
          motores: t.motors,
          motorTestType: t.motorTestType,
        };
      }
      if (t.calibraMode === "obr") {
        return {
          ...base,
          mode: "calibrabot",
          calibraMode: "obr",
          obrPreset: t.obrPreset,
          obrParams: t.obrParams,
        };
      }
      if (t.calibraMode === "kit-ia") {
        return {
          ...base,
          mode: "calibrabot",
          calibraMode: "kit-ia",
          kitPreset: t.kitPreset,
          kitParams: t.kitParams,
        };
      }
      if (t.calibraMode === "giroscópio") {
        return {
          ...base,
          mode: "calibrabot",
          calibraMode: "giroscópio",
          giroAngle: t.giroAngle,
          giroAnalysis: t.giroAnalysis,
        };
      }
      return {
        ...base,
        mode: "calibrabot",
        calibraMode: "pid",
        pidDistance: t.pidDistance,
        pidParams: t.pidParams,
      };
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

    if (!canCreateTest) {
      setSaveError(missing[0]);
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    startSaving(async () => {
      try {
        const created = unwrapAction(await createTest(payload));
        addToast(`Teste "${created.name}" criado.`, "success");
        router.push(`/dashboard/labtest/${created.id}`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao salvar o teste.";
        addToast(message, "error");
        setSaveError(message);
      }
    });
  }

  /* ------------------------------------------------------------ */
  /* Resumo                                                        */
  /* ------------------------------------------------------------ */

  const typeLabel = TYPES.find((x) => x.value === t.mode)?.label ?? "";

  const configSummary: string | null = (() => {
    if (t.mode === "runs") {
      if (!t.selectedCompetition) return null;
      if (t.isObr) {
        return `${t.selectedCompetition.name} · rodada de resgate · ${t.arena ? `arena “${t.arena.name}”` : "sem arena"}`;
      }
      if (t.isFutureEdition) {
        const m = Math.floor(t.matchDuration / 60);
        const sec = String(t.matchDuration % 60).padStart(2, "0");
        return `${t.selectedCompetition.name} · partida de ${m}:${sec} · ${plural(t.orderedSelected.length, "missão", "missões")}`;
      }
      const parts = [t.selectedCompetition.name];
      if (t.runModes.length > 1) {
        const m = t.runModes.find((x) => x.value === t.runMode);
        if (m) parts.push(m.label);
      }
      if (t.season) {
        parts.push(
          t.seasonOptions.find((s) => s.value === t.season)?.label ?? t.season,
        );
      }
      parts.push(plural(t.orderedSelected.length, "missão", "missões"));
      return parts.join(" · ");
    }
    if (t.mode === "calibrabot") {
      const mode =
        CALIBRA_OPTIONS.find((o) => o.value === t.calibraMode)?.label ?? "";
      if (t.calibraMode === "motores") {
        const extra =
          t.motorTestType === "duplas"
            ? plural(t.motorPairs().length, "dupla", "duplas")
            : "individual";
        return `${mode} · ${plural(t.motors.length, "motor", "motores")} · ${extra}`;
      }
      if (t.calibraMode === "obr") {
        const preset = getObrPreset(t.obrPreset);
        return `OBR Resgate · ${preset?.label ?? "escolha um teste"} · ${plural(t.obrParams.length, "medição", "medições")}`;
      }
      if (t.calibraMode === "kit-ia") {
        const preset = getKitPreset(t.kitPreset);
        return `Kit Ciência e IA · ${preset?.label ?? "escolha um teste"} · ${plural(t.kitParams.length, "medição", "medições")}`;
      }
      if (t.calibraMode === "giroscópio") {
        return `${mode} · ${t.giroAngle}° · ${plural(t.giroAnalysis.length, "indicador", "indicadores")}`;
      }
      return `${mode} · ${t.pidDistance} cm · ${plural(t.pidParams.length, "parâmetro", "parâmetros")}`;
    }
    return plural(t.customParams.length, "parâmetro", "parâmetros");
  })();

  const submitButton = (className = "") => (
    <button
      type="button"
      onClick={handleSave}
      className={`btn btn-primary rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none ${className}`}
      disabled={isSaving}
      aria-disabled={!canCreateTest}
    >
      {isSaving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
      {isSaving ? "Criando…" : "Criar teste"}
    </button>
  );

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 md:px-8 lg:pb-12"
    >
      {/* Cabeçalho */}
      <Link
        href="/dashboard/labtest"
        className="group inline-flex items-center gap-1.5 text-sm text-base-content/55 hover:text-base-content"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        LabTest
      </Link>

      <header className="mt-4 mb-8">
        <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
          / NOVO TESTE
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Criar{" "}
          <span className="inline-block -rotate-1 bg-accent px-2 italic text-accent-content">
            teste
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-base-content/60">
          Três passos: dê um nome, escolha o tipo e configure. Depois é só
          executar e comparar os resultados.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* Passos */}
        <ol className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-5 sm:p-8">
          <Step
            n={1}
            title="Identificação"
            hint="Um nome claro ajuda a achar o teste depois."
            done={nameMissing.length === 0}
          >
            <TestDetailsSection
              testName={testName}
              testDescription={testDescription}
              setTestName={setTestName}
              setTestDescription={setTestDescription}
            />
          </Step>

          <Step n={2} title="Tipo de teste" done>
            <div
              role="radiogroup"
              aria-label="Tipo de teste"
              className="grid gap-2 sm:grid-cols-3"
            >
              {TYPES.map(({ value, label, description, icon: Icon }) => {
                const active = t.mode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setSaveError(null);
                      t.setMode(value);
                    }}
                    className={`relative flex cursor-pointer flex-col items-start gap-2 rounded-tl-xl rounded-br-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-base-300 hover:border-base-content/25"
                    }`}
                  >
                    <Icon
                      className={`size-5 ${active ? "text-primary" : "text-base-content/45"}`}
                    />
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs leading-5 text-base-content/55">
                      {description}
                    </span>
                    {active && (
                      <CheckCircle2 className="absolute right-3 top-3 size-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </Step>

          <Step
            n={3}
            title="Configuração"
            hint={
              t.mode === "runs"
                ? t.isObr
                  ? "Escolha a competição e, se quiser, a arena para marcar as falhas."
                  : "Escolha a competição e monte a ordem das missões."
                : t.mode === "calibrabot"
                  ? "Escolha o que calibrar e o que medir."
                  : "Crie os campos que serão preenchidos em cada execução."
            }
            done={configMissing.length === 0}
            last
          >
            {t.mode === "runs" && (
              <RunsSection
                competitions={t.competitions}
                competition={t.competition}
                setCompetition={t.setCompetition}
                selectedCompetition={t.selectedCompetition}
                selectedCompetitionConfig={t.selectedCompetitionConfig}
                runModes={t.runModes}
                runMode={t.runMode}
                requiredMissionIds={t.requiredMissionIds}
                setRunMode={(v) => {
                  setSaveError(null);
                  t.setRunMode(v);
                }}
                isFullRun={t.isFullRun}
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
                matchDuration={t.matchDuration}
                setMatchDuration={t.setMatchDuration}
                isObr={t.isObr}
                arena={t.arena}
                setArena={t.setArena}
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
                futureEditionActive={t.futureEditionActive}
                kitPreset={t.kitPreset}
                selectKitPreset={t.selectKitPreset}
                kitParams={t.kitParams}
                toggleKitParam={t.toggleKitParam}
                obrActive={t.obrActive}
                obrPreset={t.obrPreset}
                selectObrPreset={t.selectObrPreset}
                obrParams={t.obrParams}
                toggleObrParam={t.toggleObrParam}
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
          </Step>
        </ol>

        {/* Resumo (desktop) */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-base-content/45">
              / RESUMO
            </p>

            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Nome" value={testName.trim() || null} />
              <SummaryRow label="Tipo" value={typeLabel} />
              <SummaryRow label="Configuração" value={configSummary} />
            </dl>

            <div className="my-5 h-px bg-base-300" />

            {missing.length > 0 ? (
              <ul className="space-y-2 text-sm" aria-label="O que falta">
                {missing.map((m) => (
                  <li
                    key={m}
                    className="flex items-start gap-2 text-base-content/60"
                  >
                    <Circle className="mt-0.5 size-3.5 shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" />
                Tudo pronto para criar.
              </p>
            )}

            {submitButton("mt-5 w-full")}

            {saveError && (
              <div className="mt-4">
                <Note tone="error">{saveError}</Note>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Barra fixa (celular / tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p
            className={`min-w-0 flex-1 truncate text-sm ${
              saveError
                ? "text-error"
                : canCreateTest
                  ? "text-success"
                  : "text-base-content/60"
            }`}
            aria-live="polite"
          >
            {saveError ??
              (canCreateTest ? "Tudo pronto." : `Falta: ${missing[0]}`)}
          </p>
          {submitButton("shrink-0")}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-xs text-base-content/45">{label}</dt>
      <dd
        className={`mt-0.5 break-words ${
          value ? "font-medium" : "text-base-content/35"
        }`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}
