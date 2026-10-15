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

  const handleAddClick = (catId: EmpathyCategory) => {
    const text = (quickInput[catId] || '').trim();
    if (text) {
      onAddNote(catId, text);
      setQuickInput((prev) => ({ ...prev, [catId]: '' }));
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
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
              onDragOver={(e) => handleDragOver(e, catId)}
              onDragLeave={() => handleDragLeave(catId)}
              onDrop={(e) => handleDrop(e, catId)}
              className={`card border bg-base-100 transition-all duration-150 p-4 flex flex-col justify-between shadow-2xs ${
                isTarget
                  ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                  : 'border-base-200 hover:border-base-300'
              } min-h-[340px]`}
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
                    placeholder="+ Adicionar nota (Enter)"
                    className="input input-bordered input-sm w-full text-xs"
                  />
                  {quickInput[catId]?.trim() && (
                    <button
                      onClick={() => handleAddClick(catId)}
                      type="button"
                      className="btn btn-primary btn-sm btn-square shrink-0"
                      title="Adicionar nota"
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
                    />
                  ))}

                  {catNotes.length === 0 && (
                    <div className="border border-dashed border-base-300 rounded-xl p-4 text-center">
                      <span className="text-xs text-base-content/50">
                        Nenhuma nota ainda. Digite acima ou arraste para cá.
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
