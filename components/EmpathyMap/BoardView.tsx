import { useState } from 'react';
import {
  Brain,
  MessageSquareQuote,
  Activity,
  Heart,
  AlertTriangle,
  Sparkles,
  Plus,
} from 'lucide-react';
import { CATEGORIES } from '@/app/(public)/[competicao]/(fll)/empathy-map/initialData';
import { EmpathyCategory, EmpathyNote, NoteColor } from '@/types/EmpathyMap.types';
import { StickyNote } from './StickyNote';

interface BoardViewProps {
  notes: EmpathyNote[];
  onAddNote: (category: EmpathyCategory, text: string) => void;
  onUpdateNoteText: (id: string, text: string) => void;
  onChangeNoteColor: (id: string, color: NoteColor) => void;
  onDeleteNote: (id: string) => void;
  onVoteNote: (id: string) => void;
  onChangeCategory: (id: string, category: EmpathyCategory) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
}

const QUADRANTS: { id: EmpathyCategory; icon: any; badgeClass: string }[] = [
  { id: 'thinks', icon: Brain, badgeClass: 'badge-info' },
  { id: 'says', icon: MessageSquareQuote, badgeClass: 'badge-success' },
  { id: 'does', icon: Activity, badgeClass: 'badge-secondary' },
  { id: 'feels', icon: Heart, badgeClass: 'badge-accent' },
  { id: 'pains', icon: AlertTriangle, badgeClass: 'badge-error' },
  { id: 'gains', icon: Sparkles, badgeClass: 'badge-warning' },
];

export const BoardView: React.FC<BoardViewProps> = ({
  notes,
  onAddNote,
  onUpdateNoteText,
  onChangeNoteColor,
  onDeleteNote,
  onVoteNote,
  onChangeCategory,
  boardRef,
}) => {
  const [quickInput, setQuickInput] = useState<{ [key in EmpathyCategory]?: string }>({});
  const [dragOverCategory, setDragOverCategory] = useState<EmpathyCategory | null>(null);

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData('text/plain', noteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, category: EmpathyCategory) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategory !== category) {
      setDragOverCategory(category);
    }
  };

  const handleDragLeave = (category: EmpathyCategory) => {
    if (dragOverCategory === category) {
      setDragOverCategory(null);
    }
  };

  const handleDrop = (e: React.DragEvent, category: EmpathyCategory) => {
    e.preventDefault();
    setDragOverCategory(null);
    const noteId = e.dataTransfer.getData('text/plain');
    if (noteId) {
      onChangeCategory(noteId, category);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, catId: EmpathyCategory) => {
    if (e.key === 'Enter') {
      const text = (quickInput[catId] || '').trim();
      if (text) {
        onAddNote(catId, text);
        setQuickInput((prev) => ({ ...prev, [catId]: '' }));
      }
    }
  };

  const scrollToQuadrant = (catId: EmpathyCategory) => {
    document
      .getElementById(`em-quadrant-${catId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categoryOrder = QUADRANTS.map((q) => q.id);

  const handleAddClick = (catId: EmpathyCategory) => {
    const text = (quickInput[catId] || '').trim();
    if (text) {
      onAddNote(catId, text);
      setQuickInput((prev) => ({ ...prev, [catId]: '' }));
    }
  };

  return (
    <div className="sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Atalhos de quadrante (só celular) */}
      <nav
        aria-label="Ir para quadrante"
        className="md:hidden sticky top-0 z-30 -mx-4 mb-3 px-4 py-2 bg-base-100/90 backdrop-blur-sm border-b border-base-200"
      >
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUADRANTS.map(({ id: catId, icon: IconComponent }) => {
            const config = CATEGORIES[catId];
            const count = notes.filter((n) => n.category === catId).length;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => scrollToQuadrant(catId)}
                className="btn btn-sm btn-ghost border border-base-300 rounded-full shrink-0 gap-1.5 font-semibold"
              >
                <IconComponent className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
                <span>{config.title}</span>
                <span className="font-mono text-xs opacity-60 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div
        ref={boardRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {QUADRANTS.map(({ id: catId, icon: IconComponent, badgeClass }) => {
          const config = CATEGORIES[catId];
          const catNotes = notes.filter((n) => n.category === catId);
          const isTarget = dragOverCategory === catId;

          return (
            <div
              key={catId}
              id={`em-quadrant-${catId}`}
              onDragOver={(e) => handleDragOver(e, catId)}
              onDragLeave={() => handleDragLeave(catId)}
              onDrop={(e) => handleDrop(e, catId)}
              className={`card border bg-base-100 transition-all duration-150 p-4 flex flex-col justify-between shadow-2xs ${
                isTarget
                  ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                  : 'border-base-200 hover:border-base-300'
              } scroll-mt-16 md:scroll-mt-24 md:min-h-[340px]`}
            >
              <div>
                {/* Quadrant Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-base-200">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${config.accentColor}18`,
                        color: config.accentColor,
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-base-content leading-tight">
                        {config.title}
                      </h3>
                      <p className="text-[11px] text-base-content/60 leading-none mt-0.5">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className={`badge ${badgeClass} badge-sm font-bold font-mono tabular-nums`}>
                    {catNotes.length}
                  </span>
                </div>

                {/* Instant Inline Add with DaisyUI input & btn */}
                <div className="mb-3 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={quickInput[catId] || ''}
                    onChange={(e) =>
                      setQuickInput((prev) => ({ ...prev, [catId]: e.target.value }))
                    }
                    onKeyDown={(e) => handleKeyDown(e, catId)}
                    placeholder="+ Adicionar nota"
                    enterKeyHint="send"
                    aria-label={`Adicionar nota em ${config.title}`}
                    className="input input-bordered input-md sm:input-sm w-full text-base sm:text-xs"
                  />
                  {quickInput[catId]?.trim() && (
                    <button
                      onClick={() => handleAddClick(catId)}
                      type="button"
                      className="btn btn-primary btn-md sm:btn-sm btn-square shrink-0"
                      title="Adicionar nota"
                      aria-label="Adicionar nota"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Notes List */}
                <div className="space-y-2">
                  {catNotes.map((note) => (
                    <StickyNote
                      key={note.id}
                      note={note}
                      onVote={onVoteNote}
                      onUpdateText={onUpdateNoteText}
                      onChangeColor={onChangeNoteColor}
                      onDelete={onDeleteNote}
                      onDragStart={handleDragStart}
                      onChangeCategory={onChangeCategory}
                      categoryOrder={categoryOrder}
                    />
                  ))}

                  {catNotes.length === 0 && (
                    <div className="border border-dashed border-base-300 rounded-xl p-4 text-center">
                      <span className="text-xs text-base-content/50">
                        Nenhuma nota ainda. Digite acima ou mova uma nota para cá.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
