"use client";

// ---------------------------------------------------------------------------
// Editor genérico de campos — usado tanto pelo CalibraBot ("variáveis
// observadas") quanto pelo modo Personalizado ("parâmetros que quero
// analisar"). É a mesma peça de UI nos dois lugares; a única diferença entre
// os modos é a lista de tipos permitidos (`allowedTypes`).
// ---------------------------------------------------------------------------

import { Plus, Trash2 } from "lucide-react";
import type { FieldDefinition, FieldType } from "@/types/labtest.types";

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  number: "Número",
  boolean: "Sim / não",
  text: "Texto",
  select: "Opções (lista)",
  duration: "Duração",
};

let _draftId = 1;
const nextKey = () => `campo_${_draftId++}`;

export function newField(type: FieldType = "number"): FieldDefinition {
  return {
    fieldKey: nextKey(),
    label: "",
    type,
    unit: null,
    targetValue: null,
    order: 0,
    required: false,
    source: "manual",
  };
}

export function FieldSchemaEditor({
  fields,
  setFields,
  allowedTypes,
  addLabel = "Adicionar parâmetro",
}: {
  fields: FieldDefinition[];
  setFields: React.Dispatch<React.SetStateAction<FieldDefinition[]>>;
  allowedTypes: FieldType[];
  addLabel?: string;
}) {
  const add = () => {
    setFields((prev) => [
      ...prev,
      { ...newField(allowedTypes[0] ?? "number"), order: prev.length },
    ]);
  };

  const remove = (fieldKey: string) =>
    setFields((prev) => prev.filter((f) => f.fieldKey !== fieldKey));

  const update = (fieldKey: string, patch: Partial<FieldDefinition>) =>
    setFields((prev) =>
      prev.map((f) => (f.fieldKey === fieldKey ? { ...f, ...patch } : f)),
    );

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field) => (
        <div
          key={field.fieldKey}
          className="flex flex-col gap-2 rounded-xl border border-base-content/10 bg-base-200/40 p-3 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            placeholder="Nome do parâmetro (ex: velocidade, ângulo...)"
            value={field.label}
            onChange={(e) => update(field.fieldKey, { label: e.target.value })}
            className="input input-bordered input-sm flex-1 focus:input-primary"
          />

          {allowedTypes.length > 1 && (
            <select
              className="select select-bordered select-sm w-full sm:w-36"
              value={field.type}
              onChange={(e) =>
                update(field.fieldKey, { type: e.target.value as FieldType })
              }
            >
              {allowedTypes.map((t) => (
                <option key={t} value={t}>
                  {FIELD_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          )}

          {(field.type === "number" || field.type === "duration") && (
            <>
              <input
                type="text"
                placeholder="Unidade (ex: cm, s)"
                value={field.unit ?? ""}
                onChange={(e) =>
                  update(field.fieldKey, { unit: e.target.value || null })
                }
                className="input input-bordered input-sm w-full sm:w-28"
              />
              <input
                type="number"
                placeholder="Meta (opcional)"
                value={field.targetValue ?? ""}
                onChange={(e) =>
                  update(field.fieldKey, {
                    targetValue: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="input input-bordered input-sm w-full sm:w-28"
              />
            </>
          )}

          {field.type === "select" && (
            <input
              type="text"
              placeholder="Opções separadas por vírgula"
              value={(field.options ?? []).map((o) => o.label).join(", ")}
              onChange={(e) =>
                update(field.fieldKey, {
                  options: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((label) => ({ value: label, label })),
                })
              }
              className="input input-bordered input-sm flex-1"
            />
          )}

          {fields.length > 1 && (
            <button
              type="button"
              onClick={() => remove(field.fieldKey)}
              className="btn btn-ghost btn-sm self-end text-base-content/40 hover:text-error hover:bg-error/10 sm:self-auto"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="btn btn-ghost btn-sm mt-1 gap-2 self-start text-primary hover:bg-primary/10"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
