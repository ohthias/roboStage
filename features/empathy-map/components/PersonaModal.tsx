import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, User, Camera } from 'lucide-react';
import { ToolButton, ToolDialog, ToolInput } from '@/components/stage';
import { Persona } from '@/features/empathy-map/types';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
  onSave: (updated: Persona) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  persona,
  onSave,
}) => {
  const sanitizeAvatarUrl = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return '';

    try {
      const parsed = new URL(trimmed, window.location.origin);
      const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      return isHttp ? parsed.toString() : '';
    } catch {
      return '';
    }
  };

  const [name, setName] = useState(persona.name);
  const [role, setRole] = useState(persona.role);
  const [quote, setQuote] = useState(persona.quote || '');
  const [avatarUrl, setAvatarUrl] = useState(sanitizeAvatarUrl(persona.avatarUrl || ''));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(persona.name);
      setRole(persona.role);
      setQuote(persona.quote || '');
      setAvatarUrl(sanitizeAvatarUrl(persona.avatarUrl || ''));
    }
  }, [isOpen, persona]);

  // Process and resize any uploaded photo
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setAvatarUrl(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...persona,
      name: name.trim() || 'Usuário',
      role: role.trim(),
      quote: quote.trim(),
      avatarUrl: avatarUrl.trim(),
    });
    onClose();
  };

  const label = 'mb-1 block text-[11px] font-semibold uppercase tracking-wider text-base-content/50';

  return (
    <ToolDialog
      open={isOpen}
      onClose={onClose}
      title="Editar persona"
      description="Defina o perfil e envie uma foto da pessoa."
      size="md"
      footer={
        <>
          <ToolButton variant="ghost" onClick={onClose}>
            Cancelar
          </ToolButton>
          <ToolButton type="submit" form="em-persona-form" variant="primary">
            Salvar persona
          </ToolButton>
        </>
      }
    >
      <form id="em-persona-form" onSubmit={handleSubmit} className="space-y-3 pb-2">
        <div className="flex items-center gap-4 rounded-lg border border-base-300 bg-base-200/40 p-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="group relative grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-tl-xl rounded-br-xl border-2 border-dashed border-base-300 bg-base-200 transition-colors hover:border-primary"
            title="Clique para escolher foto ou arraste uma imagem aqui"
          >
            {avatarUrl ? (
              <img src={sanitizeAvatarUrl(avatarUrl)} alt={name} className="size-full object-cover" />
            ) : (
              <User className="size-7 text-base-content/40" />
            )}
            <div className="absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5" />
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <p className="text-[13px] font-bold">Foto da persona</p>
            <div className="flex items-center gap-2">
              <ToolButton size="xs" variant="primary" icon={<Upload />} onClick={() => fileInputRef.current?.click()}>
                Subir foto
              </ToolButton>
              {avatarUrl && (
                <ToolButton size="xs" variant="danger" icon={<Trash2 />} onClick={() => setAvatarUrl('')}>
                  Remover
                </ToolButton>
              )}
            </div>
            <p className="text-[11px] text-base-content/50">Arraste uma foto ou escolha do computador (PNG, JPG, WebP).</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileInputChange} className="hidden" />
          </div>
        </div>

        <label className="block">
          <span className={label}>Nome da persona</span>
          <ToolInput type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Marina Santos" />
        </label>
        <label className="block">
          <span className={label}>Cargo / perfil</span>
          <ToolInput type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Professora de ciências" />
        </label>
        <label className="block">
          <span className={label}>Frase de destaque</span>
          <ToolInput type="text" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder='Ex: "Quero que a turma aprenda fazendo."' />
        </label>
        <label className="block">
          <span className={label}>Ou cole a URL da imagem (opcional)</span>
          <ToolInput
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(sanitizeAvatarUrl(e.target.value))}
            placeholder="https://exemplo.com/foto.jpg"
          />
        </label>
      </form>
    </ToolDialog>
  );
};
