"use client";
import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { useToast } from "@/components/providers/ToastContext";
import { Image, RotateCcw, X, ArrowRightLeft } from "lucide-react";
import { Panel, Segmented, ToolBadge, ToolButton, ToolDialog, ToolEmpty, ToolScope, cn } from "@/components/stage";

const QUAD_BAR: Record<string, string> = {
  strengths: "border-t-success",
  weaknesses: "border-t-error",
  opportunities: "border-t-info",
  threats: "border-t-warning",
};
const QUAD_LEFT: Record<string, string> = {
  strengths: "border-l-success",
  weaknesses: "border-l-error",
  opportunities: "border-l-info",
  threats: "border-l-warning",
};

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

  // picker state: mission currently awaiting a destination, plus where it came from (undefined = tray)
  const [picker, setPicker] = useState<{ mission: Mission; from?: QuadrantId } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const totalPlaced = useMemo(
    () => Object.values(swot).reduce((sum, arr) => sum + arr.length, 0),
    [swot]
  );

  const openPicker = (mission: Mission, from?: QuadrantId) => setPicker({ mission, from });
  const closePicker = () => setPicker(null);

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
    <ToolScope className="flex flex-col gap-3 rounded-tl-[1.25rem] rounded-br-[1.25rem] border border-base-300 p-3">
      {/* Bandeja de missões disponíveis */}
      <Panel
        title="Missões disponíveis"
        actions={<ToolBadge tone="primary">{missions.length}</ToolBadge>}
        collapsible
      >
        {missions.length === 0 ? (
          <p className="py-2 text-xs text-base-content/60">Todas as missões já foram distribuídas na matriz.</p>
        ) : (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {missions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openPicker(m)}
                className="relative aspect-square w-20 shrink-0 rounded-md border border-base-300 bg-white shadow-sm transition-transform active:scale-95"
                title={m.name}
              >
                <img src={m.image} alt={m.name} className="h-full w-full object-contain p-1.5" />
                <span className="absolute bottom-1 right-1 rounded bg-base-content px-1 font-mono text-[10px] font-bold text-base-100">{m.id}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* Abas dos quadrantes */}
      <Segmented
        label="Quadrante"
        value={activeTab}
        onChange={(v) => setActiveTab(v as QuadrantId)}
        options={QUADRANTS.map((q) => ({
          value: q.id,
          label: swot[q.id].length > 0 ? `${q.short} ${swot[q.id].length}` : q.short,
          title: q.label,
        }))}
        className="grid w-full grid-cols-4"
      />

      {/* Conteúdo do quadrante ativo */}
      <section className={cn("min-h-[300px] rounded-lg border border-t-[3px] border-base-300 bg-base-100 p-3", QUAD_BAR[activeTab])}>
        <h2 className="mb-3 text-[13px] font-bold">{activeQuadrant.label}</h2>

        {swot[activeTab].length === 0 ? (
          <ToolEmpty
            title="Quadrante vazio"
            description={
              missions.length > 0 ? "Toque em uma missão na bandeja acima para adicioná-la aqui." : "Nenhuma missão adicionada a este quadrante."
            }
          />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {swot[activeTab].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openPicker(m, activeTab)}
                className="relative aspect-square overflow-hidden rounded-md border border-base-300 bg-white shadow-sm transition-transform active:scale-95"
                title={m.name}
              >
                <img src={m.image} alt={m.name} className="h-full w-full object-contain p-1" />
                <span className="absolute bottom-1 right-1 rounded bg-base-content px-1 font-mono text-[10px] font-bold text-base-100">{m.id}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Destino da missão */}
      <ToolDialog
        open={!!picker}
        onClose={closePicker}
        title={picker?.mission.name ?? "Missão"}
        description={
          picker?.from ? `Atualmente em ${QUADRANTS.find((q) => q.id === picker.from)?.label}` : "Ainda não distribuída"
        }
        size="sm"
        footer={
          picker?.from ? (
            <ToolButton variant="danger" icon={<X />} onClick={returnToTray} className="w-full">
              Remover do quadrante
            </ToolButton>
          ) : (
            <ToolButton onClick={closePicker}>Cancelar</ToolButton>
          )
        }
      >
        {picker && (
          <div className="space-y-3 pb-2">
            <div className="mx-auto aspect-square w-24 rounded-md border border-base-300 bg-white">
              <img src={picker.mission.image} alt="" className="h-full w-full object-contain p-1" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">Mover para</p>
            <div className="grid grid-cols-2 gap-2">
              {QUADRANTS.filter((q) => q.id !== picker.from).map((q) => (
                <ToolButton
                  key={q.id}
                  size="md"
                  variant="outline"
                  icon={<ArrowRightLeft />}
                  onClick={() => placeMission(q.id)}
                  className={cn("justify-start border-l-4", QUAD_LEFT[q.id])}
                >
                  {q.label}
                </ToolButton>
              ))}
            </div>
          </div>
        )}
      </ToolDialog>

      {/* Barra de ações fixa */}
      <div
        className="sticky bottom-0 -mx-3 -mb-3 flex gap-2 rounded-br-[1.25rem] border-t border-base-300 bg-base-100/95 px-3 py-2 backdrop-blur"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <ToolButton size="md" variant="ghost" icon={<RotateCcw />} onClick={resetSwot} disabled={totalPlaced === 0} className="flex-1">
          Resetar
        </ToolButton>
        <ToolButton size="md" variant="primary" icon={<Image />} onClick={exportPNG} disabled={totalPlaced === 0} className="flex-1">
          Exportar PNG
        </ToolButton>
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
                  <span className="absolute bottom-1 right-1 rounded bg-neutral-900 px-1 font-mono text-[10px] font-bold text-white">
                    {m.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ToolScope>
  );
};
