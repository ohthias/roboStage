'use client';

import React, { useState } from 'react';
import { LayoutTemplate, Plus, ArrowRight, X } from 'lucide-react';
import { DIAGRAM_TEMPLATES } from '@/utils/thinklab/templates';
import { CanvasElement } from '@/types/thinklab.types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (elements: CanvasElement[], mode: 'replace' | 'append') => void;
}

export function TemplatesModal({
  isOpen,
  onClose,
  onLoadTemplate,
}: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  if (!isOpen) return null;

  const categories = [
    'Todos',
    'Gestão & Qualidade',
    'Design Thinking & UX',
    'Fluxograma',
    'Arquitetura',
  ];

  const filteredTemplates = DIAGRAM_TEMPLATES.filter(
    (t) => selectedCategory === 'Todos' || t.category === selectedCategory
  );

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-3xl bg-base-100 border border-base-300 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-base-200">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              Modelos Prontos de Diagramas
            </h3>
            <p className="text-xs text-base-content/70 mt-0.5">
              Ishikawa (Espinha de Peixe), 5W2H, Mapa de Empatia, Fluxogramas e Arquiteturas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 pt-3 pb-1 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-xs rounded-md text-xs whitespace-nowrap ${
                selectedCategory === cat ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template cards list */}
        <div className="grid grid-cols-1 gap-3.5 my-3 max-h-[58vh] overflow-y-auto pr-1">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-4 rounded-xl border border-base-300 hover:border-primary/50 transition-all bg-base-200/40 hover:bg-base-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-base-content/60">
                  <span className="font-semibold text-primary">{tmpl.category}</span>
                  <span>·</span>
                  <span>{tmpl.elements.length} elementos</span>
                </div>
                <h4 className="font-bold text-sm text-base-content">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-base-content/70 max-w-lg">
                  {tmpl.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    onLoadTemplate(tmpl.elements, 'append');
                    onClose();
                  }}
                  className="btn btn-xs btn-outline gap-1"
                  title="Adiciona os elementos mantendo o que você já desenhou"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar</span>
                </button>
                <button
                  onClick={() => {
                    onLoadTemplate(tmpl.elements, 'replace');
                    onClose();
                  }}
                  className="btn btn-xs btn-primary gap-1"
                  title="Substitui todo o canvas por este modelo"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Substituir</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-action mt-2">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Cancelar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
