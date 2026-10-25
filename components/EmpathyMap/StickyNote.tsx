import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { CATEGORIES, NOTE_COLORS } from '@/app/(public)/[competicao]/(fll)/empathy-map/initialData';
import { EmpathyCategory, EmpathyNote, NoteColor } from '@/types/EmpathyMap.types';

interface StickyNoteProps {
  note: EmpathyNote;
  onVote: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onChangeColor: (id: string, color: NoteColor) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, noteId: string) => void;
  onChangeCategory?: (id: string, category: EmpathyCategory) => void;
  categoryOrder?: EmpathyCategory[];
}

const COLOR_OPTIONS: NoteColor[] = ['yellow', 'emerald', 'pink', 'blue', 'amber', 'purple'];

// Em telas de toque não existe hover: controles ficam sempre visíveis.
const HOVER_REVEAL =
  '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-80 [@media(hover:hover)]:group-focus-within:opacity-80';

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onVote,
  onUpdateText,
  onChangeColor,
  onDelete,
  onDragStart,
  onChangeCategory,
  categoryOrder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;

  useEffect(() => {
    setEditText(note.text);
  }, [note.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editText.trim() && editText.trim() !== note.text) {
      onUpdateText(note.id, editText.trim());
    } else {
      setEditText(note.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(note.text);
    }
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart && onDragStart(e, note.id)}
      className={`group relative rounded-xl border p-3 transition-all duration-150 ${
        isEditing
          ? 'ring-2 ring-primary shadow-md'
          : '[@media(hover:hover)]:hover:-translate-y-0.5 hover:shadow-md [@media(hover:hover)]:cursor-grab active:cursor-grabbing shadow-2xs'
      } ${colorConfig.bg} ${colorConfig.border} ${colorConfig.text} select-none flex flex-col justify-between min-h-[80px] sm:min-h-[96px]`}
    >
      {/* Excluir */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        type="button"
        data-html2canvas-ignore
        className={`btn btn-ghost btn-circle btn-sm sm:btn-xs absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-60 hover:opacity-100 focus-visible:opacity-100 text-slate-700 transition-opacity ${HOVER_REVEAL}`}
        title="Excluir nota"
        aria-label="Excluir nota"
      >
        <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>

      {/* Texto / edição */}
      <div className="pr-8 sm:pr-5">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            rows={3}
            enterKeyHint="done"
            className="textarea textarea-bordered textarea-sm sm:textarea-xs w-full bg-white/90 text-slate-900 leading-relaxed text-base sm:text-xs"
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="text-sm sm:text-xs font-medium leading-relaxed cursor-text select-text break-words"
            title="Toque para editar"
          >
            {note.text}
          </p>
        )}
      </div>

      <div className="mt-2.5 pt-1.5 border-t border-black/5 flex items-center justify-between gap-1 text-[11px]">
        {/* Cores: alvo de toque maior no celular */}
        <div className="flex items-center gap-0.5 sm:gap-1 opacity-80 sm:opacity-60 group-hover:opacity-100 transition-opacity">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangeColor(note.id, c);
              }}
              className="p-1.5 sm:p-0 rounded-full"
              title={NOTE_COLORS[c].name}
              aria-label={`Cor ${NOTE_COLORS[c].name}`}
              aria-pressed={note.color === c}
            >
              <span
                className={`block w-4 h-4 sm:w-3 sm:h-3 rounded-full transition-transform ${
                  note.color === c ? 'ring-1 ring-slate-800 scale-125' : 'hover:scale-125 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: NOTE_COLORS[c].dot }}
              />
            </button>
          ))}
        </div>

        {/* Mover: substitui o arrastar em telas de toque */}
        {onChangeCategory && categoryOrder && (
          <label
            data-html2canvas-ignore
            className={`relative btn btn-ghost btn-circle btn-sm sm:btn-xs text-slate-700 opacity-70 hover:opacity-100 focus-within:opacity-100 ${HOVER_REVEAL}`}
            title="Mover para outro quadrante"
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <select
              value={note.category}
              onChange={(e) => onChangeCategory(note.id, e.target.value as EmpathyCategory)}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 opacity-0 cursor-pointer text-base"
              aria-label="Mover nota para outro quadrante"
            >
              {categoryOrder.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORIES[cat].title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
};
