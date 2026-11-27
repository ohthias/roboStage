import React from "react";
import { FileImage, FolderArchive, CheckCircle2, XCircle } from "lucide-react";
import { InlineAlert, ListGroup, ToolBadge, ToolButton, ToolDialog } from "@/components/stage";
import { ExportElementCounts, ExportSummary } from "@/features/quickbrick/estrategia/types";

interface ExportPreviewModalProps {
  summary: ExportSummary;
  onCancel: () => void;
  onConfirm: () => void;
}

const elementLabel = (counts: ExportElementCounts) => {
  const parts: string[] = [];
  if (counts.lines > 0) parts.push(`${counts.lines} linha(s)`);
  if (counts.freePaths > 0) parts.push(`${counts.freePaths} traço(s) livre(s)`);
  if (counts.zones > 0) parts.push(`${counts.zones} zona(s)`);
  if (counts.robots > 0) parts.push(`${counts.robots} robô(s)`);
  return parts.length > 0 ? parts.join(", ") : "vazia";
};

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  summary,
  onCancel,
  onConfirm,
}) => {
  const isGeneral = summary.type === "general";
  const includedLayers = summary.layers.filter((l) => l.included);
  const excludedLayers = summary.layers.filter((l) => !l.included);

  return (
    <ToolDialog
      open
      onClose={onCancel}
      title={isGeneral ? "Exportar PNG" : "Exportar camadas"}
      description={`Arquivo: ${summary.fileName}`}
      size="md"
      footer={
        <>
          <ToolButton variant="ghost" onClick={onCancel}>
            Cancelar
          </ToolButton>
          <ToolButton variant="primary" icon={isGeneral ? <FileImage /> : <FolderArchive />} onClick={onConfirm}>
            Confirmar exportação
          </ToolButton>
        </>
      }
    >
      <div className="space-y-3 pb-2">
        <div className="flex flex-wrap gap-1.5">
          <ToolBadge tone={summary.showZones ? "primary" : "neutral"} dot>
            Zonas {summary.showZones ? "incluídas" : "ocultas"}
          </ToolBadge>
          <ToolBadge tone={summary.showLabels ? "primary" : "neutral"} dot>
            Medidas {summary.showLabels ? "incluídas" : "ocultas"}
          </ToolBadge>
        </div>

        {summary.isEmpty && (
          <InlineAlert type="warning">
            Nenhum elemento será incluído nesta exportação — apenas o fundo da mesa.
          </InlineAlert>
        )}

        <ListGroup label={isGeneral ? "Camadas que serão exportadas" : "Camadas (um arquivo por camada)"}>
          {includedLayers.length === 0 ? (
            <p className="px-2 text-xs italic text-base-content/50">Nenhuma camada visível.</p>
          ) : (
            <ul className="max-h-36 space-y-0.5 overflow-y-auto">
              {includedLayers.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-base-content/[0.04]">
                  <span className="flex min-w-0 items-center gap-1.5 font-medium">
                    <CheckCircle2 size={14} className="shrink-0 text-success" />
                    <span className="truncate">{l.name}</span>
                  </span>
                  <span className="ml-2 shrink-0 text-[11px] text-base-content/55">{elementLabel(l.counts)}</span>
                </li>
              ))}
            </ul>
          )}
        </ListGroup>

        {excludedLayers.length > 0 && (
          <ListGroup label="Fora da exportação">
            <ul className="max-h-24 space-y-0.5 overflow-y-auto">
              {excludedLayers.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] text-base-content/55">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <XCircle size={14} className="shrink-0 text-error" />
                    <span className="truncate">{l.name}</span>
                  </span>
                  <span className="ml-2 shrink-0 text-[11px] italic">{l.reason}</span>
                </li>
              ))}
            </ul>
          </ListGroup>
        )}
      </div>
    </ToolDialog>
  );
};
