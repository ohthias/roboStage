"use client";

import { useState } from "react";
import { FolderPlus, Sparkles, X } from "lucide-react";

import IconPicker from "@/components/Dashboard/folders/IconPicker";
import {
  FOLDER_TEMPLATES,
  type FolderTemplate,
} from "@/config/folder-templates";

type CreateFolderData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  visibility: string;
  tags: string[];
};

type Props = {
  onClose: () => void;

  onCreate: (
    data: CreateFolderData,
  ) => Promise<void>;
};

export default function CreateFolderModal({
  onClose,
  onCreate,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<CreateFolderData>({
    name: "",
    description: "",
    color: "#6366f1",
    icon: "folder",
    visibility: "private",
    tags: [],
  });

  function applyTemplate(template: FolderTemplate) {
    setData({
      name: template.name,
      description: template.description,
      color: template.color,
      icon: template.icon,
      visibility: "private",
      tags: template.tags,
    });
  }

  async function handleCreate() {
    setSaving(true);

    try {
      await onCreate(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm h-screen">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl h-3/4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <FolderPlus size={20} />

              <h2 className="text-2xl font-black tracking-tight">
                Nova pasta
              </h2>
            </div>

            <p className="mt-1 text-sm text-base-content/55">
              Crie uma pasta personalizada ou utilize um template inteligente.
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
        <div className="space-y-7 p-6">
          {/* Templates */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-warning" />

              <h3 className="text-sm font-black uppercase tracking-wide">
                Templates rápidos
              </h3>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {FOLDER_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="group rounded-3xl border border-base-300 bg-base-100 p-4 text-left transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{
                      background: template.color,
                    }}
                  >
                    <span className="text-lg font-black">
                      {template.name[0]}
                    </span>
                  </div>

                  <h4 className="font-black transition-colors group-hover:text-primary">
                    {template.name}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-sm text-base-content/55">
                    {template.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-outline badge-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="divider text-xs uppercase opacity-45">
            Personalização
          </div>

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
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
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
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Cor + visibilidade */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">
                <span className="label-text text-xs font-semibold uppercase tracking-wide opacity-70">
                  Cor
                </span>
              </label>

              <input
                type="color"
                value={data.color}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                className="h-14 w-full cursor-pointer rounded-2xl border border-base-300 bg-base-100 p-2"
              />
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
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    visibility: e.target.value,
                  }))
                }
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
                Ícone da pasta
              </h3>

              <p className="mt-1 text-xs text-base-content/50">
                Escolha um ícone visual para representar a pasta.
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-base-300 px-6 py-5">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn btn-primary"
            disabled={
              saving || data.name.trim().length < 2
            }
            onClick={handleCreate}
          >
            {saving && (
              <span className="loading loading-spinner loading-xs" />
            )}

            Criar pasta
          </button>
        </div>
      </div>
    </div>
  );
}