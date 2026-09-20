import { Info, Plus, SlidersHorizontal, Trash2 } from "lucide-react";

import { CUSTOM_PARAM_TYPES } from "../Usecreatetest";

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
  return (
    <section className="card">
      <div className="card-body p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Teste customizado</h2>
              <p className="text-sm text-base-content/60">
                Defina os parâmetros que serão utilizados no teste.
              </p>
            </div>
          </div>
          <span className="badge badge-neutral self-start sm:self-auto">
            {customParams.length}/10 parâmetros
          </span>
        </div>

        <div className="alert alert-info alert-soft mt-4 items-start">
          <Info className="size-4 inline-block" />
          Cada parâmetro pode possuir um tipo diferente. Parâmetros numéricos
          permitem definir limites mínimo e máximo.
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {customParams.length === 0 ? (
            <div
              className="cursor-pointer rounded-xl border border-dashed border-base-300 bg-base-100 p-6 text-center transition hover:border-primary/50"
              role="button"
              tabIndex={0}
              onClick={addCustomParam}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addCustomParam();
                }
              }}
            >
              <p className="font-medium">Nenhum parâmetro adicionado</p>
              <p className="mt-1 text-sm text-base-content/60">
                Clique aqui para adicionar um parâmetro e configurar o teste
                customizado.
              </p>
            </div>
          ) : (
            customParams.map((p, index) => (
              <div
                key={p.id}
                className="rounded-xl border border-base-300 bg-base-200/30 p-4 transition hover:border-base-content/20"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center h-6 flex items-center justify-center rounded-sm bg-primary/10 text-primary text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      Parâmetro
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => removeCustomParam(p.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Remover
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="form-control flex flex-col">
                    <div className="label py-1">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/50">
                        Nome
                      </span>
                      <span className="label-text-alt text-xs text-base-content/50">
                        {p.name.length}/50
                      </span>
                    </div>

                    <input
                      type="text"
                      className="input input-bordered input-sm w-full mt-1"
                      value={p.name}
                      maxLength={50}
                      placeholder="ex: velocidade"
                      onChange={(e) =>
                        updateCustomParam(p.id, {
                          name: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="form-control flex flex-col">
                    <div className="label py-1 flex items-center justify-between">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/50">
                        Tipo
                      </span>
                    </div>

                    <select
                      className="select select-bordered select-sm w-full mt-1"
                      value={p.type}
                      onChange={(e) =>
                        updateCustomParam(p.id, {
                          type: e.target.value,
                        })
                      }
                    >
                      {CUSTOM_PARAM_TYPES.map((tp) => (
                        <option key={tp.value} value={tp.value}>
                          {tp.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {p.type === "number" && (
                    <>
                      <label className="form-control flex flex-col">
                        <div className="label py-1">
                          <span className="label-text text-xs uppercase tracking-wide text-base-content/50">
                            Mínimo
                          </span>
                        </div>

                        <input
                          type="number"
                          className="input input-bordered input-sm w-full mt-1"
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
                      </label>

                      <label className="form-control flex flex-col">
                        <div className="label py-1">
                          <span className="label-text text-xs uppercase tracking-wide text-base-content/50">
                            Máximo
                          </span>
                        </div>

                        <input
                          type="number"
                          className="input input-bordered input-sm w-full mt-1"
                          value={p.max ?? 100}
                          onChange={(e) =>
                            updateCustomParam(p.id, {
                              max: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="form-control flex flex-col">
                    <div className="label py-1">
                      <span className="label-text text-xs uppercase tracking-wide text-base-content/50">
                        Descrição (opcional)
                      </span>
                      <span className="label-text-alt text-xs text-base-content/50">
                        {(customMeta[p.id]?.description ?? "").length}/200
                      </span>
                    </div>

                    <input
                      type="text"
                      className="input input-bordered input-sm w-full mt-1"
                      value={customMeta[p.id]?.description ?? ""}
                      maxLength={200}
                      placeholder="ex: velocidade do motor durante o teste"
                      onChange={(e) =>
                        updateCustomMeta(p.id, {
                          description: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 pb-1.5">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-neutral"
                      checked={customMeta[p.id]?.required ?? false}
                      onChange={(e) =>
                        updateCustomMeta(p.id, {
                          required: e.target.checked,
                        })
                      }
                    />
                    <span className="text-xs">Obrigatório</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>

        {customParams.length > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-sm mt-2 w-fit ml-auto"
            onClick={addCustomParam}
            disabled={customParams.length >= 10}
          >
            <Plus className="size-4" />
            {customParams.length >= 10
              ? "Limite atingido"
              : "Adicionar parâmetro"}
          </button>
        )}
      </div>
    </section>
  );
}
