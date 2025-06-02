"use client";
import { useState } from "react";
import AccessModal from "@/components/AccessModal";
import Image from "next/image";
interface SideBarProps {
  codVisitante?: string;
  codVoluntario?: string;
  codAdmin?: string;
  setConteudo: (tipo: "geral" | "ranking" | "equipes") => void;
  onDelete: () => void;
}

export default function SideBar({
  codVisitante,
  codVoluntario,
  codAdmin,
  setConteudo,
  onDelete,
}: SideBarProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <AccessModal
          visitante={codVisitante}
          voluntario={codVoluntario}
          admin={codAdmin}
          onClose={() => setShowModal(false)}
        />
      )}

      <nav className="bg-white shadow-md border-r border-gray-200 h-screen fixed top-0 left-0 w-56 py-6 px-4 overflow-auto">
        <ul>
          <li className="flex flex-row items-center justify-left mb-6">
            <img src="https://robo-stage.vercel.app/Icone.png" alt="Logo" width={36} height={36} />
            <p className="font-bold ml-2 py-2 cursor-default">
              Robo<strong className="text-primary">Stage</strong>
            </p>
          </li>
          <li>
            <a
              onClick={() => setConteudo("geral")}
              className="text-slate-700 font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all cursor-pointer"
            >
              Geral
            </a>
          </li>
        </ul>

        <div className="mt-4">
          <h6 className="text-primary text-sm font-semibold px-4 cursor-default">
            Informações
          </h6>
          <ul className="mt-2 space-y-1">
            <li>
              <a
                onClick={() => setShowModal(true)}
                className="text-slate-700 font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all cursor-pointer"
              >
                Exibir Códigos
              </a>
            </li>
            <li>
              <a
                onClick={() => setConteudo("equipes")}
                className="text-slate-700 font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all cursor-pointer"
              >
                Equipes
              </a>
            </li>
            <li>
              <a
                onClick={() => setConteudo("ranking")}
                className="text-slate-700 font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all cursor-pointer"
              >
                Ranking
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <h6 className="text-primary text-sm font-semibold px-4 cursor-default">
            Ações
          </h6>
          <ul className="mt-2 space-y-1">
            <li>
              <a
                onClick={onDelete}
                className="text-primary-dark font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all cursor-pointer"
              >
                Deletar Evento
              </a>
            </li>
            <li>
              <a
                onClick={() =>
                  confirm("Você tem certeza que deseja sair?")
                    ? (window.location.href = "/")
                    : null
                }
                className="text-slate-700 font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all cursor-pointer"
              >
                Sair
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
