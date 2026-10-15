'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Square,
  Diamond,
  CircleDot,
  ChevronsRight,
  FileText,
  ArrowRight,
  Database,
  Layers,
  Cloud,
  Box,
  StickyNote,
  AlertCircle,
  Heading,
  Spline,
  Circle,
  Pentagon,
  ChevronRight,
  GripHorizontal,
  Plus,
  Search,
  X,
  Sparkles,
  PackageOpen,
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
  ExternalLink,
} from 'lucide-react';
import { COMPONENT_LIBRARY } from '@/utils/thinklab/component-library';
import { GRAPHIC_ASSETS } from '@/utils/thinklab/graphic-assets';
import { PredefinedComponent, GraphicAsset } from '@/types/thinklab.types';

interface ComponentLibraryProps {
  isOpen: boolean;
  onToggle: () => void;
  onInsertComponent: (template: PredefinedComponent['template']) => void;
  onInsertAsset?: (elements: GraphicAsset['elements'], assetName: string) => void;
  onOpenGraphicAssetsModal?: () => void;
}

// Icon mapper helper
function renderIcon(iconName: string) {
  const iconProps = { className: 'w-4 h-4' };
  switch (iconName) {
    case 'Square':
      return <Square {...iconProps} />;
    case 'Diamond':
      return <Diamond {...iconProps} />;
    case 'CircleDot':
      return <CircleDot {...iconProps} />;
    case 'ChevronsRight':
      return <ChevronsRight {...iconProps} />;
    case 'FileText':
      return <FileText {...iconProps} />;
    case 'ArrowRight':
      return <ArrowRight {...iconProps} />;
    case 'Database':
      return <Database {...iconProps} />;
    case 'Layers':
      return <Layers {...iconProps} />;
    case 'Cloud':
      return <Cloud {...iconProps} />;
    case 'Box':
      return <Box {...iconProps} />;
    case 'StickyNote':
      return <StickyNote {...iconProps} />;
    case 'AlertCircle':
      return <AlertCircle {...iconProps} />;
    case 'Heading':
      return <Heading {...iconProps} />;
    case 'Spline':
      return <Spline {...iconProps} />;
    case 'Circle':
      return <Circle {...iconProps} />;
    case 'Pentagon':
      return <Pentagon {...iconProps} />;
    case 'LayoutTemplate':
      return <LayoutTemplate {...iconProps} />;
    case 'Smartphone':
      return <Smartphone {...iconProps} />;
    case 'Maximize2':
      return <Maximize2 {...iconProps} />;
    case 'Server':
      return <Server {...iconProps} />;
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />;
    case 'Boxes':
      return <Boxes {...iconProps} />;
    case 'Filter':
      return <Filter {...iconProps} />;
    case 'BarChart3':
      return <BarChart3 {...iconProps} />;
    case 'Trophy':
      return <Trophy {...iconProps} />;
    case 'MessageSquare':
      return <MessageSquare {...iconProps} />;
    case 'Kanban':
      return <Kanban {...iconProps} />;
    case 'AlertTriangle':
      return <AlertTriangle {...iconProps} />;
    case 'Code':
      return <Code {...iconProps} />;
    case 'Palette':
      return <Palette {...iconProps} />;
    case 'UserCheck':
      return <UserCheck {...iconProps} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...iconProps} />;
    case 'Star':
      return <Star {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
}

// Accent & diacritic remover for resilient Portuguese search
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function ComponentLibrary({
  isOpen,
  onToggle,
  onInsertComponent,
  onInsertAsset,
  onOpenGraphicAssetsModal,
}: ComponentLibraryProps) {
  const [libraryTab, setLibraryTab] = useState<'shapes' | 'graphics'>('shapes');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const shapeCategories = ['Todos', 'Fluxograma', 'Arquitetura', 'Anotações', 'Formas'];
  const graphicCategories = [
    'Todos',
    'UI & Wireframe',
    'Tecnologia & Cloud',
    'Negócios & Métricas',
    'Gestão & Kanban',
    'Pessoas & Personas',
    'Selos & Destaques',
  ];

  const currentCategories = libraryTab === 'shapes' ? shapeCategories : graphicCategories;

  const normalizedQuery = useMemo(() => normalizeText(searchQuery.trim()), [searchQuery]);

  // Filter shapes
  const filteredComponents = useMemo(() => {
    return COMPONENT_LIBRARY.filter((item) => {
      const matchesCategory =
        activeCategory === 'Todos' || item.category === activeCategory;

      if (!normalizedQuery) {
        return matchesCategory;
      }

      const nameMatch = normalizeText(item.name).includes(normalizedQuery);
      const descMatch = normalizeText(item.description).includes(normalizedQuery);
      const catMatch = normalizeText(item.category).includes(normalizedQuery);
      const typeMatch = normalizeText(item.template.type).includes(normalizedQuery);
      const tagMatch =
        item.tags &&
        item.tags.some((tag: string) => normalizeText(tag).includes(normalizedQuery));

      return matchesCategory && (nameMatch || descMatch || catMatch || typeMatch || tagMatch);
    });
  }, [activeCategory, normalizedQuery]);

  // Filter graphics
  const filteredGraphicAssets = useMemo(() => {
    return GRAPHIC_ASSETS.filter((item) => {
      const matchesCategory =
        activeCategory === 'Todos' || item.category === activeCategory;

      if (!normalizedQuery) {
        return matchesCategory;
      }

      const nameMatch = normalizeText(item.name).includes(normalizedQuery);
      const descMatch = normalizeText(item.description).includes(normalizedQuery);
      const catMatch = normalizeText(item.category).includes(normalizedQuery);
      const tagMatch =
        item.tags &&
        item.tags.some((tag: string) => normalizeText(tag).includes(normalizedQuery));

      return matchesCategory && (nameMatch || descMatch || catMatch || tagMatch);
    });
  }, [activeCategory, normalizedQuery]);

  const handleDragStartShape = (
    e: React.DragEvent<HTMLDivElement>,
    template: PredefinedComponent['template']
  ) => {
    e.dataTransfer.setData('application/json', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartAsset = (
    e: React.DragEvent<HTMLDivElement>,
    asset: GraphicAsset
  ) => {
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

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleTabChange = (newTab: 'shapes' | 'graphics') => {
    setLibraryTab(newTab);
    setActiveCategory('Todos');
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 right-3 sm:right-4 z-20 btn btn-sm btn-neutral shadow-lg gap-1.5 tooltip tooltip-left"
        data-tip="Biblioteca de Formas & Componentes"
        aria-label="Abrir biblioteca de componentes"
      >
        <Layers className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline text-xs font-semibold">Biblioteca</span>
      </button>
    );
  }

  const currentCount =
    libraryTab === 'shapes' ? filteredComponents.length : filteredGraphicAssets.length;

  return (
    <aside
      aria-label="Biblioteca de componentes e gráficos"
      className="fixed top-20 right-2 sm:right-4 z-20 w-[calc(100vw-1rem)] sm:w-80 max-h-[calc(100vh-6.5rem)] flex flex-col bg-base-100/95 backdrop-blur-md border border-base-300 rounded-2xl shadow-2xl overflow-hidden select-none text-xs"
    >
      {/* Header */}
      <div className="p-3 border-b border-base-200 flex items-center justify-between bg-base-200/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10 text-primary">
            {libraryTab === 'shapes' ? (
              <Layers className="w-4 h-4" />
            ) : (
              <PackageOpen className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-base-content/90">
              {libraryTab === 'shapes' ? 'Formas & Nós' : 'Gráficos Prontos'}
            </div>
            <div className="text-[10px] text-base-content/50">
              Arraste para o canvas ou clique no (+)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenGraphicAssetsModal && (
            <button
              onClick={onOpenGraphicAssetsModal}
              className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary tooltip tooltip-bottom"
              data-tip="Abrir Galeria em Tela Cheia"
              aria-label="Abrir Galeria de Gráficos"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
            title="Recolher painel"
            aria-label="Recolher painel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-3 pt-2.5 pb-1 flex gap-1">
        <button
          onClick={() => handleTabChange('shapes')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5 border ${
            libraryTab === 'shapes'
              ? 'bg-base-200 text-primary border-base-300 shadow-2xs'
              : 'text-base-content/60 hover:bg-base-200/40 border-transparent'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Formas</span>
          <span className="badge badge-xs badge-ghost font-mono">{COMPONENT_LIBRARY.length}</span>
        </button>

        <button
          onClick={() => handleTabChange('graphics')}
          className={`flex-1 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5 border ${
            libraryTab === 'graphics'
              ? 'bg-base-200 text-primary border-base-300 shadow-2xs'
              : 'text-base-content/60 hover:bg-base-200/40 border-transparent'
          }`}
        >
          <PackageOpen className="w-3.5 h-3.5" />
          <span>Gráficos</span>
          <span className="badge badge-xs badge-ghost font-mono">{GRAPHIC_ASSETS.length}</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="px-3 pt-1.5 pb-1.5">
        <div className="relative flex items-center w-full">
          <Search className="w-3.5 h-3.5 text-base-content/40 absolute left-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleClearSearch();
              }
            }}
            placeholder={
              libraryTab === 'shapes'
                ? 'Buscar formas, bancos, notas...'
                : 'Buscar wireframes, servidores, kanban...'
            }
            className="input input-xs input-bordered w-full pl-8 pr-7 rounded-xl text-xs bg-base-200/50 focus:bg-base-100 focus:border-primary placeholder:text-base-content/40 transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 text-base-content/50 hover:text-base-content p-0.5 rounded-full hover:bg-base-300 transition-colors"
              title="Limpar busca (Esc)"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-2 text-[10px] text-base-content/30 pointer-events-none font-mono">
              /
            </span>
          )}
        </div>

        {/* Counter and status */}
        <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-base-content/60">
          <span>
            {currentCount} {currentCount === 1 ? 'item' : 'itens'}{' '}
            {normalizedQuery && 'encontrados'}
          </span>
          {normalizedQuery && activeCategory !== 'Todos' && (
            <button
              onClick={() => setActiveCategory('Todos')}
              className="text-primary hover:underline font-medium"
            >
              Ver todas as categorias
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-1 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-base-200/60 pb-2">
        {currentCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-xs rounded-lg text-[11px] whitespace-nowrap px-2.5 transition-all ${
              activeCategory === cat
                ? 'btn-primary shadow-xs'
                : 'btn-ghost text-base-content/70 hover:bg-base-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-19rem)]">
        {libraryTab === 'shapes' ? (
          // SHAPES LIST
          filteredComponents.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
                <Search className="w-5 h-5" />
              </div>
              <div className="font-semibold text-xs text-base-content/80">
                Nenhum componente encontrado
              </div>
              <p className="text-[11px] text-base-content/50">
                Tente buscar termos como &quot;processo&quot;, &quot;decisão&quot;, &quot;banco&quot; ou &quot;post-it&quot;.
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="btn btn-xs btn-outline btn-primary mt-2"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            filteredComponents.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStartShape(e, item.template)}
                className="group p-2.5 rounded-xl border border-base-300 hover:border-primary/50 bg-base-200/40 hover:bg-base-200/80 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-base-300 shadow-2xs"
                    style={{
                      backgroundColor:
                        item.template.backgroundColor !== 'transparent'
                          ? item.template.backgroundColor
                          : '#f1f5f9',
                      color: item.template.strokeColor,
                    }}
                  >
                    {renderIcon(item.iconName)}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-base-content truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-base-content/60 truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onInsertComponent(item.template)}
                  className="btn btn-ghost btn-xs btn-circle opacity-80 group-hover:opacity-100 hover:bg-primary hover:text-primary-content transition-all shrink-0"
                  title="Inserir no centro do canvas"
                  aria-label={`Inserir ${item.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )
        ) : (
          // GRAPHIC ASSETS LIST
          filteredGraphicAssets.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
                <Search className="w-5 h-5" />
              </div>
              <div className="font-semibold text-xs text-base-content/80">
                Nenhum gráfico encontrado
              </div>
              <p className="text-[11px] text-base-content/50">
                Tente buscar &quot;wireframe&quot;, &quot;servidor&quot;, &quot;kanban&quot; ou &quot;troféu&quot;.
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="btn btn-xs btn-outline btn-primary mt-2"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            filteredGraphicAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStartAsset(e, asset)}
                className="group p-2.5 rounded-xl border border-base-300 hover:border-primary/50 bg-base-200/40 hover:bg-base-200/80 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-base-300 bg-base-100 text-primary shadow-2xs">
                    {renderIcon(asset.iconName)}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-base-content truncate group-hover:text-primary transition-colors">
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-base-content/60 truncate">
                      {asset.description}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onInsertAsset) {
                      onInsertAsset(asset.elements, asset.name);
                    }
                  }}
                  className="btn btn-ghost btn-xs btn-circle opacity-80 group-hover:opacity-100 hover:bg-primary hover:text-primary-content transition-all shrink-0"
                  title="Inserir no centro do canvas"
                  aria-label={`Inserir ${asset.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )
        )}
      </div>

      {/* Footer Helper */}
      <div className="p-2.5 bg-base-200/40 border-t border-base-200 flex items-center justify-between text-[10px] text-base-content/60">
        <div className="flex items-center gap-1">
          <GripHorizontal className="w-3 h-3 text-base-content/40" />
          <span>Arrastar para o canvas ativo</span>
        </div>
        {onOpenGraphicAssetsModal && (
          <button
            onClick={onOpenGraphicAssetsModal}
            className="text-primary hover:underline font-semibold text-[10px]"
          >
            Galeria Completa →
          </button>
        )}
      </div>
    </aside>
  );
}
