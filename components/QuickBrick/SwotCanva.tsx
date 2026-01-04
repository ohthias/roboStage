"use client";
import jsPDF from "jspdf";
import { useState, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/app/context/ToastContext";
import {
  ArrowUturnLeftIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Image } from "lucide-react";

const seasonLogos: Record<string, { name: string; image: string }> = {
  unearthed: {
    name: "Unearthed (2025/26)",
    image: "/images/logos/Unearthed.webp",
  },
  submerged: {
    name: "Submerged (2024/25)",
    image: "/images/logos/Submerged.webp",
  },
};

export const SWOTCanvas = ({
  missions,
  setMissions,
  seasons,
  selectedSeason,
  setSelectedSeason,
}: {
  missions: any[];
  setMissions: (missions: any[]) => void;
  seasons: string[];
  selectedSeason: string | "unearthed";
  setSelectedSeason: (id: string) => void;
}) => {
  const quadrants = [
    {
      id: "strengths",
      label: "Forças",
      color: ["bg-green-100", "border-green-300"],
    },
    {
      id: "weaknesses",
      label: "Fraquezas",
      color: ["bg-red-100", "border-red-300"],
    },
    {
      id: "opportunities",
      label: "Oportunidades",
      color: ["bg-blue-100", "border-blue-300"],
    },
    {
      id: "threats",
      label: "Ameaças",
      color: ["bg-yellow-100", "border-yellow-300"],
    },
  ];

  const { addToast } = useToast();
  const router = useRouter();
  const [swot, setSwot] = useState<Record<string, any[]>>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });
  const quadrantsRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent, targetQuadrant: string) => {
    e.preventDefault();
    const transferData = e.dataTransfer.getData("mission");
    const fromQuadrant = e.dataTransfer.getData("fromQuadrant");
    if (!transferData) return;

    const mission = JSON.parse(transferData);

    setSwot((prev) => {
      let updated = { ...prev };
      if (fromQuadrant)
        updated[fromQuadrant] = updated[fromQuadrant].filter(
          (m) => m.id !== mission.id
        );
      else setMissions(missions.filter((m) => m.id !== mission.id));
      updated[targetQuadrant] = [...updated[targetQuadrant], mission];
      return updated;
    });
  };

  const handleDragStart = (
    e: React.DragEvent,
    mission: any,
    fromQuadrant?: string
  ) => {
    e.dataTransfer.setData("mission", JSON.stringify(mission));
    if (fromQuadrant) e.dataTransfer.setData("fromQuadrant", fromQuadrant);
  };

  const exportPNG = async () => {
    if (!quadrantsRef.current) return;

    addToast("Salvando...", "info");
    await document.fonts.ready;

    const element = quadrantsRef.current;
    const padding = 32;

    const originalStyle = {
      height: element.style.height,
      padding: element.style.padding,
    };

    element.style.height = "auto";
    element.style.padding = `${padding}px`;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    element.style.height = originalStyle.height;
    element.style.padding = originalStyle.padding;

    const link = document.createElement("a");
    link.download = `SWOT-${selectedSeason}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    addToast("PNG salvo com sucesso!", "success");
  };

  const resetSwot = () => {
    const allMissions = [
      ...missions,
      ...swot.strengths,
      ...swot.weaknesses,
      ...swot.opportunities,
      ...swot.threats,
    ];
    setMissions(allMissions);
    setSwot({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
    addToast("Matriz SWOT limpa!", "warning");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 max-h-[600px]">
        {/* Missões disponíveis */}
        <div className="w-40 h-[600px] overflow-y-auto p-3 bg-base-200 border border-base-300 rounded-lg">
          <h3 className="text-sm font-bold mb-2">Missões</h3>
          <div className="grid grid-cols-1 gap-3">
            {missions.map((m) => (
              <div
                key={m.id}
                draggable
                onDragStart={(e) => handleDragStart(e, m)}
                className="card w-full aspect-square bg-white rounded-xl shadow-md cursor-grab hover:scale-105 transition-transform"
                title={m.name}
              >
                <figure>
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-contain p-2"
                  />
                </figure>
                <div className="absolute bottom-2 right-2 badge badge-primary text-xs">
                  {m.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrantes SWOT */}
        <div
          ref={quadrantsRef}
          className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
        >
          {quadrants.map((q) => (
            <div
              key={q.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, q.id)}
              className={`relative flex flex-col rounded-lg border ${q.color[0]} ${q.color[1]} bg-base-100/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="card-body p-3 overflow-hidden">
                <h2 className="card-title text-black text-base">{q.label}</h2>
                <div className="flex flex-wrap gap-2 overflow-y-auto">
                  {swot[q.id].map((m) => (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, m, q.id)}
                      className="relative w-20 aspect-square rounded-lg overflow-hidden shadow bg-white cursor-grab"
                    >
                      <img
                        src={m.image}
                        alt={m.name}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-1 right-1 badge badge-secondary text-[10px]">
                        {m.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="mt-10 flex flex-col gap-6">
        {/* Ações principais */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={exportPNG}
            className="btn btn-outline btn-accent gap-2"
          >
            <Image className="size-5" />
            Exportar
          </button>
          <button
            onClick={resetSwot}
            className="btn btn-warning btn-outline gap-2"
          >
            <ArrowUturnLeftIcon className="size-5" />
            Limpar Matriz
          </button>
        </div>
      </div>
    </div>
  );
};
