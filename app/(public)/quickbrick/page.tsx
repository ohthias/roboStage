"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import QuickBrickCanvas from "@/components/QuickBrick/QuickBrickCanva";
import { SWOTCanvas } from "@/components/QuickBrick/SwotCanva";
import { Footer } from "@/components/ui/Footer";
import Head from "next/head";

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
          O QuickBrick Studio é um conjunto de ferramentas que ajuda sua equipe
          a criar estratégias eficientes para o robô durante sua jornada no
          FIRST LEGO League Challenge. Basta selecionar uma das ferramentas
          disponíveis e aproveitá-las.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-center w-full">
      <Navbar />
      <div className="flex flex-col items-center w-full">
        <h1 className="text-2xl font-bold my-4 text-primary">
          QuickBrick Studio
        </h1>
        <p className="text-sm mb-2 text-base-content px-2 text-center max-w-3xl">
          O QuickBrick Studio é um conjunto de ferramentas que ajuda sua
          equipe a criar estratégias eficientes para o robô durante sua
          jornada no FIRST LEGO League Challenge. Basta selecionar uma das
          ferramentas disponíveis e aproveitá-las.
        </p>
      </div>
      {/* Tabs DaisyUI */}
      <div role="tablist" className="tabs tabs-border my-2 mx-auto">
        <button
          role="tab"
          className={`tab ${tab === "canvas" ? "tab-active font-bold" : ""} flex items-center gap-2`}
          onClick={() => setTab("canvas")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          Estratégias
        </button>
        <button
          role="tab"
          className={`tab ${tab === "swot" ? "tab-active font-bold" : ""} flex items-center gap-2`}
          onClick={() => setTab("swot")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
          Matriz SWOT
        </button>
      </div>

      <div className="w-full px-4 mb-4">
        {tab === "canvas" && (
          <div className="flex flex-col items-center">
            <p className="text-sm mb-2 text-base-content max-w-3xl text-center">
              Selecione uma das ferramentas disponíveis e desenhar diretamente
              sobre a imagem do tapete, planejando cada movimento com precisão
              e facilidade. Ao final exporte e use como desejar!
            </p>
            <QuickBrickCanvas />
          </div>
        )}
        {tab === "swot" && (
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold my-4 ml-4 text-primary">
              Matriz SWOT das Missões
            </h1>
            <p className="text-sm mb-2 text-base-content ml-2 px-2 max-w-3xl">
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
      <Footer />
    </div>
  );
}
