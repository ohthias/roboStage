"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveCalibrationPlan } from "../../actions";
import type { CalibrationSubtype } from "./types";

// Agrupamento só pra UX — o que é salvo em `calibration_type` é sempre um
// dos 10 valores concretos do enum, nunca o nome da categoria.
const CATEGORIES = [
  {
    key: "atuadores",
    label: "Atuadores",
    desc: "Motores em pares, trios ou individualmente.",
  },
  {
    key: "programacao",
    label: "Programação",
    desc: "PID, giroscópio, seguidor de linha ou curvas.",
  },
  {
    key: "sensores",
    label: "Sensores",
    desc: "Cor/luz, distância ou sensor genérico.",
  },
  {
    key: "outro",
    label: "Outro",
    desc: "Não se encaixa nas categorias acima.",
  },
] as const;

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

function AtuadoresForm({
  onSaved,
}: {
  onSaved: (subtype: CalibrationSubtype, config: unknown) => void;
}) {
  const [subtype, setSubtype] = useState<"motor" | "servo">("motor");
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
          <span className="label-text">Tipo de atuador</span>
        </div>
        <div className="join">
          {(["motor", "servo"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubtype(s)}
              className={`join-item btn btn-sm capitalize ${
                subtype === s ? "btn-info" : "btn-ghost border-base-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </label>

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
          onClick={() => onSaved(subtype, { actuators, grouping, combinations: combos })}
        >
          Salvar configuração
        </button>
      </div>
    </div>
  );
}

const AXES = ["arfagem", "guinada", "rotacao"] as const;

function ProgramacaoForm({
  onSaved,
}: {
  onSaved: (subtype: CalibrationSubtype, config: unknown) => void;
}) {
  const [subtype, setSubtype] = useState<"pid" | "giroscopio" | "linha" | "curvas">("pid");
  const [axes, setAxes] = useState<Array<(typeof AXES)[number]>>([]);
  const [notes, setNotes] = useState("");

  function toggleAxis(axis: (typeof AXES)[number]) {
    setAxes((prev) => (prev.includes(axis) ? prev.filter((a) => a !== axis) : [...prev, axis]));
  }

  const canSave = subtype !== "giroscopio" || axes.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <label className="form-control">
        <div className="label">
          <span className="label-text">O que testar</span>
        </div>
        <div className="join flex-wrap">
          {(["pid", "giroscopio", "linha", "curvas"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubtype(s)}
              className={`join-item btn btn-sm capitalize ${
                subtype === s ? "btn-info" : "btn-ghost border-base-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </label>

      {subtype === "giroscopio" && (
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

      {subtype !== "giroscopio" && (
        <label className="form-control">
          <div className="label">
            <span className="label-text">Notas (opcional)</span>
          </div>
          <textarea
            className="textarea textarea-bordered"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-info"
          disabled={!canSave}
          onClick={() =>
            onSaved(subtype, subtype === "giroscopio" ? { axes } : { notes: notes || undefined })
          }
        >
          Salvar configuração
        </button>
      </div>
    </div>
  );
}

function SensoresForm({
  onSaved,
}: {
  onSaved: (subtype: CalibrationSubtype, config: unknown) => void;
}) {
  const [subtype, setSubtype] = useState<"sensor_cor" | "sensor_distancia" | "sensor">("sensor_cor");
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <label className="form-control">
        <div className="label">
          <span className="label-text">Sensor</span>
        </div>
        <div className="join flex-wrap">
          {[
            { value: "sensor_cor" as const, label: "Cor / luz" },
            { value: "sensor_distancia" as const, label: "Distância" },
            { value: "sensor" as const, label: "Genérico" },
          ].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSubtype(s.value)}
              className={`join-item btn btn-sm ${
                subtype === s.value ? "btn-info" : "btn-ghost border-base-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </label>

      <label className="form-control">
        <div className="label">
          <span className="label-text">Notas (opcional)</span>
        </div>
        <textarea
          className="textarea textarea-bordered"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-info"
          onClick={() => onSaved(subtype, { notes: notes || undefined })}
        >
          Salvar configuração
        </button>
      </div>
    </div>
  );
}

function OutroForm({
  onSaved,
}: {
  onSaved: (subtype: CalibrationSubtype, config: unknown) => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <label className="form-control">
        <div className="label">
          <span className="label-text">Descreva o que vai testar</span>
        </div>
        <textarea
          className="textarea textarea-bordered"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-info"
          disabled={!notes.trim()}
          onClick={() => onSaved("outro", { notes })}
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
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["key"] | null>(null);
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                category === c.key ? "border-info bg-info/5" : "border-base-300"
              }`}
            >
              <p className="font-semibold">{c.label}</p>
              <p className="mt-1 text-xs text-base-content/60">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {category === "atuadores" && <AtuadoresForm onSaved={handleSaved} />}
      {category === "programacao" && <ProgramacaoForm onSaved={handleSaved} />}
      {category === "sensores" && <SensoresForm onSaved={handleSaved} />}
      {category === "outro" && <OutroForm onSaved={handleSaved} />}

      {error && <div className="alert alert-error text-sm">{error}</div>}
      {isPending && <p className="text-sm text-base-content/50">Salvando…</p>}
    </div>
  );
}