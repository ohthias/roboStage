'use client';

import React from 'react';
import { HelpCircle, X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const SHORTCUT_GROUPS = [
    {
      title: 'Ferramentas de Criação',
      shortcuts: [
        { key: '1 ou V', desc: 'Ferramenta de Seleção / Mover' },
        { key: '2 ou R', desc: 'Retângulo / Processo' },
        { key: '3 ou D', desc: 'Losango / Decisão' },
        { key: '4 ou C', desc: 'Início / Fim (Terminator)' },
        { key: '5 ou B', desc: 'Banco de Dados (Cilindro)' },
        { key: '6 ou P', desc: 'Entrada / Saída (Paralelogramo)' },
        { key: '7 ou E', desc: 'Círculo / Elipse' },
        { key: '8 ou A', desc: 'Seta de Fluxo' },
        { key: '9 ou L', desc: 'Linha Reta' },
        { key: 'B', desc: 'Curva Bézier Avançada' },
        { key: 'M', desc: 'Polígono / Caminho Editável' },
        { key: 'P', desc: 'Caneta Livre (Freedraw)' },
        { key: 'T ou 0', desc: 'Inserir Texto Livre' },
        { key: 'E', desc: 'Borracha (Apagar)' },
      ],
    },
    {
      title: 'Navegação no Canvas',
      shortcuts: [
        { key: 'Espaço + Arrastar', desc: 'Mover pelo canvas (Pan)' },
        { key: 'Scroll do mouse', desc: 'Rolar pelo canvas' },
        { key: 'Ctrl + Scroll', desc: 'Aumentar / Diminuir Zoom' },
        { key: '+ ou -', desc: 'Zoom in / Zoom out' },
      ],
    },
    {
      title: 'Edição & Manipulação',
      shortcuts: [
        { key: 'Segurar Alt ao arrastar', desc: 'Desativar Snap (guias inteligentes)' },
        { key: 'Ctrl + E', desc: 'Exportar (SVG, PNG, PDF)' },
        { key: 'Arraste da Biblioteca', desc: 'Inserir componentes e gráficos' },
        { key: 'Arrastar Pontos (Roxo/Amarelo)', desc: 'Ajustar curvatura da Bézier' },
        { key: 'Arrastar Vértices (Índigo)', desc: 'Remodelar polígonos e caminhos' },
        { key: 'Ctrl + G', desc: 'Agrupar elementos selecionados' },
        { key: 'Ctrl + Shift + G', desc: 'Desagrupar elementos' },
        { key: 'Shift + Clique', desc: 'Seleção múltipla de itens' },
        { key: 'Duplo Clique', desc: 'Editar texto direto na forma' },
        { key: 'Delete / Backspace', desc: 'Excluir elemento(s) selecionado(s)' },
        { key: 'Ctrl + D', desc: 'Duplicar elemento(s) ou grupo' },
        { key: 'Ctrl + Z', desc: 'Desfazer ação anterior' },
        { key: 'Ctrl + Y / Ctrl+Shift+Z', desc: 'Refazer ação' },
        { key: 'Arrastar área vazia', desc: 'Seleção em caixa (múltiplos itens)' },
      ],
    },
  ];

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-base-200">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              Atalhos de Teclado & Dicas de Uso
            </h3>
            <p className="text-xs text-base-content/70 mt-0.5">
              Produtividade rápida para diagramar e desenhar fluxogramas.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 max-h-[60vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="bg-base-200/50 rounded-xl p-3.5 border border-base-300">
              <h4 className="font-bold text-xs uppercase text-primary tracking-wider mb-2.5">
                {group.title}
              </h4>
              <div className="space-y-2 text-xs">
                {group.shortcuts.map((s) => (
                  <div key={s.key} className="flex items-center justify-between gap-2">
                    <span className="text-base-content/75">{s.desc}</span>
                    <kbd className="kbd kbd-xs font-mono font-semibold shrink-0 bg-base-100 border-base-300">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-action mt-2">
          <button onClick={onClose} className="btn btn-sm btn-primary">
            Entendido
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
