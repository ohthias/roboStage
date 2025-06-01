"use client";
import { useState } from "react";
import AccessModal from "@/components/AccessModal";

interface SideBarProps {
  codVisitante?: string;
  codVoluntario?: string;
  codAdmin?: string;
}

export default function SideBar({
  codVisitante,
  codVoluntario,
  codAdmin,
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

      <nav className="bg-white shadow-md border-r border-gray-200 h-screen fixed top-0 left-0 max-w-[250px] py-6 px-4 overflow-auto">
        <ul>
          <li>
            <p className="font-bold px-4 py-2 cursor-default">
              Robo<strong className="text-primary">Stage</strong>
            </p>
          </li>
          <li>
            <a
              href="javascript:void(0)"
              className="text-slate-700 font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all"
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
          </ul>
        </div>

        <div className="mt-4">
          <h6 className="text-primary text-sm font-semibold px-4 cursor-default">
            Ações
          </h6>
          <ul className="mt-2 space-y-1">
            <li>
              <a
                href="/create-room"
                className="text-primary-dark font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all"
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
