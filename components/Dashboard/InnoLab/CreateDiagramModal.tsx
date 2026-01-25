"use client";

import { useState } from "react";
import { Brain, Fish, List, CircleDashed, Workflow } from "lucide-react";
import { BaseModal } from "../UI/BaseModal";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";

interface CreateDiagramModalProps {
  open: boolean;
  onClose: () => void;
  fetchDocuments?: () => Promise<void>; // opcional
}

export default function CreateDiagramModal({
  open,
  onClose,
  fetchDocuments,
}: CreateDiagramModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const diagramOptions = [
    {
      id: "5W2H",
      name: "5W2H",
      description: "Estruture planos com base nas 7 perguntas fundamentais.",
      icon: List,
    },
    {
      id: "Ishikawa",
      name: "Diagrama de Ishikawa",
      description:
        "Identifique causas e efeitos de problemas em formato de espinha de peixe.",
      icon: Fish,
    },
    {
      id: "Mapa Mental",
      name: "Mapa Mental",
      description: "Organize ideias de forma visual e hierárquica.",
      icon: Brain,
    },
    {
      id: "SWOT",
      name: "Análise SWOT",
      description:
        "Avalie forças, fraquezas, oportunidades e ameaças.",
      icon: CircleDashed,
    },
    {
      id: "Flowchart",
      name: "Fluxograma",
      description:
        "Visualize processos e fluxos de trabalho.",
      icon: Workflow,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type) return;

    setLoading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      const { error } = await supabase.from("documents").insert([
        {
          title,
          diagram_type: type,
          content: {},
          user_id: user?.id ?? null,
        },
      ]);

      if (error) throw error;

      addToast("Diagrama criado com sucesso!", "success");

      if (fetchDocuments) {
        await fetchDocuments();
      }

      setTitle("");
      setType(null);
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Erro ao criar diagrama.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Novo Diagrama"
      description="Escolha o tipo de diagrama e dê um nome ao documento."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="create-diagram-form"
            className="btn btn-secondary"
            disabled={!title || !type || loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner" />
                Criando...
              </>
            ) : (
              "Criar Diagrama"
            )}
          </button>
        </div>
      }
    >
      <form
        id="create-diagram-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Nome */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">
              Nome do Documento
            </span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Ex: Mapa Mental dos Problemas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Tipos */}
        <div>
          <span className="label-text font-semibold mb-3 block">
            Tipo de Diagrama
          </span>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {diagramOptions.map((opt) => {
              const Icon = opt.icon;
              const selected = type === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center
                    transition-all duration-200
                    ${
                      selected
                        ? "border-secondary bg-base-200 shadow-md scale-[1.02]"
                        : "border-base-300 hover:border-secondary hover:shadow-sm"
                    }
                  `}
                >
                  <Icon className="w-12 h-12 text-secondary mb-2" />
                  <span className="font-medium text-secondary">
                    {opt.name}
                  </span>

                  {selected && (
                    <p className="mt-2 text-xs text-base-content/70">
                      {opt.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </BaseModal>
  );
}