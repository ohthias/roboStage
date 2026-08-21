"use client";

// ---------------------------------------------------------------------------
// Renderiza o input certo (número, sim/não, texto, seleção...) para um
// FieldDefinition. Usado pelo ResultForm em qualquer modo — é o que permite
// o modo Personalizado registrar lançamentos sem nenhum código específico.
// ---------------------------------------------------------------------------

import { CheckCircle2, XCircle } from "lucide-react";
import type { FieldDefinition, FieldValue } from "@/types/labtest.types";

export function FieldValueInput({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: FieldValue["value"];
  onChange: (value: FieldValue["value"]) => void;
}) {
  switch (field.type) {
    case "boolean":
      return (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`btn btn-xs gap-1 rounded-lg transition-all ${
              value === true
                ? "btn-success text-success-content"
                : "btn-ghost text-base-content/40 hover:bg-success/10 hover:text-success"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sim
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`btn btn-xs gap-1 rounded-lg transition-all ${
              value === false
                ? "btn-error text-error-content"
                : "btn-ghost text-base-content/40 hover:bg-error/10 hover:text-error"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            Não
          </button>
        </div>
      );

    case "select":
      return (
        <select
          className="select select-bordered select-sm w-full focus:select-primary"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Selecione...</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "text":
      return (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="input input-bordered input-sm w-full focus:input-primary"
        />
      );

    case "duration":
      return (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            value={typeof value === "number" ? value : ""}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : null)
            }
            className="input input-bordered input-sm w-24 focus:input-primary"
          />
          <span className="text-xs text-base-content/40">{field.unit ?? "s"}</span>
        </div>
      );

    case "number":
    default:
      return (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            max={field.targetValue ?? undefined}
            placeholder="0"
            value={typeof value === "number" ? value : ""}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : null)
            }
            className="input input-bordered input-sm w-28 focus:input-primary"
          />
          {field.unit && (
            <span className="text-xs text-base-content/40">{field.unit}</span>
          )}
          {field.targetValue != null && (
            <span className="text-xs text-base-content/40">/ {field.targetValue}</span>
          )}
        </div>
      );
  }
}
