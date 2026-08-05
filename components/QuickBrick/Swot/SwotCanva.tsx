"use client";
import { useState, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/app/context/ToastContext";
import { Image, RotateCcw } from "lucide-react";

export const SWOTCanvas = ({
  missions,
  setMissions,
  selectedSeason,
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
      color: ["bg-success/20", "border-success", "text-success"],
    },
    {
      id: "weaknesses",
      label: "Fraquezas",
      color: ["bg-error/20", "border-error", "text-error"],
    },
    {
      id: "opportunities",
      label: "Oportunidades",
      color: ["bg-info/20", "border-info", "text-info"],
    },
    {
      id: "threats",
      label: "Ameaças",
      color: ["bg-warning/20", "border-warning", "text-warning"],
    },
  ];

  const { addToast } = useToast();
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
    if (!fromQuadrant) {
      setMissions(missions.filter((m) => m.id !== mission.id));
    }

    setSwot((prev) => {
      const updated = { ...prev };
      if (fromQuadrant) {
        updated[fromQuadrant] = updated[fromQuadrant].filter(
          (m) => m.id !== mission.id
        );
      }
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
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-end gap-4">
        <button
          onClick={exportPNG}
          className="btn btn-outline btn-success gap-2"
        >
          <Image className="size-5" />
          Exportar
        </button>

        <button
          onClick={resetSwot}
          className="btn btn-outline btn-error gap-2"
        >
          <RotateCcw className="size-5" />
          Resetar
        </button>
      </section>

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
              className={`relative flex flex-col rounded-lg border ${q.color[0]} ${q.color[1]} ${q.color[2]} bg-base-100/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="card-body p-3 overflow-hidden">
                <h2 className="card-title text-base">{q.label}</h2>
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
    </div>
  );
};
