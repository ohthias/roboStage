"use client";

import { useState } from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface CreateDiagramModalProps {
  onCreate: (data: { title: string; type: string }) => void;
}

export default function CreateDiagramModal({ onCreate }: CreateDiagramModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const diagramOptions = [
    {
      id: "5W2H",
      name: "5W2H",
      description:
        "Estruture planos com base nas 7 perguntas fundamentais: o que, por quê, onde, quando, quem, como e quanto.",
      image: "/images/cardInnoTest/5w2h.png",
    },
    {
      id: "Ishikawa",
      name: "Diagrama de Ishikawa",
      description:
        "Identifique causas e efeitos de problemas organizacionais em formato de espinha de peixe.",
      image: "/images/cardInnoTest/ishikawa.png",
    },
    {
      id: "Mapa Mental",
      name: "Mapa Mental",
      description:
        "Organize ideias e temas de forma visual e hierárquica para facilitar o entendimento.",
      image: "/images/cardInnoTest/mapaMental.png",
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
      {/* Botão para abrir o modal */}
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        Criar Diagrama
      </button>

      {/* Modal DaisyUI */}
      {isOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-3xl">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-secondary">Novo Diagrama</h3>
              <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-sm">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do documento */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Nome do Documento</span>
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

              {/* Seleção de tipo de diagrama */}
              <div>
                <span className="label-text font-semibold mb-2 block">Tipo de Diagrama</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {diagramOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className={`card border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        type === opt.id ? "border-secondary bg-base-200" : "border-base-300"
                      }`}
                      onClick={() => setType(opt.id)}
                    >
                      {/* imagem ocupa toda a largura */}
                      <figure className="w-full h-40 overflow-hidden rounded-t-xl">
                        <Image
                          src={opt.image}
                          alt={opt.name}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      </figure>

                      <div className="card-body p-4">
                        <h2 className="card-title text-secondary text-base">{opt.name}</h2>
                        <p className="text-sm text-base-content">{opt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="modal-action">
                <button type="button" onClick={() => setIsOpen(false)} className="btn">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-secondary" disabled={!title || !type}>
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