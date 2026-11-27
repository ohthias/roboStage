import React from 'react';
import { Edit2, Search, User, X } from 'lucide-react';
import { IconButton, ToolBadge, ToolInput } from '@/components/stage';
import { Persona } from '@/features/empathy-map/types';

interface PersonaBarProps {
  persona: Persona;
  onEditPersona: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalNotes: number;
}

export const PersonaBar: React.FC<PersonaBarProps> = ({ persona, onEditPersona, searchQuery, onSearchChange, totalNotes }) => {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onEditPersona}
          type="button"
          className="group relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          title="Alterar foto da persona"
          aria-label="Alterar foto da persona"
        >
          {persona.avatarUrl ? (
            <img src={persona.avatarUrl} alt={persona.name} className="size-full object-cover" />
          ) : (
            <User className="size-5 text-primary" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold">{persona.name}</span>
            {persona.role && <span className="text-xs text-base-content/60">· {persona.role}</span>}
            <IconButton label="Editar persona" icon={<Edit2 />} size="xs" onClick={onEditPersona} />
          </div>
          {persona.quote && (
            <p className="mt-0.5 line-clamp-2 max-w-lg text-xs italic text-base-content/60 sm:line-clamp-1">“{persona.quote}”</p>
          )}
        </div>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <ToolInput
          icon={<Search />}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar notas..."
          aria-label="Buscar notas"
          enterKeyHint="search"
          className="flex-1 sm:w-56 sm:flex-none"
          suffix={
            searchQuery ? (
              <button type="button" onClick={() => onSearchChange('')} aria-label="Limpar busca" className="grid place-items-center text-base-content/45 hover:text-base-content">
                <X className="size-3" />
              </button>
            ) : undefined
          }
        />
        <ToolBadge className="whitespace-nowrap font-mono">{totalNotes} notas</ToolBadge>
      </div>
    </div>
  );
};
