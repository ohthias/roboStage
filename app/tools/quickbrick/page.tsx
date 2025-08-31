"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import QuickBrickCanvas from "@/components/QuickBrickCanva";
import { SWOTCanvas } from "@/components/SwotCanva";
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
    <>
      <Head>
        <title>QuickBrick Studio | Robostage</title>
        <meta
          name="description"
          content="QuickBrick Studio: Planeje estratégias para o seu robô na FIRST LEGO League Challenge com facilidade e precisão."
        />
        <meta
          name="keywords"
          content="QuickBrick, Robostage, LEGO, FLL, robótica, estratégia"
        />
        <meta property="og:title" content="QuickBrick Studio | Robostage" />
        <meta
          property="og:description"
          content="Planeje estratégias para seu robô na FIRST LEGO League Challenge com o QuickBrick Studio."
        />
        <meta
          property="og:url"
          content="https://robostage.vercel.app/tools/quickbrick"
        />
        <meta property="og:type" content="website" />
      </Head>
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
        <div role="tablist" className="tabs tabs-border my-2 ml-4">
          <button
            role="tab"
            className={`tab ${tab === "canvas" ? "tab-active" : ""}`}
            onClick={() => setTab("canvas")}
          >
            Estratégias
          </button>
          <button
            role="tab"
            className={`tab ${tab === "swot" ? "tab-active" : ""}`}
            onClick={() => setTab("swot")}
          >
            Matriz SWOT
          </button>
        </div>

        <div className="w-full px-4 mb-4">
          {tab === "canvas" && (
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-bold my-4 ml-4 text-primary">
                Estratégias
              </h1>
              <p className="text-sm mb-2 text-base-content ml-2 px-2 max-w-3xl">
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
    </>
  );
}
