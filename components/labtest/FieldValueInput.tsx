"use client";

// ---------------------------------------------------------------------------
// Renderiza o input certo (número, sim/não, texto, seleção...) para um
// FieldDefinition. Usado pela execução em qualquer modo —
// é o que permite o modo Personalizado registrar lançamentos sem nenhum
// código específico.
// ---------------------------------------------------------------------------

import type { FieldDefinition, FieldValue } from "@/types/labtest.types";

const segBase =
  "cursor-pointer rounded-tl-lg rounded-br-lg px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function FieldValueInput({
  field,
  value,
  onChange,
  id,
  invalid = false,
}: {
  field: FieldDefinition;
  value: FieldValue["value"];
  onChange: (value: FieldValue["value"]) => void;
  id?: string;
  invalid?: boolean;
}) {
  const invalidCls = invalid ? "input-error" : "";

  switch (field.type) {
    case "boolean":
      return (
        <div
          role="radiogroup"
          aria-label={field.label}
          className="inline-flex gap-1 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/50 p-1"
        >
          {[
            { v: true, label: "Sim" },
            { v: false, label: "Não" },
          ].map((o) => {
            const active = value === o.v;
            return (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(active ? null : o.v)}
                className={`${segBase} ${
                  active
                    ? o.v
                      ? "bg-success text-success-content"
                      : "bg-base-content text-base-100"
                    : "text-base-content/55 hover:text-base-content"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      );

    case "select":
      return (
        <select
          id={id}
          className={`select w-full ${invalid ? "select-error" : ""}`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Selecione…</option>
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
          id={id}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={`input w-full ${invalidCls}`}
          placeholder="Escreva aqui"
        />
      );

    case "duration":
    case "number":
    default: {
      const min = field.type === "duration" ? 0 : (field.min ?? undefined);
      const max = field.max ?? undefined;
      const unit = field.unit ?? (field.type === "duration" ? "s" : null);
      return (
        <div className="flex flex-wrap items-center gap-2">
          <label className={`input w-full max-w-56 ${invalidCls}`}>
            <input
              id={id}
              type="number"
              inputMode="decimal"
              step="any"
              min={min}
              max={max}
              placeholder={
                min !== undefined && max !== undefined ? `${min} a ${max}` : "0"
              }
              value={typeof value === "number" ? value : ""}
              onChange={(e) =>
                onChange(e.target.value === "" ? null : Number(e.target.value))
              }
              className="grow tabular-nums"
            />
            {unit && (
              <span className="text-xs text-base-content/45">{unit}</span>
            )}
          </label>
          {field.targetValue != null && (
            <span className="font-mono text-xs text-base-content/50">
              meta {field.targetValue}
              {unit ? ` ${unit}` : ""}
            </span>
          )}
        </div>
      );
    }
  }
}
