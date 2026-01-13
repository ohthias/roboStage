
import React, { useState, useEffect, useMemo } from 'react';
import { Document, DocumentMap } from './types';
import { Search, X, FileText, ChevronRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentMap;
  onSelect: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, documents, onSelect }) => {
  const [query, setQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResultIds, setAiResultIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setAiResultIds([]);
    }
  }, [isOpen]);

  const allDocs = useMemo(() => Object.values(documents) as Document[], [documents]);

  const filteredResults = useMemo(() => {
    if (!query || aiResultIds.length > 0) return [];
    return allDocs.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  }, [query, allDocs, aiResultIds]);

  const aiResults = useMemo(() => {
    return aiResultIds.map(id => documents[id]).filter(Boolean) as Document[];
  }, [aiResultIds, documents]);

  if (!isOpen) return null;

  return (
    <div className={`modal modal-open z-[100]`}>
      <div className="modal-box max-w-2xl p-0 bg-base-100 border border-base-300 shadow-2xl overflow-hidden">
        {/* Barra de Busca Superior */}
        <div className="p-4 border-b border-base-300 flex items-center gap-3 bg-base-200/50">
          <Search size={22} className="opacity-30" />
          <input 
            autoFocus
            type="text"
            className="input input-ghost w-full focus:bg-transparent text-lg font-medium p-0 h-auto"
            placeholder="Pesquisar documentos ou perguntar à IA..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAiResultIds([]); 
            }}
            onKeyDown={(e) => e.key === 'Enter'}
          />
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
          {isAiLoading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <span className="loading loading-ring loading-lg text-primary scale-150"></span>
              <p className="text-sm font-black tracking-widest uppercase opacity-40">Consultando Nexus...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {(aiResultIds.length > 0 ? aiResults : filteredResults).map(doc => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelect(doc.id);
                    onClose();
                  }}
                  className="btn btn-ghost btn-block justify-start h-auto py-3 px-4 gap-4 normal-case group border-none"
                >
                  <div className="avatar placeholder">
                    <div className="bg-base-200 text-xl w-10 rounded-lg group-hover:bg-primary group-hover:text-primary-content transition-colors">
                      <span>{doc.icon || '📄'}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-base flex items-center gap-2">
                      {doc.title}
                      {aiResultIds.length > 0 && <span className="badge badge-primary badge-xs">IA Match</span>}
                    </div>
                    <div className="text-xs opacity-50 line-clamp-1">{doc.content || 'Documento sem conteúdo'}</div>
                  </div>
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}

              {!query && (
                <div className="py-16 text-center opacity-30">
                  <FileText size={48} className="mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">Digite para buscar</p>
                  <p className="text-xs mt-2">Use a busca semântica com Gemini AI</p>
                </div>
              )}

              {query && filteredResults.length === 0 && aiResultIds.length === 0 && !isAiLoading && (
                <div className="py-16 text-center text-error opacity-60">
                  <X size={40} className="mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest">Nenhum resultado</p>
                  <p className="text-xs mt-2">Tente termos diferentes ou use a Busca IA</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé de Comandos */}
        <div className="p-3 bg-base-200/50 border-t border-base-300 flex justify-between">
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase opacity-40"><kbd className="kbd kbd-xs">↑↓</kbd> Navegar</span>
            <span className="flex items-center gap-1 text-[10px] font-black uppercase opacity-40"><kbd className="kbd kbd-xs">↵</kbd> Selecionar</span>
          </div>
          <span className="text-[10px] font-black uppercase opacity-40">ESC para fechar</span>
        </div>
      </div>
      <div className="modal-backdrop bg-base-300/40 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
};
