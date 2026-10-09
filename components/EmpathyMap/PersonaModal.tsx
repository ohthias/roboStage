import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, User, Camera } from 'lucide-react';
import { Persona } from '@/types/EmpathyMap.types';

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
  const [name, setName] = useState(persona.name);
  const [role, setRole] = useState(persona.role);
  const [quote, setQuote] = useState(persona.quote || '');
  const [avatarUrl, setAvatarUrl] = useState(persona.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(persona.name);
      setRole(persona.role);
      setQuote(persona.quote || '');
      setAvatarUrl(persona.avatarUrl);
    }
  }, [isOpen, persona]);

  if (!isOpen) return null;

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
          Editar Persona
        </h3>
        <p className="text-xs text-base-content/60 mt-0.5 mb-4">
          Defina o perfil e faça o upload de uma foto da pessoa.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Photo Upload Zone */}
          <div className="card bg-base-200/50 border border-base-300 p-3.5 flex flex-row items-center gap-4">
            {/* Avatar Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative w-16 h-16 rounded-full overflow-hidden bg-base-200 border-2 border-base-300 group cursor-pointer shrink-0 flex items-center justify-center hover:border-primary transition-colors"
              title="Clique para escolher foto ou arraste uma imagem aqui"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-base-content/40" />
              )}

              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="flex-1 space-y-1.5">
              <div className="text-xs font-bold text-base-content">
                Foto da Persona
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-xs btn-primary gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Subir Foto</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="btn btn-xs btn-ghost text-error gap-1"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remover</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-base-content/50">
                Arraste uma foto ou selecione do computador (PNG, JPG, WebP)
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="label py-0.5 text-xs font-bold text-base-content">
              Nome da Persona
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Marina Santos"
              className="input input-bordered input-sm w-full text-xs"
            />
          </div>

          <div>
            <label className="label py-0.5 text-xs font-bold text-base-content">
              Cargo / Perfil
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Product Manager & Mãe de 2 filhos"
              className="input input-bordered input-sm w-full text-xs"
            />
          </div>

          <div>
            <label className="label py-0.5 text-xs font-bold text-base-content">
              Frase de Destaque (Quote)
            </label>
            <input
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder='Ex: "Só quero que o dinheiro funcione em paz sem burocracia."'
              className="input input-bordered input-sm w-full text-xs"
            />
          </div>

          <div>
            <label className="label py-0.5 text-xs font-bold text-base-content">
              Ou cole a URL da Imagem (opcional)
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              className="input input-bordered input-sm w-full text-xs"
            />
          </div>

          <div className="modal-action pt-2 border-t border-base-200 flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary font-bold"
            >
              Salvar Persona
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
};
