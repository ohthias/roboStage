import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { NOTE_COLORS } from '@/app/(public)/[competicao]/(fll)/empathy-map/initialData';
import { EmpathyNote, NoteColor } from '@/types/EmpathyMap.types';

interface StickyNoteProps {
  note: EmpathyNote;
  onVote: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onChangeColor: (id: string, color: NoteColor) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, noteId: string) => void;
}

const COLOR_OPTIONS: NoteColor[] = ['yellow', 'emerald', 'pink', 'blue', 'amber', 'purple'];

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onVote,
  onUpdateText,
  onChangeColor,
  onDelete,
  onDragStart,
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
        isEditing ? 'ring-2 ring-primary shadow-md' : 'hover:-translate-y-0.5 hover:shadow-md cursor-grab active:cursor-grabbing shadow-2xs'
      } ${colorConfig.bg} ${colorConfig.border} ${colorConfig.text} select-none flex flex-col justify-between`}
      style={{ minHeight: '96px' }}
    >
      {/* Delete button (top right on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        type="button"
        className="btn btn-ghost btn-circle btn-xs absolute top-1 right-1 opacity-0 group-hover:opacity-80 hover:opacity-100 text-slate-700 transition-opacity"
        title="Excluir nota"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Note Content / Inline Edit */}
      <div className="pr-5">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            rows={2}
            className="textarea textarea-bordered textarea-xs w-full bg-white/90 text-slate-900 leading-relaxed"
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="text-xs font-medium leading-relaxed cursor-text select-text break-words"
            title="Clique para editar"
          >
            {note.text}
          </p>
        )}
      </div>
      <div className="mt-2.5 pt-1.5 border-t border-black/5 flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangeColor(note.id, c);
              }}
              className={`w-3 h-3 rounded-full transition-transform ${
                note.color === c ? 'ring-1 ring-slate-800 scale-125' : 'hover:scale-125 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: NOTE_COLORS[c].dot }}
              title={NOTE_COLORS[c].name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
