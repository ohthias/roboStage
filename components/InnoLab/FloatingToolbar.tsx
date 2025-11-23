import React from "react";
import {
  Plus,
  Trash2,
  Type,
  Hand,
  Smile,
  Lasso,
  Layers,
  BoxSelect,
  MousePointer2,
  Cable,
  Highlighter,
} from "lucide-react";

interface Props {
  onAddNode: () => void;
  onAddText: () => void;
  onAddSticker: () => void;
  onAddZone: () => void;
  onRemoveNode: () => void;
  interactionMode: "pan" | "select" | "lasso" | "connect" | "highlighter";
  setInteractionMode: (
    mode: "pan" | "select" | "lasso" | "connect" | "highlighter"
  ) => void;
  isStickerPickerOpen: boolean;
  onToggleLayers: () => void;
  isLayersOpen: boolean;
  highlighterColor: string;
  setHighlighterColor: (c: string) => void;
  highlighterThickness: number;
  setHighlighterThickness: (t: number) => void;
}

const FloatingToolbar: React.FC<Props> = ({
  onAddNode,
  onAddText,
  onAddSticker,
  onAddZone,
  onRemoveNode,
  interactionMode,
  setInteractionMode,
  isStickerPickerOpen,
  onToggleLayers,
  isLayersOpen,
  highlighterColor,
  setHighlighterColor,
  highlighterThickness,
  setHighlighterThickness,
}) => {
  const highlightColors = [
    "#fde047", // Yellow
    "#86efac", // Green
    "#f9a8d4", // Pink
    "#93c5fd", // Blue
    "#fdba74", // Orange
  ];

  const highlightSizes = [10, 20, 35];

  return (
    <div className="absolute left-0 top-0 h-screen flex items-start z-30">
      <div className="m-4 rounded-2xl p-3 bg-base-100 border border-base-300 shadow-lg flex flex-col gap-1 h-max">
        <button
          onClick={() => setInteractionMode("pan")}
          className={`btn btn-square btn-sm ${
            interactionMode === "pan"
              ? "bg-primary/10 text-primary border-primary"
              : "btn-ghost"
          }`}
          title="Navegar"
        >
          <Hand size={18} />
        </button>

        <button
          onClick={() => setInteractionMode("select")}
          className={`btn btn-square btn-sm ${
            interactionMode === "select"
              ? "bg-primary/10 text-primary border-primary"
              : "btn-ghost"
          }`}
          title="Ferramenta Seleção"
        >
          <MousePointer2 size={18} />
        </button>

        <button
          onClick={() => setInteractionMode("lasso")}
          className={`btn btn-square btn-sm ${
            interactionMode === "lasso"
              ? "bg-primary/10 text-primary border-primary"
              : "btn-ghost"
          }`}
          title="Ferramenta Laço"
        >
          <Lasso size={18} />
        </button>

        <button
          onClick={() => setInteractionMode("connect")}
          className={`btn btn-square btn-sm ${
            interactionMode === "connect"
              ? "bg-primary/10 text-primary border-primary"
              : "btn-ghost"
          }`}
          title="Ferramenta Conectar"
        >
          <Cable size={18} />
        </button>

        <button
          onClick={() => setInteractionMode("highlighter")}
          className={`btn btn-square btn-sm ${
            interactionMode === "highlighter"
              ? "bg-primary/10 text-primary border-primary"
              : "btn-ghost"
          }`}
          title="Marcador"
        >
          <Highlighter size={18} />
        </button>

        <div className="divider my-1"></div>
        {/* ADD NODE */}
        <button
          onClick={onAddNode}
          className="btn btn-square btn-sm btn-ghost hover:bg-primary/10 hover:text-primary"
          title="Criar Nó"
        >
          <Plus size={18} />
        </button>

        {/* TEXT */}
        <button
          onClick={onAddText}
          className="btn btn-square btn-sm btn-ghost"
          title="Adicionar Bloco de Texto"
        >
          <Type size={18} />
        </button>

        {/* STICKER */}
        <button
          onClick={onAddSticker}
          className={`btn btn-square btn-sm ${
            isStickerPickerOpen
              ? "bg-primary/10 text-primary border-primary"
              : "btn-ghost"
          }`}
          title="Adicionar Sticker"
        >
          <Smile size={18} />
        </button>

        {/* ZONE */}
        <button
          onClick={onAddZone}
          className="btn btn-square btn-sm btn-ghost"
          title="Criar Zona"
        >
          <BoxSelect size={18} />
        </button>

        <div className="divider my-1"></div>

        {/* LAYERS */}
        <button
          onClick={onToggleLayers}
          className={`btn btn-square btn-sm ${
            isLayersOpen
              ? "bg-primary/10 text-primary border-primary"
              : "btn-ghost"
          }`}
          title="Camadas"
        >
          <Layers size={18} />
        </button>

        {/* DELETE */}
        <button
          onClick={onRemoveNode}
          className="btn btn-square btn-sm btn-ghost hover:text-error"
          title="Deletar Elemento"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* HIGHLIGHTER SUBMENU */}
      {interactionMode === "highlighter" && (
        <div className="ml-2 mt-4 p-4 bg-base-100 rounded-2xl shadow-xl border border-base-300 flex flex-col gap-4 animate-[slideIn_0.15s_ease-out]">
          {/* COLORS */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] uppercase text-base-content/50 font-bold tracking-wider">
              Cor
            </span>
            <div className="flex flex-col gap-2">
              {highlightColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setHighlighterColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    highlighterColor === c
                      ? "border-primary scale-110 shadow"
                      : "border-base-300"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* SIZES */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase text-base-content/50 font-bold tracking-wider">
              Tamanho
            </span>
            <div className="flex flex-col items-center gap-3">
              {highlightSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setHighlighterThickness(s)}
                  className={`rounded-full bg-base-content/40 hover:bg-base-content/70 transition-all ${
                    highlighterThickness === s
                      ? "bg-primary ring-2 ring-primary/40"
                      : ""
                  }`}
                  style={{ width: s / 2 + 12, height: s / 2 + 12 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
