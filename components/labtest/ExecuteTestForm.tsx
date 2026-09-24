"use client";

// ---------------------------------------------------------------------------
// Formulário de página cheia para registrar uma execução (lançamento) de um
// teste e enviar direto ao banco (test_executions), usado pela rota
// /dashboard/labtest/[id]/execute. Diferente do ResultForm (modal, múltiplos
// rascunhos de uma vez), esta tela registra UMA execução por envio — pensada
// para ser aberta rapidamente antes/depois de rodar o teste no robô.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Save, Sigma } from "lucide-react";

import type { FieldDefinition, FieldValue } from "@/types/labtest.types";
import { emptyValueForType, getNumericValue } from "@/types/labtest.types";
import { getModeDefinition, ACCENT_STYLES } from "@/utils/labtest/modes";
import { FieldValueInput } from "./FieldValueInput";
import { SectionDivider } from "./shared";
import { createTestExecution } from "@/app/(protected)/dashboard/labtest/actions";

interface ExecuteTestFormProps {
  testId: string;
  mode: string;
  testName: string;
  fields: FieldDefinition[];
  nextExecutionNumber: number;
}

export default function ExecuteTestForm({
  testId,
  mode,
  testName,
  fields,
  nextExecutionNumber,
}: ExecuteTestFormProps) {
  const router = useRouter();
  const modeDef = getModeDefinition(mode as Parameters<typeof getModeDefinition>[0]);
  const Icon = modeDef.icon;
  const accent = ACCENT_STYLES[modeDef.accent];

  const [values, setValues] = useState<FieldValue[]>(
    fields.map((f) => ({ fieldKey: f.fieldKey, value: emptyValueForType(f.type) })),
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateValue = (fieldKey: string, value: FieldValue["value"]) =>
    setValues((prev) => prev.map((v) => (v.fieldKey === fieldKey ? { ...v, value } : v)));

  const numericFields = fields.filter((f) => f.type === "number" || f.type === "duration");
  const total = numericFields.reduce((sum, f) => sum + getNumericValue(values, f.fieldKey), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const results = Object.fromEntries(values.map((v) => [v.fieldKey, v.value]));
      await createTestExecution({ testId, notes: notes.trim() || undefined, results });
      router.push(`/dashboard/labtest/${testId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar a execução.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-5">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.bgSoft}`}>
          <FlaskConical className={`h-5 w-5 ${accent.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-base-content/45">
            Registrar execução #{nextExecutionNumber}
          </p>
          <h2 className="truncate text-base font-semibold leading-tight">{testName}</h2>
        </div>
        <span className={`badge badge-outline hidden items-center gap-1.5 py-3 sm:flex ${accent.text}`}>
          <Icon className="h-3.5 w-3.5" />
          {modeDef.label}
        </span>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-10 text-center text-sm text-base-content/45">
          Este teste ainda não tem parâmetros configurados para registrar.
        </div>
      ) : (
        <div className="rounded-2xl border border-base-content/10 bg-base-100 p-5">
          <SectionDivider label="Valores desta execução" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((field) => {
              const fv = values.find((v) => v.fieldKey === field.fieldKey);
              return (
                <div key={field.fieldKey} className="form-control gap-1">
                  <label className="label py-0">
                    <span className="label-text text-xs font-medium">{field.label}</span>
                  </label>
                  <FieldValueInput
                    field={field}
                    value={fv?.value ?? null}
                    onChange={(value) => updateValue(field.fieldKey, value)}
                  />
                </div>
              );
            })}
          </div>

          {numericFields.length > 1 && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-base-content/8 bg-base-200/60 px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <Sigma className="h-4 w-4" />
                <span>Somatório dos campos numéricos</span>
              </div>
              <span className={`text-base font-bold ${accent.text}`}>{total}</span>
            </div>
          )}

          <div className="form-control mt-4 gap-1">
            <label className="label py-0">
              <span className="label-text text-xs font-medium">Observações</span>
              <span className="label-text-alt text-base-content/35">opcional</span>
            </label>
            <textarea
              rows={3}
              placeholder="Comportamento observado, anomalias, contexto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea textarea-bordered textarea-sm resize-none text-sm"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-xs text-error">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost gap-2 text-base-content/50"
        >
          Cancelar
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary gap-2">
          <Save className="h-4 w-4" />
          {submitting ? "Salvando..." : "Salvar execução"}
        </button>
      </div>
    </form>
  );
}
