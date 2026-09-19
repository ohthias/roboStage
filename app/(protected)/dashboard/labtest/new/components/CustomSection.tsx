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
  customParams: Array<{ id: string; name: string; type: string; min?: number; max?: number }>;
  addCustomParam: () => void;
  updateCustomParam: (id: string, patch: Partial<{ name: string; type: string; min?: number; max?: number }>) => void;
  removeCustomParam: (id: string) => void;
  customMeta: Record<string, { required: boolean; description: string }>;
  updateCustomMeta: (id: string, patch: Partial<{ required: boolean; description: string }>) => void;
}) {
  return (
    <section className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">Teste customizado</h2>
              <p className="text-sm text-base-content/60">
                Defina os parâmetros que serão utilizados no teste.
              </p>
            </div>
          </div>

          <span className="badge badge-neutral">{customParams.length} parâmetros</span>
        </div>

        <div className="alert mt-4 bg-base-200/60">
          <Info className="size-4 shrink-0" />

          <p className="text-xs text-base-content/70">
            Cada parâmetro pode possuir um tipo diferente. Parâmetros numéricos permitem definir limites mínimo e máximo.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {customParams.map((p, index) => (
            <div
              key={p.id}
              className="rounded-xl border border-base-300 bg-base-100 p-4 transition hover:border-base-content/20"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm">{index + 1}</span>
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

              <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_0.7fr_0.7fr]">
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text text-xs">Nome</span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    value={p.name}
                    placeholder="ex: velocidade"
                    onChange={(e) =>
                      updateCustomParam(p.id, {
                        name: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text text-xs">Tipo</span>
                  </div>

                  <select
                    className="select select-bordered select-sm"
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
                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text text-xs">Mínimo</span>
                      </div>

                      <input
                        type="number"
                        className="input input-bordered input-sm"
                        value={p.min ?? 0}
                        onChange={(e) =>
                          updateCustomParam(p.id, {
                            min: Number(e.target.value),
                          })
                        }
                      />
                    </label>

                    <label className="form-control">
                      <div className="label py-1">
                        <span className="label-text text-xs">Máximo</span>
                      </div>

                      <input
                        type="number"
                        className="input input-bordered input-sm"
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

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="form-control">
                  <div className="label py-1">
                    <span className="label-text text-xs">Descrição (opcional)</span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    value={customMeta[p.id]?.description ?? ""}
                    placeholder="ex: velocidade do motor durante o teste"
                    onChange={(e) =>
                      updateCustomMeta(p.id, {
                        description: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-2 self-end pb-1.5">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
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
          ))}
        </div>

        <button type="button" className="btn btn-outline btn-sm mt-2 w-fit" onClick={addCustomParam}>
          <Plus className="size-4" />
          Adicionar parâmetro
        </button>
      </div>
    </section>
  );
}
