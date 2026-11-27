"use client";

import { useState, useEffect } from "react";
import { SWOTCanvas } from "@/features/quickbrick/swot/components/SwotCanva";
import { SwotMobile } from "@/features/quickbrick/swot/components/SwotMobile";
import HeaderTool from "@/features/quickbrick/shared/components/HeaderTool";
import { LayoutGrid } from "lucide-react";
import { loadSeasonMissions } from "@/lib/data/missions-client";

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
  // A temporada vem só da rota (/matriz-swot/[season]).
  const selectedSeason = season;

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= 720);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

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
            selectedSeason={selectedSeason}
          />
        )}
      </div>
    </div>
  );
}