"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import QuickBrickCanvas from "@/components/QuickBrickCanva";
import { SWOTCanvas } from "@/components/SwotCanva";

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

export default function QuickBrickPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [tab, setTab] = useState("canvas");
  const [missions, setMissions] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= 720);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => {
      window.removeEventListener("resize", checkSize);
    };
  }, []);

  useEffect(() => {
    fetch("/data/missions.json")
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
        if (availableSeasons.length > 0) {
          setSelectedSeason(availableSeasons[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => {
        const seasonMissions = data[selectedSeason] || [];
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
          O QuickBrick Studio é uma ferramenta que ajuda sua equipe a criar
          estratégias eficientes para o robô durante sua jornada no FIRST LEGO
          League Challenge. Basta selecionar uma das ferramentas disponíveis e
          desenhar diretamente sobre a imagem do tapete, planejando cada
          movimento com precisão e facilidade.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Navbar />

      {/* Tabs DaisyUI */}
      <div role="tablist" className="tabs tabs-boxed my-4">
        <button
          role="tab"
          className={`tab ${tab === "canvas" ? "tab-active" : ""}`}
          onClick={() => setTab("canvas")}
        >
          QuickBrick
        </button>
        <button
          role="tab"
          className={`tab ${tab === "swot" ? "tab-active" : ""}`}
          onClick={() => setTab("swot")}
        >
          Matriz SWOT
        </button>
      </div>

      <div className="w-full px-4">
        {tab === "canvas" && (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold my-4 text-primary">
              QuickBrick Studio
            </h1>
            <p className="text-sm mb-2 text-base-content px-2 text-center max-w-3xl">
              O QuickBrick Studio é uma ferramenta que ajuda sua equipe a criar
              estratégias eficientes para o robô durante sua jornada no FIRST
              LEGO League Challenge. Basta selecionar uma das ferramentas
              disponíveis e desenhar diretamente sobre a imagem do tapete,
              planejando cada movimento com precisão e facilidade.
            </p>
            <QuickBrickCanvas />
          </div>
        )}
        {tab === "swot" && (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold my-4 text-primary">
              Matriz SWOT das Missões
            </h1>
            <p className="text-sm mb-2 text-base-content px-2 text-center max-w-3xl">
              Escolha uma temporada e arraste as missões para os quadrantes da
              matriz SWOT para organizar a estratégia da sua equipe.
            </p>
            <SWOTCanvas
              missions={missions}
              setMissions={setMissions}
              seasons={seasons}
              selectedSeason={selectedSeason}
              setSelectedSeason={setSelectedSeason}
            />
          </div>
        )}
      </div>
    </div>
  );
}
