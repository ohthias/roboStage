"use client";

// ---------------------------------------------------------------------------
// Formulário de lançamento de resultados — genérico para qualquer modo.
// Antes existiam 3 painéis (Runs/CalibraBot/Individual), cada um com sua
// própria forma de guardar valor. Agora todos usam a mesma estrutura:
// um FieldDefinition[] (vindo do teste) + N entradas, cada uma com um
// FieldValue por campo, renderizado via <FieldValueInput />.
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  FlaskConical,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  X,
} from "lucide-react";

import type { FieldDefinition, FieldValue } from "@/types/labtest.types";
import { emptyValueForType, getNumericValue } from "@/types/labtest.types";
import { getModeDefinition, ACCENT_STYLES } from "@/utils/labtest/modes";
import { FieldValueInput } from "./FieldValueInput";
import { SectionDivider } from "./shared";
import { useSaveEntries } from "@/hooks/useLabTests";
import type { ModeId } from "@/types/labtest.types";

let _uid = 1;
const uid = () => _uid++;

interface DraftEntry {
  id: number;
  values: FieldValue[];
  notes: string;
  collapsed: boolean;
}

function makeDraft(fields: FieldDefinition[]): DraftEntry {
  return {
    id: uid(),
    collapsed: false,
    notes: "",
    values: fields.map((f) => ({
      fieldKey: f.fieldKey,
      value: emptyValueForType(f.type),
    })),
  };
}

function entryTotal(entry: DraftEntry, fields: FieldDefinition[]) {
  return fields
    .filter((f) => f.type === "number")
    .reduce((sum, f) => sum + getNumericValue(entry.values, f.fieldKey), 0);
}

function CardShell({
  header,
  children,
  collapsed,
  onToggle,
  accentClass,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  accentClass: string;
}) {
  return (
    <div
      className={`rounded-2xl border transition-all ${
        collapsed ? "border-base-content/10 bg-base-200/40" : accentClass
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        {header}
        {collapsed ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-base-content/40" />
        ) : (
          <ChevronUp className="h-4 w-4 shrink-0 text-base-content/40" />
        )}
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-4 border-t border-base-content/8 px-4 pb-4 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

interface LabTestResponseFormProps {
  testId: string;
  mode: ModeId;
  testName: string;
  fields: FieldDefinition[];
  nextExecutionNumber: number;
  onSaved?: () => void;
}

export default function LabTestResponseForm({
  testId,
  mode,
  testName,
  fields,
  nextExecutionNumber,
  onSaved,
}: LabTestResponseFormProps) {
  const [open, setOpen] = useState(false);
  const modeDef = getModeDefinition(mode);
  const Icon = modeDef.icon;
  const accent = ACCENT_STYLES[modeDef.accent];

  const { saveEntries, submitting, error } = useSaveEntries(testId);
  const [drafts, setDrafts] = useState<DraftEntry[]>([makeDraft(fields)]);

  const addDraft = () => setDrafts((d) => [...d, makeDraft(fields)]);
  const removeDraft = (id: number) =>
    setDrafts((d) => d.filter((x) => x.id !== id));
  const toggleCollapse = (id: number) =>
    setDrafts((d) =>
      d.map((x) => (x.id === id ? { ...x, collapsed: !x.collapsed } : x)),
    );
  const updateNotes = (id: number, notes: string) =>
    setDrafts((d) => d.map((x) => (x.id === id ? { ...x, notes } : x)));
  const updateValue = (id: number, fieldKey: string, value: FieldValue["value"]) =>
    setDrafts((d) =>
      d.map((x) =>
        x.id === id
          ? {
              ...x,
              values: x.values.map((v) =>
                v.fieldKey === fieldKey ? { ...v, value } : v,
              ),
            }
          : x,
      ),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveEntries(
      drafts.map((d) => ({ values: d.values, notes: d.notes.trim() || null })),
      nextExecutionNumber,
    );
    setDrafts([makeDraft(fields)]);
    setOpen(false);
    onSaved?.();
  };

  const entryNoun =
    mode === "individual" ? "tentativa" : mode === "runs" ? "run" : "combinação";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn btn-sm gap-2 rounded-lg ${accent.text}`}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        Registrar resultado
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-base-100 sm:rounded-3xl"
      >
        <div className="flex items-start gap-3 border-b border-base-content/10 px-5 py-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-base-content/45">
              Registrar resultado
            </p>
            <h2 className="truncate text-base font-semibold leading-tight">{testName}</h2>
          </div>
          <div className={`badge badge-outline hidden items-center gap-1.5 py-3 sm:flex ${accent.text}`}>
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{modeDef.label}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <SectionDivider label="Lançamentos" />

          <div className="flex flex-col gap-3">
            {drafts.map((entry, i) => {
              const total = entryTotal(entry, fields);
              const hasNumericFields = fields.some((f) => f.type === "number");

              return (
                <CardShell
                  key={entry.id}
                  collapsed={entry.collapsed}
                  onToggle={() => toggleCollapse(entry.id)}
                  accentClass={`${accent.borderSoft} ${accent.bgSoft3}`}
                  header={
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${accent.bgSoft} ${accent.text}`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold capitalize leading-tight">
                          {entryNoun} #{i + 1}
                        </p>
                        {entry.collapsed && hasNumericFields && (
                          <p className="mt-0.5 text-xs text-base-content/45">{total} pts</p>
                        )}
                      </div>
                      {drafts.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDraft(entry.id);
                          }}
                          className="btn btn-ghost btn-xs ml-2 text-base-content/30 hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {fields.map((field) => {
                      const fv = entry.values.find((v) => v.fieldKey === field.fieldKey);
                      console.log("Field value for", field.fieldKey, fv);
                      return (
                        <div key={field.fieldKey} className="form-control gap-1">
                          <label className="label py-0">
                            <span className="label-text text-xs font-medium">{field.label}</span>
                          </label>
                          <FieldValueInput
                            field={field}
                            value={fv?.value ?? null}
                            onChange={(value) => updateValue(entry.id, field.fieldKey, value)}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {hasNumericFields && (
                    <div className="flex items-center justify-between rounded-xl border border-base-content/8 bg-base-200/60 px-4 py-2.5">
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <TrendingUp className="h-4 w-4" />
                        <span>Total do lançamento</span>
                      </div>
                      <span className={`text-base font-bold ${accent.text}`}>{total} pts</span>
                    </div>
                  )}

                  <div className="form-control gap-1">
                    <label className="label py-0">
                      <span className="label-text text-xs font-medium">Observações</span>
                      <span className="label-text-alt text-base-content/35">opcional</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Comportamento observado, anomalias, contexto..."
                      value={entry.notes}
                      onChange={(e) => updateNotes(entry.id, e.target.value)}
                      className="textarea textarea-bordered textarea-sm resize-none text-sm"
                    />
                  </div>
                </CardShell>
              );
            })}

            <button
              type="button"
              onClick={addDraft}
              className={`btn btn-ghost btn-sm mt-1 gap-2 self-start hover:bg-primary/10 ${accent.text}`}
            >
              <Plus className="h-4 w-4" />
              Novo lançamento
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-xs text-error">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-base-content/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-ghost gap-2 text-base-content/50"
          >
            <RotateCcw className="h-4 w-4" />
            Descartar
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary gap-2">
            <Save className="h-4 w-4" />
            {submitting ? "Salvando..." : "Salvar resultados"}
          </button>
        </div>
      </form>
    </div>
  );
}
