'use client';

import React, { useState, useMemo } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  Upload,
  Code2,
  FileJson,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { CanvasElement, ViewportState } from '@/types/thinklab.types';
import {
  createDiagramJsonbPayload,
  validateDiagramJsonb,
  generateSqlSnippets,
  DiagramJsonbPayload,
} from '@/utils/thinklab/jsonb-exporter';

interface DatabaseJsonbModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  viewport: ViewportState;
  gridType: 'dots' | 'lines' | 'none';
  onLoadElements: (elements: CanvasElement[], title?: string) => void;
  onNotify: (msg: string) => void;
}

export function DatabaseJsonbModal({
  isOpen,
  onClose,
  elements,
  viewport,
  gridType,
  onLoadElements,
  onNotify,
}: DatabaseJsonbModalProps) {
  const [diagramTitle, setDiagramTitle] = useState('Fluxograma do Sistema');
  const [diagramDesc, setDiagramDesc] = useState('Diagrama exportado com estrutura nativa JSONB');
  const [tableName, setTableName] = useState('diagramas');
  const [activeTab, setActiveTab] = useState<'jsonb' | 'sql' | 'import'>('jsonb');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedInsert, setCopiedInsert] = useState(false);

  // Import JSONB state
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Generate real-time JSONB payload
  const jsonbPayload: DiagramJsonbPayload = useMemo(() => {
    return createDiagramJsonbPayload(
      elements,
      viewport,
      gridType,
      diagramTitle,
      diagramDesc
    );
  }, [elements, viewport, gridType, diagramTitle, diagramDesc]);

  const jsonbString = useMemo(() => {
    return JSON.stringify(jsonbPayload, null, 2);
  }, [jsonbPayload]);

  const sqlSnippets = useMemo(() => {
    return generateSqlSnippets(tableName.trim() || 'diagramas');
  }, [tableName]);

  if (!isOpen) return null;

  // Copy JSONB payload
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonbString);
      setCopiedJson(true);
      onNotify('Payload JSONB copiado para a área de transferência!');
      setTimeout(() => setCopiedJson(false), 2500);
    } catch {
      onNotify('Falha ao copiar JSONB.');
    }
  };

  // Download JSONB File
  const handleDownloadJson = () => {
    const blob = new Blob([jsonbString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramTitle.toLowerCase().replace(/\s+/g, '-')}-jsonb.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Download do JSONB gerado com sucesso!');
  };

  // Copy SQL DDL
  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(sqlSnippets.ddl);
      setCopiedSql(true);
      onNotify('Script SQL DDL copiado!');
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      onNotify('Falha ao copiar SQL.');
    }
  };

  // Copy SQL Insert
  const handleCopyInsert = async () => {
    try {
      const fullInsert = `-- Inserção direta com valor JSONB escapado:\nINSERT INTO ${tableName} (title, data)\nVALUES (\n  '${diagramTitle}',\n  '${JSON.stringify(jsonbPayload).replace(/'/g, "''")}'::jsonb\n);`;
      await navigator.clipboard.writeText(fullInsert);
      setCopiedInsert(true);
      onNotify('Comando INSERT com JSONB copiado!');
      setTimeout(() => setCopiedInsert(false), 2500);
    } catch {
      onNotify('Falha ao copiar INSERT SQL.');
    }
  };

  // Import JSONB into canvas
  const handleImportJson = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText.trim());
      const validation = validateDiagramJsonb(parsed);

      if (!validation.valid || !validation.payload) {
        setImportError(validation.error || 'Formato JSONB inválido.');
        return;
      }

      onLoadElements(validation.payload.elements, validation.payload.title);
      onNotify(`Diagrama "${validation.payload.title}" com ${validation.payload.elements.length} elementos carregado!`);
      onClose();
    } catch (err: any) {
      setImportError(`Erro de sintaxe JSON: ${err.message || 'Verifique as aspas e vírgulas.'}`);
    }
  };

  // Handle file drop/upload for JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportJsonText(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-4xl bg-base-100 border border-base-300 shadow-2xl p-6 rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-base-content leading-tight">
                  Integração com Banco de Dados (JSONB)
                </h3>
                <span className="badge badge-primary badge-sm font-mono text-[10px]">
                  PostgreSQL / Supabase / SQL
                </span>
              </div>
              <p className="text-xs text-base-content/70 mt-0.5">
                Exporte, sincronize e armazene toda a estrutura vetorial em colunas nativas do tipo <code>jsonb</code>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center justify-between py-3 border-b border-base-200 shrink-0">
          <div className="join">
            <button
              onClick={() => setActiveTab('jsonb')}
              className={`btn btn-xs sm:btn-sm join-item gap-1.5 ${
                activeTab === 'jsonb' ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Payload JSONB</span>
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`btn btn-xs sm:btn-sm join-item gap-1.5 ${
                activeTab === 'sql' ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Scripts SQL & Índices</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`btn btn-xs sm:btn-sm join-item gap-1.5 ${
                activeTab === 'import' ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar do Banco</span>
            </button>
          </div>

          <div className="text-xs font-mono text-base-content/60 hidden sm:flex items-center gap-2">
            <span>{elements.length} elementos</span>
            <span>·</span>
            <span>~{(new TextEncoder().encode(jsonbString).length / 1024).toFixed(1)} KB</span>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="my-3 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'jsonb' && (
            <div className="space-y-4">
              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-base-200/50 rounded-xl border border-base-300">
                <div>
                  <label className="label py-1 text-[11px] font-semibold text-base-content/80">
                    Título do Diagrama:
                  </label>
                  <input
                    type="text"
                    value={diagramTitle}
                    onChange={(e) => setDiagramTitle(e.target.value)}
                    placeholder="Ex: Arquitetura de Microsserviços"
                    className="input input-bordered input-sm w-full bg-base-100 text-xs"
                  />
                </div>
                <div>
                  <label className="label py-1 text-[11px] font-semibold text-base-content/80">
                    Descrição / Metadados:
                  </label>
                  <input
                    type="text"
                    value={diagramDesc}
                    onChange={(e) => setDiagramDesc(e.target.value)}
                    placeholder="Ex: Versão aprovada para homologação"
                    className="input input-bordered input-sm w-full bg-base-100 text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="btn btn-sm btn-primary gap-1.5 text-xs shadow-xs"
                  >
                    {copiedJson ? <Check className="w-4 h-4 text-primary-content" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedJson ? 'Copiado para Área de Transferência!' : 'Copiar JSONB para Inserir no Banco'}</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="btn btn-sm btn-outline gap-1.5 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar arquivo .json</span>
                  </button>
                </div>

                <div className="text-[11px] text-base-content/60 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>Pronto para <code>INSERT INTO ... (coluna_jsonb)</code></span>
                </div>
              </div>

              {/* Preview Code Box */}
              <div className="relative rounded-2xl bg-neutral text-neutral-content p-4 font-mono text-[11px] overflow-auto max-h-[340px] shadow-inner border border-base-300">
                <pre className="whitespace-pre-wrap select-all leading-relaxed">
                  {jsonbString}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              {/* Config table name */}
              <div className="p-3 bg-base-200/50 rounded-xl border border-base-300 flex items-center gap-3">
                <span className="text-xs font-semibold whitespace-nowrap">Nome da Tabela:</span>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="input input-bordered input-xs w-44 font-mono text-xs"
                  placeholder="diagramas"
                />
                <span className="text-[11px] text-base-content/60">
                  (Personalize o nome da tabela nos scripts gerados abaixo)
                </span>
              </div>

              {/* DDL Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Terminal className="w-4 h-4" />
                    <span>1. Criação da Tabela com Coluna JSONB & Índices GIN</span>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="btn btn-xs btn-outline gap-1"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copiado!' : 'Copiar DDL'}</span>
                  </button>
                </div>
                <div className="rounded-xl bg-neutral text-neutral-content p-3.5 font-mono text-[11px] overflow-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">{sqlSnippets.ddl}</pre>
                </div>
              </div>

              {/* INSERT & QUERY Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
                    <Sparkles className="w-4 h-4" />
                    <span>2. Comando INSERT com o Diagrama Atual</span>
                  </div>
                  <button
                    onClick={handleCopyInsert}
                    className="btn btn-xs btn-outline btn-success gap-1"
                  >
                    {copiedInsert ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedInsert ? 'Copiado!' : 'Copiar INSERT com Dados'}</span>
                  </button>
                </div>
                <div className="rounded-xl bg-neutral text-neutral-content p-3.5 font-mono text-[11px] overflow-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">
{`INSERT INTO ${tableName} (title, data)
VALUES (
  '${diagramTitle}',
  '${JSON.stringify(jsonbPayload).replace(/'/g, "''")}'::jsonb
);`}
                  </pre>
                </div>
              </div>

              {/* Analytics query example */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-info">
                  <Info className="w-4 h-4" />
                  <span>3. Consultas Analíticas Direto no JSONB</span>
                </div>
                <div className="rounded-xl bg-neutral text-neutral-content p-3.5 font-mono text-[11px] overflow-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">{sqlSnippets.query}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-3">
              <div className="p-3 bg-info/10 border border-info/20 rounded-xl text-xs text-info space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Restaurar Diagrama a partir de um registro do Banco de Dados</span>
                </div>
                <p className="text-[11px] opacity-90">
                  Cole abaixo o valor recuperado da coluna <code>jsonb</code> (ou selecione um arquivo JSON exportado) para carregar todos os elementos no canvas.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-base-content/80">
                  Conteúdo JSONB recuperado:
                </label>
                <label className="btn btn-xs btn-outline gap-1 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Carregar arquivo .json</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError(null);
                }}
                placeholder='Cole aqui o JSONB retornado pelo SELECT data FROM diagramas...'
                rows={8}
                className="textarea textarea-bordered w-full font-mono text-xs bg-base-100"
              />

              {importError && (
                <div className="alert alert-error text-xs py-2 px-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleImportJson}
                  disabled={!importJsonText.trim()}
                  className="btn btn-sm btn-primary gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Aplicar e Restaurar no Canvas</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action mt-2 pt-2 border-t border-base-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-base-content/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Formato 100% compatível com PostgreSQL, Supabase, Neon, Prisma e Drizzle ORM.</span>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
