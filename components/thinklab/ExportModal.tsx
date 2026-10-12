'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Image as ImageIcon,
  FileText,
  FileJson,
  X,
  Eye,
  Loader2,
  ExternalLink,
  Layers,
  Printer,
  Sparkles,
  Database,
} from 'lucide-react';
import { CanvasElement } from '@/types/thinklab.types';
import {
  exportToSvgString,
  downloadSvg,
  downloadPng,
  copyPngToClipboard,
  downloadPdf,
  openPdfPreview,
  getElementsBoundingBox,
} from '@/utils/thinklab/svg-exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  onNotify: (msg: string) => void;
  onOpenDatabaseJsonb?: () => void;
}

export function ExportModal({
  isOpen,
  onClose,
  elements,
  onNotify,
  onOpenDatabaseJsonb,
}: ExportModalProps) {
  // General options
  const [padding, setPadding] = useState<number>(40);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  // PNG options
  const [pngScale, setPngScale] = useState<number>(2);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);

  // PDF options
  const [pdfFormat, setPdfFormat] = useState<'a4' | 'a3' | 'letter'>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [pdfMargin, setPdfMargin] = useState<number>(36);
  const [pdfIncludeHeader, setPdfIncludeHeader] = useState<boolean>(true);
  const [pdfTitle, setPdfTitle] = useState<string>('Fluxograma ExcaliFlow');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isPreviewingPdf, setIsPreviewingPdf] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [exportSection, setExportSection] = useState<'all' | 'png' | 'pdf' | 'svg' | 'json'>('all');

  const svgCode = useMemo(() => {
    if (!isOpen) return '';
    return exportToSvgString(elements, {
      padding,
      transparentBackground: transparentBg,
      backgroundColor: bgColor,
    });
  }, [isOpen, elements, padding, transparentBg, bgColor]);

  if (!isOpen) return null;

  const bounds = getElementsBoundingBox(elements, padding);
  const roundedWidth = Math.ceil(bounds.width);
  const roundedHeight = Math.ceil(bounds.height);

  // Copy SVG to clipboard
  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopied(true);
      onNotify('Código SVG copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onNotify('Não foi possível copiar automaticamente.');
    }
  };

  // Download SVG
  const handleDownloadSvg = () => {
    downloadSvg(svgCode, `diagrama-excaliflow-${Date.now()}.svg`);
    onNotify('Download do arquivo SVG iniciado!');
  };

  // Download PNG image
  const handleDownloadPng = async () => {
    try {
      setIsGeneratingPng(true);
      await downloadPng(
        svgCode,
        roundedWidth,
        roundedHeight,
        `diagrama-excaliflow-${Date.now()}.png`,
        pngScale
      );
      onNotify(`Download do arquivo PNG (${pngScale}x) concluído com sucesso!`);
    } catch {
      onNotify('Erro ao gerar imagem PNG no cliente.');
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Copy PNG image directly to clipboard
  const handleCopyPng = async () => {
    try {
      setCopiedImage(true);
      await copyPngToClipboard(
        svgCode,
        roundedWidth,
        roundedHeight,
        pngScale
      );
      onNotify('Imagem PNG copiada! Cole com Ctrl+V em chats ou editores.');
      setTimeout(() => setCopiedImage(false), 2500);
    } catch {
      onNotify('Área de transferência de imagem não suportada neste navegador.');
      setCopiedImage(false);
    }
  };

  // Download PDF Document
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadPdf(
        svgCode,
        roundedWidth,
        roundedHeight,
        `diagrama-excaliflow-${Date.now()}.pdf`,
        {
          format: pdfFormat,
          orientation: pdfOrientation,
          margin: pdfMargin,
          title: pdfTitle.trim() || 'Diagrama ExcaliFlow',
          includeHeader: pdfIncludeHeader,
        }
      );
      onNotify('Documento PDF gerado e baixado com sucesso!');
    } catch {
      onNotify('Erro ao gerar documento PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Preview PDF Document in new browser tab
  const handlePreviewPdf = async () => {
    try {
      setIsPreviewingPdf(true);
      await openPdfPreview(
        svgCode,
        roundedWidth,
        roundedHeight,
        {
          format: pdfFormat,
          orientation: pdfOrientation,
          margin: pdfMargin,
          title: pdfTitle.trim() || 'Diagrama ExcaliFlow',
          includeHeader: pdfIncludeHeader,
        }
      );
      onNotify('Pré-visualização do PDF aberta em nova aba.');
    } catch {
      onNotify('Não foi possível abrir o leitor de PDF do navegador.');
    } finally {
      setIsPreviewingPdf(false);
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(elements, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `diagrama-excaliflow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotify('Diagrama exportado como arquivo JSON!');
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-5xl bg-base-100 border border-base-300 shadow-2xl p-6 rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200 shrink-0">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2 text-base-content">
              <Download className="w-5 h-5 text-primary" />
              Central de Exportação de Diagramas
            </h3>
            <p className="text-xs text-base-content/70 mt-0.5">
              Converta seu desenho em imagem PNG em alta resolução, documento PDF pronto para impressão ou vetor puro SVG.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Navigation Pills */}
        <div className="flex items-center gap-1.5 py-3 border-b border-base-200/60 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setExportSection('all')}
            className={`btn btn-xs rounded-lg text-xs gap-1.5 ${
              exportSection === 'all' ? 'btn-primary' : 'btn-ghost border border-base-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Todos os Formatos
          </button>
          <button
            onClick={() => setExportSection('png')}
            className={`btn btn-xs rounded-lg text-xs gap-1.5 ${
              exportSection === 'png' ? 'btn-primary' : 'btn-ghost border border-base-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-info" />
            Imagem PNG
          </button>
          <button
            onClick={() => setExportSection('pdf')}
            className={`btn btn-xs rounded-lg text-xs gap-1.5 ${
              exportSection === 'pdf' ? 'btn-primary' : 'btn-ghost border border-base-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-error" />
            Documento PDF
          </button>
          <button
            onClick={() => setExportSection('svg')}
            className={`btn btn-xs rounded-lg text-xs gap-1.5 ${
              exportSection === 'svg' ? 'btn-primary' : 'btn-ghost border border-base-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-warning" />
            Vetor SVG
          </button>
          <button
            onClick={() => setExportSection('json')}
            className={`btn btn-xs rounded-lg text-xs gap-1.5 ${
              exportSection === 'json' ? 'btn-primary' : 'btn-ghost border border-base-300'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-success" />
            Projeto JSON
          </button>
        </div>

        {/* Body Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-3 flex-1 overflow-y-auto pr-1">
          {/* Options Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* General Canvas Options */}
            <div className="p-3 bg-base-200/50 rounded-xl border border-base-300 space-y-3">
              <div className="font-semibold text-xs text-base-content/90 flex items-center justify-between">
                <span>Configurações do Canvas</span>
                <span className="font-mono text-[10px] text-base-content/50">
                  {elements.length} {elements.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {/* Background Color & Transparency */}
              <div>
                <label className="text-[11px] font-medium text-base-content/70 block mb-1">
                  Cor de Fundo
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs rounded"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                    />
                    <span className="text-xs">Transparente</span>
                  </label>

                  {!transparentBg && (
                    <div className="flex items-center gap-1.5">
                      {['#ffffff', '#f8fafc', '#fefce8', '#f1f5f9', '#0f172a'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setBgColor(c)}
                          className={`w-5 h-5 rounded-md border ${
                            bgColor === c ? 'ring-2 ring-primary ring-offset-1' : 'border-base-300'
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                          aria-label={`Cor de fundo ${c}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Margin / Padding */}
              <div>
                <label className="text-[11px] font-medium text-base-content/70 block mb-1">
                  Margem Externa (Padding)
                </label>
                <div className="join w-full">
                  {[20, 40, 80].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPadding(p)}
                      className={`btn btn-xs join-item flex-1 ${
                        padding === p ? 'btn-primary' : 'btn-ghost border border-base-300'
                      }`}
                    >
                      {p}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION: PNG IMAGE EXPORT */}
            {(exportSection === 'all' || exportSection === 'png') && (
              <div className="p-3 bg-base-200/50 rounded-xl border border-info/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs flex items-center gap-1.5 text-info">
                    <ImageIcon className="w-4 h-4" />
                    <span>Exportar Imagem PNG</span>
                  </div>
                  <span className="text-[10px] bg-info/10 text-info font-mono px-1.5 py-0.5 rounded">
                    {Math.round(roundedWidth * pngScale)} × {Math.round(roundedHeight * pngScale)} px
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-base-content/70 block mb-1">
                    Escala de Resolução
                  </label>
                  <div className="join w-full">
                    {[
                      { scale: 1, label: '1x (Web)' },
                      { scale: 2, label: '2x (Retina HD)' },
                      { scale: 3, label: '3x (4K Ultra)' },
                    ].map((item) => (
                      <button
                        key={item.scale}
                        onClick={() => setPngScale(item.scale)}
                        className={`btn btn-xs join-item flex-1 ${
                          pngScale === item.scale ? 'btn-primary' : 'btn-ghost border border-base-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={handleDownloadPng}
                    disabled={isGeneratingPng}
                    className="btn btn-sm btn-info text-info-content gap-1.5 text-xs shadow-xs"
                  >
                    {isGeneratingPng ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Baixar PNG</span>
                  </button>

                  <button
                    onClick={handleCopyPng}
                    disabled={isGeneratingPng}
                    className="btn btn-sm btn-outline gap-1.5 text-xs"
                    title="Copiar imagem PNG para colar direto no chat ou documento"
                  >
                    {copiedImage ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedImage ? 'Copiado!' : 'Copiar Imagem'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION: PDF DOCUMENT EXPORT */}
            {(exportSection === 'all' || exportSection === 'pdf') && (
              <div className="p-3 bg-base-200/50 rounded-xl border border-error/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs flex items-center gap-1.5 text-error">
                    <FileText className="w-4 h-4" />
                    <span>Exportar Documento PDF</span>
                  </div>
                  <span className="text-[10px] bg-error/10 text-error font-mono px-1.5 py-0.5 rounded">
                    jsPDF Vector
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-base-content/70 block mb-1">
                      Papel
                    </label>
                    <select
                      value={pdfFormat}
                      onChange={(e) => setPdfFormat(e.target.value as 'a4' | 'a3' | 'letter')}
                      className="select select-bordered select-xs w-full rounded-lg"
                    >
                      <option value="a4">A4 (Padrão)</option>
                      <option value="a3">A3 (Grande)</option>
                      <option value="letter">Carta (Letter)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-base-content/70 block mb-1">
                      Orientação
                    </label>
                    <select
                      value={pdfOrientation}
                      onChange={(e) => setPdfOrientation(e.target.value as 'auto' | 'portrait' | 'landscape')}
                      className="select select-bordered select-xs w-full rounded-lg"
                    >
                      <option value="auto">Automática ({roundedWidth >= roundedHeight ? 'Paisagem' : 'Retrato'})</option>
                      <option value="landscape">Paisagem (Horizontal)</option>
                      <option value="portrait">Retrato (Vertical)</option>
                    </select>
                  </div>
                </div>

                {/* PDF Header Checkbox & Title */}
                <div className="space-y-1.5">
                  <label className="cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-error checkbox-xs rounded"
                      checked={pdfIncludeHeader}
                      onChange={(e) => setPdfIncludeHeader(e.target.checked)}
                    />
                    <span className="text-xs">Incluir Cabeçalho & Data</span>
                  </label>

                  {pdfIncludeHeader && (
                    <input
                      type="text"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      placeholder="Título do Diagrama no PDF"
                      className="input input-xs input-bordered w-full rounded-lg text-xs"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf || isPreviewingPdf}
                    className="btn btn-sm btn-error text-error-content gap-1.5 text-xs shadow-xs"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Baixar PDF</span>
                  </button>

                  <button
                    onClick={handlePreviewPdf}
                    disabled={isGeneratingPdf || isPreviewingPdf}
                    className="btn btn-sm btn-outline gap-1.5 text-xs"
                    title="Abrir o PDF em uma nova aba do navegador para visualização ou impressão direta"
                  >
                    {isPreviewingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5" />
                    )}
                    <span>Ver no Navegador</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION: SVG VETORIAL */}
            {(exportSection === 'all' || exportSection === 'svg') && (
              <div className="p-3 bg-base-200/50 rounded-xl border border-warning/30 space-y-2">
                <div className="font-semibold text-xs flex items-center gap-1.5 text-warning">
                  <FileCode className="w-4 h-4" />
                  <span>Vetor Puro SVG</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleDownloadSvg}
                    className="btn btn-sm btn-warning text-warning-content gap-1.5 text-xs shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar SVG</span>
                  </button>

                  <button
                    onClick={handleCopySvg}
                    className="btn btn-sm btn-outline gap-1.5 text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar SVG'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION: JSON BACKUP */}
            {(exportSection === 'all' || exportSection === 'json') && (
              <div className="p-3 bg-base-200/50 rounded-xl border border-success/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-success flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Backup do Projeto</span>
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    Arquivo JSON com todos os nós e dados
                  </div>
                </div>
                <button
                  onClick={handleExportJson}
                  className="btn btn-xs btn-outline btn-success gap-1 text-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Salvar JSON</span>
                </button>
              </div>
            )}

            {/* SECTION: JSONB DATABASE INTEGRATION */}
            {onOpenDatabaseJsonb && (
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Integração Banco de Dados (JSONB)</span>
                  </div>
                  <div className="text-[10px] text-base-content/60">
                    Gere scripts DDL, INSERT e estrutura JSONB
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenDatabaseJsonb();
                  }}
                  className="btn btn-xs btn-primary gap-1 text-xs shadow-2xs"
                >
                  <Database className="w-3 h-3" />
                  <span>Abrir JSONB</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview & Code Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-[460px]">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-base-200 pb-2 mb-3 shrink-0">
              <div className="join">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`btn btn-xs join-item ${
                    activeTab === 'preview' ? 'btn-neutral' : 'btn-ghost'
                  }`}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Visualização em Tempo Real
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`btn btn-xs join-item ${
                    activeTab === 'code' ? 'btn-neutral' : 'btn-ghost'
                  }`}
                >
                  <FileCode className="w-3 h-3 mr-1" />
                  Código SVG
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-base-content/60 font-mono">
                <span>{roundedWidth} × {roundedHeight} px</span>
              </div>
            </div>

            {/* Preview Box */}
            {activeTab === 'preview' ? (
              <div
                className={`flex-1 rounded-2xl border border-base-300 p-4 flex items-center justify-center overflow-auto shadow-inner ${
                  transparentBg
                    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]'
                    : ''
                }`}
                style={{
                  backgroundColor: transparentBg ? undefined : bgColor,
                }}
              >
                {elements.length === 0 ? (
                  <div className="text-center text-base-content/50 text-xs">
                    Nenhum elemento no canvas para pré-visualizar.
                  </div>
                ) : (
                  <div
                    className="max-w-full max-h-full flex items-center justify-center scale-95 transition-transform"
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 rounded-2xl bg-neutral text-neutral-content p-4 font-mono text-[11px] overflow-auto shadow-inner">
                <pre className="whitespace-pre-wrap select-all">{svgCode}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal actions footer */}
        <div className="modal-action mt-2 pt-2 border-t border-base-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-base-content/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Exportações processadas 100% no cliente sem envio de dados a servidores externos.</span>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Concluir / Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
