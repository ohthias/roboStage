"use client";
import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/app/context/ToastContext";
import { Image, RotateCcw, X, ArrowRightLeft, ChevronDown } from "lucide-react";

type Mission = { id: string | number; name: string; image: string };
type QuadrantId = "strengths" | "weaknesses" | "opportunities" | "threats";

const QUADRANTS: {
  id: QuadrantId;
  label: string;
  short: string;
  color: [string, string, string];
}[] = [
  { id: "strengths", label: "Forças", short: "Forças", color: ["bg-success/15", "border-success", "text-success"] },
  { id: "weaknesses", label: "Fraquezas", short: "Fraq.", color: ["bg-error/15", "border-error", "text-error"] },
  { id: "opportunities", label: "Oportunidades", short: "Oport.", color: ["bg-info/15", "border-info", "text-info"] },
  { id: "threats", label: "Ameaças", short: "Ameaças", color: ["bg-warning/15", "border-warning", "text-warning"] },
];

export const SwotMobile = ({
  missions,
  setMissions,
  selectedSeason,
}: {
  missions: Mission[];
  setMissions: (missions: Mission[]) => void;
  selectedSeason: string;
}) => {
  const { addToast } = useToast();

  const [swot, setSwot] = useState<Record<QuadrantId, Mission[]>>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });
  const [activeTab, setActiveTab] = useState<QuadrantId>("strengths");
  const [trayOpen, setTrayOpen] = useState(true);

  // picker state: mission currently awaiting a destination, plus where it came from (undefined = tray)
  const [picker, setPicker] = useState<{ mission: Mission; from?: QuadrantId } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const totalPlaced = useMemo(
    () => Object.values(swot).reduce((sum, arr) => sum + arr.length, 0),
    [swot]
  );

  const openPicker = (mission: Mission, from?: QuadrantId) => {
    setPicker({ mission, from });
    dialogRef.current?.showModal();
  };

  const closePicker = () => {
    dialogRef.current?.close();
    setPicker(null);
  };

  const placeMission = (target: QuadrantId) => {
    if (!picker) return;
    const { mission, from } = picker;

    if (from === target) {
      closePicker();
      return;
    }

    if (from) {
      setSwot((prev) => ({
        ...prev,
        [from]: prev[from].filter((m) => m.id !== mission.id),
        [target]: [...prev[target], mission],
      }));
    } else {
      setMissions(missions.filter((m) => m.id !== mission.id));
      setSwot((prev) => ({ ...prev, [target]: [...prev[target], mission] }));
    }

    setActiveTab(target);
    closePicker();
  };

  const returnToTray = () => {
    if (!picker || !picker.from) return;
    const { mission, from } = picker;
    setSwot((prev) => ({
      ...prev,
      [from!]: prev[from!].filter((m) => m.id !== mission.id),
    }));
    setMissions([...missions, mission]);
    closePicker();
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

  const exportPNG = async () => {
    if (!exportRef.current) return;
    addToast("Salvando...", "info");
    await document.fonts.ready;

    const canvas = await html2canvas(exportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `SWOT-${selectedSeason}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    addToast("PNG salvo com sucesso!", "success");
  };

  const activeQuadrant = QUADRANTS.find((q) => q.id === activeTab)!;

  return (
    <div className="flex flex-col gap-4">
      {/* Bandeja de missões disponíveis */}
      <div className="rounded-lg border border-base-300 bg-base-200 overflow-hidden">
        <button
          onClick={() => setTrayOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2"
        >
          <span className="text-sm font-bold">
            Missões disponíveis
            <span className="badge badge-primary badge-sm ml-2">{missions.length}</span>
          </span>
          <ChevronDown
            className={`size-4 transition-transform ${trayOpen ? "rotate-180" : ""}`}
          />
        </button>

        {trayOpen && (
          <div className="px-3 pb-3">
            {missions.length === 0 ? (
              <p className="text-xs opacity-60 py-2">
                Todas as missões já foram distribuídas na matriz.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {missions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => openPicker(m)}
                    className="relative shrink-0 w-20 aspect-square rounded-lg bg-white border border-base-300 shadow-sm active:scale-95 transition-transform"
                    title={m.name}
                  >
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-full h-full object-contain p-1.5"
                    />
                    <span className="absolute bottom-1 right-1 badge badge-primary badge-xs">
                      {m.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Abas dos quadrantes */}
      <div role="tablist" className="tabs tabs-boxed grid grid-cols-4 gap-1">
        {QUADRANTS.map((q) => (
          <button
            key={q.id}
            role="tab"
            onClick={() => setActiveTab(q.id)}
            className={`tab gap-1 ${activeTab === q.id ? "tab-active" : ""}`}
          >
            <span className="text-xs">{q.short}</span>
            {swot[q.id].length > 0 && (
              <span className={`badge badge-xs ${activeTab === q.id ? "badge-neutral" : ""}`}>
                {swot[q.id].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo do quadrante ativo */}
      <div
        className={`min-h-[320px] rounded-lg border p-3 ${activeQuadrant.color[0]} ${activeQuadrant.color[1]}`}
      >
        <h2 className={`text-sm font-bold mb-3 ${activeQuadrant.color[2]}`}>
          {activeQuadrant.label}
        </h2>

        {swot[activeTab].length === 0 ? (
          <p className="text-xs opacity-60 text-center py-10">
            {missions.length > 0
              ? "Toque em uma missão na bandeja acima para adicioná-la aqui."
              : "Nenhuma missão adicionada a este quadrante."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {swot[activeTab].map((m) => (
              <button
                key={m.id}
                onClick={() => openPicker(m, activeTab)}
                className="relative aspect-square rounded-lg overflow-hidden bg-white border border-base-300 shadow-sm active:scale-95 transition-transform"
                title={m.name}
              >
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-contain p-1"
                />
                <span className="absolute bottom-1 right-1 badge badge-secondary badge-xs">
                  {m.id}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de destino */}
      <dialog ref={dialogRef} className="modal" onClose={() => setPicker(null)}>
        <div className="modal-box">
          {picker && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 aspect-square rounded-lg bg-white border border-base-300 shrink-0">
                  <img
                    src={picker.mission.image}
                    alt={picker.mission.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div>
                  <p className="font-bold text-sm">{picker.mission.name}</p>
                  <p className="text-xs opacity-60">
                    {picker.from
                      ? `Atualmente em ${QUADRANTS.find((q) => q.id === picker.from)?.label}`
                      : "Ainda não distribuída"}
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold opacity-70 mb-2">
                Mover para:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUADRANTS.filter((q) => q.id !== picker.from).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => placeMission(q.id)}
                    className={`btn btn-sm justify-start gap-2 ${q.color[0]} ${q.color[1]} border`}
                  >
                    <ArrowRightLeft className="size-3.5" />
                    {q.label}
                  </button>
                ))}
              </div>

              {picker.from && (
                <button
                  onClick={returnToTray}
                  className="btn btn-sm btn-ghost btn-error w-full mt-3 gap-2"
                >
                  <X className="size-3.5" />
                  Remover do quadrante
                </button>
              )}
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closePicker}>fechar</button>
        </form>
      </dialog>

      {/* Barra de ações fixa */}
      <div
        className="sticky bottom-0 -mx-4 px-4 py-3 bg-base-100/95 backdrop-blur border-t border-base-300 flex gap-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={exportPNG}
          disabled={totalPlaced === 0}
          className="btn btn-outline btn-success btn-sm flex-1 gap-2"
        >
          <Image className="size-4" />
          Exportar
        </button>
        <button
          onClick={resetSwot}
          disabled={totalPlaced === 0}
          className="btn btn-outline btn-error btn-sm flex-1 gap-2"
        >
          <RotateCcw className="size-4" />
          Resetar
        </button>
      </div>

      {/* Layout oculto usado apenas para gerar o PNG (mantém o mesmo resultado do desktop) */}
      <div
        ref={exportRef}
        className="absolute top-0 left-[-10000px] pointer-events-none w-[720px] p-8 bg-white grid grid-cols-2 gap-6"
        aria-hidden
      >
        {QUADRANTS.map((q) => (
          <div
            key={q.id}
            className={`rounded-lg border ${q.color[0]} ${q.color[1]} p-3`}
          >
            <h2 className={`font-bold text-base mb-2 ${q.color[2]}`}>{q.label}</h2>
            <div className="flex flex-wrap gap-2">
              {swot[q.id].map((m) => (
                <div
                  key={m.id}
                  className="relative w-20 aspect-square rounded-lg overflow-hidden shadow bg-white"
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
        ))}
      </div>
    </div>
  );
};
