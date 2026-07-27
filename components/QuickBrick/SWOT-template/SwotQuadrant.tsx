import React, { useState, useRef, useEffect } from "react";
import type {
  SwotCategory,
  SwotItem,
  SwotQuadrantConfig,
} from "@/types/SWOTTemplateType";
import {
  Shield,
  AlertTriangle,
  Lightbulb,
  Swords,
  X,
  Edit2,
  Check,
  Trash2,
  GripVertical,
} from "lucide-react";

interface SwotQuadrantProps {
  config: SwotQuadrantConfig;
  items: SwotItem[];
  onUpdateItem: (category: SwotCategory, id: string, newText: string) => void;
  onDeleteItem: (category: SwotCategory, id: string) => void;
  onMoveItem: (
    itemId: string,
    fromCategory: SwotCategory,
    toCategory: SwotCategory,
  ) => void;
}

const iconMap = { Shield, AlertTriangle, Lightbulb, Swords };

// Maps each quadrant to a daisyUI semantic color — flat, solid, no gradients.
const THEME_STYLES = {
  green: { text: "text-success", border: "border-success/20" },
  yellow: { text: "text-warning", border: "border-warning/20" },
  blue: { text: "text-info", border: "border-info/20" },
  red: { text: "text-error", border: "border-error/20" },
} as const;

export const SwotQuadrant: React.FC<SwotQuadrantProps> = ({
  config,
  items,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const Icon = iconMap[config.iconName];
  const style = THEME_STYLES[config.colorTheme];
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const startEditing = (item: SwotItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onUpdateItem(config.id, editingId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDragStart = (e: React.DragEvent, item: SwotItem) => {
    e.dataTransfer.setData(
      "application/swot-item",
      JSON.stringify({ id: item.id, fromCategory: config.id }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/swot-item"));
      if (data?.id && data?.fromCategory) {
        onMoveItem(data.id, data.fromCategory, config.id);
      }
    } catch (err) {
      console.error("Failed to process drop", err);
    }
  };

  return (
    <div
      className={`card h-full shadow-sm`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Icon size={20} className={style.text} />
        <div>
          <h2 className="font-semibold text-base text-gray-700">{config.title}</h2>
          <p className="text-xs opacity-60 text-gray-500">{config.description}</p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[200px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-sm opacity-50 italic">
            {isDragOver ? (
              <span>Solte aqui</span>
            ) : (
              <>
                <span className="mb-1">Nenhum item</span>
                <span className="text-xs">
                  Use o campo acima para adicionar
                </span>
              </>
            )}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              draggable={!editingId}
              onDragStart={(e) => handleDragStart(e, item)}
              className="group flex items-start gap-2 p-2 rounded-btn border border-transparent
                hover:border-base-300 cursor-grab active:cursor-grabbing"
            >
              {editingId === item.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="input input-sm input-bordered flex-1"
                  />
                  <button
                    onClick={saveEdit}
                    className="btn btn-ghost btn-xs btn-square text-success"
                    aria-label="Salvar"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="btn btn-ghost btn-xs btn-square"
                    aria-label="Cancelar"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <GripVertical
                    size={14}
                    className="mt-0.5 opacity-30 flex-shrink-0"
                  />
                  <span className="text-sm flex-1 leading-relaxed break-words select-none text-gray-700">
                    {item.text}
                  </span>
                  <div className="flex items-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => startEditing(item)}
                      className="btn btn-ghost btn-xs btn-square"
                      aria-label="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(config.id, item.id)}
                      className="btn btn-ghost btn-xs btn-square text-error"
                      aria-label="Apagar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
