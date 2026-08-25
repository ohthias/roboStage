import React from "react";
import {
  FileImage,
  FolderArchive,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ExportElementCounts, ExportSummary } from "@/types/CanvasType";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card bg-base-300 shadow-xl w-full max-w-md animate-fade-in-up">
        <div className="card-body p-5">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold flex items-center gap-2 text-primary">
              {isGeneral ? <FileImage size={20} /> : <FolderArchive size={20} />}
              {isGeneral ? "Exportar imagem geral" : "Exportar camadas separadas"}
            </h3>
            <button
              onClick={onCancel}
              className="btn btn-xs btn-circle btn-ghost"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs opacity-70 mb-3">
            Arquivo: <span className="font-mono">{summary.fileName}</span>
          </p>

          {/* Toggles ativos no momento da exportação */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span
              className={`badge badge-sm ${
                summary.showZones ? "badge-primary" : "badge-ghost opacity-50"
              }`}
            >
              Zonas {summary.showZones ? "incluídas" : "ocultas"}
            </span>
            <span
              className={`badge badge-sm ${
                summary.showLabels ? "badge-primary" : "badge-ghost opacity-50"
              }`}
            >
              Medidas {summary.showLabels ? "incluídas" : "ocultas"}
            </span>
          </div>

          {summary.isEmpty && (
            <div className="alert alert-warning py-2 px-3 mb-3 text-xs">
              <AlertTriangle size={16} />
              <span>
                Nenhum elemento será incluído nesta exportação — apenas o
                fundo da mesa.
              </span>
            </div>
          )}

          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-50 mb-1">
              {isGeneral
                ? "Camadas que serão exportadas"
                : "Camadas incluídas no ZIP"}
            </p>
            {includedLayers.length === 0 ? (
              <p className="text-xs opacity-50 italic">
                Nenhuma camada será incluída.
              </p>
            ) : (
              <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {includedLayers.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between text-xs bg-base-100 rounded-lg px-2 py-1"
                  >
                    <span className="flex items-center gap-1 font-medium truncate">
                      <CheckCircle2 size={13} className="text-success shrink-0" />
                      {l.name}
                    </span>
                    <span className="opacity-60 shrink-0 ml-2">
                      {elementLabel(l.counts)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {excludedLayers.length > 0 && (
            <div className="mb-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-50 mb-1">
                Camadas não incluídas
              </p>
              <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {excludedLayers.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between text-xs bg-base-100/50 rounded-lg px-2 py-1 opacity-60"
                  >
                    <span className="flex items-center gap-1 truncate">
                      <XCircle size={13} className="text-error shrink-0" />
                      {l.name}
                    </span>
                    <span className="shrink-0 ml-2 italic">{l.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-3">
            <button className="btn btn-ghost btn-sm flex-1" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={onConfirm}
              disabled={includedLayers.length === 0}
            >
              Confirmar exportação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};