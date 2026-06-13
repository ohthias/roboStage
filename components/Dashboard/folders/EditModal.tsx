"use client";

import { useState } from "react";
import { X } from "lucide-react";

import IconPicker from "@/components/Dashboard/folders/IconPicker";

export type EditData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  visibility: string;
  tags: string;
};

type Props = {
  initial: EditData;
  onSave: (data: EditData) => Promise<void>;
  onClose: () => void;
};

export default function EditModal({
  initial,
  onSave,
  onClose,
}: Props) {
  const [data, setData] = useState<EditData>(initial);
  const [saving, setSaving] = useState(false);

  const set =
    (key: keyof EditData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setData((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));

  async function handleSave() {
    setSaving(true);

    try {
      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Editar pasta
            </h2>

            <p className="mt-1 text-sm text-base-content/55">
              Personalize aparência, visibilidade e organização da pasta.
            </p>
          </div>

          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Nome */}
          <div>
            <label className="label">
              <span className="label-text text-xs font-semibold uppercase tracking-wide opacity-70">
                Nome
              </span>
            </label>

            <input
              className="input input-bordered w-full rounded-2xl"
              placeholder="Nome da pasta"
              value={data.name}
              onChange={set("name")}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="label">
              <span className="label-text text-xs font-semibold uppercase tracking-wide opacity-70">
                Descrição
              </span>
            </label>

            <textarea
              className="textarea textarea-bordered min-h-28 w-full resize-none rounded-2xl"
              placeholder="Descrição da pasta"
              value={data.description}
              onChange={set("description")}
            />
          </div>

          {/* Cor + Visibilidade */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">
                <span className="label-text text-xs font-semibold uppercase tracking-wide opacity-70">
                  Cor
                </span>
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/40 p-3">
                <input
                  type="color"
                  value={data.color || "#6366f1"}
                  onChange={set("color")}
                  className="h-12 w-16 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                />

                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    Cor principal
                  </span>

                  <span className="text-xs opacity-55">
                    Personalize a identidade visual
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text text-xs font-semibold uppercase tracking-wide opacity-70">
                  Visibilidade
                </span>
              </label>

              <select
                className="select select-bordered w-full rounded-2xl"
                value={data.visibility}
                onChange={set("visibility")}
              >
                <option value="private">Privado</option>
                <option value="team">Equipe</option>
                <option value="public">Público</option>
                <option value="unlisted">Não listado</option>
              </select>
            </div>
          </div>

          {/* Ícones */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-black uppercase tracking-wide opacity-70">
                Ícone
              </h3>

              <p className="mt-1 text-xs text-base-content/50">
                Escolha um ícone visual para identificar rapidamente a pasta.
              </p>
            </div>

            <div className="rounded-3xl border border-base-300 bg-base-200/30 p-4">
              <IconPicker
                value={data.icon}
                onChange={(icon) =>
                  setData((prev) => ({
                    ...prev,
                    icon,
                  }))
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">
              <span className="label-text text-xs font-semibold uppercase tracking-wide opacity-70">
                Tags
              </span>
            </label>

            <input
              className="input input-bordered w-full rounded-2xl"
              placeholder="ex: testes, estratégia, engenharia"
              value={data.tags}
              onChange={set("tags")}
            />

            <p className="mt-2 text-xs text-base-content/45">
              Separe múltiplas tags utilizando vírgula.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-base-300 px-6 py-5">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn btn-primary"
            disabled={saving || data.name.trim().length < 2}
            onClick={handleSave}
          >
            {saving && (
              <span className="loading loading-spinner loading-xs" />
            )}

            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}