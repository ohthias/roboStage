import React from "react";
import {
  Bot,
  Hand,
  Pencil,
  Ruler,
  Eraser,
  SquareDashedMousePointer,
  Undo2,
  Redo2,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Plus,
  Archive,
  Scan,
} from "lucide-react";

import { Layer, ToolType } from "@/features/quickbrick/estrategia/types";
import {
  Section,
  PanelCard,
  IconToggle,
  ActionButton,
  ToggleRow,
  SliderRow,
} from "@/components/stage/tool/panel-kit";
import { IconButton, Kbd, cn } from "@/components/stage";

/* ------------------ Tipagens ------------------ */

export interface ToolbarProps {
  tool: ToolType;
  setTool: (t: ToolType) => void;

  color: string;
  setColor: (c: string) => void;

  // NOVO: controle de tamanho do apagador
  eraserSize: number;
  setEraserSize: (v: number) => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  clearLayer: () => void;
  exportGeneral: () => void;
  exportLayers: () => void;

  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  showZones: boolean;
  setShowZones: (v: boolean) => void;

  layers: Layer[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  toggleVisibility: (id: string) => void;
  toggleZoneVisibility: (id: string) => void;
}

const TOOLS: { key: ToolType; icon: typeof Hand; label: string }[] = [
  { key: "hand", icon: Hand, label: "Mover" },
  { key: "robot", icon: Bot, label: "Robô" },
  { key: "line", icon: Ruler, label: "Linha" },
  { key: "free", icon: Pencil, label: "Livre" },
  { key: "eraser", icon: Eraser, label: "Borracha" },
  { key: "zone", icon: SquareDashedMousePointer, label: "Zonas" },
];

/* ------------------ Componente Principal ------------------ */

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  eraserSize,
  setEraserSize,
  undo,
  redo,
  canUndo,
  canRedo,
  clearLayer,
  exportGeneral,
  exportLayers,
  showLabels,
  setShowLabels,
  showZones,
  setShowZones,
  layers,
  activeLayerId,
  setActiveLayerId,
  addLayer,
  deleteLayer,
  renameLayer,
  toggleVisibility,
  toggleZoneVisibility,
}) => {
  return (
    <div className="flex h-full min-h-[513px] w-64 flex-col border-r border-base-300 bg-base-100">
      <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-3">
        {/* FERRAMENTAS */}
        <Section title="Ferramentas">
          <div className="grid grid-cols-6 gap-1">
            {TOOLS.map((t) => (
              <IconToggle
                key={t.key}
                active={tool === t.key}
                onClick={() => setTool(t.key)}
                Icon={t.icon}
                label={t.label}
              />
            ))}
          </div>
        </Section>

        {/* PROPRIEDADES */}
        <Section title="Propriedades">
          <PanelCard className="flex items-center gap-3 p-2">
            <div className="relative size-8 overflow-hidden rounded-md ring-1 ring-base-content/15">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: color }}
              />
              <input
                aria-label="Selecionar cor"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
              />
            </div>

            <div className="leading-tight">
              <p className="text-[11px] text-base-content/55">Cor do traço</p>
              <p className="font-mono text-[13px] font-semibold">{color.toUpperCase()}</p>
            </div>
          </PanelCard>

          <div className="mt-2 space-y-0.5">
            <ToggleRow
              label="Mostrar Medidas"
              checked={showLabels}
              onChange={setShowLabels}
            />
            <ToggleRow
              label="Mostrar Zonas"
              checked={showZones}
              onChange={setShowZones}
            />
          </div>

          {/* Tamanho do apagador — só aparece com a ferramenta selecionada */}
          {tool === "eraser" && (
            <div className="mt-3">
              <SliderRow label="Tamanho da borracha" value={eraserSize} min={10} max={80} step={2} display={`${eraserSize}px`} onChange={setEraserSize} />
              <p className="mt-1 text-[11px] leading-relaxed text-base-content/55">
                Passe sobre um traço para apagar só a parte tocada. Segure <Kbd>Ctrl</Kbd> para apagar o traço inteiro.
              </p>
            </div>
          )}
        </Section>

        {/* AÇÕES */}
        <Section title="Ações">
          <div className="grid grid-cols-2 gap-2">
            {/* Undo/Redo */}
            <div className="col-span-2 flex gap-2">
              <ActionButton
                onClick={undo}
                disabled={!canUndo}
                Icon={Undo2}
                label="Desfazer"
                className="flex-1"
              />
              <ActionButton
                onClick={redo}
                disabled={!canRedo}
                Icon={Redo2}
                label="Refazer"
                className="flex-1"
              />
            </div>

            <ActionButton
              onClick={clearLayer}
              Icon={Trash2}
              label="Limpar Camada"
              variant="error"
              outline
              className="col-span-2"
            />

            <ActionButton
              onClick={exportGeneral}
              Icon={ImageIcon}
              label="PNG"
              variant="primary"
              className="w-full"
            />

            <ActionButton
              onClick={exportLayers}
              Icon={Archive}
              label="Camadas"
              className="w-full"
            />
          </div>
        </Section>

        {/* CAMADAS */}
        <Section title="Camadas" action={<AddLayerButton onClick={addLayer} />}>
          <ul className="space-y-0.5 rounded-lg border border-base-300 bg-base-100 p-1 max-h-[80px] overflow-y-auto">
            {layers.map((layer) => {
              const isActive = activeLayerId === layer.id;
              return (
                <li
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-md py-1 pl-1 pr-0.5 transition-colors",
                    isActive ? "bg-primary/10" : "hover:bg-base-content/[0.04]",
                  )}
                >
                  <span className={cn("h-5 w-1 shrink-0 rounded-full", isActive ? "bg-primary" : "bg-transparent")} aria-hidden />
                  <input
                    aria-label={`Nome da camada ${layer.name}`}
                    type="text"
                    value={layer.name}
                    onChange={(e) => renameLayer(layer.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "h-7 min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 text-[13px] hover:border-base-300 focus:border-primary focus:bg-base-100 focus:outline-none",
                      isActive && "font-semibold text-primary",
                    )}
                  />
                  <IconButton
                    label="Mostrar zonas"
                    icon={<Scan />}
                    size="xs"
                    active={layer.zonesVisible && layer.visible}
                    disabled={!layer.visible}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleZoneVisibility(layer.id);
                    }}
                  />
                  <IconButton
                    label={layer.visible ? "Ocultar camada" : "Mostrar camada"}
                    icon={layer.visible ? <Eye /> : <EyeOff className="opacity-40" />}
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(layer.id);
                    }}
                  />
                  {layers.length > 1 && (
                    <IconButton
                      label="Excluir camada"
                      icon={<Trash2 />}
                      size="xs"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </div>
  );
};

const AddLayerButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <IconButton label="Adicionar camada" icon={<Plus />} size="xs" variant="primary" onClick={onClick} />
);
