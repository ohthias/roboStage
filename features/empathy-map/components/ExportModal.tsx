import React, { useState } from 'react';
import { Image, FileText, Table, Download, Upload } from 'lucide-react';
import { InlineAlert, ToolButton, ToolDialog, cn } from '@/components/stage';
import html2canvas from 'html2canvas-pro';
import { EmpathyMap } from '@/features/empathy-map/types';
import { exportMapToCSV, exportMapToMarkdown, downloadFile } from '@/features/empathy-map/lib/exportHelpers';

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

  const options = [
    { icon: Image, title: 'Imagem PNG', text: 'Captura do quadro', onClick: handleExportPNG, cls: 'bg-primary/10 text-primary', disabled: isExportingImage },
    { icon: FileText, title: 'Relatório .md', text: 'Para Notion e Docs', onClick: handleExportMarkdown, cls: 'bg-info/10 text-info' },
    { icon: Table, title: 'Planilha .csv', text: 'Tabela com notas', onClick: handleExportCSV, cls: 'bg-success/10 text-success' },
    { icon: Download, title: 'Backup .json', text: 'Arquivo completo', onClick: handleExportJSON, cls: 'bg-secondary/10 text-secondary' },
  ];
  const isError = statusMessage?.startsWith('Erro') || statusMessage?.includes('inválido');

  return (
    <ToolDialog
      open={isOpen}
      onClose={onClose}
      title="Exportar mapa de empatia"
      description="Escolha o formato para compartilhar."
      size="md"
      footer={
        <div className="flex w-full items-center justify-between">
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold transition-colors hover:bg-base-content/[0.06] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-primary">
            <Upload className="size-4" />
            Restaurar .json
            <input type="file" accept=".json" onChange={handleFileUpload} className="sr-only" />
          </label>
          <ToolButton onClick={onClose}>Fechar</ToolButton>
        </div>
      }
    >
      {statusMessage && (
        <InlineAlert type={isError ? 'error' : statusMessage.startsWith('Gerando') ? 'info' : 'success'} className="mb-3">
          {statusMessage}
        </InlineAlert>
      )}
      <div className="grid grid-cols-2 gap-2 pb-2">
        {options.map(({ icon: Icon, title, text, onClick, cls, disabled }) => (
          <button
            key={title}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex flex-col items-start gap-2 rounded-lg border border-base-300 bg-base-100 p-3 text-left transition-colors hover:border-base-content/30 hover:bg-base-200/50 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
          >
            <span className={cn('grid size-8 place-items-center rounded-tl-md rounded-br-md', cls)}>
              <Icon className="size-4" />
            </span>
            <span>
              <span className="block text-[13px] font-bold">{title}</span>
              <span className="block text-[11px] text-base-content/55">{text}</span>
            </span>
          </button>
        ))}
      </div>
    </ToolDialog>
  );
};
