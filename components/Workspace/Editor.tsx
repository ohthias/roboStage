import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Document, DocumentMap, DocumentVersion } from './types';
import { 
  Sparkles, FileText, ChevronRight, Clock, 
  Undo2, Redo2, Bold, Italic, Code, Smile, 
  Columns2, BookOpen, CheckSquare, List, ListOrdered, 
  SquareCode, Link as LinkIcon, ListTree, X, Maximize2, 
  History, RotateCcw, Bookmark, MoreVertical, Share2, 
  Download, Strikethrough as StrikethroughIcon, 
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  Palette
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface EditorProps {
  document: Document | null;
  allDocuments: DocumentMap;
  onUpdate: (id: string, updates: Partial<Document>) => void;
  onSelect: (id: string) => void;
}

type ViewMode = 'split' | 'editor' | 'preview';

const COMMON_EMOJIS = [
  '🚀', '📄', '📅', '📝', '📂', '💡', '🔥', '✨', '🎯', '🛠️', 
  '📊', '💻', '🎨', '🧠', '🌟', '📌', '🔒', '🔔', '💬', '🌈',
  '🏠', '💼', '🛒', '🍎', '🍕', '🌍', '✈️', '⏰', '🔑', '💎',
  '❤️', '🎉', '✅', '❌', '⚠️', '⭐', '🍀', '🦋', '🌙', '☀️'
];

const COLORS = [
  { name: 'Default', value: 'inherit', class: 'bg-base-content' },
  { name: 'Nexus Blue', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Rose Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Emerald Green', value: '#10b981', class: 'bg-emerald-500' },
  { name: 'Amber Gold', value: '#f59e0b', class: 'bg-amber-500' },
  { name: 'Violet Purple', value: '#8b5cf6', class: 'bg-violet-500' },
  { name: 'Slate Gray', value: '#64748b', class: 'bg-slate-500' },
];

export const Editor: React.FC<EditorProps> = ({ document, allDocuments, onUpdate, onSelect }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [localContent, setLocalContent] = useState('');
  const [activeLine, setActiveLine] = useState(0);
  const [showToC, setShowToC] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [activeFormatting, setActiveFormatting] = useState({
    bold: false,
    italic: false,
    code: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
    color: 'inherit'
  });
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const wordCount = useMemo(() => {
    return localContent.trim().split(/\s+/).filter(Boolean).length;
  }, [localContent]);

  useEffect(() => {
    if (document) {
      setLocalContent(document.content);
      setHistory([document.content]);
      setHistoryIndex(0);
    }
  }, [document?.id]);

  const handleEditorScroll = () => {
    if (viewMode !== 'split' || isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    const editor = editorPaneRef.current;
    const preview = previewPaneRef.current;
    if (editor && preview) {
      const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    }
    setTimeout(() => { isSyncingScroll.current = false; }, 50);
  };

  const handlePreviewScroll = () => {
    if (viewMode !== 'split' || isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    const editor = editorPaneRef.current;
    const preview = previewPaneRef.current;
    if (editor && preview) {
      const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);
    }
    setTimeout(() => { isSyncingScroll.current = false; }, 50);
  };

  const checkFormatting = useCallback(() => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    const isFormatted = (prefix: string, suffix: string) => {
      const outside = value.substring(selectionStart - prefix.length, selectionStart) === prefix &&
                      value.substring(selectionEnd, selectionEnd + suffix.length) === suffix;
      const inside = selectedText.length >= (prefix.length + suffix.length) &&
                     selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
      
      if (prefix === '*' && (outside || inside)) {
          const outsideBold = value.substring(selectionStart - 2, selectionStart) === '**' &&
                             value.substring(selectionEnd, selectionEnd + 2) === '**';
          const insideBold = selectedText.startsWith('**') && selectedText.endsWith('**');
          if (outsideBold || insideBold) return false;
      }
      return outside || inside;
    };

    // Simple color check (looks for surrounding span with style)
    const colorMatch = value.substring(selectionStart - 50, selectionStart).match(/<span style="color:\s*(#[0-9a-fA-F]{6}|inherit)">$/);
    const currentColor = colorMatch ? colorMatch[1] : 'inherit';

    setActiveFormatting({
      bold: isFormatted('**', '**'),
      italic: isFormatted('*', '*'),
      code: isFormatted('`', '`'),
      strikethrough: isFormatted('~~', '~~'),
      subscript: isFormatted('<sub>', '</sub>'),
      superscript: isFormatted('<sup>', '</sup>'),
      color: currentColor
    });
  }, []);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    const value = textareaRef.current.value;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    const isOutside = value.substring(selectionStart - prefix.length, selectionStart) === prefix &&
                      value.substring(selectionEnd, selectionEnd + suffix.length) === suffix;
    
    const isInside = selectedText.length >= (prefix.length + suffix.length) &&
                     selectedText.startsWith(prefix) && selectedText.endsWith(suffix);

    let newContent = '';
    let newStart = selectionStart;
    let newEnd = selectionEnd;

    if (isOutside) {
      newContent = value.substring(0, selectionStart - prefix.length) +
                   selectedText +
                   value.substring(selectionEnd + suffix.length);
      newStart -= prefix.length;
      newEnd -= prefix.length;
    } else if (isInside) {
      newContent = value.substring(0, selectionStart) +
                   selectedText.substring(prefix.length, selectedText.length - suffix.length) +
                   value.substring(selectionEnd);
      newEnd -= (prefix.length + suffix.length);
    } else {
      newContent = value.substring(0, selectionStart) +
                   prefix + selectedText + suffix +
                   value.substring(selectionEnd);
      newStart += prefix.length;
      newEnd += prefix.length;
    }

    setLocalContent(newContent);
    if (document) onUpdate(document.id, { content: newContent });
    pushToHistory(newContent);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newStart, newEnd);
        checkFormatting();
      }
    }, 0);
  };

  const handleTextColor = (color: string) => {
    if (!textareaRef.current) return;
    const prefix = `<span style="color: ${color}">`;
    const suffix = `</span>`;
    
    // Check if we are already in a span of ANY color to replace it
    const value = textareaRef.current.value;
    const { selectionStart, selectionEnd } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);

    // If color is inherit, we are essentially removing color
    if (color === 'inherit') {
        const spanMatch = value.substring(selectionStart - 50, selectionStart).match(/<span style="color:\s*(#[0-9a-fA-F]{6}|inherit)">$/);
        if (spanMatch && value.substring(selectionEnd, selectionEnd + 7) === '</span>') {
            const fullPrefix = spanMatch[0];
            const newContent = value.substring(0, selectionStart - fullPrefix.length) + selectedText + value.substring(selectionEnd + 7);
            setLocalContent(newContent);
            if (document) onUpdate(document.id, { content: newContent });
            pushToHistory(newContent);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(selectionStart - fullPrefix.length, selectionEnd - fullPrefix.length);
                    checkFormatting();
                }
            }, 0);
            return;
        }
    }

    insertFormatting(prefix, suffix);
  };

  const handleInsertLink = () => {
    const url = prompt('Inserir URL:');
    if (url) insertFormatting('[', `](${url})`);
  };

  const pushToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevContent = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setLocalContent(prevContent);
      if (document) onUpdate(document.id, { content: prevContent });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextContent = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setLocalContent(nextContent);
      if (document) onUpdate(document.id, { content: nextContent });
    }
  };

  const updateActiveLine = (textarea: HTMLTextAreaElement) => {
    const val = textarea.value;
    const cursorPosition = textarea.selectionStart;
    const linesBefore = val.substring(0, cursorPosition).split('\n');
    setActiveLine(linesBefore.length - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalContent(val);
    if (document) onUpdate(document.id, { content: val });
    pushToHistory(val);
    updateActiveLine(e.target);
    checkFormatting();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    updateActiveLine(e.currentTarget);
    checkFormatting();
  };

  const slugify = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  };

  const tocItems = useMemo(() => {
    const items: { level: number, text: string, id: string }[] = [];
    const lines = localContent.split('\n');
    lines.forEach(line => {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        items.push({
          level: match[1].length,
          text: match[2],
          id: slugify(match[2])
        });
      }
    });
    return items;
  }, [localContent]);

  const renderMarkdown = (text: string) => {
    if (!text) return { __html: '<p class="opacity-20 italic">Comece a escrever sua obra-prima...</p>' };
    const lines = text.split('\n');
    const result: string[] = [];
    let listStack: ('ul' | 'ol')[] = [];
    let inCodeBlock = false;
    let inQuote = false;

    const flushLists = (targetLevel = 0) => {
      while (listStack.length > targetLevel) result.push(`</${listStack.pop()}>`);
    };
    const flushQuote = () => { if (inQuote) { result.push('</blockquote>'); inQuote = false; } };
    const processInline = (line: string) => {
      return line
        .replace(/<span style="color:\s*(.*?)">(.*?)<\/span>/g, '<span style="color: $1">$2</span>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/<sub>(.*?)<\/sub>/g, '<sub>$1</sub>')
        .replace(/<sup>(.*?)<\/sup>/g, '<sup>$1</sup>')
        .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-base-200 text-primary font-mono text-sm border border-base-300">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="my-8"><img src="$2" alt="$1" class="rounded-2xl shadow-xl w-full" /><figcaption class="text-center text-xs opacity-40 mt-3 font-medium">$1</figcaption></figure>');
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          flushLists(); flushQuote(); inCodeBlock = true;
          result.push(`<div class="mockup-code my-8 shadow-lg border border-base-300 before:opacity-30"><pre data-prefix=">"><code>`);
        } else {
          inCodeBlock = false;
          result.push('</code></pre></div>');
        }
        continue;
      }
      if (inCodeBlock) { result.push(line.replace(/</g, '&lt;') + '\n'); continue; }

      if (line.trim().startsWith('>')) {
        if (!inQuote) { flushLists(); inQuote = true; result.push('<blockquote class="border-l-4 border-primary bg-primary/5 p-6 italic rounded-r-2xl my-6 text-xl text-base-content/80">'); }
        result.push(processInline(line.trim().substring(1).trim()) + '<br/>');
        continue;
      } else if (inQuote && line.trim() === '') {
        if (i + 1 < lines.length && !lines[i+1].trim().startsWith('>')) flushQuote();
      } else if (inQuote && !line.trim().startsWith('>')) {
        flushQuote();
      }

      if (line.trim() === '---') { flushLists(); flushQuote(); result.push('<div class="divider my-12 opacity-50"></div>'); continue; }

      const hMatch = line.match(/^(#{1,3})\s+(.*)$/);
      if (hMatch) {
        flushLists(); flushQuote();
        const level = hMatch[1].length;
        const rawText = hMatch[2];
        const text = processInline(rawText);
        const id = slugify(rawText);
        const classes = level === 1 
          ? 'text-5xl font-black mb-10 mt-16 tracking-tighter text-base-content' 
          : level === 2 
            ? 'text-3xl font-bold mb-6 mt-12 border-b border-base-300 pb-3 text-base-content/90' 
            : 'text-xl font-bold mb-4 mt-8 text-base-content/80';
        result.push(`<h${level} id="${id}" class="${classes}">${text}</h${level}>`);
        continue;
      }

      const listMatch = line.match(/^(\s*)(\*|\d+\.)\s+(.*)$/);
      if (listMatch) {
        flushQuote();
        const indent = listMatch[1].length;
        const level = Math.floor(indent / 2);
        const type = listMatch[2].includes('.') ? 'ol' : 'ul';
        let content = processInline(listMatch[3]);

        if (content.startsWith('[ ] ')) {
          content = `<div class="flex items-center gap-3 py-1"><input type="checkbox" class="checkbox checkbox-primary checkbox-sm" /> <span class="text-base-content/80 font-medium">${content.substring(4)}</span></div>`;
        } else if (content.startsWith('[x] ')) {
          content = `<div class="flex items-center gap-3 py-1"><input type="checkbox" checked class="checkbox checkbox-primary checkbox-sm" /> <span class="line-through opacity-40 font-medium">${content.substring(4)}</span></div>`;
        }

        while (listStack.length > level + 1) result.push(`</${listStack.pop()}>`);
        while (listStack.length < level + 1) {
          listStack.push(type);
          result.push(`<${type} class="menu menu-md bg-transparent p-0 ml-4 my-2">`);
        }
        result.push(`<li class="leading-relaxed"><span>${content}</span></li>`);
        continue;
      } else if (line.trim() !== '') {
        flushLists();
      }

      if (line.trim() === '') {
        result.push('<div class="h-6"></div>');
      } else {
        result.push(`<p class="mb-4 leading-loose text-lg text-base-content/80 font-medium antialiased">${processInline(line)}</p>`);
      }
    }
    flushLists(); flushQuote();
    return { __html: result.join('') };
  };

  const scrollToHeading = (id: string) => {
    const element = window.document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveSnapshot = () => {
    if (!document) return;
    const label = prompt('Dê um nome a esta versão (opcional):') || undefined;
    const newVersion: DocumentVersion = {
      id: uuidv4(),
      content: localContent,
      timestamp: Date.now(),
      label
    };
    const updatedVersions = [...(document.versions || []), newVersion];
    onUpdate(document.id, { versions: updatedVersions });
  };

  const handleRevert = (version: DocumentVersion) => {
    if (!document) return;
    if (confirm('Reverter para esta versão? Alterações não salvas serão perdidas.')) {
      setLocalContent(version.content);
      onUpdate(document.id, { content: version.content });
      setShowHistory(false);
    }
  };

  if (!document) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-base-100 h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] workspace-pattern pointer-events-none" />
      <div className="text-center animate-in zoom-in duration-500">
        <div className="inline-flex p-8 bg-base-200 rounded-[3rem] border border-base-300 shadow-inner mb-8">
            <FileText size={120} className="text-primary/20" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter opacity-10">Nexus Intelligence</h2>
        <p className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30 mt-4">Selecione uma página para começar</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-base-100 relative group/editor">
      {/* HEADER */}
      <header className="navbar bg-base-100/95 backdrop-blur-md border-b border-base-300 px-6 min-h-[4.5rem] z-40 sticky top-0 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-hidden">
           <div className="dropdown dropdown-bottom">
             <label 
               tabIndex={0} 
               className="p-2.5 bg-base-200 rounded-2xl font-bold text-2xl shadow-sm cursor-pointer hover:bg-base-300 transition-all active:scale-95 block border border-base-300/50"
               title="Mudar Ícone"
             >
               {document.icon || '📄'}
             </label>
             <div tabIndex={0} className="dropdown-content z-[60] p-4 shadow-2xl bg-base-100 rounded-2xl border border-base-300 w-80 mt-2 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between mb-4 px-1">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Ícones Rápidos</span>
               </div>
               <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1 no-scrollbar">
                 {COMMON_EMOJIS.map(emoji => (
                   <button 
                     key={emoji} 
                     className="text-2xl hover:bg-base-200 p-2 rounded-xl transition-all hover:scale-125" 
                     onClick={() => {
                       onUpdate(document.id, { icon: emoji });
                       if (window.document.activeElement instanceof HTMLElement) window.document.activeElement.blur();
                     }}
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
               <div className="divider my-2 opacity-20"></div>
             </div>
           </div>

           <div className="flex flex-col min-w-0">
              <h1 className="text-base font-bold truncate tracking-tight text-base-content/90">{document.title}</h1>
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest opacity-40">
                {document.parentId && <span className="hover:text-primary cursor-pointer truncate max-w-[120px] hover:underline" onClick={() => onSelect(document.parentId!)}>{allDocuments[document.parentId]?.title}</span>}
                {document.parentId && <ChevronRight size={10}/>}
                <span>ID: {document.id.slice(0, 6)}</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="join bg-base-200/50 p-1 rounded-2xl border border-base-300">
            <button 
              className={`join-item btn btn-xs h-8 px-4 border-none transition-all ${viewMode === 'editor' ? 'bg-base-100 shadow-md text-primary font-bold' : 'btn-ghost opacity-40 hover:opacity-100'}`} 
              onClick={() => setViewMode('editor')} 
              title="Escrita"
            >
              <Maximize2 size={14} />
            </button>
            <button 
              className={`join-item btn btn-xs h-8 px-4 border-none transition-all ${viewMode === 'split' ? 'bg-base-100 shadow-md text-primary font-bold' : 'btn-ghost opacity-40 hover:opacity-100'}`} 
              onClick={() => setViewMode('split')} 
              title="Dividido"
            >
              <Columns2 size={14} />
            </button>
            <button 
              className={`join-item btn btn-xs h-8 px-4 border-none transition-all ${viewMode === 'preview' ? 'bg-base-100 shadow-md text-primary font-bold' : 'btn-ghost opacity-40 hover:opacity-100'}`} 
              onClick={() => setViewMode('preview')} 
              title="Leitura"
            >
              <BookOpen size={14} />
            </button>
          </div>
          
          <div className="h-8 w-[1px] bg-base-300 mx-1 hidden sm:block" />

          <button 
            className={`btn btn-sm btn-ghost rounded-xl gap-2 h-9 px-4 ${showHistory ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">Histórico</span>
          </button>

          <div className="dropdown dropdown-end">
             <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle h-9 w-9 hover:bg-base-200"><MoreVertical size={18}/></label>
             <ul tabIndex={0} className="dropdown-content z-[60] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-52 border border-base-300 mt-2">
                <li><a className="gap-3 py-3 text-xs font-semibold"><Share2 size={14}/> Compartilhar</a></li>
                <li><a className="gap-3 py-3 text-xs font-semibold"><Download size={14}/> Exportar</a></li>
             </ul>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="flex items-center gap-6 px-6 h-12 bg-base-100 border-b border-base-300 overflow-x-auto no-scrollbar shrink-0 z-30">
        <div className="join">
          <button 
            className={`join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl transition-all ${activeFormatting.bold ? 'btn-active btn-primary text-primary-content shadow-inner scale-95' : 'opacity-40 hover:opacity-100 hover:bg-base-200'}`} 
            onClick={() => insertFormatting('**', '**')} 
            title="Negrito"
          >
            <Bold size={16}/>
          </button>
          <button 
            className={`join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl transition-all ${activeFormatting.italic ? 'btn-active btn-primary text-primary-content shadow-inner scale-95' : 'opacity-40 hover:opacity-100 hover:bg-base-200'}`} 
            onClick={() => insertFormatting('*', '*')} 
            title="Itálico"
          >
            <Italic size={16}/>
          </button>
          <button 
            className={`join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl transition-all ${activeFormatting.strikethrough ? 'btn-active btn-primary text-primary-content shadow-inner scale-95' : 'opacity-40 hover:opacity-100 hover:bg-base-200'}`} 
            onClick={() => insertFormatting('~~', '~~')} 
            title="Riscado"
          >
            <StrikethroughIcon size={16}/>
          </button>
        </div>

        <div className="join">
          {/* COLOR PICKER DROPDOWN */}
          <div className="dropdown dropdown-bottom">
            <button 
              tabIndex={0}
              className={`btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl transition-all ${activeFormatting.color !== 'inherit' ? 'text-primary' : 'opacity-40 hover:opacity-100'}`} 
              title="Cor do Texto"
            >
              <Palette size={16}/>
              {activeFormatting.color !== 'inherit' && <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeFormatting.color }} />}
            </button>
            <div tabIndex={0} className="dropdown-content z-[60] p-3 shadow-2xl bg-base-100 rounded-2xl border border-base-300 w-48 mt-1">
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleTextColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform flex items-center justify-center ${c.class} ${activeFormatting.color === c.value ? 'border-primary' : ''}`}
                    title={c.name}
                  >
                    {activeFormatting.color === c.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="join">
          <button 
            className={`join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl transition-all ${activeFormatting.superscript ? 'btn-active btn-primary text-primary-content shadow-inner scale-95' : 'opacity-40 hover:opacity-100'}`} 
            onClick={() => insertFormatting('<sup>', '</sup>')} 
            title="Sobrescrito"
          >
            <SuperscriptIcon size={16}/>
          </button>
          <button 
            className={`join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl transition-all ${activeFormatting.subscript ? 'btn-active btn-primary text-primary-content shadow-inner scale-95' : 'opacity-40 hover:opacity-100'}`} 
            onClick={() => insertFormatting('<sub>', '</sub>')} 
            title="Subscrito"
          >
            <SubscriptIcon size={16}/>
          </button>
        </div>

        <div className="join">
          <button className="join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl opacity-40 hover:opacity-100 hover:bg-base-200" onClick={() => insertFormatting('* ')} title="Lista Marcadores"><List size={16}/></button>
          <button className="join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl opacity-40 hover:opacity-100 hover:bg-base-200" onClick={() => insertFormatting('1. ')} title="Lista Numerada"><ListOrdered size={16}/></button>
          <button className="join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl opacity-40 hover:opacity-100 hover:bg-base-200" onClick={() => insertFormatting('* [ ] ')} title="Checklist"><CheckSquare size={16}/></button>
        </div>

        <div className="join">
          <button 
            className={`join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl transition-all ${activeFormatting.code ? 'btn-active btn-primary text-primary-content shadow-inner scale-95' : 'opacity-40 hover:opacity-100 hover:bg-base-200'}`} 
            onClick={() => insertFormatting('`', '`')} 
            title="Código"
          >
            <Code size={16}/>
          </button>
          <button className="join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl opacity-40 hover:opacity-100 hover:bg-base-200" onClick={() => insertFormatting('```javascript\n', '\n```')} title="Bloco Código"><SquareCode size={16}/></button>
          <button className="join-item btn btn-ghost btn-sm w-9 h-9 p-0 rounded-xl opacity-40 hover:opacity-100 hover:bg-base-200" onClick={handleInsertLink} title="Link"><LinkIcon size={16}/></button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button 
            className={`btn btn-sm h-9 px-3 btn-ghost rounded-xl gap-2 transition-all ${showToC ? 'bg-primary/10 text-primary' : 'opacity-50 hover:opacity-100 hover:bg-base-200'}`} 
            onClick={() => setShowToC(!showToC)}
          >
            <ListTree size={16}/>
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Navegação</span>
          </button>
          
          <div className="dropdown dropdown-bottom dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm h-9 w-9 btn-circle opacity-50 hover:opacity-100 hover:bg-base-200"><Smile size={18}/></label>
            <div tabIndex={0} className="dropdown-content z-[60] p-4 shadow-2xl bg-base-100 rounded-2xl border border-base-300 w-80 mt-1 grid grid-cols-6 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {COMMON_EMOJIS.map(emoji => (
                <button key={emoji} className="text-xl hover:bg-base-200 p-2 rounded-xl transition-all hover:scale-125" onClick={() => insertFormatting(emoji)}>{emoji}</button>
              ))}
            </div>
          </div>
          <div className="w-[1px] h-5 bg-base-300 mx-1" />
          <div className="join">
            <button className="join-item btn btn-ghost btn-sm w-9 h-9 p-0 opacity-40 hover:opacity-100 hover:text-primary disabled:opacity-10" onClick={handleUndo} disabled={historyIndex <= 0}><Undo2 size={18}/></button>
            <button className="join-item btn btn-ghost btn-sm w-9 h-9 p-0 opacity-40 hover:opacity-100 hover:text-primary disabled:opacity-10" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo2 size={18}/></button>
          </div>
        </div>
      </div>

      {/* MAIN WORK AREA */}
      <div className="flex-1 flex overflow-hidden relative bg-base-200/20">
        {/* HISTORY SIDEBAR */}
        {showHistory && (
          <aside className="w-80 border-r border-base-300 bg-base-100 flex flex-col z-20 shadow-xl animate-in slide-in-from-left duration-400 ease-out">
            <div className="p-5 border-b border-base-300 flex items-center justify-between bg-base-200/30">
              <h3 className="font-bold text-[11px] uppercase tracking-widest opacity-50">Linha do Tempo</h3>
              <button onClick={() => setShowHistory(false)} className="btn btn-ghost btn-xs btn-circle"><X size={14}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              <button onClick={handleSaveSnapshot} className="btn btn-primary btn-sm btn-block gap-2 mb-3 shadow-md rounded-xl py-5 h-auto">
                <Bookmark size={15} /> Criar Versão Salva
              </button>
              
              {!document.versions || document.versions.length === 0 ? (
                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                  <Clock size={32} className="mb-4 text-base-content/20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma alteração registrada</p>
                </div>
              ) : (
                document.versions.slice().reverse().map((v) => (
                  <div key={v.id} className="card bg-base-100 border border-base-200 hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer rounded-2xl overflow-hidden" onClick={() => handleRevert(v)}>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold opacity-30 bg-base-200 px-2 py-0.5 rounded-full">{new Date(v.timestamp).toLocaleTimeString()}</span>
                        <RotateCcw size={14} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                      </div>
                      <p className="text-sm font-bold text-base-content/80 truncate mb-1">
                        {v.label || 'Alteração Automática'}
                      </p>
                      <p className="text-[11px] opacity-40 line-clamp-2 leading-relaxed">
                        {v.content.slice(0, 80)}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* EDITOR PANE */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div 
            ref={editorPaneRef}
            className={`pane transition-all duration-300 ${viewMode === 'editor' ? 'flex-1 bg-base-100 overflow-y-auto' : 'flex-1 overflow-y-auto'}`}
            onScroll={handleEditorScroll}
          >
            <div className={`mx-auto p-12 lg:p-24 relative ${viewMode === 'editor' ? 'max-w-4xl' : ''}`}>
               <div className="active-line-indicator border-l-2 border-primary/30 transition-all duration-150" style={{ top: `${(activeLine * 1.8) + 6}rem`, height: '1.6rem', left: '1.5rem' }} />
               <textarea
                ref={textareaRef}
                className="editor-text w-full min-h-[85vh] bg-transparent focus:outline-none text-xl font-medium leading-relaxed resize-none caret-primary selection:bg-primary/10 placeholder:opacity-20"
                value={localContent}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                onMouseUp={checkFormatting}
                spellCheck={false}
                placeholder="Comece sua jornada criativa aqui..."
              />
            </div>
          </div>
        )}

        {/* SPLIT DIVIDER */}
        {viewMode === 'split' && (
          <div className="w-[1px] bg-base-300 h-full shrink-0 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-base-100 border border-base-300 rounded-full z-10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-col-resize shadow-sm">
               <div className="w-[1px] h-4 bg-base-300 mx-[1px]"></div>
               <div className="w-[1px] h-4 bg-base-300 mx-[1px]"></div>
             </div>
          </div>
        )}

        {/* PREVIEW PANE */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div 
            ref={previewPaneRef}
            className={`pane transition-all duration-300 bg-white border-l border-base-300 overflow-y-auto ${viewMode === 'preview' ? 'flex-1' : 'flex-1'}`}
            onScroll={handlePreviewScroll}
          >
            <div className={`mx-auto p-12 lg:p-24 relative ${viewMode === 'preview' ? 'max-w-4xl' : ''}`}>
              {/* ToC Overlay */}
              {showToC && tocItems.length > 0 && (
                <div className="mb-16 p-8 bg-base-200/20 rounded-3xl border border-base-300 shadow-inner animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-3">
                      <ListTree size={16} className="text-primary" /> Índice Estrutural
                    </span>
                    <button onClick={() => setShowToC(false)} className="btn btn-ghost btn-xs btn-circle opacity-30 hover:opacity-100"><X size={14} /></button>
                  </div>
                  <nav className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                    {tocItems.map((item, idx) => (
                      <button 
                        key={`${item.id}-${idx}`}
                        onClick={() => scrollToHeading(item.id)}
                        className={`text-left hover:text-primary transition-all block w-full truncate border-b border-transparent hover:border-primary/20 pb-1 ${item.level === 1 ? 'font-bold text-sm text-base-content' : item.level === 2 ? 'pl-4 text-xs opacity-60' : 'pl-8 text-[11px] opacity-40 italic'}`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Document Hero */}
              <div className="flex flex-col gap-8 mb-24 group">
                <div className="text-8xl group-hover:scale-110 transition-transform duration-700 origin-left drop-shadow-sm">
                  {document.icon || '📄'}
                </div>
                <div className="space-y-4">
                   <h1 className="text-6xl font-black tracking-tight text-base-content leading-[1.1]">{document.title || 'Novo Documento'}</h1>
                   <div className="flex flex-wrap gap-2">
                      {document.tags.map(tag => (
                        <span key={tag} className="badge badge-lg bg-base-100 border border-base-300 font-bold uppercase tracking-widest text-[9px] opacity-50 px-4 py-3 hover:opacity-100 hover:border-primary hover:text-primary transition-all cursor-default">#{tag}</span>
                      ))}
                   </div>
                </div>
              </div>
              
              <div 
                className="prose prose-xl prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-base-content/80 prose-p:leading-relaxed antialiased"
                dangerouslySetInnerHTML={renderMarkdown(localContent)}
              />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="h-10 border-t border-base-300 px-8 flex items-center justify-between bg-base-100/80 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase opacity-40">
        <div className="flex gap-10">
          <div className="flex items-center gap-2">
            <span className="opacity-50">Palavras:</span>
            <span className="text-base-content">{wordCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-50">Leitura:</span>
            <span className="text-base-content">{Math.ceil(wordCount / 220)} min</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
           <div className="flex items-center gap-2 text-success opacity-80">
             <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
             <span>Nexus Link Ativo</span>
           </div>
        </div>
      </footer>

      {/* AI PROCESSING OVERLAY */}
      {isAiLoading && (
        <div className="absolute inset-0 bg-base-100/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="relative mb-10">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
           </div>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-50 animate-pulse">Processando Nexus IA...</p>
        </div>
      )}
    </div>
  );
};
