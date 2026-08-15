"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveCalibrationPlan } from "../../actions";
import type { CalibrationSubtype } from "./types";

const SUBTYPES: { value: CalibrationSubtype; label: string; desc: string }[] = [
  {
    value: "atuadores",
    label: "Atuadores",
    desc: "Testa motores em pares, trios ou individualmente.",
  },
  {
    value: "programacao",
    label: "Programação",
    desc: "PID, giroscópio (arfagem, guinada, rotação) ou andar do robô.",
  },
  {
    value: "sensores",
    label: "Sensores",
    desc: "Luz e ultrassônico.",
  },
];

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 1) return items.map((i) => [i]);
  const result: T[][] = [];
  items.forEach((item, index) => {
    combinations(items.slice(index + 1), size - 1).forEach((rest) => {
      result.push([item, ...rest]);
    });
  });
  return result;
}

const GROUPING_SIZE = { individual: 1, duplas: 2, trios: 3 } as const;

function AtuadoresForm({ onSaved }: { onSaved: (subtype: "atuadores", config: unknown) => void }) {
  const [actuatorInput, setActuatorInput] = useState("");
  const [actuators, setActuators] = useState<string[]>([]);
  const [grouping, setGrouping] = useState<keyof typeof GROUPING_SIZE>("duplas");

  function addActuator() {
    const value = actuatorInput.trim();
    if (!value || actuators.includes(value)) return;
    setActuators((prev) => [...prev, value]);
    setActuatorInput("");
  }

  const combos = actuators.length >= GROUPING_SIZE[grouping]
    ? combinations(actuators, GROUPING_SIZE[grouping])
    : [];

  return (
    <div className="flex flex-col gap-4">
      <label className="form-control">
        <div className="label">
          <span className="label-text">Atuadores a testar</span>
        </div>
        <div className="flex gap-2">
          <input
            className="input input-bordered flex-1"
            value={actuatorInput}
            onChange={(e) => setActuatorInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addActuator())}
            placeholder="ex: Motor A"
          />
          <button type="button" className="btn btn-info" onClick={addActuator}>
            Adicionar
          </button>
        </div>
      </label>

      {actuators.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actuators.map((a) => (
            <span key={a} className="badge badge-lg gap-2">
              {a}
              <button
                type="button"
                onClick={() => setActuators((prev) => prev.filter((x) => x !== a))}
                aria-label={`Remover ${a}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <label className="form-control">
        <div className="label">
          <span className="label-text">Agrupamento</span>
        </div>
        <div className="join">
          {(Object.keys(GROUPING_SIZE) as (keyof typeof GROUPING_SIZE)[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrouping(g)}
              className={`join-item btn btn-sm capitalize ${
                grouping === g ? "btn-info" : "btn-ghost border-base-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </label>

      {combos.length > 0 && (
        <div>
          <div className="label">
            <span className="label-text">
              {combos.length} combinações geradas — cada uma vira uma execução planejada
            </span>
          </div>
          <ul className="flex flex-wrap gap-2 text-xs">
            {combos.map((c, i) => (
              <li key={i} className="rounded border border-base-300 px-2 py-1 font-mono">
                {c.join(" + ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-info"
          disabled={combos.length === 0}
          onClick={() => onSaved("atuadores", { actuators, grouping, combinations: combos })}
        >
          Salvar configuração
        </button>
      </div>
    </div>
  );
}

const AXES = ["arfagem", "guinada", "rotacao"] as const;

function ProgramacaoForm({ onSaved }: { onSaved: (subtype: "programacao", config: unknown) => void }) {
  const [subject, setSubject] = useState<"pid" | "giroscopio" | "andar">("pid");
  const [axes, setAxes] = useState<Array<(typeof AXES)[number]>>([]);

  function toggleAxis(axis: (typeof AXES)[number]) {
    setAxes((prev) => (prev.includes(axis) ? prev.filter((a) => a !== axis) : [...prev, axis]));
  }

  const canSave = subject !== "giroscopio" || axes.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <label className="form-control">
        <div className="label">
          <span className="label-text">O que testar</span>
        </div>
        <div className="join flex-wrap">
          {(["pid", "giroscopio", "andar"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`join-item btn btn-sm capitalize ${
                subject === s ? "btn-info" : "btn-ghost border-base-300"
              }`}
            >
              {s === "andar" ? "Andar do robô" : s}
            </button>
          ))}
        </div>
      </label>

      {subject === "giroscopio" && (
        <label className="form-control">
          <div className="label">
            <span className="label-text">Eixos</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {AXES.map((axis) => (
              <label key={axis} className="flex items-center gap-2 text-sm capitalize">
                <input
                  type="checkbox"
                  className="checkbox checkbox-info"
                  checked={axes.includes(axis)}
                  onChange={() => toggleAxis(axis)}
                />
                {axis}
              </label>
            ))}
          </div>
        </label>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-info"
          disabled={!canSave}
          onClick={() =>
            onSaved("programacao", subject === "giroscopio" ? { subject, axes } : { subject })
          }
        >
          Salvar configuração
        </button>
      </div>
    </div>
  );
}

const SENSORS = ["luz", "ultrassonico"] as const;

function SensoresForm({ onSaved }: { onSaved: (subtype: "sensores", config: unknown) => void }) {
  const [sensors, setSensors] = useState<Array<(typeof SENSORS)[number]>>([]);

  function toggle(sensor: (typeof SENSORS)[number]) {
    setSensors((prev) => (prev.includes(sensor) ? prev.filter((s) => s !== sensor) : [...prev, sensor]));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {SENSORS.map((sensor) => (
          <label key={sensor} className="flex items-center gap-2 text-sm capitalize">
            <input
              type="checkbox"
              className="checkbox checkbox-info"
              checked={sensors.includes(sensor)}
              onChange={() => toggle(sensor)}
            />
            {sensor}
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-info"
          disabled={sensors.length === 0}
          onClick={() => onSaved("sensores", { sensors })}
        >
          Salvar configuração
        </button>
      </div>
    </div>
  );
}

export function CalibraBotSetup({ testId }: { testId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subtype, setSubtype] = useState<CalibrationSubtype | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSaved(kind: CalibrationSubtype, config: unknown) {
    setError(null);
    startTransition(async () => {
      try {
        await saveCalibrationPlan(testId, kind, config as never);
        router.push(`/dashboard/labtest/${testId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar a configuração.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="label">
          <span className="label-text">Tipo de teste</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SUBTYPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSubtype(s.value)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                subtype === s.value ? "border-info bg-info/5" : "border-base-300"
              }`}
            >
              <p className="font-semibold">{s.label}</p>
              <p className="mt-1 text-xs text-base-content/60">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {subtype === "atuadores" && <AtuadoresForm onSaved={handleSaved} />}
      {subtype === "programacao" && <ProgramacaoForm onSaved={handleSaved} />}
      {subtype === "sensores" && <SensoresForm onSaved={handleSaved} />}

      {error && <div className="alert alert-error text-sm">{error}</div>}
      {isPending && <p className="text-sm text-base-content/50">Salvando…</p>}
    </div>
  );
}