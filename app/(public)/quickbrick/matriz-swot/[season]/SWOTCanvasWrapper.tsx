"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/UI/Navbar";
import { SWOTCanvas } from "@/components/QuickBrick/SwotCanva";
import { Footer } from "@/components/UI/Footer";
import Breadcrumbs from "@/components/UI/Breadcrumbs";

const seasonLogos: Record<string, { name: string; image: string }> = {
  submerged: {
    name: "Submerged (2024/25)",
    image: "/images/logos/Submerged.webp",
  },
  unearthed: {
    name: "Unearthed (2025/26)",
    image: "/images/logos/Unearthed.webp",
  },
};

interface SwotPageClientProps {
  season: string;
}

export default function SwotPageClient({ season }: SwotPageClientProps) {
  const params = useParams(); // { season: string }
  const [isMobile, setIsMobile] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>(season);

  // Detecta tamanho da tela
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Carrega temporadas disponíveis
  useEffect(() => {
    fetch("/api/data/missions")
      .then((res) => res.json())
      .then((data) => {
        const availableSeasons: string[] = [];
        Object.entries(data).forEach(([seasonId, seasonMissions]: any) => {
          const hasImages = seasonMissions.some((m: any) => m.image);
          if (hasImages && seasonLogos[seasonId]) {
            availableSeasons.push(seasonId);
          }
        });
        setSeasons(availableSeasons);
        if (!selectedSeason && availableSeasons.length > 0) {
          setSelectedSeason(availableSeasons[0]);
        }
      });
  }, [selectedSeason]);

  // Carrega missões da temporada selecionada
  useEffect(() => {
    if (!selectedSeason) return;
    fetch("/api/data/missions")
      .then((res) => res.json())
      .then((data) => {
        const seasonKey = Array.isArray(selectedSeason)
          ? selectedSeason[0]
          : selectedSeason;
        const seasonMissions = data[seasonKey] || [];
        setMissions(seasonMissions.filter((m: any) => m.image));
      });
  }, [selectedSeason]);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Navbar />
        <h1 className="text-2xl font-bold my-4 text-primary">
          Ops! Ferramenta não está disponível no celular
        </h1>
        <p className="text-sm mb-2 text-base-content px-5">
          A Matriz SWOT é uma ferramenta que ajuda sua equipe a organizar as
          missões da FIRST LEGO League Challenge em quatro quadrantes: Forças,
          Fraquezas, Oportunidades e Ameaças. No momento, ela está disponível
          apenas em telas maiores, como notebooks e desktops.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />
        <div className="flex flex-col items-start px-4 mb-8">
          <div className="my-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-base-300/10 text-primary shadow-sm">
                {selectedSeason && seasonLogos[selectedSeason] ? (
                  <img
                    src={seasonLogos[selectedSeason].image}
                    alt={seasonLogos[selectedSeason].name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-primary rounded-full text-white font-bold">
                    ?
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
                  Matriz SWOT
                </h1>
                <span className="text-sm text-base-content/70 font-medium">
                  {selectedSeason && seasonLogos[selectedSeason]
                    ? seasonLogos[selectedSeason].name
                    : "Missões"}
                </span>
              </div>
            </div>

            <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
              Organize estrategicamente as missões da sua equipe distribuindo-as
              nos quadrantes da matriz{" "}
              <strong>Forças, Fraquezas, Oportunidades</strong> e
              <strong> Ameaças</strong>. Ao final, você pode exportar a análise
              e utilizá-la nos treinos, apresentações ou planejamentos.
            </p>
          </div>
          <SWOTCanvas
            missions={missions}
            setMissions={setMissions}
            seasons={seasons}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
