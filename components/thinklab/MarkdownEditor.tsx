import React, { useRef } from 'react';
import {
  Copy,
  Check,
  Upload,
  Trash2,
  HelpCircle,
  Hash,
  ListPlus,
  Star,
} from 'lucide-react';
import { IshikawaData } from '@/app/(public)/[competicao]/thinklab/ishikawa/ishikawa.types';

interface MarkdownEditorProps {
  markdown: string;
  onChange: (value: string) => void;
  parsedData: IshikawaData;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  markdown,
  onChange,
  parsedData,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [showSyntaxHelp, setShowSyntaxHelp] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate statistics
  const categoryCount = parsedData.categories.length;
  const totalCauses = parsedData.categories.reduce((acc, cat) => acc + cat.causes.length, 0);
  const totalSubCauses = parsedData.categories.reduce(
    (acc, cat) => acc + cat.causes.reduce((sAcc, c) => sAcc + c.subCauses.length, 0),
    0
  );
  const rootCausesCount = parsedData.categories.reduce(
    (acc, cat) =>
      acc +
      cat.causes.filter((c) => c.isRootCause).length +
      cat.causes.reduce((sAcc, c) => sAcc + c.subCauses.filter((s) => s.isRootCause).length, 0),
    0
  );

  const insertTextAtCursor = (prefix: string, defaultText: string = '', suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;
    const insertion = `${prefix}${selectedText}${suffix}`;

    const newMarkdown =
      textarea.value.substring(0, start) + insertion + textarea.value.substring(end);

    onChange(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInsert6M = () => {
    const default6M = `# Problema: Seu Efeito Indesejado Aqui

## Método
- Processo de trabalho não padronizado
  - Falta de manual operacional
- Tempo de ciclo acima do esperado

## Máquina
- Equipamento sem manutenção preventiva [alta]
  - Falta de peças de reposição [CR]
- Calibração incorreta dos sensores

## Mão de Obra
- Falta de capacitação técnica da equipe
  - Alto turnover no setor
- Sobrecarga de tarefas

## Material
- Matéria-prima fora da especificação [CR]
  - Troca de fornecedor
- Armazenamento em local úmido

## Medição
- Instrumentos de medição descalibrados
- Amostragem insuficiente

## Meio Ambiente
- Ruído e temperatura elevada no local
- Iluminação deficiente na área de inspeção`;
    onChange(default6M);
  };

  const lines = markdown.split('\n');

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-2 border-black rounded-2xl p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden text-zinc-100 select-none">
      {/* Editor Header Bar Bento Block */}
      <div className="pb-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            id="btn-copy-markdown"
            onClick={handleCopyMarkdown}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
            title="Copiar texto Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            id="btn-upload-file"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
            title="Importar arquivo .md do computador"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-toggle-syntax-help"
            onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showSyntaxHelp
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
            }`}
            title="Guia de Sintaxe"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Syntax Quick Actions Toolbar */}
      <div className="py-2.5 border-b border-zinc-800/80 flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => insertTextAtCursor('\n# Problema: ', 'Novo Efeito Indesejado')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-indigo-300 rounded-lg font-mono font-medium transition-colors"
          title="Adicionar Cabeçalho do Problema / Efeito Principal"
        >
          <Hash className="w-3 h-3 text-indigo-400" />
          # Problema
        </button>

        <button
          onClick={() => insertTextAtCursor('\n\n## ', 'Nova Categoria', '\n- Causa inicial')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-300 rounded-lg font-mono font-medium transition-colors"
          title="Adicionar Categoria Principal (Ex: Método, Máquina)"
        >
          <Hash className="w-3 h-3 text-emerald-400" />
          ## Categoria
        </button>

        <button
          onClick={() => insertTextAtCursor('\n- ', 'Nova Causa')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg font-mono font-medium transition-colors"
          title="Adicionar Causa Secundária"
        >
          <ListPlus className="w-3 h-3 text-zinc-400" />
          - Causa
        </button>

        <button
          onClick={() => insertTextAtCursor('\n  - ', 'Subcausa (Por quê?)')}
          className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg font-mono font-medium transition-colors"
          title="Adicionar Sub-causa (5 Porquês)"
        >
          <span className="font-mono text-zinc-400">↳</span>
          - Sub-causa
        </button>

        <button
          onClick={() => insertTextAtCursor('', '', ' [CR]')}
          className="flex items-center gap-1 px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg font-medium transition-colors"
          title="Marcar item como Causa Raiz"
        >
          <Star className="w-3 h-3 fill-red-400 text-red-400" />
          [CR] Raiz
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleInsert6M}
            className="px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800 rounded-lg font-bold transition-colors"
            title="Preencher com estrutura padrão dos 6M"
          >
            6M
          </button>
          <button
            onClick={() => onChange('')}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
            title="Limpar editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Syntax Guide Popup Card */}
      {showSyntaxHelp && (
        <div className="my-2 p-3 bg-zinc-800/95 border border-zinc-700 rounded-xl text-xs text-zinc-300 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="font-bold text-indigo-300 flex items-center justify-between">
            <span>📖 Sintaxe Markdown para Espinha de Peixe</span>
            <button
              onClick={() => setShowSyntaxHelp(false)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700/80">
              <span className="text-indigo-400 font-bold"># Problema: [Nome]</span> → Cabeça do peixe
            </div>
            <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700/80">
              <span className="text-emerald-400 font-bold">## [Categoria]</span> → Espinhas principais (6M)
            </div>
            <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700/80">
              <span className="text-indigo-300 font-bold">- [Causa]</span> → Causas secundárias
            </div>
            <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700/80">
              <span className="text-zinc-400 font-bold">{'  '}- [Subcausa]</span> → 5 Porquês (indentado)
            </div>
            <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700/80">
              <span className="text-red-400 font-bold">[CR]</span> ou <span className="text-red-400 font-bold">⭐</span> → Causa Raiz
            </div>
            <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700/80">
              <span className="text-amber-400 font-bold">[alta]</span> / <span className="text-emerald-400 font-bold">[baixa]</span> → Severidade
            </div>
          </div>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="relative flex-1 flex overflow-hidden my-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
        {/* Line numbers column */}
        <div className="w-10 py-3 bg-zinc-950 border-r border-zinc-800/80 text-right pr-2 select-none font-mono text-xs text-zinc-600 space-y-[4px]">
          {lines.map((_, idx) => (
            <div key={`line-${idx + 1}`}>{idx + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="markdown-input-area"
          value={markdown}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`# Problema: Atraso nas Entregas\n\n## Método\n- Rota mal planejada\n  - Falta de GPS atualizado\n\n## Mão de Obra\n- Falta de motoristas [CR]`}
          className="flex-1 p-3 font-mono text-sm leading-relaxed text-indigo-200 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 overflow-y-auto whitespace-pre selection:bg-indigo-900 selection:text-white placeholder:text-zinc-600 select-text"
          spellCheck={false}
        />
      </div>

      {/* Editor Footer / Statistics Bar Bento Block */}
      <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 font-bold text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            {categoryCount} Cat
          </span>
          <span className="flex items-center gap-1.5 font-bold text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {totalCauses} Causas
          </span>
          {totalSubCauses > 0 && (
            <span className="flex items-center gap-1.5 font-bold text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              {totalSubCauses} Subcausas
            </span>
          )}
          {rootCausesCount > 0 && (
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <Star className="w-3 h-3 fill-red-400" />
              {rootCausesCount} Raiz
            </span>
          )}
        </div>

        <div className="text-[11px] text-zinc-500 font-mono">
          {lines.length} linhas • {markdown.length} chars
        </div>
      </div>
    </div>
  );
};
