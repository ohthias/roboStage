"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createCalibrationExecution } from "../../actions";
import type { CalibrationResult } from "./types";
import { AtuadoresConfig, CalibrationSubtype, GiroscopioConfig } from "../setup/types";

const RESULT_OPTIONS: { value: CalibrationResult; label: string }[] = [
  { value: "aprovado", label: "Aprovado" },
  { value: "necessita_ajuste", label: "Necessita ajuste" },
  { value: "reprovado", label: "Reprovado" },
];

export function CalibraBotExecuteForm({
  testId,
  calibrationType,
  config,
}: {
  testId: string;
  calibrationType: CalibrationSubtype;
  config: unknown;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [operatorId, setOperatorId] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedCombo, setSelectedCombo] = useState<string[] | null>(null);
  const [motorUsed, setMotorUsed] = useState("");
  const [robotModel, setRobotModel] = useState("");
  const [firmware, setFirmware] = useState("");
  const [batteryUsed, setBatteryUsed] = useState("");
  const [sensorUsed, setSensorUsed] = useState("");
  const [portUsed, setPortUsed] = useState("");
  const [idealValueFound, setIdealValueFound] = useState("");
  const [configurationUsed, setConfigurationUsed] = useState("");
  const [result, setResult] = useState<CalibrationResult>("necessita_ajuste");
  const [finalNotes, setFinalNotes] = useState("");
  const isActuatorCalibration = calibrationType === "motor" || calibrationType === "servo";

  function handleSubmit() {
    if (!operatorId.trim()) {
      setError("Informe quem operou o robô nessa execução.");
      return;
    }
    if (isActuatorCalibration && !selectedCombo) {
      setError("Escolha qual combinação de atuadores foi testada.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await createCalibrationExecution(
          {
            testId,
            operatorId: operatorId.trim(),
            durationSeconds: durationSeconds ? Number.parseFloat(durationSeconds) : undefined,
            notes: notes.trim() || undefined,
            resultSummary: RESULT_OPTIONS.find((r) => r.value === result)?.label,
          },
          {
            calibrationType,
            robotModel: robotModel.trim() || undefined,
            firmware: firmware.trim() || undefined,
            batteryUsed: batteryUsed.trim() || undefined,
            sensorUsed: sensorUsed.trim() || undefined,
            motorUsed: selectedCombo ? selectedCombo.join(" + ") : motorUsed.trim() || undefined,
            portUsed: portUsed.trim() || undefined,
            idealValueFound: idealValueFound.trim() || undefined,
            configurationUsed: configurationUsed.trim() || undefined,
            result,
            finalNotes: finalNotes.trim() || undefined,
          }
        );
        router.push(`/dashboard/labtest/${testId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível registrar a execução.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Operador</span>
          </div>
          <input
            className="input input-bordered"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            placeholder="Nome de quem rodou o teste"
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Duração (segundos, opcional)</span>
          </div>
          <input
            type="number"
            min="0"
            className="input input-bordered"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(e.target.value)}
          />
        </label>
      </div>

      {isActuatorCalibration && (
        <AtuadoresFields config={config as AtuadoresConfig} selected={selectedCombo} onSelect={setSelectedCombo} />
      )}
      {calibrationType === "giroscopio" && <GiroscopioFields config={config as GiroscopioConfig} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Modelo do robô (opcional)</span>
          </div>
          <input className="input input-bordered" value={robotModel} onChange={(e) => setRobotModel(e.target.value)} />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Firmware (opcional)</span>
          </div>
          <input className="input input-bordered" value={firmware} onChange={(e) => setFirmware(e.target.value)} />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Bateria usada (opcional)</span>
          </div>
          <input className="input input-bordered" value={batteryUsed} onChange={(e) => setBatteryUsed(e.target.value)} />
        </label>
        {!isActuatorCalibration && (
          <label className="form-control">
            <div className="label">
              <span className="label-text">Motor usado (opcional)</span>
            </div>
            <input className="input input-bordered" value={motorUsed} onChange={(e) => setMotorUsed(e.target.value)} />
          </label>
        )}
        <label className="form-control">
          <div className="label">
            <span className="label-text">Sensor usado (opcional)</span>
          </div>
          <input className="input input-bordered" value={sensorUsed} onChange={(e) => setSensorUsed(e.target.value)} />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Porta usada (opcional)</span>
          </div>
          <input className="input input-bordered" value={portUsed} onChange={(e) => setPortUsed(e.target.value)} />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Valor ideal encontrado (opcional)</span>
          </div>
          <input
            className="input input-bordered"
            value={idealValueFound}
            onChange={(e) => setIdealValueFound(e.target.value)}
            placeholder="ex: kP=0.8, kI=0.02"
          />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Configuração usada (opcional)</span>
          </div>
          <input
            className="input input-bordered"
            value={configurationUsed}
            onChange={(e) => setConfigurationUsed(e.target.value)}
          />
        </label>
      </div>

      <label className="form-control">
        <div className="label">
          <span className="label-text">Resultado</span>
        </div>
        <div className="join">
          {RESULT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setResult(opt.value)}
              className={`join-item btn btn-sm ${result === opt.value ? "btn-info" : "btn-ghost border-base-300"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </label>

      <label className="form-control">
        <div className="label">
          <span className="label-text">Notas finais (opcional)</span>
        </div>
        <textarea
          className="textarea textarea-bordered"
          rows={2}
          value={finalNotes}
          onChange={(e) => setFinalNotes(e.target.value)}
        />
      </label>

      <label className="form-control">
        <div className="label">
          <span className="label-text">Observações gerais (opcional)</span>
        </div>
        <textarea className="textarea textarea-bordered" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      <div className="flex justify-end">
        <button type="button" className="btn btn-info" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Registrando…" : "Registrar execução"}
        </button>
      </div>
    </div>
  );
}

function AtuadoresFields({
  config,
  selected,
  onSelect,
}: {
  config: AtuadoresConfig;
  selected: string[] | null;
  onSelect: (combo: string[]) => void;
}) {
  return (
    <label className="form-control">
      <div className="label">
        <span className="label-text">Combinação testada</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {config.combinations.map((combo, i) => {
          const isSelected = selected?.join("+") === combo.join("+");
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(combo)}
              className={`rounded border px-3 py-1.5 font-mono text-xs ${
                isSelected ? "border-info bg-info/10" : "border-base-300"
              }`}
            >
              {combo.join(" + ")}
            </button>
          );
        })}
      </div>
    </label>
  );
}

function GiroscopioFields({ config }: { config: GiroscopioConfig }) {
  return (
    <div className="alert alert-info text-sm">
      Eixos configurados: <span className="font-semibold capitalize">{config.axes.join(", ")}</span>
    </div>
  );
}