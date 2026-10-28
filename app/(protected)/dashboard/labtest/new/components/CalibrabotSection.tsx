import { Plus, X } from "lucide-react";

import {
  CALIBRA_OPTIONS,
  GIRO_ANALYSIS_OPTIONS,
  PID_PARAM_OPTIONS,
} from "../Usecreatetest";
import { useToast } from "@/app/context/ToastContext";
import { CheckChip, FieldLabel, Note, Segmented } from "./FormBits";
import { KitIaSection } from "./KitIaSection";
import { OBR_PRESETS } from "@/utils/labtest/obr-presets";

type CalibraMode = "motores" | "giroscópio" | "pid" | "kit-ia" | "obr";

const MOTOR_TEST_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "duplas", label: "Duplas" },
] as const;

export function CalibrabotSection({
  calibraMode,
  setCalibraMode,
  motorInput,
  setMotorInput,
  addMotor,
  removeMotor,
  motors,
  motorTestType,
  setMotorTestType,
  motorPairs,
  giroAngle,
  setGiroAngle,
  giroAnalysis,
  toggleGiroAnalysis,
  pidDistance,
  setPidDistance,
  pidParams,
  togglePidParam,
  futureEditionActive,
  kitPreset,
  selectKitPreset,
  kitParams,
  toggleKitParam,
  obrActive,
  obrPreset,
  selectObrPreset,
  obrParams,
  toggleObrParam,
}: {
  obrActive: boolean;
  obrPreset: string;
  selectObrPreset: (id: string) => void;
  obrParams: string[];
  toggleObrParam: (name: string) => void;
  futureEditionActive: boolean;
  kitPreset: string;
  selectKitPreset: (id: string) => void;
  kitParams: string[];
  toggleKitParam: (name: string) => void;
  calibraMode: CalibraMode;
  setCalibraMode: (value: CalibraMode) => void;
  motorInput: string;
  setMotorInput: (value: string) => void;
  addMotor: () => void;
  removeMotor: (name: string) => void;
  motors: string[];
  motorTestType: "individual" | "duplas";
  setMotorTestType: (value: "individual" | "duplas") => void;
  motorPairs: () => [string, string][];
  giroAngle: number;
  setGiroAngle: (value: number) => void;
  giroAnalysis: string[];
  toggleGiroAnalysis: (value: string) => void;
  pidDistance: number;
  setPidDistance: (value: number) => void;
  pidParams: string[];
  togglePidParam: (value: string) => void;
}) {
  const { addToast } = useToast();

  const handleAddMotor = () => {
    const name = motorInput.trim();
    if (!name) return;
    if (motors.includes(name)) {
      addToast("Já existe um motor com esse nome.", "warning");
      return;
    }
    addMotor();
  };

  // Trocar de modo limpa a configuração anterior.
  const handleChangeMode = (mode: CalibraMode) => {
    if (mode === calibraMode) return;
    setMotorInput("");
    motors.forEach(removeMotor);
    setMotorTestType("individual");
    setGiroAngle(0);
    giroAnalysis.forEach(toggleGiroAnalysis);
    setPidDistance(0);
    pidParams.forEach(togglePidParam);
    selectKitPreset("");
    selectObrPreset("");
    setCalibraMode(mode);
  };

  const pairs = motorPairs();

  return (
    <div className="flex flex-col gap-6">
      <Segmented
        label="O que calibrar"
        value={calibraMode}
        options={[
          ...(CALIBRA_OPTIONS as ReadonlyArray<{ value: CalibraMode; label: string }>),
          // Kit Ciência e IA: só com a liga FLL Future Edition ativa.
          ...(futureEditionActive
            ? [{ value: "kit-ia" as const, label: "Kit Ciência e IA" }]
            : []),
          // Testes da OBR Resgate: só com a liga OBR ativa.
          ...(obrActive ? [{ value: "obr" as const, label: "OBR Resgate" }] : []),
        ]}
        onChange={handleChangeMode}
      />

      {calibraMode === "motores" && (
        <>
          <div>
            <FieldLabel htmlFor="motor-name">Motores</FieldLabel>
            <div className="flex gap-2">
              <input
                id="motor-name"
                type="text"
                placeholder="ex: motor_esquerdo"
                className="input w-full flex-1"
                value={motorInput}
                autoComplete="off"
                onChange={(e) => setMotorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMotor();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-square btn-outline border-base-300"
                onClick={handleAddMotor}
                disabled={!motorInput.trim()}
                aria-label="Adicionar motor"
                title="Adicionar motor"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {motors.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {motors.map((m) => (
                  <li
                    key={m}
                    className="flex items-center gap-1 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-200/40 py-1 pl-3 pr-1 font-mono text-xs"
                  >
                    {m}
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-square text-base-content/45 hover:text-error"
                      onClick={() => removeMotor(m)}
                      aria-label={`Remover ${m}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-base-content/45">
                Digite o nome e aperte Enter.
              </p>
            )}
          </div>

          <div>
            <FieldLabel>Como testar</FieldLabel>
            <Segmented
              label="Como testar"
              value={motorTestType}
              options={MOTOR_TEST_TYPES}
              onChange={setMotorTestType}
            />
            <p className="mt-2 text-xs text-base-content/50">
              {motorTestType === "individual"
                ? "Cada motor é testado sozinho."
                : "Cada combinação de 2 motores vira um teste."}
            </p>
          </div>

          {motorTestType === "duplas" &&
            (motors.length < 2 ? (
              <Note tone="info">Adicione 2 motores ou mais para formar duplas.</Note>
            ) : (
              <div>
                <FieldLabel
                  aside={
                    <span className="font-mono text-xs text-base-content/45">
                      {pairs.length}
                    </span>
                  }
                >
                  Duplas geradas
                </FieldLabel>
                <ul className="flex flex-wrap gap-2">
                  {pairs.map(([a, b]) => (
                    <li
                      key={`${a}-${b}`}
                      className="rounded-tl-lg rounded-br-lg border border-primary/30 bg-primary/5 px-3 py-1.5 font-mono text-xs"
                    >
                      {a} <span className="text-primary">+</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </>
      )}

      {calibraMode === "kit-ia" && futureEditionActive && (
        <KitIaSection
          kitPreset={kitPreset}
          selectKitPreset={selectKitPreset}
          kitParams={kitParams}
          toggleKitParam={toggleKitParam}
        />
      )}

      {calibraMode === "obr" && obrActive && (
        <KitIaSection
          presets={OBR_PRESETS}
          kitPreset={obrPreset}
          selectKitPreset={selectObrPreset}
          kitParams={obrParams}
          toggleKitParam={toggleObrParam}
          note={
            <>
              Testes típicos da <strong className="font-semibold">OBR Resgate</strong>{" "}
              (liga ativa na sua conta). A equipe anota as medições em cada
              execução; campos marcados <span className="font-mono text-xs">AUTO</span>{" "}
              são calculados pelo LabTest, como a margem entre cores e as taxas
              de acerto.
            </>
          }
        />
      )}

      {calibraMode === "giroscópio" && (
        <>
          <div className="max-w-48">
            <FieldLabel htmlFor="giro-angle">Ângulo alvo</FieldLabel>
            <label className="input w-full">
              <input
                id="giro-angle"
                type="number"
                className="grow"
                value={giroAngle}
                onChange={(e) => setGiroAngle(Number(e.target.value))}
              />
              <span className="text-base-content/45">°</span>
            </label>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-base-content/80">
              O que medir
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {GIRO_ANALYSIS_OPTIONS.map((o) => (
                <CheckChip
                  key={o.value}
                  checked={giroAnalysis.includes(o.value)}
                  onChange={() => toggleGiroAnalysis(o.value)}
                >
                  {o.label}
                </CheckChip>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {calibraMode === "pid" && (
        <>
          <div className="max-w-48">
            <FieldLabel htmlFor="pid-distance">Distância alvo</FieldLabel>
            <label className="input w-full">
              <input
                id="pid-distance"
                type="number"
                className="grow"
                value={pidDistance}
                onChange={(e) => setPidDistance(Number(e.target.value))}
              />
              <span className="text-base-content/45">cm</span>
            </label>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-base-content/80">
              Parâmetros registrados
            </legend>
            <p className="mb-3 text-xs text-base-content/50">
              Marque os valores que você vai anotar em cada execução.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PID_PARAM_OPTIONS.map((p) => (
                <CheckChip
                  key={p}
                  mono
                  checked={pidParams.includes(p)}
                  onChange={() => togglePidParam(p)}
                >
                  {p.replace("_", " ")}
                </CheckChip>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </div>
  );
}
