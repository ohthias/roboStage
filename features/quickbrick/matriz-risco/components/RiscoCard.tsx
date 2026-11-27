import React from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Risco } from "@/features/quickbrick/matriz-risco/types";
import { getRiskTextColor } from "@/features/quickbrick/matriz-risco/lib/constants";
import { IconButton, cn } from "@/components/stage";

interface RiscoCardProps {
  risco: Risco;
  onEdit: (risco: Risco) => void;
  onRemove: (riskId: number) => void;
  onView: (risco: Risco) => void;
}

const RiscoCard: React.FC<RiscoCardProps> = ({ risco, onEdit, onRemove, onView }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("riskId", risco.id.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onView(risco);
    }
  };

  return (
    <div
      draggable
      onClick={() => onView(risco)}
      onKeyDown={handleKeyDown}
      onDragStart={handleDragStart}
      className={cn(
        "group relative my-1 flex cursor-grab items-center gap-1 rounded-md border bg-base-100 py-1.5 pl-1 pr-1 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing",
        getRiskTextColor(risco.impacto, risco.probabilidade),
      )}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${risco.titulo}`}
    >
      <GripVertical className="size-3.5 shrink-0 opacity-40" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-[13px] font-semibold leading-tight">{risco.titulo}</p>
      <div className="flex shrink-0 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <IconButton
          label={`Editar risco: ${risco.titulo}`}
          icon={<Pencil />}
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(risco);
          }}
        />
        <IconButton
          label={`Remover risco: ${risco.titulo}`}
          icon={<Trash2 />}
          size="xs"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(risco.id);
          }}
        />
      </div>
    </div>
  );
};

export default RiscoCard;
