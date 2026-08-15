"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createPersonalizadoExecution } from "../../actions";
import type { ExecuteParameter } from "./types";

export function PersonalizadoExecuteForm({
  testId,
  parameters,
}: {
  testId: string;
  parameters: ExecuteParameter[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [operatorId, setOperatorId] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(parameters.map((p) => [p.id, p.type === "boolean" ? "false" : ""]))
  );

  function handleSubmit() {
    if (!operatorId.trim()) {
      setError("Informe quem operou o robô nessa execução.");
      return;
    }
    const missingRequired = parameters.filter((p) => p.isRequired && !values[p.id]?.trim());
    if (missingRequired.length > 0) {
      setError(`Preencha os parâmetros obrigatórios: ${missingRequired.map((p) => p.name).join(", ")}.`);
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await createPersonalizadoExecution(
          {
            testId,
            operatorId: operatorId.trim(),
            durationSeconds: durationSeconds ? Number.parseFloat(durationSeconds) : undefined,
            notes: notes.trim() || undefined,
          },
          {
            values: parameters
              .filter((p) => values[p.id]?.trim().length > 0)
              .map((p) => ({ parameterId: p.id, value: values[p.id].trim() })),
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

      <ul className="flex flex-col gap-3">
        {parameters.map((param) => (
          <li key={param.id} className="rounded-lg border border-base-300 p-3">
            <label className="form-control">
              <div className="label">
                <span className="label-text">
                  {param.name}
                  {param.isRequired && <span className="text-error"> *</span>}
                  {param.unit && <span className="text-base-content/40"> ({param.unit})</span>}
                </span>
              </div>

              {param.type === "boolean" ? (
                <div className="join w-fit">
                  <button
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, [param.id]: "true" }))}
                    className={`join-item btn btn-sm ${
                      values[param.id] === "true" ? "btn-secondary" : "btn-ghost border-base-300"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, [param.id]: "false" }))}
                    className={`join-item btn btn-sm ${
                      values[param.id] === "false" ? "btn-secondary" : "btn-ghost border-base-300"
                    }`}
                  >
                    Não
                  </button>
                </div>
              ) : (
                <input
                  type={param.type === "number" ? "number" : "text"}
                  className="input input-bordered input-sm"
                  value={values[param.id]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [param.id]: e.target.value }))}
                />
              )}

              {param.description && (
                <p className="mt-1 text-xs text-base-content/50">{param.description}</p>
              )}
            </label>
          </li>
        ))}
      </ul>

      <label className="form-control">
        <div className="label">
          <span className="label-text">Observações gerais (opcional)</span>
        </div>
        <textarea className="textarea textarea-bordered" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      <div className="flex justify-end">
        <button type="button" className="btn btn-secondary" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Registrando…" : "Registrar execução"}
        </button>
      </div>
    </div>
  );
}