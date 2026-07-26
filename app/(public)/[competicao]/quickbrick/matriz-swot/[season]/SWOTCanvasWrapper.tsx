"use client";

import { useState, useEffect } from "react";
import { SWOTCanvas } from "@/components/QuickBrick/SwotCanva";
import CardMobileNotUse from "@/components/MobileNotUse";
import HeaderTool from "@/components/QuickBrick/HeaderTool";
import { LayoutGrid } from "lucide-react";

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
    fetch("/api/data/missions")
      .then((res) => res.json())
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
    return <CardMobileNotUse />;
  }

  return (
    <>
      <div className="px-4 md:px-8">
        <HeaderTool
          NameTool="Matriz SWOT"
          DescriptionTool={`Organize estrategicamente as missões da ${seasons[selectedSeason]?.name.toLocaleUpperCase() || "temporada"} distribuindo-as nos quadrantes da matriz: Forças, Fraquezas, Oportunidades e Ameaças.`}
          IconTool={LayoutGrid}
        />
        <div className="flex flex-col items-start mt-8 mb-16">
          <SWOTCanvas
            missions={missions}
            setMissions={setMissions}
            seasons={availableSeasons}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
          />
        </div>
      </div>
    </>
  );
}
