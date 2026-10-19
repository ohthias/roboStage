'use client';

import React, { useState, useMemo } from 'react';
import {
  PackageOpen,
  Search,
  X,
  Plus,
  GripHorizontal,
  LayoutTemplate,
  Smartphone,
  Maximize2,
  Server,
  ShieldCheck,
  Boxes,
  Filter,
  BarChart3,
  Trophy,
  MessageSquare,
  Kanban,
  AlertTriangle,
  Code,
  Palette,
  UserCheck,
  CheckCircle2,
  Star,
  Sparkles,
} from 'lucide-react';
import { GRAPHIC_ASSETS } from '@/utils/thinklab/graphic-assets';
import { GraphicAsset } from '@/types/thinklab.types';

interface GraphicAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertAsset: (elements: GraphicAsset['elements'], assetName: string) => void;
}

function renderIcon(iconName: string) {
  const p = { className: 'w-4 h-4' };
  switch (iconName) {
    case 'LayoutTemplate':
      return <LayoutTemplate {...p} />;
    case 'Smartphone':
      return <Smartphone {...p} />;
    case 'Maximize2':
      return <Maximize2 {...p} />;
    case 'Search':
      return <Search {...p} />;
    case 'Server':
      return <Server {...p} />;
    case 'ShieldCheck':
      return <ShieldCheck {...p} />;
    case 'Boxes':
      return <Boxes {...p} />;
    case 'Filter':
      return <Filter {...p} />;
    case 'BarChart3':
      return <BarChart3 {...p} />;
    case 'Trophy':
      return <Trophy {...p} />;
    case 'MessageSquare':
      return <MessageSquare {...p} />;
    case 'Kanban':
      return <Kanban {...p} />;
    case 'AlertTriangle':
      return <AlertTriangle {...p} />;
    case 'Code':
      return <Code {...p} />;
    case 'Palette':
      return <Palette {...p} />;
    case 'UserCheck':
      return <UserCheck {...p} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...p} />;
    case 'Star':
      return <Star {...p} />;
    default:
      return <Sparkles {...p} />;
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function GraphicAssetsModal({
  isOpen,
  onClose,
  onInsertAsset,
}: GraphicAssetsModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'Todos',
    'UI & Wireframe',
    'Tecnologia & Cloud',
    'Negócios & Métricas',
    'Gestão & Kanban',
    'Pessoas & Personas',
    'Selos & Destaques',
  ];

  const filteredAssets = useMemo(() => {
    const q = normalize(searchQuery.trim());
    return GRAPHIC_ASSETS.filter((item) => {
      const matchCat = activeCategory === 'Todos' || item.category === activeCategory;
      if (!q) return matchCat;

      const nameMatch = normalize(item.name).includes(q);
      const descMatch = normalize(item.description).includes(q);
      const catMatch = normalize(item.category).includes(q);
      const tagMatch = item.tags && item.tags.some((t : string) => normalize(t).includes(q));

      return matchCat && (nameMatch || descMatch || catMatch || tagMatch);
    });
  }, [activeCategory, searchQuery]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, asset: GraphicAsset) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        isGraphicAsset: true,
        name: asset.name,
        elements: asset.elements,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-5xl bg-base-100 border border-base-300 shadow-2xl p-6 rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                Biblioteca de Elementos Gráficos Prontos
                <span className="badge badge-primary badge-sm font-semibold">Uso Livre</span>
              </h3>
              <p className="text-xs text-base-content/70 mt-0.5">
                Ilustrações, mockups de UI, ícones de cloud, personas e gráficos sketch prontos para arrastar ou inserir no canvas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Fechar modal de elementos gráficos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="py-3 border-b border-base-200/70 space-y-2.5 shrink-0">
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-base-content/40 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por wireframe, navegador, servidor, kanban, troféu, persona..."
              className="input input-sm input-bordered w-full pl-9 pr-8 rounded-xl text-xs bg-base-200/40 focus:bg-base-100 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-base-content/40 hover:text-base-content"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-xs rounded-lg text-xs whitespace-nowrap px-3 ${
                  activeCategory === cat
                    ? 'btn-primary shadow-xs'
                    : 'btn-ghost border border-base-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
                <Search className="w-6 h-6" />
              </div>
              <div className="font-semibold text-sm text-base-content/80">
                Nenhum elemento gráfico encontrado
              </div>
              <p className="text-xs text-base-content/50 max-w-sm mx-auto">
                Tente buscar por termos genéricos como &quot;janela&quot;, &quot;nuvem&quot;, &quot;gráfico&quot;, &quot;dev&quot; ou altere a categoria selecionada.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-xs btn-outline btn-primary mt-2"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, asset)}
                  className="group relative p-3.5 rounded-2xl border border-base-300 hover:border-primary/60 bg-base-200/30 hover:bg-base-200/70 transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between shadow-2xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-base-100 border border-base-300 text-primary shadow-2xs">
                          {renderIcon(asset.iconName)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-base-content group-hover:text-primary transition-colors">
                            {asset.name}
                          </div>
                          <span className="text-[10px] text-base-content/50">
                            {asset.category}
                          </span>
                        </div>
                      </div>
                      <span className="badge badge-ghost badge-xs font-mono text-[9px]">
                        {asset.elements.length} {asset.elements.length === 1 ? 'parte' : 'partes'}
                      </span>
                    </div>

                    <p className="text-[11px] text-base-content/70 line-clamp-2">
                      {asset.description}
                    </p>

                    {asset.tags && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {asset.tags.slice(0, 3).map((tag : string) => (
                          <span
                            key={tag}
                            className="text-[9px] bg-base-300/60 text-base-content/60 px-1.5 py-0.5 rounded font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-base-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-base-content/50">
                      <GripHorizontal className="w-3 h-3" />
                      <span>Arraste para o canvas</span>
                    </div>

                    <button
                      onClick={() => onInsertAsset(asset.elements, asset.name)}
                      className="btn btn-xs btn-primary gap-1 shadow-xs"
                      title="Inserir no centro do canvas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Inserir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action mt-2 pt-2 border-t border-base-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-base-content/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Todos os elementos são vetores agrupados e 100% editáveis no estilo Excalidraw.</span>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
