"use client";

import { useState } from "react";
import { FolderPlus, Sparkles, X } from "lucide-react";

import IconPicker from "@/components/Dashboard/folders/IconPicker";
import {
  FOLDER_TEMPLATES,
  type FolderTemplate,
} from "@/config/folder-templates";
import { BaseModal } from "../UI/BaseModal";

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

  onCreate: (data: CreateFolderData) => Promise<void>;
};

export default function CreateFolderModal({ onClose, onCreate }: Props) {
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
    <BaseModal
      title="Nova pasta"
      description="Crie uma pasta personalizada ou utilize um template inteligente."
      onClose={onClose}
      open
      size="md"
      footer={
        <div className="flex items-center justify-end gap-4">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn btn-primary"
            disabled={saving || data.name.trim().length < 2}
            onClick={handleCreate}
          >
            {saving && <span className="loading loading-spinner loading-xs" />}
            Criar pasta
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="collapse border border-base-300 bg-base-100">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title mb-0 flex items-center gap-2">
            <Sparkles size={16} className="text-warning" />

            <h3 className="text-sm font-black uppercase tracking-wide">
              Templates rápidos
            </h3>
          </div>
          <div className="collapse-content p-2">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {FOLDER_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="group rounded-3xl border border-base-300 bg-base-100 p-4 text-left transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl flex flex-col items-start gap-2 w-full"
                >
                  <div
                    className="mb-4 flex h-8 w-8 items-center justify-center rounded-sm text-white shadow-sm"
                    style={{
                      background: template.color,
                    }}
                  >
                    <span className="text-lg font-black">{template.name[0]}</span>
                  </div>

                  <h4 className="font-black transition-colors group-hover:text-primary w-full text-left text-sm tracking-tight">
                    {template.name}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-xs text-base-content/55 w-full">
                    {template.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {template.tags.map((tag) => (
                      <span key={tag} className="badge badge-outline badge-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
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
            maxLength={500}
          />
        </div>

        {/* Cor + visibilidade */}
        <div className="flex gap-4 flex-row items-start">
          <div className="flex flex-col gap-2">
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
              className="cursor-pointer rounded-2xl border border-base-300 bg-base-100 p-2 max-w-md h-10 "
            />
          </div>

          <div className="flex flex-col flex-1 gap-2">
            <label className="label">
              <span className="label-text text-xs font-semibold uppercase tracking-wide opacity-70">
                Visibilidade
              </span>
            </label>

            <select
              className="select select-bordered w-full rounded-2xl px-4 py-3"
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
    </BaseModal>
  );
}
