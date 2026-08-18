"use client";

import { useState, type FormEvent } from "react";
import { ChevronRight, FlaskConical, GripVertical, X } from "lucide-react";

import { BaseModal } from "../UI/Modal/BaseModal";
import { useToast } from "@/app/context/ToastContext";
import { useCreateTest, useMissionCatalog } from "@/hooks/useLabTests";
import { LAB_TEST_MODE_LIST, getModeDefinition } from "@/utils/labtest/modes";
import {
  FieldSchemaEditor,
  newField,
} from "./FieldSchemaEditor";
import { InfoBox, SectionDivider } from "./shared";
import type { FieldDefinition, ModeId } from "@/types/labtest.types";

type Season = "submerged" | "unearthed" | "";

const SEASONS: { id: Season; label: string; emoji: string }[] = [
  { id: "submerged", label: "Submerged", emoji: "🌊" },
  { id: "unearthed", label: "Unearthed", emoji: "🌍" },
];

interface LabTestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Painel: seleção/ordenação de missões do catálogo (usado por "runs")
// ---------------------------------------------------------------------------

function CatalogFieldPicker({
  catalog,
  loading,
  selected,
  setSelected,
}: {
  catalog: FieldDefinition[];
  loading: boolean;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const remove = (key: string) =>
    setSelected((prev) => prev.filter((k) => k !== key));

  const moveItem = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    setSelected((prev) => {
      const fromIndex = prev.indexOf(fromKey);
      const toIndex = prev.indexOf(toKey);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromKey);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionDivider label="Selecionar missões" />

      {loading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {catalog.map((f) => (
            <button
              key={f.fieldKey}
              type="button"
              onClick={() => toggle(f.fieldKey)}
              aria-pressed={selected.includes(f.fieldKey)}
              className={`flex items-center gap-2 rounded-md px-3 py-1 text-sm transition-colors ${
                selected.includes(f.fieldKey)
                  ? "bg-primary text-white"
                  : "bg-transparent text-base-content/70 hover:bg-base-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  selected.includes(f.fieldKey) ? "bg-white" : "bg-base-content/40"
                }`}
              />
              <span className="truncate">{f.label}</span>
              <span className="ml-auto text-[10px] opacity-70">
                {f.fieldKey}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <>
          <SectionDivider label="Ordem de execução" />
          <div className="flex flex-col gap-2">
            {selected.map((key, i) => {
              const f = catalog.find((x) => x.fieldKey === key);
              return (
                <div
                  key={key}
                  draggable
                  onDragStart={() => setDraggedId(key)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedId) moveItem(draggedId, key);
                    setDraggedId(null);
                  }}
                  onDragEnd={() => setDraggedId(null)}
                  className="flex items-center gap-3 rounded-xl border border-base-content/10 bg-base-200/60 px-4 py-2.5"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-base-content/30" />
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {f?.fieldKey} — {f?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(key)}
                    className="btn btn-ghost btn-xs rounded-lg text-base-content/40 hover:bg-error/10 hover:text-error"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <InfoBox>
        Após criar, você poderá registrar cada lançamento inserindo os
        resultados por missão conforme a ordem definida acima.
      </InfoBox>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

export default function LabTestForm({ onSuccess, onCancel }: LabTestFormProps) {
  const [mode, setMode] = useState<ModeId>("runs");
  const [name, setName] = useState("");
  const [season, setSeason] = useState<Season>("submerged");

  // campos de catálogo (runs / individual)
  const [selectedCatalogKeys, setSelectedCatalogKeys] = useState<string[]>([]);
  const { missions: catalog, loading: loadingCatalog } = useMissionCatalog(
    getModeDefinition(mode).requiresSeason ? season : null,
  );

  // campos definidos pelo usuário (calibrabot / custom)
  const [userFields, setUserFields] = useState<FieldDefinition[]>([
    newField("number"),
  ]);
  const [notes, setNotes] = useState("");

  const { addToast } = useToast();
  const { createTest, submitting, error: submitError } = useCreateTest();
  const modeDef = getModeDefinition(mode);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) {
      addToast("Informe o nome do teste.", "error");
      return;
    }
    if (modeDef.requiresSeason && !season) {
      addToast("Selecione a temporada.", "error");
      return;
    }
    if (modeDef.fieldSource === "catalog" && selectedCatalogKeys.length === 0) {
      addToast("Selecione ao menos uma missão.", "error");
      return;
    }
    if (
      modeDef.fieldSource === "user-defined" &&
      userFields.every((f) => !f.label.trim())
    ) {
      addToast("Defina ao menos um parâmetro.", "error");
      return;
    }

    let fields: FieldDefinition[];
    if (modeDef.fieldSource === "catalog") {
      fields = selectedCatalogKeys.map((key, index) => {
        const f = catalog.find((c) => c.fieldKey === key)!;
        return { ...f, order: index };
      });
    } else {
      fields = userFields
        .filter((f) => f.label.trim())
        .map((f, index) => ({ ...f, order: index }));
    }

    try {
      await createTest({
        name: cleanName,
        description: mode === "individual" ? notes.trim() || null : null,
        mode,
        season: modeDef.requiresSeason ? season : null,
        fields,
        config: { mode },
      });
      addToast("Teste criado com sucesso!", "success");
      onSuccess?.();
    } catch {
      addToast("Erro ao criar o teste. Tente novamente.", "error");
    }
  };

  return (
    <BaseModal
      title="Criar novo teste"
      description="Configure os detalhes iniciais do teste e selecione as missões ou parâmetros conforme o modo escolhido."
      onClose={() => onCancel?.()}
      size="md"
      open
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl flex-col gap-6"
      >
        {submitError && (
          <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {submitError}
          </div>
        )}

        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Nome do teste</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Missão 12 — Ciclo de ajuste"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input input-bordered w-full focus:input-primary"
          />
        </div>

        <div className="form-control gap-2">
          <label className="label py-0">
            <span className="label-text font-medium">Modo</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LAB_TEST_MODE_LIST.map(({ id, label, sublabel, icon: Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`relative flex cursor-pointer flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/8 shadow-sm shadow-primary/10"
                      : "border-base-content/15 hover:border-primary/30 hover:bg-base-200/50"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active ? "bg-primary/20" : "bg-base-200"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${active ? "text-primary" : "text-base-content/50"}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        active ? "text-primary" : "text-base-content"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-base-content/50">
                      {sublabel}
                    </p>
                  </div>
                  {active && (
                    <ChevronRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {modeDef.requiresSeason && (
          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Temporada</span>
            </label>
            <div className="flex gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeason(s.id)}
                  className={`btn btn-sm gap-2 rounded-xl border transition-all ${
                    season === s.id
                      ? "btn-primary border-primary"
                      : "btn-ghost border-base-content/15 hover:border-primary/40"
                  }`}
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="divider my-0" />

        {modeDef.fieldSource === "catalog" && (
          <CatalogFieldPicker
            catalog={catalog}
            loading={loadingCatalog}
            selected={selectedCatalogKeys}
            setSelected={setSelectedCatalogKeys}
          />
        )}

        {modeDef.fieldSource === "user-defined" && (
          <div className="flex flex-col gap-5">
            <SectionDivider
              label={mode === "custom" ? "Parâmetros do teste" : "Variáveis observadas"}
            />
            <FieldSchemaEditor
              fields={userFields}
              setFields={setUserFields}
              allowedTypes={modeDef.allowedFieldTypes}
              addLabel={
                mode === "custom" ? "Adicionar parâmetro" : "Adicionar variável"
              }
            />
            <InfoBox>
              {mode === "custom"
                ? "Cada parâmetro vira uma coluna nos lançamentos e um gráfico próprio na visualização — defina exatamente o que quer acompanhar."
                : "As variáveis definidas aqui serão registradas em cada combinação testada."}
            </InfoBox>
          </div>
        )}

        {mode === "individual" && (
          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Observações iniciais</span>
              <span className="label-text-alt text-base-content/40">opcional</span>
            </label>
            <textarea
              rows={3}
              placeholder="Hipótese ou contexto do teste..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea textarea-bordered w-full resize-none text-sm leading-relaxed focus:textarea-primary"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="btn btn-primary gap-2"
          >
            <FlaskConical className="h-4 w-4" />
            {submitting ? "Salvando..." : "Criar teste"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
