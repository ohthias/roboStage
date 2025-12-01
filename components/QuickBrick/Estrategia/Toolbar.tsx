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

/* ícone: componente do lucide (aceita props SVG e size) */
type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number }
>;

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
            <ToolButton
              active={tool === "hand"}
              onClick={() => setTool("hand")}
              Icon={Hand}
              label="Mover"
            />

            <ToolButton
              active={tool === "robot"}
              onClick={() => setTool("robot")}
              Icon={Bot}
              label="Robô"
            />

            <ToolButton
              active={tool === "line"}
              onClick={() => setTool("line")}
              Icon={Ruler}
              label="Linha"
            />

            <ToolButton
              active={tool === "free"}
              onClick={() => setTool("free")}
              Icon={Pencil}
              label="Livre"
            />

            <ToolButton
              active={tool === "zone"}
              onClick={() => setTool("zone")}
              Icon={SquareDashedMousePointer}
              label="Zonas"
            />
          </div>
        </Section>

        {/* PROPRIEDADES */}
        <Section title="Propriedades">
          <div className="p-4 bg-base-100 border border-base-300 rounded-xl shadow-sm flex items-center gap-4">
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
          </div>

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
              <button
                className="btn btn-sm flex-1 btn-neutral"
                onClick={undo}
                disabled={!canUndo}
                title="Desfazer"
              >
                <Undo2 size={16} />
                <span className="ml-1 hidden md:inline">Desfazer</span>
              </button>

              <button
                className="btn btn-sm flex-1 btn-neutral"
                onClick={redo}
                disabled={!canRedo}
                title="Refazer"
              >
                <Redo2 size={16} />
                <span className="ml-1 hidden md:inline">Refazer</span>
              </button>
            </div>

            <button
              onClick={clearLayer}
              className="btn btn-outline btn-error btn-sm col-span-2"
            >
              <Trash2 size={16} />
              <span className="ml-2">Limpar Camada</span>
            </button>

            <button
              className="btn btn-sm btn-neutral w-full"
              onClick={exportGeneral}
              title="Exportar imagem geral"
            >
              <ImageIcon size={16} />
              <span className="ml-1">PNG</span>
            </button>

            <button
              className="btn btn-sm btn-neutral w-full"
              onClick={exportLayers}
              title="Exportar em camadas separadas"
            >
              <Archive size={16} />
              <span className="ml-1">Camadas</span>
            </button>
          </div>
        </Section>

        {/* CAMADAS */}
        <Section title="Camadas" button={<AddLayerButton onClick={addLayer} />}>
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

/* ------------------ Componentes Auxiliares com Tipagens ------------------ */

type SectionProps = {
  title: string;
  children: React.ReactNode;
  button?: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, children, button }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-[11px] font-semibold tracking-wide uppercase text-base-content/60">
        {title}
      </h3>
      {button}
    </div>
    {children}
  </section>
);

type ToolButtonProps = {
  active: boolean;
  onClick: () => void;
  Icon: IconComponent;
  label: string;
};

const ToolButton: React.FC<ToolButtonProps> = ({
  active,
  onClick,
  Icon,
  label,
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    aria-label={label}
    title={label}
    className={`
      flex items-center justify-center h-9 w-full rounded-lg transition-all
      border
      ${active 
        ? "bg-primary text-primary-content border-primary shadow-sm" 
        : "bg-base-100 border-base-300 hover:bg-base-300/40"
      }
    `}
  >
    <Icon size={18} />
  </button>
);

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

const ToggleRow: React.FC<ToggleRowProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between py-1 cursor-pointer">
    <span className="text-xs opacity-80">{label}</span>

    <div
      className={`
        relative h-4 w-8 rounded-full transition-colors cursor-pointer
        ${checked ? "bg-primary" : "bg-base-300"}
      `}
      onClick={() => onChange(!checked)}
    >
      <div
        className={`
          absolute top-[2px] h-3 w-3 rounded-full bg-white transition-all
          ${checked ? "right-[2px]" : "left-[2px]"}
        `}
      />
    </div>
  </label>
);

type AddLayerButtonProps = {
  onClick: () => void;
};

const AddLayerButton: React.FC<AddLayerButtonProps> = ({ onClick }) => (
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