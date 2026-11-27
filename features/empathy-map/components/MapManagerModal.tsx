import { useState } from 'react';
import { Plus, Folder, Trash2, RotateCcw } from 'lucide-react';
import { IconButton, ToolButton, ToolDialog, ToolInput, cn, useToolConfirm } from '@/components/stage';
import { EmpathyMap } from '@/features/empathy-map/types';

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

  const { confirm, dialog } = useToolConfirm();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateNewMap(newTitle.trim(), newPersonaName.trim() || 'Usuário');
    setNewTitle('');
    setNewPersonaName('');
    setShowCreateForm(false);
    onClose();
  };

  const label = 'mb-1 block text-[11px] font-semibold uppercase tracking-wider text-base-content/50';

  return (
    <>
      <ToolDialog
        open={isOpen}
        onClose={onClose}
        title="Projetos e personas"
        description="Escolha um mapa existente ou crie um novo."
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <ToolButton
              variant="ghost"
              size="xs"
              icon={<RotateCcw />}
              onClick={async () => {
                if (await confirm({ title: 'Restaurar exemplos?', message: 'Os mapas de exemplo voltam ao estado original.', confirmLabel: 'Restaurar' })) {
                  onResetTemplates();
                  onClose();
                }
              }}
            >
              Restaurar exemplos
            </ToolButton>
            <ToolButton onClick={onClose}>Fechar</ToolButton>
          </div>
        }
      >
        {!showCreateForm ? (
          <ToolButton variant="outline" size="md" icon={<Plus />} onClick={() => setShowCreateForm(true)} className="mb-3 w-full">
            Criar novo mapa de empatia
          </ToolButton>
        ) : (
          <form onSubmit={handleCreate} className="mb-3 space-y-2.5 rounded-lg border border-base-300 bg-base-200/40 p-3">
            <label className="block">
              <span className={label}>Nome do projeto</span>
              <ToolInput type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder="Ex: Professores da escola" autoFocus />
            </label>
            <label className="block">
              <span className={label}>Nome da persona</span>
              <ToolInput type="text" value={newPersonaName} onChange={(e) => setNewPersonaName(e.target.value)} placeholder="Ex: Carlos Silva" />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <ToolButton size="xs" variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </ToolButton>
              <ToolButton size="xs" type="submit" variant="primary">
                Criar
              </ToolButton>
            </div>
          </form>
        )}

        <div className="max-h-[40vh] space-y-0.5 overflow-y-auto pb-2 sm:max-h-64">
          {maps.map((m) => {
            const active = m.id === activeMapId;
            return (
              <div key={m.id} className={cn('flex items-center gap-1 rounded-md pr-1 transition-colors', active ? 'bg-primary/10' : 'hover:bg-base-content/[0.05]')}>
                <button
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => {
                    onSelectMap(m.id);
                    onClose();
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className={cn('grid size-7 shrink-0 place-items-center rounded-md [&>svg]:size-4', active ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/70')}>
                    <Folder />
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block truncate text-[13px] font-semibold', active && 'text-primary')}>{m.title}</span>
                    <span className="block truncate text-[11px] text-base-content/55">
                      {m.persona.name} · {m.notes.length} notas
                    </span>
                  </span>
                </button>
                {maps.length > 1 && (
                  <IconButton
                    label={`Excluir ${m.title}`}
                    icon={<Trash2 />}
                    size="xs"
                    variant="danger"
                    onClick={async () => {
                      if (await confirm({ title: 'Excluir mapa?', message: `“${m.title}” e todas as notas serão apagados.`, confirmLabel: 'Excluir' })) {
                        onDeleteMap(m.id);
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </ToolDialog>
      {dialog}
    </>
  );
};
