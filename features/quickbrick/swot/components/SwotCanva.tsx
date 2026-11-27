"use client";
import { useState, useRef } from "react";
import { useChangeNotifier } from "@/lib/hooks/useChangeNotifier";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/components/providers/ToastContext";
import { Image, RotateCcw } from "lucide-react";
import { Panel, ToolBadge, ToolButton, ToolScope, Toolbar, ToolbarGroup, ToolbarSpacer, cn } from "@/components/stage";

export const SWOTCanvas = ({
  missions,
  setMissions,
  selectedSeason,
  initialSwot,
  onSwotChange,
}: {
  /** Estado salvo (caderno do QuickBrick Studio). */
  initialSwot?: Record<string, any[]>;
  /** Avisado a cada mudança — usado para salvar no banco. */
  onSwotChange?: (swot: Record<string, any[]>) => void;
  missions: any[];
  setMissions: (missions: any[]) => void;
  /** Temporada vem da rota (/matriz-swot/[season]); não há seletor aqui. */
  selectedSeason: string;
}) => {
  const quadrants = [
    { id: "strengths", letter: "S", label: "Forças", hint: "Interno · ajuda", bar: "border-t-success", chip: "bg-success text-success-content", drop: "bg-success/[0.06]" },
    { id: "weaknesses", letter: "W", label: "Fraquezas", hint: "Interno · atrapalha", bar: "border-t-error", chip: "bg-error text-error-content", drop: "bg-error/[0.06]" },
    { id: "opportunities", letter: "O", label: "Oportunidades", hint: "Externo · ajuda", bar: "border-t-info", chip: "bg-info text-info-content", drop: "bg-info/[0.06]" },
    { id: "threats", letter: "T", label: "Ameaças", hint: "Externo · atrapalha", bar: "border-t-warning", chip: "bg-warning text-warning-content", drop: "bg-warning/[0.08]" },
  ];
  const [dragOver, setDragOver] = useState<string | null>(null);

  const { addToast } = useToast();
  const [swot, setSwot] = useState<Record<string, any[]>>(() => ({
    strengths: initialSwot?.strengths ?? [],
    weaknesses: initialSwot?.weaknesses ?? [],
    opportunities: initialSwot?.opportunities ?? [],
    threats: initialSwot?.threats ?? [],
  }));
  useChangeNotifier(swot, onSwotChange);
  const quadrantsRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent, targetQuadrant: string) => {
    e.preventDefault();
    setDragOver(null);
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

  const placed = swot.strengths.length + swot.weaknesses.length + swot.opportunities.length + swot.threats.length;

  return (
    <ToolScope className="overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300">
      <Toolbar label="Ações da matriz SWOT" className="px-3">
        <ToolbarGroup>
          <span className="px-1 text-[13px] font-bold capitalize">{selectedSeason}</span>
          <ToolBadge>
            {placed}/{placed + missions.length} na matriz
          </ToolBadge>
        </ToolbarGroup>
        <ToolbarSpacer />
        <ToolbarGroup>
          <ToolButton variant="ghost" icon={<RotateCcw />} onClick={resetSwot}>
            Resetar
          </ToolButton>
          <ToolButton variant="primary" icon={<Image />} onClick={exportPNG}>
            Exportar PNG
          </ToolButton>
        </ToolbarGroup>
      </Toolbar>

      <div className="flex flex-col gap-3 p-3 lg:flex-row">
        {/* Missões disponíveis */}
        <Panel title="Missões" actions={<ToolBadge>{missions.length}</ToolBadge>} className="lg:w-44 lg:shrink-0" padded={false}>
          <div className="grid max-h-[560px] grid-cols-3 gap-2 overflow-y-auto p-2 sm:grid-cols-6 lg:grid-cols-1">
            {missions.map((m) => (
              <div
                key={m.id}
                draggable
                onDragStart={(e) => handleDragStart(e, m)}
                className="group relative aspect-square cursor-grab overflow-hidden rounded-md border border-base-300 bg-white transition-[border-color,box-shadow] hover:border-primary hover:shadow-[3px_3px_0_0_var(--color-primary)] active:cursor-grabbing"
                title={m.name}
              >
                <img src={m.image} alt={m.name} className="h-full w-full object-contain p-2" />
                <span className="absolute bottom-1 right-1 rounded bg-base-content px-1 font-mono text-[10px] font-bold text-base-100">{m.id}</span>
              </div>
            ))}
            {missions.length === 0 && (
              <p className="col-span-full px-1 py-4 text-center text-xs text-base-content/50">Todas as missões já estão na matriz.</p>
            )}
          </div>
        </Panel>

        {/* Quadrantes SWOT */}
        <div ref={quadrantsRef} className="grid flex-1 grid-cols-1 gap-3 bg-base-200/0 md:grid-cols-2">
          {quadrants.map((q) => (
            <section
              key={q.id}
              aria-label={q.label}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOver !== q.id) setDragOver(q.id);
              }}
              onDragLeave={() => setDragOver((d) => (d === q.id ? null : d))}
              onDrop={(e) => handleDrop(e, q.id)}
              className={cn(
                "flex min-h-[260px] flex-col overflow-hidden rounded-lg border border-t-[3px] border-base-300 bg-base-100 transition-[box-shadow,background-color]",
                q.bar,
                dragOver === q.id && cn("ring-2 ring-primary/40", q.drop),
              )}
            >
              <header className="flex items-center justify-between gap-2 border-b border-base-300 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn("grid size-7 place-items-center rounded-tl-md rounded-br-md font-mono text-sm font-bold", q.chip)}>{q.letter}</span>
                  <div>
                    <h3 className="text-[13px] font-bold leading-tight">{q.label}</h3>
                    <p className="text-[11px] leading-tight text-base-content/50">{q.hint}</p>
                  </div>
                </div>
                <ToolBadge className="font-mono">{swot[q.id].length}</ToolBadge>
              </header>
              <div className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto p-3">
                {swot[q.id].map((m) => (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, m, q.id)}
                    className="relative aspect-square w-20 cursor-grab overflow-hidden rounded-md border border-base-300 bg-white shadow-sm active:cursor-grabbing"
                    title={m.name}
                  >
                    <img src={m.image} alt={m.name} className="h-full w-full object-contain" />
                    <span className="absolute bottom-1 right-1 rounded bg-base-content px-1 font-mono text-[10px] font-bold text-base-100">{m.id}</span>
                  </div>
                ))}
                {swot[q.id].length === 0 && (
                  <p className="m-auto rounded-md border border-dashed border-base-300 px-3 py-4 text-center text-xs text-base-content/45">
                    Arraste missões para cá
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </ToolScope>
  );
};
