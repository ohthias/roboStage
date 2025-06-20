"use client";
import { useState, useEffect } from "react";

type ViewType =
  | "default"
  | "Hub"
  | "AvaliacaoRounds"
  | "SemiFinal"
  | "EventosRounds"
  | "Discursos";

interface HeroVoluntarioProps {
  codigo_sala: string;
  setView: (view: ViewType) => void;
  view: ViewType;
}

interface HeroData {
  check_desafios_round: boolean;
  check_eventos_round: boolean;
  check_discursos_premiacao: boolean;
}

export default function HeroVoluntario({
  codigo_sala,
  setView,
  view,
}: HeroVoluntarioProps) {
  const [data, setData] = useState<HeroData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/rooms/${codigo_sala}/others/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.error) {
          console.error("Erro ao buscar dados:", result.error);
          return;
        }
        setData(result);
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };
    fetchData();
  }, [codigo_sala]);

  const getClass = (item: ViewType) =>
    `hover:text-details-primary block font-medium text-[15px] ${
      view === item ? "text-details-primary underline" : "text-slate-900"
    }`;

  const handleClick = (target: ViewType) => {
    setView(target);
    setMenuOpen(false);
  };

  return (
    <header className="shadow-md tracking-wide relative z-50">
      {/* Barra superior */}
      <section className="py-2 bg-secondary-details text-white px-4 sm:px-10 overflow-x-auto">
        <div className="flex items-center whitespace-nowrap gap-2 text-sm">
          <span className="font-semibold">Acesso:</span>
          <span>Voluntário</span>
          <span className="mx-2 font-semibold">|</span>
          <span
            className="font-semibold cursor-pointer underline"
            onClick={() =>
              confirm("Você tem certeza que deseja sair?") &&
              (window.location.href = "/")
            }
          >
            Sair do evento
          </span>
        </div>
      </section>

      {/* Barra de navegação */}
      <div className="flex items-center justify-between px-6 py-3 bg-white min-h-[65px]">
        {/* Logo */}
        <a href="#">
          <img
            src="https://robo-stage.vercel.app/Icone.png"
            alt="logo"
            className="w-10"
          />
        </a>

        {/* Botão hamburger - visível apenas no mobile */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor">
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Menu desktop */}
        <ul className="hidden md:flex items-center gap-4">
          <li>
            <a href="#" className={getClass("Hub")} onClick={() => setView("Hub")}>
              Hub
            </a>
          </li>
          <li>
            <a
              href="#"
              className={getClass("AvaliacaoRounds")}
              onClick={() => setView("AvaliacaoRounds")}
            >
              Avaliação Rounds
            </a>
          </li>
          <li>
            <a
              href="#"
              className={getClass("SemiFinal")}
              onClick={() => setView("SemiFinal")}
            >
              Avaliação de semi-final e final
            </a>
          </li>
          {data?.check_eventos_round && (
            <li>
              <a
                href="#"
                className={getClass("EventosRounds")}
                onClick={() => setView("EventosRounds")}
              >
                Eventos Rounds
              </a>
            </li>
          )}
          {data?.check_discursos_premiacao && (
            <li>
              <a
                href="#"
                className={getClass("Discursos")}
                onClick={() => setView("Discursos")}
              >
                Discursos
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Menu mobile - só aparece se menuOpen for true */}
      {menuOpen && (
        <ul className="flex flex-col md:hidden px-6 pb-4 space-y-2 bg-white border-t border-gray-100">
          <li>
            <a href="#" className={getClass("Hub")} onClick={() => handleClick("Hub")}>
              Hub
            </a>
          </li>
          <li>
            <a
              href="#"
              className={getClass("AvaliacaoRounds")}
              onClick={() => handleClick("AvaliacaoRounds")}
            >
              Avaliação Rounds
            </a>
          </li>
          <li>
            <a
              href="#"
              className={getClass("SemiFinal")}
              onClick={() => handleClick("SemiFinal")}
            >
              Avaliação de semi-final e final
            </a>
          </li>
          {data?.check_eventos_round && (
            <li>
              <a
                href="#"
                className={getClass("EventosRounds")}
                onClick={() => handleClick("EventosRounds")}
              >
                Eventos Rounds
              </a>
            </li>
          )}
          {data?.check_discursos_premiacao && (
            <li>
              <a
                href="#"
                className={getClass("Discursos")}
                onClick={() => handleClick("Discursos")}
              >
                Discursos
              </a>
            </li>
          )}
        </ul>
      )}
    </header>
  );
}