import React, { useState } from 'react';
import { X, Image, FileText, Table, Download, Upload, Check } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { EmpathyMap } from '@/types/EmpathyMap.types';
import { exportMapToCSV, exportMapToMarkdown, downloadFile } from '@/utils/EmpathyMap/exportHelpers';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  map: EmpathyMap;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onImportMap: (importedMap: EmpathyMap) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  map,
  canvasRef,
  onImportMap,
}) => {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const sanitizeName = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    setIsExportingImage(true);
    setStatusMessage('Gerando imagem...');

    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
      });

      const a = document.createElement('a');
      a.download = `mapa-empatia-${sanitizeName(map.persona.name)}.png`;
      a.href = canvas.toDataURL('image/png', 0.95);
      a.click();
      setStatusMessage('Imagem PNG exportada!');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch {
      setStatusMessage('Erro ao gerar imagem.');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportMarkdown = () => {
    const md = exportMapToMarkdown(map);
    downloadFile(md, `mapa-empatia-${sanitizeName(map.persona.name)}.md`, 'text/markdown');
    setStatusMessage('Relatório em Markdown exportado!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleExportCSV = () => {
    const csv = exportMapToCSV(map);
    downloadFile(csv, `notas-empatia-${sanitizeName(map.persona.name)}.csv`, 'text/csv;charset=utf-8;');
    setStatusMessage('Planilha CSV exportada!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(map, null, 2);
    downloadFile(jsonStr, `mapa-empatia-${sanitizeName(map.persona.name)}.json`, 'application/json');
    setStatusMessage('Backup JSON exportado!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.persona && Array.isArray(parsed.notes)) {
          onImportMap(parsed);
          setStatusMessage('Mapa importado com sucesso!');
          setTimeout(() => {
            setStatusMessage(null);
            onClose();
          }, 1500);
        } else {
          setStatusMessage('Formato de arquivo inválido.');
        }
      } catch {
        setStatusMessage('Erro ao ler arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md relative bg-base-100">
        <button
          onClick={onClose}
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/60"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-base text-base-content">
          Exportar Mapa de Empatia
        </h3>
        <p className="text-xs text-base-content/60 mt-1 mb-4">
          Escolha o formato desejado para compartilhamento.
        </p>

        {statusMessage && (
          <div className="alert alert-success py-2 px-3 text-xs mb-3">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={handleExportPNG}
            disabled={isExportingImage}
            type="button"
            className="card bg-base-200/60 hover:bg-base-200 border border-base-300 p-3.5 text-left transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Image className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-bold text-base-content">Imagem PNG</div>
            <p className="text-[10px] text-base-content/60 mt-0.5">Captura do quadro</p>
          </button>

          <button
            onClick={handleExportMarkdown}
            type="button"
            className="card bg-base-200/60 hover:bg-base-200 border border-base-300 p-3.5 text-left transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-info/10 text-info flex items-center justify-center mb-2">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-bold text-base-content">Relatório .md</div>
            <p className="text-[10px] text-base-content/60 mt-0.5">Para Notion e Docs</p>
          </button>

          <button
            onClick={handleExportCSV}
            type="button"
            className="card bg-base-200/60 hover:bg-base-200 border border-base-300 p-3.5 text-left transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center mb-2">
              <Table className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-bold text-base-content">Planilha .csv</div>
            <p className="text-[10px] text-base-content/60 mt-0.5">Tabela com notas</p>
          </button>

          <button
            onClick={handleExportJSON}
            type="button"
            className="card bg-base-200/60 hover:bg-base-200 border border-base-300 p-3.5 text-left transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-2">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-bold text-base-content">Backup .json</div>
            <p className="text-[10px] text-base-content/60 mt-0.5">Arquivo completo</p>
          </button>
        </div>

        <div className="modal-action pt-2 border-t border-base-200 flex items-center justify-between mt-3">
          <label className="btn btn-sm btn-ghost gap-1.5 cursor-pointer text-xs font-normal">
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar .json</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button onClick={onClose} type="button" className="btn btn-sm">
            Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
};
