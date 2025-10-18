import React, { useEffect, useRef } from 'react';
import { Risco } from '@/types/MatrizRisco';
import { IMPACTO_LABELS, PROBABILIDADE_LABELS, getRiskColor } from '@/app/(public)/quickbrick/matriz-de-risco/constants';

interface RiscoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  risco: Risco | null;
}

const RiscoDetalhesModal: React.FC<RiscoDetalhesModalProps> = ({ isOpen, onClose, risco }) => {
  const modalRef = useRef<HTMLDivElement>(null);

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
        
        // Set initial focus on the close button
        firstElement.focus();
        
        window.addEventListener('keydown', handleTabKey);
        return () => {
            window.removeEventListener('keydown', handleTabKey);
        };
    }
  }, [isOpen]);


  if (!isOpen || !risco) return null;

  const riskColor = getRiskColor(risco.impacto, risco.probabilidade);

  return (
    <div className="modal modal-open inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={modalRef}
        className={`modal-box relative w-full max-w-lg border-t-8 bg-base-300 ${riskColor}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="btn btn-ghost btn-sm btn-circle absolute right-2 top-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="details-modal-title" className="text-2xl font-bold text-base-content mb-2">{risco.titulo}</h2>
        <p className="text-base text-base-content mb-4">{risco.descricao || 'Nenhuma descrição fornecida.'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="p-3 rounded-md bg-base-200">
            <span className="text-sm text-base-content block">IMPACTO</span>
            <span className="font-bold text-lg text-base-content">{IMPACTO_LABELS[risco.impacto]}</span>
          </div>
          <div className="p-3 rounded-md bg-base-200">
            <span className="text-sm text-base-content block">PROBABILIDADE</span>
            <span className="font-bold text-lg text-base-content">{PROBABILIDADE_LABELS[risco.probabilidade]}</span>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn btn-primary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiscoDetalhesModal;