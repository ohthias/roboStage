"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavigationBarProps {
  code_volunteer: string;
  code_visitor: string;
}

export default function NavigationBar({
  code_volunteer,
  code_visitor,
}: NavigationBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Fechar com ESC e travar scroll do body quando aberto
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : prev || "";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <>
      {/* Barra superior com o botão hamburguer (sempre visível) */}
      <div className="py-3 px-2 flex justify-start items-center bg-base-200 border-b border-base-300 rounded-lg">
        <button
          aria-label="Abrir menu"
          aria-expanded={isOpen}
          aria-controls="rs-offcanvas"
          className="btn btn-square btn-ghost"
          onClick={() => setIsOpen(true)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-2xl font-bold text-base-content ml-4">
          Show<span className="text-primary">Live</span>
        </div>

      </div>

      {/* Overlay (fecha ao clicar) */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Painel lateral (off-canvas) */}
      <aside
        id="rs-offcanvas"
        role="dialog"
        aria-modal="true"
        className={`
          fixed top-0 left-0 h-full w-80 max-w-[90vw] z-50
          bg-base-200 shadow-xl border-r border-base-300
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Cabeçalho do painel */}
        <div className="p-4 flex items-center justify-between border-b border-base-300">
          <h3 className="font-bold text-lg">Show<span className="text-primary">Live</span></h3>
          <button
            className="btn btn-square btn-ghost"
            aria-label="Fechar menu"
            onClick={() => setIsOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo do painel */}
        <nav className="flex-1 overflow-y-auto p-4">
          {/* Códigos */}
          <div className="mb-4">
            <p className="menu-title">Códigos</p>
            <div className="bg-base-100 p-3 rounded-box flex justify-between items-center mb-2">
              <span className="text-xs text-base-content">Voluntário</span>
              <span className="badge badge-ghost">{code_volunteer}</span>
            </div>
            <div className="bg-base-100 p-3 rounded-box flex justify-between items-center">
              <span className="text-xs text-base-content">Visitante</span>
              <span className="badge badge-ghost">{code_visitor}</span>
            </div>
          </div>

          {/* Links */}
          <ul className="menu gap-1 w-full">
            <li>
              <a href="#" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-apps mr-2" style={{ lineHeight: 0 }} />
                Geral
              </a>
            </li>
            <li>
              <a href="#equipes" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-employees-woman-man mr-2" style={{ lineHeight: 0 }} />
                Equipes
              </a>
            </li>
            <li>
              <a href="#ranking" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-ranking-star mr-2" style={{ lineHeight: 0 }} />
                Ranking
              </a>
            </li>
            <li>
              <a href="#visualizacao" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-eye mr-2" style={{ lineHeight: 0 }} />
                Visualização
              </a>
            </li>
            <li>
              <hr className="border-base-300 my-2 w-full" />
            </li>
            <li>
              <a href="#personalizacao" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-customize-edit mr-2" style={{ lineHeight: 0 }} />
                Personalização
              </a>
            </li>
            <li>
              <a href="#configuracoes" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-settings mr-2" style={{ lineHeight: 0 }} />
                Configurações
              </a>
            </li>
          </ul>
        </nav>

        {/* Botão Voltar */}
        <div className="p-4 border-t border-base-300">
          <button
            className="btn btn-outline btn-error btn-sm w-full"
            onClick={() => {
              setIsOpen(false);
              router.push("/dashboard#showLive");
            }}
          >
            Voltar ao Hub
          </button>
        </div>
      </aside>
    </>
  );
}
