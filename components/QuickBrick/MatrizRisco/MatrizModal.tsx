import React, { useState, useEffect } from 'react';
import { Risco, Impacto, Probabilidade } from '@/types/MatrizRisco';
import { IMPACTO_LABELS, PROBABILIDADE_LABELS } from '@/app/(public)/quickbrick/matriz-de-risco/constants';

interface RiscoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (risco: Omit<Risco, 'id'> & { id?: number }) => void;
  riscoToEdit?: Risco | null;
}

const RiscoModal: React.FC<RiscoModalProps> = ({ isOpen, onClose, onSave, riscoToEdit }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [impacto, setImpacto] = useState<Impacto>(Impacto.Medio);
  const [probabilidade, setProbabilidade] = useState<Probabilidade>(Probabilidade.Media);

  useEffect(() => {
    if (riscoToEdit) {
      setTitulo(riscoToEdit.titulo);
      setDescricao(riscoToEdit.descricao);
      setImpacto(riscoToEdit.impacto);
      setProbabilidade(riscoToEdit.probabilidade);
    } else {
      // Reset form for new risk
      setTitulo('');
      setDescricao('');
      setImpacto(Impacto.Medio);
      setProbabilidade(Probabilidade.Media);
    }
  }, [riscoToEdit, isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
        onClose();
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo) return; // Basic validation
    onSave({
      id: riscoToEdit?.id,
      titulo,
      descricao,
      impacto,
      probabilidade,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div className="modal modal-open w-full" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box relative p-6">
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
            aria-label="Fechar"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {riscoToEdit ? 'Editar Risco' : 'Adicionar Novo Risco'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="textarea textarea-bordered w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="impacto" className="block text-sm font-medium text-gray-700 mb-1">
                  Impacto
                </label>
                <select
                  id="impacto"
                  value={impacto}
                  onChange={(e) => setImpacto(Number(e.target.value) as Impacto)}
                  className="select select-bordered w-full"
                >
                  {Object.entries(IMPACTO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="probabilidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Probabilidade
                </label>
                <select
                  id="probabilidade"
                  value={probabilidade}
                  onChange={(e) => setProbabilidade(Number(e.target.value) as Probabilidade)}
                  className="select select-bordered w-full"
                >
                  {Object.entries(PROBABILIDADE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-action justify-end">
              <button type="button" onClick={onClose} className="btn">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Risco
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RiscoModal;