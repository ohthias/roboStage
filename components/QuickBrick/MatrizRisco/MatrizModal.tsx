"use client";
import React, { useState, useEffect, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Focus trapping for accessibility
  useEffect(() => {
    if (isOpen) {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) { // Shift+Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };
        
        // Set initial focus on the first element (usually the title input)
        firstElement.focus();
        
        window.addEventListener('keydown', handleTabKey);
        return () => {
            window.removeEventListener('keydown', handleTabKey);
        };
    }
  }, [isOpen]);


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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-base-100 rounded-lg shadow-xl p-6 w-full max-w-lg relative" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
         <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
        <h2 id="modal-title" className="text-2xl font-bold mb-4 text-base-content">{riscoToEdit ? 'Editar Risco' : 'Adicionar Novo Risco'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-sm font-medium text-base-content/85 mb-1">Título</label>
            <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input w-full" required />
          </div>
          <div className="mb-4">
            <label htmlFor="descricao" className="block text-sm font-medium text-base-content/85 mb-1">Descrição</label>
            <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="textarea w-full"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <div>
              <label htmlFor="impacto" className="block text-sm font-medium text-base-content/85 mb-1">Impacto</label>
              <select id="impacto" value={impacto} onChange={(e) => setImpacto(Number(e.target.value) as Impacto)} className="select">
                {Object.entries(IMPACTO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="probabilidade" className="block text-sm font-medium text-base-content/85 mb-1">Probabilidade</label>
              <select id="probabilidade" value={probabilidade} onChange={(e) => setProbabilidade(Number(e.target.value) as Probabilidade)} className="select">
              {Object.entries(PROBABILIDADE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar Risco</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiscoModal;