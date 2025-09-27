"use client";
import jsPDF from "jspdf";
import { useState, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/app/context/ToastContext";
import { ArrowUturnLeftIcon, DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

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
    { id: "strengths", label: "Forças", color: "bg-green-100" },
    { id: "weaknesses", label: "Fraquezas", color: "bg-red-100" },
    { id: "opportunities", label: "Oportunidades", color: "bg-blue-100" },
    { id: "threats", label: "Ameaças", color: "bg-yellow-100" },
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDrop = (e: React.DragEvent, targetQuadrant: string) => {
    e.preventDefault();
    const transferData = e.dataTransfer.getData("mission");
    const fromQuadrant = e.dataTransfer.getData("fromQuadrant");
    if (!transferData) return;

    const mission = JSON.parse(transferData);

    setSwot((prev) => {
      let updated = { ...prev };
      if (fromQuadrant) updated[fromQuadrant] = updated[fromQuadrant].filter((m) => m.id !== mission.id);
      else setMissions(missions.filter((m) => m.id !== mission.id));
      updated[targetQuadrant] = [...updated[targetQuadrant], mission];
      return updated;
    });
  };

  const handleDragStart = (e: React.DragEvent, mission: any, fromQuadrant?: string) => {
    e.dataTransfer.setData("mission", JSON.stringify(mission));
    if (fromQuadrant) e.dataTransfer.setData("fromQuadrant", fromQuadrant);
  };

  const exportPDF = async () => {
    if (!quadrantsRef.current) return;
    addToast("Salvando...", "info");
    await document.fonts.ready;
    const originalHeight = quadrantsRef.current.style.height;
    quadrantsRef.current.style.height = "auto";
    const canvas = await html2canvas(quadrantsRef.current, { scale: 2, useCORS: true });
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
    const canvas = await html2canvas(quadrantsRef.current, { scale: 2, useCORS: true });
    quadrantsRef.current.style.height = originalHeight;
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

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeason(seasonId);
    resetSwot();
    router.push(`/quickbrick/matriz-swot/${seasonId}`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Missões disponíveis */}
        <div className="w-40 h-[550px] overflow-y-auto p-3 bg-base-200 rounded-lg">
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
                  <img src={m.image} alt={m.name} className="w-full h-full object-contain p-2" />
                </figure>
                <div className="absolute bottom-2 right-2 badge badge-primary text-xs">{m.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrantes SWOT */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4" ref={quadrantsRef}>
          {quadrants.map((q) => (
            <div
              key={q.id}
              className={`card shadow-md ${q.color} border border-base-300 h-64`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, q.id)}
            >
              <div className="card-body p-3 overflow-hidden">
                <h2 className="card-title text-black text-base">{q.label}</h2>
                <div className="flex flex-wrap gap-2 overflow-y-auto max-h-40">
                  {swot[q.id].map((m) => (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, m, q.id)}
                      className="relative w-20 aspect-square rounded-lg overflow-hidden shadow bg-white cursor-grab"
                    >
                      <img src={m.image} alt={m.name} className="w-full h-full object-contain" />
                      <span className="absolute bottom-1 right-1 badge badge-secondary text-[10px]">{m.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={exportPDF} className="btn btn-primary">
          <DocumentIcon className="size-6 mr-2" />
          Exportar PDF
        </button>
        <button onClick={exportPNG} className="btn btn-accent">
          <PhotoIcon className="size-6 mr-2" />
          Exportar PNG
        </button>
        <button onClick={resetSwot} className="btn btn-warning">
          <ArrowUturnLeftIcon className="size-6 mr-2" />
          Limpar Matriz
        </button>
        {/* Menu recolhível de temporadas */}
        <div className="dropdown mb-4">
          <label tabIndex={0} className="btn m-1">
            Temporada: {seasonLogos[selectedSeason]?.name || selectedSeason}
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            {seasons
              .filter((s) => s !== selectedSeason)
              .map((s) => (
                <li key={s}>
                  <button onClick={() => handleSeasonChange(s)}>
                    {seasonLogos[s]?.name || s}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};