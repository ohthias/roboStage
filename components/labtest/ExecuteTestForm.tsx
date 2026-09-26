"use client";

// ---------------------------------------------------------------------------
// Formulário de página cheia para registrar uma execução (lançamento) de um
// teste e enviar direto ao banco (test_executions), usado pela rota
// /dashboard/labtest/[id]/execute. Diferente do ResultForm (modal, múltiplos
// rascunhos de uma vez), esta tela registra UMA execução por envio — pensada
// para ser aberta rapidamente antes/depois de rodar o teste no robô.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Plus, Save, Trash2 } from "lucide-react";

import type { FieldDefinition, FieldValue } from "@/types/labtest.types";
import { emptyValueForType } from "@/types/labtest.types";
import { getModeDefinition, ACCENT_STYLES } from "@/utils/labtest/modes";
import { FieldValueInput } from "./FieldValueInput";
import { SectionDivider } from "./shared";
import { createTestExecution } from "@/app/(protected)/dashboard/labtest/actions";

interface ExecuteTestFormProps {
  testId: string;
  mode: string;
  season?: string | null;
  testName: string;
  fields: FieldDefinition[];
  nextExecutionNumber: number;
  isMotorPairs?: boolean;
}

interface ExecutionDraft {
  id: number;
  selectedPair: string;
  values: FieldValue[];
  missionAnswers: Record<string, MissionAnswerDraft>;
  notes: string;
}

interface MissionAnswerDraft {
  value: number;
  subAnswers: Record<string, number>;
}

interface RawMission {
  id: string;
  name: string;
  type?: [string, ...(string | number | null)[]];
  "sub-mission"?: Array<{
    id?: string;
    submission: string;
    type?: [string, ...(string | number | null)[]];
  }>;
}

let nextDraftId = 1;

export default function ExecuteTestForm({
  testId,
  mode,
  season,
  testName,
  fields,
  nextExecutionNumber,
  isMotorPairs = false,
}: ExecuteTestFormProps) {
  const router = useRouter();
  const modeDef = getModeDefinition(mode as Parameters<typeof getModeDefinition>[0]);
  const Icon = modeDef.icon;
  const accent = ACCENT_STYLES[modeDef.accent];
  const isFllRuns = mode === "runs" && Boolean(season);
  const [missionCatalog, setMissionCatalog] = useState<RawMission[]>([]);

  useEffect(() => {
    if (!isFllRuns) return;

    let active = true;
    fetch("/api/data/missions")
      .then((response) => response.json())
      .then((data: Record<string, RawMission[]>) => {
        if (active) setMissionCatalog(Array.isArray(data[season ?? ""]) ? data[season ?? ""] : []);
      })
      .catch(() => {
        if (active) setMissionCatalog([]);
      });

    return () => {
      active = false;
    };
  }, [isFllRuns, season]);

  const pairFields = isMotorPairs
    ? fields.filter(
        (field) => field.fieldKey.endsWith("__rotacao") || field.fieldKey.endsWith("__tempo"),
      )
    : [];
  const pairOptions = Array.from(
    new Set(pairFields.map((field) => field.fieldKey.replace(/__(rotacao|tempo)$/, ""))),
  );
  const makeDraft = (): ExecutionDraft => ({
    id: nextDraftId++,
    selectedPair: pairOptions[0] ?? "",
    values: fields.map((f) => ({ fieldKey: f.fieldKey, value: emptyValueForType(f.type) })),
    missionAnswers: Object.fromEntries(
      fields.map((field) => {
        const mission = missionCatalog.find((item) => item.id === field.fieldKey);
        return [
          field.fieldKey,
          {
            value: 0,
            subAnswers: Object.fromEntries(
              (mission?.["sub-mission"] ?? []).map((sub, index) => [sub.id ?? `${field.fieldKey}-sub-${index}`, 0]),
            ),
          },
        ];
      }),
    ),
    notes: "",
  });
  const [drafts, setDrafts] = useState<ExecutionDraft[]>(() => [makeDraft()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fllMissions = fields
    .map((field) => missionCatalog.find((mission) => mission.id === field.fieldKey))
    .filter((mission): mission is RawMission => Boolean(mission));

  const updateMissionValue = (draftId: number, missionId: string, value: number) =>
    setDrafts((prev) => prev.map((draft) => draft.id === draftId
      ? {
          ...draft,
          missionAnswers: {
            ...draft.missionAnswers,
            [missionId]: { ...draft.missionAnswers[missionId], value },
          },
          values: draft.values.map((item) => item.fieldKey === missionId ? { ...item, value } : item),
        }
      : draft));

  const updateSubAnswer = (draftId: number, missionId: string, subId: string, value: number) =>
    setDrafts((prev) => prev.map((draft) => draft.id === draftId
      ? {
          ...draft,
          missionAnswers: {
            ...draft.missionAnswers,
            [missionId]: {
              ...draft.missionAnswers[missionId],
              subAnswers: { ...draft.missionAnswers[missionId]?.subAnswers, [subId]: value },
            },
          },
        }
      : draft));

  const renderMissionInput = (
    type: RawMission["type"],
    value: number,
    onChange: (value: number) => void,
  ) => {
    const kind = type?.[0];
    const namedOptions = type?.slice(1).filter((item): item is string => typeof item === "string" && item.length > 0) ?? [];
    const options = kind === "range"
      ? Array.from({ length: Number(type?.[2] ?? 0) - Number(type?.[1] ?? 0) + 1 }, (_, index) => String(Number(type?.[1] ?? 0) + index))
      : namedOptions.map((label, index) => ({ label, value: String(index + 1) }));
    const visibleOptions = options.filter((option) => (typeof option === "string" ? option : option.value) !== "0");

    return (
      <select value={value} onChange={(event) => onChange(Number(event.target.value))} className="select select-bordered select-sm w-full">
        <option value="0">Não realizado</option>
        {visibleOptions.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return <option key={optionValue} value={optionValue}>{label}</option>;
        })}
        {kind === "switch" && namedOptions.length === 0 && <option value="1">Cumprido</option>}
      </select>
    );
  };

  const updateValue = (draftId: number, fieldKey: string, value: FieldValue["value"]) =>
    setDrafts((prev) => prev.map((draft) => draft.id === draftId
      ? { ...draft, values: draft.values.map((v) => (v.fieldKey === fieldKey ? { ...v, value } : v)) }
      : draft));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      for (const draft of drafts) {
        const fieldsForExecution = pairOptions.length
          ? fields.filter((field) => field.fieldKey.startsWith(`${draft.selectedPair}__`))
          : fields;
        const results = Object.fromEntries(
          draft.values
            .filter((value) => fieldsForExecution.some((field) => field.fieldKey === value.fieldKey))
            .map((value) => [value.fieldKey, value.value]),
        );
        const executionResults = isFllRuns && fllMissions.length > 0
          ? {
              answers: Object.fromEntries(fllMissions.map((mission, missionIndex) => {
                const answer = draft.missionAnswers[mission.id] ?? { value: 0, subAnswers: {} };
                return [mission.id, {
                  order: missionIndex,
                  value: answer.value,
                  missionId: mission.id,
                  subAnswers: answer.subAnswers,
                  objectiveAnswers: {},
                }];
              })),
              missions: fllMissions.map((mission) => mission.id),
            }
          : results;
        await createTestExecution({ testId, notes: draft.notes.trim() || undefined, results: executionResults });
      }
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
          <div className="flex items-center justify-between gap-3">
            <SectionDivider label={`Execuções (${drafts.length})`} />
            <button type="button" onClick={() => setDrafts((prev) => [...prev, makeDraft()])} className="btn btn-ghost btn-sm gap-1">
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {drafts.map((draft, index) => {
              const fieldsForExecution = pairOptions.length
                ? fields.filter((field) => field.fieldKey.startsWith(`${draft.selectedPair}__`))
                : fields;
              return (
                <div key={draft.id} className="rounded-xl border border-base-content/10 bg-base-200/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Execução {index + 1}</span>
                    {drafts.length > 1 && (
                      <button type="button" onClick={() => setDrafts((prev) => prev.filter((item) => item.id !== draft.id))} className="btn btn-ghost btn-xs text-error" aria-label={`Remover execução ${index + 1}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {pairOptions.length > 0 && (
                    <select value={draft.selectedPair} onChange={(e) => setDrafts((prev) => prev.map((item) => item.id === draft.id ? { ...item, selectedPair: e.target.value } : item))} className="select select-bordered select-sm mb-3 w-full" required>
                      {pairOptions.map((pair) => {
                        const pairField = pairFields.find((field) => field.fieldKey.startsWith(`${pair}__`));
                        return <option key={pair} value={pair}>{pairField?.label.split(" · ")[0] ?? pair}</option>;
                      })}
                    </select>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {isFllRuns && fllMissions.length > 0 ? fllMissions.map((mission) => {
                      const answer = draft.missionAnswers[mission.id] ?? { value: 0, subAnswers: {} };
                      return <div key={mission.id} className="form-control gap-1 sm:col-span-2">
                        <label className="label py-0"><span className="label-text text-xs font-medium">{mission.id} · {mission.name}</span></label>
                        {renderMissionInput(mission.type, answer.value, (value) => updateMissionValue(draft.id, mission.id, value))}
                        {(mission["sub-mission"] ?? []).map((sub, subIndex) => {
                          const subId = sub.id ?? `${mission.id}-sub-${subIndex}`;
                          return <div key={subId} className="ml-4 mt-2 form-control gap-1">
                            <label className="label py-0"><span className="label-text text-xs">{sub.submission}</span></label>
                            {renderMissionInput(sub.type, answer.subAnswers[subId] ?? 0, (value) => updateSubAnswer(draft.id, mission.id, subId, value))}
                          </div>;
                        })}
                      </div>;
                    }) : fieldsForExecution.map((field) => {
                      const fv = draft.values.find((v) => v.fieldKey === field.fieldKey);
                      return <div key={field.fieldKey} className="form-control gap-1"><label className="label py-0"><span className="label-text text-xs font-medium">{field.label}</span></label>{field.description && <p className="text-xs text-base-content/55">{field.description}</p>}<FieldValueInput field={field} value={fv?.value ?? null} onChange={(value) => updateValue(draft.id, field.fieldKey, value)} /></div>;
                    })}
                  </div>
                  <textarea rows={2} placeholder="Observações (opcional)" value={draft.notes} onChange={(e) => setDrafts((prev) => prev.map((item) => item.id === draft.id ? { ...item, notes: e.target.value } : item))} className="textarea textarea-bordered textarea-sm mt-3 w-full resize-none text-sm" />
                </div>
              );
            })}
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
