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

  return (
    <header className="shadow-md tracking-wide relative z-50">
      <section className="py-2 bg-secondary-details text-white text-right px-10">
        <p className="text-sm">
          <span className="mx-3 font-semibold">Acesso:</span>Voluntário
          <span className="mx-3 font-semibold">Código Evento:</span>
          {codigo_sala}
          <span
            className="mx-3 font-semibold cursor-pointer underline"
            onClick={() => console.log("Sair do evento clicado")}
          >
            Sair do evento
          </span>
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-3 bg-white min-h-[65px]">
        <a href="#">
          <img
            src="https://robo-stage.vercel.app/Icone.png"
            alt="logo"
            className="w-10"
          />
        </a>

        <ul className="flex items-center gap-4">
          <li>
            <a
              href="#"
              className={getClass("Hub")}
              onClick={() => setView("Hub")}
            >
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
          {data?.check_desafios_round && (
            <li>
              <a
                href="#"
                className={getClass("SemiFinal")}
                onClick={() => setView("SemiFinal")}
              >
                Avaliação de semi-final e final
              </a>
            </li>
          )}
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
    </header>
  );
}