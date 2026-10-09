import React from 'react';
import { User, Edit2, Search, X } from 'lucide-react';
import { Persona } from '@/types/EmpathyMap.types';

interface PersonaBarProps {
  persona: Persona;
  onEditPersona: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalNotes: number;
}

export const PersonaBar: React.FC<PersonaBarProps> = ({
  persona,
  onEditPersona,
  searchQuery,
  onSearchChange,
  totalNotes,
}) => {
  return (
    <div className="bg-base-200/50 border border-base-300 px-4 lg:px-8 py-3 rounded-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Persona quick info with DaisyUI avatar & badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onEditPersona}
            type="button"
            className="avatar cursor-pointer group relative"
            title="Clique para alterar foto da persona"
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-base-200 group-hover:ring-primary overflow-hidden bg-base-200 flex items-center justify-center transition-all">
              {persona.avatarUrl ? (
                <img
                  src={persona.avatarUrl}
                  alt={persona.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-base-content">
                {persona.name}
              </span>
              <span className="text-xs text-base-content/40">·</span>
              <span className="text-xs text-base-content/70 font-medium">
                {persona.role}
              </span>
              <button
                onClick={onEditPersona}
                type="button"
                className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content"
                title="Editar dados da persona"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            {persona.quote && (
              <p className="text-xs text-base-content/60 italic truncate max-w-lg mt-0.5">
                "{persona.quote}"
              </p>
            )}
          </div>
        </div>

        {/* Quick Search & Count Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar notas..."
              className="input input-bordered input-sm w-full pl-8 pr-7 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="badge badge-neutral badge-sm font-mono font-bold whitespace-nowrap">
            {totalNotes} notas
          </div>
        </div>
      </div>
    </div>
  );
};
