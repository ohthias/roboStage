"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { SWOTCanvas } from "@/components/QuickBrick/SwotCanva";
import { Footer } from "@/components/ui/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

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
        const seasonKey = Array.isArray(selectedSeason) ? selectedSeason[0] : selectedSeason;
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
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-center w-full">
      <Navbar />
      <Breadcrumbs />
      <div className="flex flex-col items-start w-full px-4 mb-8">
        <h1 className="text-2xl font-bold my-4 text-primary">
          Matriz SWOT das{" "}
          {selectedSeason && seasonLogos[selectedSeason]
            ? seasonLogos[selectedSeason].name
            : "Missões"}
        </h1>
        <p className="text-sm mb-2 text-base-content max-w-3xl">
          Arraste as missões para os quadrantes da matriz SWOT
          para organizar a estratégia da sua equipe. Ao final, exporte e use como desejar!
        </p>
        <SWOTCanvas
          missions={missions}
          setMissions={setMissions}
          seasons={seasons}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
        />
      </div>
      <Footer />
    </div>
  );
}
