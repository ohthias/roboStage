import React, { useState } from 'react';
import {
  X,
  FileText,
  Image as ImageIcon,
  FileCode,
  Copy,
  Check,
  Download,
  Layers,
  Printer,
} from 'lucide-react';
import { exportToPdf, exportToPng, exportToSvg, copyImageToClipboard, downloadMarkdownFile } from '@/utils/thinklab/export';
import { IshikawaData, DiagramSettings } from '@/app/(public)/[competicao]/thinklab/ishikawa/ishikawa.types';
import { THEMES } from '@/utils/thinklab/themes';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  data: IshikawaData;
  settings: DiagramSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  svgRef,
  data,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'png' | 'svg' | 'markdown'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [pngScale, setPngScale] = useState<number>(3);
  const [includeBackground, setIncludeBackground] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentTheme = THEMES[settings.theme] || THEMES['classic-blue'];
  const sanitizedFilename = (data.title || 'diagrama-ishikawa')
    .toLowerCase()
    .replace(/[^a-z0-9à-ú]+/g, '-')
    .replace(/^-|-$/g, '') || 'diagrama-ishikawa';

  const handleExportPdf = async () => {
    if (!svgRef.current) return;
    setIsExporting(true);
    try {
      await exportToPdf(
        svgRef.current,
        data.title,
        `${sanitizedFilename}.pdf`,
        includeBackground ? currentTheme.paperBg : '#ffffff'
      );
      onClose();
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      alert('Ocorreu um erro ao exportar o PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    if (!svgRef.current) return;
    setIsExporting(true);
    try {
      await exportToPng(
        svgRef.current,
        `${sanitizedFilename}.png`,
        pngScale,
        includeBackground ? currentTheme.paperBg : 'transparent'
      );
      onClose();
    } catch (err) {
      console.error('Erro ao exportar PNG:', err);
      alert('Ocorreu um erro ao gerar a imagem PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    setIsExporting(true);
    try {
      exportToSvg(
        svgRef.current,
        `${sanitizedFilename}.svg`,
        includeBackground ? currentTheme.paperBg : 'transparent'
      );
      onClose();
    } catch (err) {
      console.error('Erro ao exportar SVG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!svgRef.current) return;
    const success = await copyImageToClipboard(
      svgRef.current,
      includeBackground ? currentTheme.paperBg : '#ffffff'
    );
    if (success) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } else {
      alert('Não foi possível copiar para a área de transferência neste navegador.');
    }
  };

  const handleDownloadMd = () => {
    downloadMarkdownFile(data.rawMarkdown, `${sanitizedFilename}.md`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-base-100 rounded-3xl shadow-2xl border-2 border-base-content/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-base-content/10 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content border-2 border-base-content/20 flex items-center justify-center shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-base-content">
                Exportar Diagrama
              </h2>
              <p className="text-xs font-medium opacity-60">
                Selecione o formato desejado em alta resolução
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-square border border-base-content/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection daisyUI */}
        <div className="flex flex-wrap border-b border-base-content/10 bg-base-200/40 p-2.5 gap-2">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`btn btn-xs sm:btn-sm gap-1.5 font-bold ${
              activeTab === 'pdf' ? 'btn-error shadow-sm' : 'btn-ghost'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF (A4)</span>
          </button>

          <button
            onClick={() => setActiveTab('png')}
            className={`btn btn-xs sm:btn-sm gap-1.5 font-bold ${
              activeTab === 'png' ? 'btn-success shadow-sm' : 'btn-ghost'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>PNG HD</span>
          </button>

          <button
            onClick={() => setActiveTab('svg')}
            className={`btn btn-xs sm:btn-sm gap-1.5 font-bold ${
              activeTab === 'svg' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>SVG Vetorial</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`btn btn-xs sm:btn-sm gap-1.5 font-bold ${
              activeTab === 'markdown' ? 'btn-warning shadow-sm' : 'btn-ghost'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Markdown</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* PDF Options */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-error/10 border border-error/30 flex items-start gap-3">
                <Printer className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <div className="text-base-content space-y-1">
                  <div className="font-extrabold text-error">
                    PDF em Formato A4 Paisagem (Landscape)
                  </div>
                  <p className="opacity-80 font-medium">
                    Gera um documento de alta qualidade com layout profissional, cabeçalho executivo,
                    título do efeito principal e data.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/60 border border-base-content/10">
                <div>
                  <div className="font-bold text-base-content">Fundo do Tema</div>
                  <div className="opacity-60 text-[11px]">Incluir cor de fundo do tema selecionado</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                  className="toggle toggle-primary toggle-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => window.print(), 100);
                  }}
                  className="btn btn-outline btn-error font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir (Ctrl+P)</span>
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="btn btn-error font-bold shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Gerando PDF...' : 'Baixar Arquivo PDF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* PNG Options */}
          {activeTab === 'png' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-base-content">Resolução da Imagem:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { scale: 2, label: '2x (Padrão)' },
                    { scale: 3, label: '3x (Alta HD)' },
                    { scale: 4, label: '4x (Ultra 4K)' },
                  ].map((opt) => (
                    <button
                      key={opt.scale}
                      onClick={() => setPngScale(opt.scale)}
                      className={`btn btn-xs sm:btn-sm font-bold ${
                        pngScale === opt.scale ? 'btn-success' : 'btn-outline'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/60 border border-base-content/10">
                <div>
                  <div className="font-bold text-base-content">Fundo Sólido</div>
                  <div className="opacity-60 text-[11px]">Desative para obter PNG com fundo transparente</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                  className="toggle toggle-success toggle-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCopyImage}
                  className="btn btn-outline btn-success font-bold"
                >
                  {copiedImage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedImage ? 'Copiado!' : 'Copiar Imagem'}</span>
                </button>

                <button
                  onClick={handleExportPng}
                  disabled={isExporting}
                  className="btn btn-success font-bold shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Processando...' : 'Baixar PNG'}</span>
                </button>
              </div>
            </div>
          )}

          {/* SVG Options */}
          {activeTab === 'svg' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-1">
                <div className="font-extrabold text-primary">Vetor SVG Escalável</div>
                <p className="opacity-80 font-medium">
                  Arquivo vetorial puro com nós editáveis, perfeito para Figma, Illustrator, Inkscape ou slides interativos.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/60 border border-base-content/10">
                <div>
                  <div className="font-bold text-base-content">Incluir Fundo</div>
                  <div className="opacity-60 text-[11px]">Manter o retângulo de papel de fundo</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                  className="toggle toggle-primary toggle-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportSvg}
                  disabled={isExporting}
                  className="btn btn-primary w-full font-bold shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo SVG</span>
                </button>
              </div>
            </div>
          )}

          {/* Markdown Options */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-base-content">Código Markdown da Análise:</label>
                <pre className="p-3.5 rounded-2xl bg-base-300 font-mono text-[11px] max-h-44 overflow-y-auto border border-base-content/10">
                  {data.rawMarkdown}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(data.rawMarkdown);
                    setCopiedMd(true);
                    setTimeout(() => setCopiedMd(false), 2000);
                  }}
                  className="btn btn-outline btn-warning font-bold"
                >
                  {copiedMd ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedMd ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  onClick={handleDownloadMd}
                  className="btn btn-warning font-bold shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar .md</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t-2 border-base-content/10 bg-base-200/50 flex justify-end">
          <button onClick={onClose} className="btn btn-sm btn-ghost font-bold">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
