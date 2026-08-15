"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveCustomParameters } from "../../actions";
import type { CustomParameterInput, ParameterType } from "./types";

const MAX_PARAMETERS = 10;

const TYPE_LABELS: Record<ParameterType, string> = {
  text: "Texto",
  number: "Número",
  boolean: "Sim/Não",
  select: "Seleção",
};

function emptyParameter(): CustomParameterInput {
  return { name: "", type: "text", unit: "", description: "", isRequired: false };
}

export function PersonalizadoSetup({ testId }: { testId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [parameters, setParameters] = useState<CustomParameterInput[]>([emptyParameter()]);
  const [error, setError] = useState<string | null>(null);

  function update(index: number, patch: Partial<CustomParameterInput>) {
    setParameters((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function addParameter() {
    if (parameters.length >= MAX_PARAMETERS) return;
    setParameters((prev) => [...prev, emptyParameter()]);
  }

  function removeParameter(index: number) {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const cleaned = parameters
      .map((p) => ({ ...p, name: p.name.trim() }))
      .filter((p) => p.name.length > 0);

    if (cleaned.length === 0) {
      setError("Adicione ao menos um parâmetro com nome.");
      return;
    }
    const names = cleaned.map((p) => p.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      setError("Os nomes dos parâmetros precisam ser únicos.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await saveCustomParameters(testId, cleaned);
        router.push(`/dashboard/labtest/${testId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar os parâmetros.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-base-content/60">
        Defina até {MAX_PARAMETERS} parâmetros que esse teste vai medir. Dá pra editar depois, mas
        o nome de cada um precisa ser único.
      </p>

      <ul className="flex flex-col gap-4">
        {parameters.map((param, index) => (
          <li key={index} className="rounded-lg border border-base-300 p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="badge badge-secondary badge-outline">#{index + 1}</span>
              {parameters.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => removeParameter(index)}
                >
                  Remover
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Nome</span>
                </div>
                <input
                  className="input input-bordered input-sm"
                  value={param.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                  placeholder="ex: Distância percorrida"
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Tipo</span>
                </div>
                <select
                  className="select select-bordered select-sm"
                  value={param.type}
                  onChange={(e) => update(index, { type: e.target.value as ParameterType })}
                >
                  {(Object.keys(TYPE_LABELS) as ParameterType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Unidade (opcional)</span>
                </div>
                <input
                  className="input input-bordered input-sm"
                  value={param.unit}
                  onChange={(e) => update(index, { unit: e.target.value })}
                  placeholder="ex: cm, s, %"
                />
              </label>

              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-secondary checkbox-sm"
                  checked={param.isRequired}
                  onChange={(e) => update(index, { isRequired: e.target.checked })}
                />
                Obrigatório em toda execução
              </label>

              <label className="form-control sm:col-span-2">
                <div className="label">
                  <span className="label-text">Descrição (opcional)</span>
                </div>
                <textarea
                  className="textarea textarea-bordered textarea-sm"
                  rows={2}
                  value={param.description}
                  onChange={(e) => update(index, { description: e.target.value })}
                  placeholder="O que esse parâmetro representa e como medir"
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="btn btn-ghost btn-sm self-start"
        onClick={addParameter}
        disabled={parameters.length >= MAX_PARAMETERS}
      >
        + Adicionar parâmetro ({parameters.length}/{MAX_PARAMETERS})
      </button>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      <div className="flex justify-end">
        <button type="button" className="btn btn-secondary" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar parâmetros"}
        </button>
      </div>
    </div>
  );
}