import React from "react";
import { Pencil } from "lucide-react";
import { InfoTile, ToolBadge, ToolButton, ToolDialog } from "@/components/stage";
import { Risco } from "@/features/quickbrick/matriz-risco/types";
import { IMPACTO_LABELS, PROBABILIDADE_LABELS, getRiskLevel } from "@/features/quickbrick/matriz-risco/lib/constants";

interface RiscoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  risco: Risco | null;
  onEdit?: (risco: Risco) => void;
}

const RiscoDetalhesModal: React.FC<RiscoDetalhesModalProps> = ({ isOpen, onClose, risco, onEdit }) => {
  const level = risco ? getRiskLevel(risco.impacto, risco.probabilidade) : null;

  return (
    <ToolDialog
      open={isOpen && !!risco}
      onClose={onClose}
      title={risco?.titulo ?? "Risco"}
      size="md"
      footer={
        <>
          {onEdit && risco && (
            <ToolButton
              variant="ghost"
              icon={<Pencil />}
              onClick={() => {
                onClose();
                onEdit(risco);
              }}
            >
              Editar
            </ToolButton>
          )}
          <ToolButton variant="primary" onClick={onClose}>
            Fechar
          </ToolButton>
        </>
      }
    >
      {risco && level && (
        <div className="space-y-3 pb-2">
          <ToolBadge tone={level.tone === "error" ? "primary" : level.tone} dot>
            Risco {level.label.toLowerCase()} · {risco.impacto * risco.probabilidade}/25
          </ToolBadge>
          <p className="text-[13px] leading-6 text-base-content/80">{risco.descricao || "Nenhuma descrição fornecida."}</p>
          <div className="grid grid-cols-2 gap-2">
            <InfoTile label="Impacto" value={IMPACTO_LABELS[risco.impacto]} />
            <InfoTile label="Probabilidade" value={PROBABILIDADE_LABELS[risco.probabilidade]} />
          </div>
        </div>
      )}
    </ToolDialog>
  );
};

export default RiscoDetalhesModal;
