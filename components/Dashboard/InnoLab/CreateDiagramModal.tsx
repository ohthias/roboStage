"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Brain, Fish, List, CircleDashed, Workflow } from "lucide-react";

interface CreateDiagramModalProps {
  onCreate: (data: { title: string; type: string }) => void;
}

export default function CreateDiagramModal({
  onCreate,
}: CreateDiagramModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const diagramOptions = [
    {
      id: "5W2H",
      name: "5W2H",
      description:
        "Estruture planos com base nas 7 perguntas fundamentais: o que, por quê, onde, quando, quem, como e quanto.",
      icon: List,
    },
    {
      id: "Ishikawa",
      name: "Diagrama de Ishikawa",
      description:
        "Identifique causas e efeitos de problemas organizacionais em formato de espinha de peixe.",
      icon: Fish,
    },
    {
      id: "Mapa Mental",
      name: "Mapa Mental",
      description:
        "Organize ideias e temas de forma visual e hierárquica para facilitar o entendimento.",
      icon: Brain,
    },
    {
      id: "SWOT",
      name: "Análise SWOT",
      description:
        "Avalie forças, fraquezas, oportunidades e ameaças para planejamento estratégico.",
      icon: CircleDashed,
    },
    {
      id: "Flowchart",
      name: "Fluxograma",
      description:
        "Visualize processos e fluxos de trabalho com diagramas claros e estruturados.",
      icon: Workflow,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type) return;
    onCreate({ title, type });
    setTitle("");
    setType(null);
    setIsOpen(false);
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        Criar Diagrama
      </button>

      {isOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-secondary">
                Novo Diagrama
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Nome do Documento
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Mapa Mental dos problemas encontrados"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <span className="label-text font-semibold mb-2 block">
                  Tipo de Diagrama
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {diagramOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = type === opt.id;

                    return (
                      <div
                        key={opt.id}
                        className={`flex flex-col items-center justify-center p-4 cursor-pointer rounded-xl
            border-2 transition-all duration-300 transform
            ${
              isSelected
                ? "border-secondary bg-base-200 shadow-lg scale-105"
                : "border-base-300 hover:border-secondary hover:shadow-md hover:scale-105 transition-all duration-300"
            }`}
                        onClick={() => setType(opt.id)}
                      >
                        {/* Ícone com animação */}
                        <Icon className="w-16 h-16 text-secondary mb-2 transition-transform duration-300" />
                        <span className="font-medium text-center text-base text-secondary">
                          {opt.name}
                        </span>

                        {/* Descrição só aparece se selecionado */}
                        {isSelected && (
                          <p className="mt-2 text-xs text-center text-base-content transition-opacity duration-300">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões */}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={!title || !type}
                >
                  Criar Diagrama
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
}
