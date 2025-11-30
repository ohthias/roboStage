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
  Image,
  Eye,
  EyeOff,
  Plus,
  Archive,
  Scan
} from "lucide-react";

import { Layer, ToolType } from "@/types/CanvasType";

interface ToolbarProps {
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
  toggleZoneVisibility
}) => {
  return (
    <div className="w-64 h-[513px] flex flex-col bg-base-200 text-base-content border-r border-base-300">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

        {/* Ferramentas */}
        <Section title="Ferramentas">
          <div className="join grid grid-cols-5 w-full">
            <ToolButton
              active={tool === "hand"}
              onClick={() => setTool("hand")}
              Icon={<Hand size={20} />}
              label="Mover & Editar"
            />

            <ToolButton
              active={tool === "robot"}
              onClick={() => setTool("robot")}
              Icon={<Bot size={20} />}
              label="Robô"
            />

            <ToolButton
              active={tool === "line"}
              onClick={() => setTool("line")}
              Icon={<Ruler size={20} />}
              label="Linha Reta"
            />

            <ToolButton
              active={tool === "free"}
              onClick={() => setTool("free")}
              Icon={<Pencil size={20} />}
              label="Desenho Livre"
            />

            <ToolButton
              active={tool === "zone"}
              onClick={() => setTool("zone")}
              Icon={<SquareDashedMousePointer size={20} />}
              label="Criar Zona"
            />
          </div>
        </Section>

        {/* Propriedades */}
        <Section title="Propriedades">
          <div className="flex items-center gap-4 p-3 bg-base-100 border border-base-300 rounded-box">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-base-content/20 shadow-sm relative">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-base-content/70">Cor</span>
              <span className="text-sm font-mono">{color.toUpperCase()}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Mostrar Medidas"
              checked={showLabels}
              onChange={setShowLabels}
            />

            <ToggleRow
              label="Mostrar Todas as Zonas"
              checked={showZones}
              onChange={setShowZones}
            />
          </div>
        </Section>

        {/* Ações */}
        <Section title="Ações">
          <div className="grid grid-cols-2 gap-2">

            <div className="join col-span-2 grid grid-cols-2">
              <button
                className="btn btn-sm join-item"
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo2 size={16} /> Desfazer
              </button>

              <button
                className="btn btn-sm join-item"
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo2 size={16} /> Refazer
              </button>
            </div>

            <button
              onClick={clearLayer}
              className="btn btn-outline btn-error btn-sm col-span-2"
            >
              <Trash2 size={16} /> Limpar Camada Ativa
            </button>

            <button
              onClick={exportGeneral}
              className="btn btn-neutral btn-sm w-full"
            >
              <Image size={16} /> Exportar PNG
            </button>

            <button
              onClick={exportLayers}
              className="btn btn-neutral btn-sm w-full"
            >
              <Archive size={16} /> Exportar Camadas
            </button>
          </div>
        </Section>

        {/* Camadas */}
        <Section title="Camadas" button={<AddLayerButton onClick={addLayer} />}>
          <ul className="menu bg-base-100 w-full rounded-box border border-base-300 p-0">
            {layers.map((layer) => {
              const isActive = activeLayerId === layer.id;

              return (
                <li
                  key={layer.id}
                  className={`${isActive ? "bg-base-200 border-l-4 border-primary" : ""}`}
                >
                  <div
                    className="flex items-center gap-2 py-2 px-3 cursor-pointer"
                    onClick={() => setActiveLayerId(layer.id)}
                  >
                    <input
                      type="text"
                      value={layer.name}
                      onChange={(e) => renameLayer(layer.id, e.target.value)}
                      className={`input input-ghost input-xs w-full max-w-[120px] ${
                        isActive ? "font-bold" : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Ações da camada */}
                    <div className="flex items-center gap-1 ml-auto">

                      {/* Zonas */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleZoneVisibility(layer.id);
                        }}
                        className={`btn btn-square btn-ghost btn-xs ${
                          layer.zonesVisible && layer.visible
                            ? "text-primary"
                            : "text-base-content/30"
                        }`}
                        disabled={!layer.visible}
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
                      >
                        {layer.visible ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} className="text-base-content/30" />
                        )}
                      </button>

                      {/* Deletar */}
                      {layers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="btn btn-square btn-ghost btn-xs text-error"
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

/* -------- Componentes Auxiliares -------- */

const Section = ({
  title,
  children,
  button
}: {
  title: string;
  children: React.ReactNode;
  button?: React.ReactNode;
}) => (
  <section>
    <div className="flex justify-between mb-2">
      <div className="divider font-bold text-xs opacity-60 uppercase grow">
        {title}
      </div>
      {button}
    </div>
    {children}
  </section>
);

const ToolButton = ({
  active,
  onClick,
  Icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ReactNode;
  label: string;
}) => (
  <div className="tooltip" data-tip={label}>
    <button
      onClick={onClick}
      className={`btn join-item w-full ${
        active ? "btn-primary" : "btn-ghost bg-base-100"
      }`}
    >
      {Icon}
    </button>
  </div>
);

const ToggleRow = ({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="label cursor-pointer justify-between">
    <span className="label-text">{label}</span>
    <input
      type="checkbox"
      className="toggle toggle-primary toggle-sm"
      checked={checked}
      onChange={() => onChange(!checked)}
    />
  </label>
);

const AddLayerButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="btn btn-primary btn-xs ml-2">
    <Plus size={14} />
  </button>
);