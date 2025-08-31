"use client";
import jsPDF from "jspdf";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { useToast } from "@/app/context/ToastContext";

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
  selectedSeason: string;
  setSelectedSeason: (id: string) => void;
}) => {
  const quadrants = [
    { id: "strengths", label: "Forças", color: "#BBF7D0" },
    { id: "weaknesses", label: "Fraquezas", color: "#FECACA" },
    { id: "opportunities", label: "Oportunidades", color: "#BFDBFE" },
    { id: "threats", label: "Ameaças", color: "#FEF08A" },
  ];
  const { addToast } = useToast();

  const [swot, setSwot] = useState<Record<string, any[]>>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });

  const handleDrop = (e: React.DragEvent, quadrantId: string) => {
    e.preventDefault();
    const missionData = e.dataTransfer.getData("mission");
    if (!missionData) return;
    const mission = JSON.parse(missionData);

    // adiciona ao quadrante
    setSwot((prev) => ({
      ...prev,
      [quadrantId]: [...prev[quadrantId], mission],
    }));

    // remove da lista
    setMissions(missions.filter((m) => m.id !== mission.id));
  };

  const quadrantsRef = useRef<HTMLDivElement>(null);

  // Export PDF
  const exportPDF = async () => {
    if (!quadrantsRef.current) return;
    addToast("Salvando...", "info");
    await document.fonts.ready;
    const originalHeight = quadrantsRef.current.style.height;
    quadrantsRef.current.style.height = "auto";
    const canvas = await html2canvas(quadrantsRef.current, {
      scale: 2,
      useCORS: true,
    });
    quadrantsRef.current.style.height = originalHeight;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SWOT-${selectedSeason}.pdf`);
    addToast("PDF salvo com sucesso!", "success");
  };

  const exportPNG = async () => {
    if (!quadrantsRef.current) return;
    addToast("Salvando...", "info");
    await document.fonts.ready;
    const originalHeight = quadrantsRef.current.style.height;
    quadrantsRef.current.style.height = "auto";
    const canvas = await html2canvas(quadrantsRef.current, {
      scale: 2,
      useCORS: true,
    });
    quadrantsRef.current.style.height = originalHeight;
    const link = document.createElement("a");
    link.download = `SWOT-${selectedSeason}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("PNG salvo com sucesso!", "success");
  };

  return (
    <div className="w-full pb-2">
      {/* cards de temporadas */}
      <div className="flex flex-wrap justify-start gap-4 ml-4">
        {seasons.map((id) => {
          const season = seasonLogos[id];
          return (
            <div
              key={id}
              onClick={() => {
                setSelectedSeason(id);
                setSwot({
                  strengths: [],
                  weaknesses: [],
                  opportunities: [],
                  threats: [],
                });
              }}
              className={`cursor-pointer card w-24 shadow-md border aspect-square bg-base-200 ${
                selectedSeason === id ? "border-primary" : "border-base-300"
              }`}
            >
              <figure className="p-2">
                <img
                  src={season?.image || "/images/icons/default-season.png"}
                  alt={season?.name || id}
                  className="rounded-md object-contain"
                />
              </figure>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 h-screen p-4">
        {/* cards de missões disponíveis */}
        <div className="flex-shrink-0 w-38 h-[550px] overflow-y-auto p-2 bg-base-200 rounded-lg overflow-x-hidden">
          <div className="grid grid-cols-1 gap-4">
            {missions.map((m) => (
              <div
                key={m.id}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("mission", JSON.stringify(m))
                }
                className="relative w-32 aspect-square bg-white rounded-xl overflow-hidden shadow-md cursor-grab hover:scale-105 transition-transform"
                title={m.name}
              >
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-2 right-2 bg-primary bg-opacity-70 text-primary-content text-xs px-2 py-1 rounded-lg">
                  {m.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* quadrantes */}
        <div
          className="flex-1 grid grid-cols-2 gap-4 h-[550px]"
          ref={quadrantsRef}
        >
          {quadrants.map((q) => (
            <div
              key={q.id}
              className={`flex flex-col items-center justify-start border border-base-300 rounded-lg p-2`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, q.id)}
              style={{ backgroundColor: q.color }}
            >
              <h2 className="font-bold mb-2 text-black">{q.label}</h2>
              <div className="flex flex-wrap gap-2 justify-start items-start overflow-y-auto h-[200px]">
                {swot[q.id].map((m) => (
                  <div
                    key={m.id}
                    className="relative w-24 aspect-square rounded-lg overflow-hidden shadow bg-white h-24"
                  >
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-1 right-1 bg-secondary text-white text-[10px] px-1 rounded">
                      {m.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* botões de exportação */}
      <div className="flex gap-4 justify-center">
        <button onClick={exportPDF} className="btn btn-primary">
          Exportar PDF
        </button>
        <button onClick={exportPNG} className="btn btn-secondary">
          Exportar PNG
        </button>
      </div>
    </div>
  );
};
