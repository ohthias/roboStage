import React from "react";
import {
  Bot,
  Hand,
  Pencil,
  Ruler,
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

import { Layer, ToolType } from "@/types/CanvasType";
import {
  Section,
  PanelCard,
  IconToggle,
  ActionButton,
  ToggleRow,
} from "@/components/UI/panel-kit";

/* ------------------ Tipagens ------------------ */

export interface ToolbarProps {
  tool: ToolType;
  setTool: (t: ToolType) => void;

  color: string;
  setColor: (c: string) => void;

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
  { key: "zone", icon: SquareDashedMousePointer, label: "Zonas" },
];

/* ------------------ Componente Principal ------------------ */

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
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
    <div className="w-64 h-[513px] flex flex-col bg-base-200 border-r border-base-300">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {/* FERRAMENTAS */}
        <Section title="Ferramentas">
          <div className="grid grid-cols-5 gap-2">
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
          <PanelCard className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden relative ring-1 ring-base-content/10 shadow-sm">
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
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

            <div>
              <p className="text-[11px] opacity-60">Cor selecionada</p>
              <p className="text-sm font-mono">{color.toUpperCase()}</p>
            </div>
          </PanelCard>

          <div className="mt-4 space-y-3">
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
          <ul className="menu bg-base-100 border border-base-300 rounded-xl w-full p-0 shadow-sm">
            {layers.map((layer) => {
              const isActive = activeLayerId === layer.id;

              return (
                <li
                  key={layer.id}
                  className={`transition-all ${
                    isActive ? "bg-base-200/70 border-l-4 border-primary" : ""
                  }`}
                >
                  <div
                    className="flex items-center gap-2 py-2 px-3 cursor-pointer"
                    onClick={() => setActiveLayerId(layer.id)}
                  >
                    {/* Nome */}
                    <input
                      aria-label={`Nome da camada ${layer.name}`}
                      type="text"
                      value={layer.name}
                      onChange={(e) => renameLayer(layer.id, e.target.value)}
                      className={`input input-ghost input-xs w-full max-w-[140px] rounded-lg ${
                        isActive ? "font-semibold" : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex items-center gap-1 ml-auto">
                      {/* Mostrar zonas */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleZoneVisibility(layer.id);
                        }}
                        className={`btn btn-square btn-ghost btn-xs ${
                          layer.zonesVisible && layer.visible
                            ? "text-primary"
                            : "opacity-30"
                        }`}
                        disabled={!layer.visible}
                        title="Mostrar zonas"
                      >
                        <Scan size={14} />
                      </button>

                      {/* Visibilidade */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(layer.id);
                        }}
                        className="btn btn-square btn-ghost btn-xs"
                        title="Visibilidade"
                      >
                        {layer.visible ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} className="opacity-30" />
                        )}
                      </button>

                      {/* Delete */}
                      {layers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="btn btn-square btn-ghost btn-xs text-error"
                          title="Deletar camada"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
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
  <button
    onClick={onClick}
    aria-label="Adicionar camada"
    className="
      flex items-center justify-center h-6 w-6 rounded-md
      bg-primary/10 text-primary hover:bg-primary hover:text-primary-content
      transition-all border border-primary/20
    "
  >
    <Plus size={14} />
  </button>
);
