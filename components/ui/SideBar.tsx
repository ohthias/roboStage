import { useState } from "react";
import AccessModal from "@/components/AccessModal";

type ViewType =
  | "geral"
  | "ranking"
  | "equipes"
  | "personalização"
  | "visualização"
  | "configurações"
  | "modal"
  | "sair";

interface SideBarProps {
  codVisitante?: string;
  codVoluntario?: string;
  codAdmin?: string;
  setConteudo: (tipo: ViewType) => void;
}

export default function SideBar({
  codVisitante,
  codVoluntario,
  codAdmin,
  setConteudo,
}: SideBarProps) {
  const [showModal, setShowModal] = useState(false);
  const [isExitModal, setExitModal] = useState(false);
  const showExitModal = () => setExitModal(true);
  const hideExitModal = () => setExitModal(false);

  const [selectedView, setSelectedView] = useState<ViewType>("geral");

  const getClass = (item: ViewType) =>
    `font-medium text-[15px] block hover:text-slate-900 hover:bg-gray-100 rounded px-4 py-2 transition-all cursor-pointer ${
      selectedView === item ? "text-primary " : "text-slate-700"
    }`;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) hideExitModal();
  };

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
            <img
              src="https://robo-stage.vercel.app/Icone.png"
              alt="Logo"
              width={36}
              height={36}
            />
            <p className="font-bold ml-2 py-2 cursor-default">
              Robo<strong className="text-primary">Stage</strong>
            </p>
          </li>
          <li>
            <a
              onClick={() => {
                setSelectedView("geral");
                setConteudo("geral");
              }}
              className={getClass("geral")}
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
                onClick={() => {
                  setSelectedView("modal");
                  setShowModal(true);
                }}
                className={getClass("modal")}
              >
                Exibir Códigos
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setSelectedView("equipes");
                  setConteudo("equipes");
                }}
                className={getClass("equipes")}
              >
                Equipes
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setSelectedView("ranking");
                  setConteudo("ranking");
                }}
                className={getClass("ranking")}
              >
                Ranking
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setSelectedView("visualização");
                  setConteudo("visualização");
                }}
                className={getClass("visualização")}
              >
                Visualização
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
                onClick={() => {
                  setSelectedView("personalização");
                  setConteudo("personalização");
                }}
                className={getClass("personalização")}
              >
                Personalização
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setSelectedView("configurações");
                  setConteudo("configurações");
                }}
                className={getClass("configurações")}
              >
                Configurações
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setSelectedView("sair");
                  showExitModal();
                }}
                className={getClass("sair")}
              >
                Sair
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {isExitModal && (
        <div
          className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] overflow-auto"
          onClick={handleOutsideClick}
        >
          <div className="fixed inset-0 w-full h-full bg-[rgba(0,0,0,0.5)]" />

          <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 relative z-10">
            {/* Fechar modal */}
            <svg
              onClick={hideExitModal}
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
              viewBox="0 0 320.591 320.591"
            >
              <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" />
              <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" />
            </svg>

            <div className="my-10 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 fill-primary inline"
                viewBox="0 0 286.054 286.054"
              >
                <path
                  fill="#e2574c"
                  d="M143.027 0C64.04 0 0 64.04 0 143.027c0 78.996 64.04 143.027 143.027 143.027 78.996 0 143.027-64.022 143.027-143.027C286.054 64.04 222.022 0 143.027 0zm0 259.236c-64.183 0-116.209-52.026-116.209-116.209S78.844 26.818 143.027 26.818s116.209 52.026 116.209 116.209-52.026 116.209-116.209 116.209zm.009-196.51c-10.244 0-17.995 5.346-17.995 13.981v79.201c0 8.644 7.75 13.972 17.995 13.972 9.994 0 17.995-5.551 17.995-13.972V76.707c-.001-8.43-8.001-13.981-17.995-13.981zm0 124.997c-9.842 0-17.852 8.01-17.852 17.86 0 9.833 8.01 17.843 17.852 17.843s17.843-8.01 17.843-17.843c-.001-9.851-8.001-17.86-17.843-17.86z"
                />
              </svg>

              <h4 className="text-lg text-slate-900 font-semibold mt-6">
                Você deseja sair?
              </h4>
              <div className="flex max-sm:flex-col gap-4">
                <button
                  type="button"
                  onClick={hideExitModal}
                  className="px-2 py-2.5 rounded-lg w-full text-sm font-medium bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-2 py-2.5 rounded-lg w-full text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                  onClick={() => (window.location.href = "/")}
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
