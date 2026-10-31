"use client";

import { useState, useEffect } from "react";
import { SWOTCanvas } from "@/components/QuickBrick/Swot/SwotCanva";
import { SwotMobile } from "@/components/QuickBrick/Swot/SwotMobile";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import { LayoutGrid } from "lucide-react";
import { loadMissionCatalog, loadSeasonMissions } from "@/utils/data/missions-client";

const seasons: Record<string, { name: string }> = {
  bioglow: {
    name: "Bioglow (2026/27)",
  },
  submerged: {
    name: "Submerged (2024/25)",
  },
  unearthed: {
    name: "Unearthed (2025/26)",
  },
};

interface SwotPageClientProps {
  season: string;
}

export default function SwotPageClient({ season }: SwotPageClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>(season);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    // Catálogo inteiro só aqui (para saber quais temporadas têm imagens);
    // a requisição é memorizada e não se repete a cada troca de temporada.
    loadMissionCatalog()
      .then((data) => {
        const availableSeasons: string[] = [];
        Object.entries(data).forEach(([seasonId, seasonMissions]: any) => {
          const hasImages = seasonMissions.some((m: any) => m.image);
          if (hasImages && seasons[seasonId]) {
            availableSeasons.push(seasonId);
          }
        });
        setAvailableSeasons(availableSeasons);
        if (!selectedSeason && availableSeasons.length > 0) {
          setSelectedSeason(availableSeasons[0]);
        }
      });
  }, [selectedSeason]);

  useEffect(() => {
    if (!selectedSeason) return;
    loadSeasonMissions<any>(selectedSeason).then((seasonMissions) => {
      setMissions(seasonMissions.filter((m) => m.image));
    });
  }, [selectedSeason]);

  return (
    <div className="px-4 md:px-8">
      <HeaderTool
        NameTool="Matriz SWOT"
        DescriptionTool={`Organize estrategicamente as missões da ${seasons[selectedSeason]?.name.toLocaleUpperCase() || "temporada"} distribuindo-as nos quadrantes da matriz: Forças, Fraquezas, Oportunidades e Ameaças.`}
        IconTool={LayoutGrid}
      />
      <div className="mt-8 mb-16">
        {isMobile ? (
          <SwotMobile
            missions={missions}
            setMissions={setMissions}
            selectedSeason={selectedSeason}
          />
        ) : (
          <SWOTCanvas
            missions={missions}
            setMissions={setMissions}
            seasons={availableSeasons}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
          />
        )}
      </div>
    </div>
  );
}