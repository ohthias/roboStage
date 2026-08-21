"use client";

// ---------------------------------------------------------------------------
// Modal de criação de teste. É aqui que os 4 modos realmente se diferenciam:
// - runs / individual: puxam o catálogo oficial de missões da temporada
//   (useMissionCatalog -> /api/data/missions) e usam isso como `fields`.
// - calibrabot / custom: usam o FieldSchemaEditor para o usuário desenhar
//   os próprios campos.
// No fim, os dois caminhos convergem para o mesmo formato (FieldDefinition[])
// e chamam useCreateTest — por isso o resto do app não precisa saber a
// diferença.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { X, FlaskConical } from "lucide-react";
import { useCreateTest, useMissionCatalog } from "@/hooks/useLabTests";
import { LAB_TEST_MODE_LIST, getModeDefinition, ACCENT_STYLES } from "@/utils/labtest/modes";
import { FieldSchemaEditor, newField } from "./FieldSchemaEditor";
import type { FieldDefinition, FieldType, ModeId } from "@/types/labtest.types";

const SEASONS = [
  { value: "unearthed", label: "UNEARTHED℠ (2023/24)" },
  { value: "masterpiece", label: "MASTERPIECE™ (2024/25)" },
  { value: "submerged", label: "SUBMERGED℠ (2025/26)" },
  { value: "bioglow", label: "BIOGLOW™ (2026/27)" },
];

const ALLOWED_TYPES_BY_MODE: Record<ModeId, FieldType[]> = {
  runs: ["number"],
  individual: ["number"],
  calibrabot: ["number", "boolean", "text", "select", "duration"],
  custom: ["number", "boolean", "text", "select", "duration"],
};

export default function LabTestForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { createTest, submitting, error } = useCreateTest();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<ModeId>("runs");
  const [season, setSeason] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<FieldDefinition[]>([newField()]);

  const usesMissionCatalog = mode === "runs" || mode === "individual";
  const { missions, loading: missionsLoading } = useMissionCatalog(
    usesMissionCatalog ? season : null,
  );

  const modeDef = getModeDefinition(mode);
  const accent = ACCENT_STYLES[modeDef.accent];

  const fieldsToSave = useMemo(() => {
    if (usesMissionCatalog) return missions;
    return customFields.filter((f) => f.label.trim().length > 0);
  }, [usesMissionCatalog, missions, customFields]);

  const canSubmit =
    name.trim().length > 0 &&
    (!usesMissionCatalog || (!!season && missions.length > 0)) &&
    (usesMissionCatalog || fieldsToSave.length > 0) &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const id = await createTest({
        name: name.trim(),
        description: description.trim() || null,
        mode,
        season: season || null,
        fields: fieldsToSave,
      });
      if (id) onSuccess();
    } catch {
      // erro já exposto via `error`, abaixo do formulário
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-base-100 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-base-content/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent.bgSoft}`}>
              <FlaskConical className={`h-4 w-4 ${accent.text}`} />
            </div>
            <h2 className="text-base font-semibold">Novo teste</h2>
          </div>
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm btn-circle">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {LAB_TEST_MODE_LIST.map(({ id, label, icon: Icon, accent: a }) => {
              const style = ACCENT_STYLES[a];
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`btn btn-sm gap-2 rounded-xl border ${
                    active
                      ? `${style.bgSoft} ${style.text} ${style.borderSoft}`
                      : "btn-ghost border-transparent text-base-content/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
          <p className="-mt-3 text-xs text-base-content/40">{modeDef.description}</p>

          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-xs font-medium">Nome do teste</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Run de qualificação 1"
              className="input input-bordered focus:input-primary"
              required
            />
          </div>

          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-xs font-medium">Descrição</span>
              <span className="label-text-alt text-base-content/35">opcional</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered resize-none text-sm"
            />
          </div>

          {usesMissionCatalog ? (
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text text-xs font-medium">Temporada</span>
              </label>
              <select
                className="select select-bordered focus:select-primary"
                value={season ?? ""}
                onChange={(e) => setSeason(e.target.value || null)}
              >
                <option value="">Selecione a temporada...</option>
                {SEASONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {season && missionsLoading && (
                <p className="mt-1 text-xs text-base-content/40">Carregando missões...</p>
              )}
              {season && !missionsLoading && missions.length > 0 && (
                <p className="mt-1 text-xs text-base-content/40">
                  {missions.length} missões carregadas do catálogo oficial.
                </p>
              )}
              {season && !missionsLoading && missions.length === 0 && (
                <p className="mt-1 text-xs text-warning">
                  Não encontramos missões para esta temporada.
                </p>
              )}
            </div>
          ) : (
            <div className="form-control gap-2">
              <label className="label py-0">
                <span className="label-text text-xs font-medium">
                  {mode === "calibrabot" ? "Variáveis observadas" : "Parâmetros que quero analisar"}
                </span>
              </label>
              <FieldSchemaEditor
                fields={customFields}
                setFields={setCustomFields}
                allowedTypes={ALLOWED_TYPES_BY_MODE[mode]}
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-error/20 bg-error/5 p-3 text-xs text-error">
              {error}
            </div>
          )}

          <div className="mt-auto flex items-center justify-end gap-2 border-t border-base-content/10 pt-4">
            <button type="button" onClick={onCancel} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={!canSubmit} className="btn btn-primary">
              {submitting ? "Salvando..." : "Criar teste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
