"use client";

import { useRouter } from "next/navigation";

interface NavigationBarProps {
  code_volunteer: string;
  code_visitor: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function Sidebar({
  code_volunteer,
  code_visitor,
  open,
  setOpen,
}: NavigationBarProps) {
  const router = useRouter();

  return (
    <>
      <button
        className="btn btn-primary fixed top-4 left-4 z-50 lg:none"
        onClick={() => setOpen(true)}
        style={{ lineHeight: 0 }}
      >
        <i className="fi fi-br-menu-burger"></i>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-base-200/50 z-40 lg:hidden"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50
          bg-base-200 shadow-xl border-r border-base-300
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0
        `}
      >
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-bold text-lg">
            Show<span className="text-primary">Live</span>
          </h3>
          {/* Botão fechar em mobile */}
          <button
            className="btn btn-sm btn-circle btn-ghost lg:hidden"
            onClick={() => setOpen(false)}
            style={{ lineHeight: 0 }}
          >
            <i className="fi fi-br-cross"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-2">
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

          <ul className="menu gap-1 w-full">
            <li>
              <a href="#" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-apps mr-2" />
                Geral
              </a>
            </li>
            <li>
              <a href="#equipes" className="btn btn-ghost justify-start">
                <i
                  className="fi fi-rr-employees-woman-man mr-2"
                  style={{ lineHeight: 0 }}
                />
                Equipes
              </a>
            </li>
            <li>
              <a href="#ranking" className="btn btn-ghost justify-start">
                <i
                  className="fi fi-rr-ranking-star mr-2"
                  style={{ lineHeight: 0 }}
                />
                Ranking
              </a>
            </li>
            <li>
              <a href="#visualizacao" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-eye mr-2" style={{ lineHeight: 0 }} />
                Visualização
              </a>
            </li>
            <hr className="my-2 border border-base-300" />
            <li>
              <a href="#" className="btn btn-ghost justify-start">
                Gracius Professionalism
              </a>
            </li>
            <li>
              <a href="#" className="btn btn-ghost justify-start">
                Inspeção Pré-Rodada
              </a>
            </li>
            <li>
              <a href="#" className="btn btn-ghost justify-start">
                Visualização Avançada
              </a>
            </li>
            <li>
              <a href="#" className="btn btn-ghost justify-start">
                Brackets 
              </a>
            </li>
            <hr className="my-2 border border-base-300" />
            <li>
              <a href="#personalizacao" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-customize-edit mr-2" />
                Personalização
              </a>
            </li>
            <li>
              <a href="#configuracoes" className="btn btn-ghost justify-start">
                <i className="fi fi-rr-settings mr-2" />
                Configurações
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-base-300">
          <button
            className="btn btn-outline btn-error btn-sm w-full"
            onClick={() => router.push("/dashboard#showLive")}
          >
            Voltar ao Hub
          </button>
        </div>
      </aside>
    </>
  );
}
