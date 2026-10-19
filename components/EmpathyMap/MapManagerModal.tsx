import { useState } from 'react';
import { X, Plus, Folder, Trash2, RotateCcw } from 'lucide-react';
import { EmpathyMap } from '@/types/EmpathyMap.types';

interface MapManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  maps: EmpathyMap[];
  activeMapId: string;
  onSelectMap: (id: string) => void;
  onCreateNewMap: (title: string, personaName: string) => void;
  onDuplicateMap: (id: string) => void;
  onDeleteMap: (id: string) => void;
  onResetTemplates: () => void;
}

export const MapManagerModal: React.FC<MapManagerModalProps> = ({
  isOpen,
  onClose,
  maps,
  activeMapId,
  onSelectMap,
  onCreateNewMap,
  onDeleteMap,
  onResetTemplates,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPersonaName, setNewPersonaName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateNewMap(newTitle.trim(), newPersonaName.trim() || 'Usuário');
    setNewTitle('');
    setNewPersonaName('');
    setShowCreateForm(false);
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md relative bg-base-100">
        <button
          onClick={onClose}
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/60"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-base text-base-content">
          Projetos & Personas
        </h3>
        <p className="text-xs text-base-content/60 mt-1 mb-4">
          Escolha um mapa existente ou crie um novo projeto.
        </p>

        {/* Create new map button / form */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            type="button"
            className="btn btn-outline btn-primary btn-sm w-full mb-3 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Mapa de Empatia</span>
          </button>
        ) : (
          <form onSubmit={handleCreate} className="card bg-base-200/50 border border-base-300 p-3.5 mb-3.5 space-y-2.5">
            <div>
              <label className="label py-0.5 text-xs font-bold text-base-content">
                Nome do Projeto
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                placeholder="Ex: Novo Usuário Onboarding"
                className="input input-bordered input-sm w-full text-xs"
                autoFocus
              />
            </div>
            <div>
              <label className="label py-0.5 text-xs font-bold text-base-content">
                Nome da Persona
              </label>
              <input
                type="text"
                value={newPersonaName}
                onChange={(e) => setNewPersonaName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="input input-bordered input-sm w-full text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-xs btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-xs btn-primary font-bold"
              >
                Criar
              </button>
            </div>
          </form>
        )}

        {/* Maps list */}
        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
          {maps.map((m) => {
            const isActive = m.id === activeMapId;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMap(m.id);
                  onClose();
                }}
                className={`card border p-3 transition-all cursor-pointer flex flex-row items-center justify-between gap-2.5 ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary-content'
                    : 'border-base-200 hover:bg-base-200/50 text-base-content'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/60'
                  }`}>
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-base-content truncate">{m.title}</div>
                    <div className="text-[11px] text-base-content/60 font-normal">
                      {m.persona.name} · {m.notes.length} notas
                    </div>
                  </div>
                </div>

                {maps.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMap(m.id);
                    }}
                    type="button"
                    className="btn btn-ghost btn-circle btn-xs text-error hover:bg-error/10"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Reset / Close */}
        <div className="modal-action pt-2 border-t border-base-200 flex items-center justify-between mt-3">
          <button
            onClick={() => {
              if (confirm('Restaurar modelos de exemplo?')) {
                onResetTemplates();
                onClose();
              }
            }}
            type="button"
            className="btn btn-xs btn-ghost gap-1 text-base-content/60"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar Exemplos</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm"
          >
            Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
};
