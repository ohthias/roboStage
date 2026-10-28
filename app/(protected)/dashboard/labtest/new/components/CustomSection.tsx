import { Plus, Trash2 } from "lucide-react";

import { CUSTOM_PARAM_TYPES } from "../Usecreatetest";
import { CharCount, Segmented } from "./FormBits";

const MAX_PARAMS = 10;

type ParamType = (typeof CUSTOM_PARAM_TYPES)[number]["value"];

export function CustomSection({
  customParams,
  addCustomParam,
  updateCustomParam,
  removeCustomParam,
  customMeta,
  updateCustomMeta,
}: {
  customParams: Array<{
    id: string;
    name: string;
    type: string;
    min?: number;
    max?: number;
  }>;
  addCustomParam: () => void;
  updateCustomParam: (
    id: string,
    patch: Partial<{ name: string; type: string; min?: number; max?: number }>,
  ) => void;
  removeCustomParam: (id: string) => void;
  customMeta: Record<string, { required: boolean; description: string }>;
  updateCustomMeta: (
    id: string,
    patch: Partial<{ required: boolean; description: string }>,
  ) => void;
}) {
  const full = customParams.length >= MAX_PARAMS;
  const smallLabel = "mb-1 block text-xs text-base-content/55";

  return (
    <div className="flex flex-col gap-3">
      {customParams.map((p, index) => {
        const description = customMeta[p.id]?.description ?? "";
        return (
          <div
            key={p.id}
            className="rounded-tl-xl rounded-br-xl border border-base-300 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-2.5 font-mono text-xs text-base-content/40">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={`param-name-${p.id}`} className="sr-only">
                      Nome do parâmetro {index + 1}
                    </label>
                    <input
                      id={`param-name-${p.id}`}
                      type="text"
                      className="input w-full font-medium"
                      value={p.name}
                      maxLength={50}
                      placeholder="Nome, ex: velocidade"
                      autoComplete="off"
                      onChange={(e) =>
                        updateCustomParam(p.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <Segmented
                    label={`Tipo do parâmetro ${index + 1}`}
                    value={p.type as ParamType}
                    options={CUSTOM_PARAM_TYPES}
                    onChange={(type) => updateCustomParam(p.id, { type })}
                  />
                </div>

                {p.type === "number" && (
                  <div className="grid max-w-xs grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor={`param-min-${p.id}`}
                        className={smallLabel}
                      >
                        Mínimo
                      </label>
                      <input
                        id={`param-min-${p.id}`}
                        type="number"
                        className="input input-sm w-full"
                        value={p.min ?? ""}
                        onChange={(e) =>
                          updateCustomParam(p.id, {
                            min:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`param-max-${p.id}`}
                        className={smallLabel}
                      >
                        Máximo
                      </label>
                      <input
                        id={`param-max-${p.id}`}
                        type="number"
                        className="input input-sm w-full"
                        value={p.max ?? 100}
                        onChange={(e) =>
                          updateCustomParam(p.id, {
                            max: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor={`param-desc-${p.id}`}
                      className={smallLabel}
                    >
                      Descrição (opcional)
                    </label>
                    <CharCount value={description} max={200} />
                  </div>
                  <input
                    id={`param-desc-${p.id}`}
                    type="text"
                    className="input input-sm w-full"
                    value={description}
                    maxLength={200}
                    placeholder="ex: velocidade do motor durante o teste"
                    onChange={(e) =>
                      updateCustomMeta(p.id, { description: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-base-content/70">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-xs"
                      checked={customMeta[p.id]?.required ?? false}
                      onChange={(e) =>
                        updateCustomMeta(p.id, { required: e.target.checked })
                      }
                    />
                    Obrigatório
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                    onClick={() => removeCustomParam(p.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addCustomParam}
        disabled={full}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-tl-xl rounded-br-xl border border-dashed border-base-300 py-4 text-sm text-base-content/60 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-base-300 disabled:hover:text-base-content/60"
      >
        <Plus className="size-4" />
        {full
          ? `Limite de ${MAX_PARAMS} parâmetros`
          : customParams.length === 0
            ? "Adicionar o primeiro parâmetro"
            : `Adicionar parâmetro (${customParams.length}/${MAX_PARAMS})`}
      </button>
    </div>
  );
}
