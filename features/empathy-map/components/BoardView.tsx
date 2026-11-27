import { useState } from 'react';
import {
  Brain,
  MessageSquareQuote,
  Activity,
  Heart,
  AlertTriangle,
  Sparkles,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { IconButton, ToolInput, cn } from '@/components/stage';
import { CATEGORIES } from '@/features/empathy-map/lib/initialData';
import { EmpathyCategory, EmpathyNote, NoteColor } from '@/features/empathy-map/types';
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

const QUADRANTS: { id: EmpathyCategory; icon: LucideIcon }[] = [
  { id: 'thinks', icon: Brain },
  { id: 'says', icon: MessageSquareQuote },
  { id: 'does', icon: Activity },
  { id: 'feels', icon: Heart },
  { id: 'pains', icon: AlertTriangle },
  { id: 'gains', icon: Sparkles },
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
    <div>
      {/* Atalhos de quadrante (só celular) */}
      <nav
        aria-label="Ir para quadrante"
        className="sticky top-16 z-30 -mx-4 mb-3 border-b border-base-300 bg-base-100/90 px-4 py-2 backdrop-blur-sm md:hidden"
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
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-base-300 bg-base-100 px-2.5 text-xs font-semibold"
              >
                <IconComponent className="size-3.5" style={{ color: config.accentColor }} />
                <span>{config.title}</span>
                <span className="font-mono tabular-nums opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div ref={boardRef} className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {QUADRANTS.map(({ id: catId, icon: IconComponent }) => {
          const config = CATEGORIES[catId];
          const catNotes = notes.filter((n) => n.category === catId);
          const isTarget = dragOverCategory === catId;

          return (
            <section
              key={catId}
              id={`em-quadrant-${catId}`}
              aria-label={config.title}
              onDragOver={(e) => handleDragOver(e, catId)}
              onDragLeave={() => handleDragLeave(catId)}
              onDrop={(e) => handleDrop(e, catId)}
              className={cn(
                'flex scroll-mt-28 flex-col overflow-hidden rounded-lg border bg-base-100 transition-[border-color,box-shadow] duration-150 md:min-h-[340px]',
                isTarget ? 'border-primary ring-2 ring-primary/30' : 'border-base-300',
              )}
              style={{ borderTopColor: config.accentColor, borderTopWidth: 3 }}
            >
              <header className="flex items-center justify-between gap-2 border-b border-base-300 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-tl-md rounded-br-md"
                    style={{ backgroundColor: `${config.accentColor}1f`, color: config.accentColor }}
                  >
                    <IconComponent className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-bold leading-tight">{config.title}</h3>
                    <p className="truncate text-[11px] leading-tight text-base-content/55">{config.subtitle}</p>
                  </div>
                </div>
                <span
                  className="grid h-5 min-w-5 place-items-center rounded px-1 font-mono text-[11px] font-bold tabular-nums"
                  style={{ backgroundColor: `${config.accentColor}1f`, color: config.accentColor }}
                >
                  {catNotes.length}
                </span>
              </header>

              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex items-center gap-1.5">
                  <ToolInput
                    type="text"
                    value={quickInput[catId] || ''}
                    onChange={(e) => setQuickInput((prev) => ({ ...prev, [catId]: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(e, catId)}
                    placeholder="+ Adicionar nota"
                    enterKeyHint="send"
                    aria-label={`Adicionar nota em ${config.title}`}
                    className="h-9 text-base sm:h-8 sm:text-[13px]"
                  />
                  {quickInput[catId]?.trim() && (
                    <IconButton label="Adicionar nota" icon={<Plus />} variant="primary" onClick={() => handleAddClick(catId)} />
                  )}
                </div>

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
                  <p className="rounded-md border border-dashed border-base-300 px-3 py-4 text-center text-xs text-base-content/50">
                    Nenhuma nota ainda. Digite acima ou mova uma nota para cá.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
