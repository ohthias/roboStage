'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ChevronDown,
  GripVertical,
  Search,
  X,
  Sparkles,
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
  Workflow,
  Shapes,
  Users,
  Award,
} from 'lucide-react';
import { COMPONENT_LIBRARY } from '@/utils/thinklab/component-library';
import { GRAPHIC_ASSETS } from '@/utils/thinklab/graphic-assets';
import { ICON_CATEGORIES, IconEntry } from '@/utils/thinklab/icon-library';
import { EMOJI_CATEGORIES, EmojiEntry, EMOJI_FONT_STACK } from '@/utils/thinklab/emoji-library';
import { PredefinedComponent, GraphicAsset } from '@/types/thinklab.types';
import { IconBubble, cn } from './editor-ui';

interface ComponentLibraryProps {
  onInsertComponent: (template: PredefinedComponent['template']) => void;
  onInsertAsset?: (elements: GraphicAsset['elements'], assetName: string) => void;
  /** Muda de valor para pedir foco no campo de busca (atalho "/"). */
  focusSearchSignal?: number;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

export function renderLibraryIcon(iconName: string, className = 'size-4') {
  const Icon = ICONS[iconName] ?? Sparkles;
  return <Icon className={className} />;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Fluxograma: Workflow,
  Arquitetura: Server,
  Anotações: StickyNote,
  Formas: Shapes,
  'UI & Wireframe': LayoutTemplate,
  'Tecnologia & Cloud': Cloud,
  'Negócios & Métricas': BarChart3,
  'Gestão & Kanban': Kanban,
  'Pessoas & Personas': Users,
  'Selos & Destaques': Award,
};

const SHAPE_CATEGORIES: PredefinedComponent['category'][] = ['Fluxograma', 'Arquitetura', 'Anotações', 'Formas'];
const GRAPHIC_CATEGORIES: GraphicAsset['category'][] = [
  'UI & Wireframe',
  'Tecnologia & Cloud',
  'Negócios & Métricas',
  'Gestão & Kanban',
  'Pessoas & Personas',
  'Selos & Destaques',
];

// Remove acentos para uma busca tolerante em português
function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function matches(
  item: { name: string; description: string; category: string; tags?: string[] },
  query: string,
  extra?: string,
) {
  if (!query) return true;
  return [item.name, item.description, item.category, extra ?? '', ...(item.tags ?? [])].some((s) =>
    normalizeText(s).includes(query),
  );
}

type LibraryItem =
  | { kind: 'shape'; id: string; name: string; description: string; iconName: string; data: PredefinedComponent }
  | { kind: 'asset'; id: string; name: string; description: string; iconName: string; data: GraphicAsset }
  | { kind: 'icon'; id: string; name: string; description: string; iconName: string; data: IconEntry }
  | { kind: 'emoji'; id: string; name: string; description: string; iconName: string; data: EmojiEntry };

interface Section {
  key: string;
  title: string;
  items: LibraryItem[];
  layout?: 'list' | 'grid';
  icon?: React.ReactNode;
}

const MEDIA_BASE = {
  backgroundColor: 'transparent',
  fillStyle: 'none' as const,
  strokeStyle: 'solid' as const,
  roughness: 0,
  opacity: 1,
};

/** Template de inserção para um ícone ou emoji do catálogo. */
function mediaTemplate(item: LibraryItem): PredefinedComponent['template'] | null {
  if (item.kind === 'icon') {
    return {
      ...MEDIA_BASE,
      type: 'icon',
      iconName: item.data.key,
      width: 56,
      height: 56,
      strokeColor: '#1e293b',
      strokeWidth: 2,
    };
  }
  if (item.kind === 'emoji') {
    return {
      ...MEDIA_BASE,
      type: 'emoji',
      emoji: item.data.char,
      width: 64,
      height: 64,
      strokeColor: '#1e293b',
      strokeWidth: 1,
    };
  }
  return null;
}

/**
 * Conteúdo da aba "Design": seções recolhíveis por categoria, cada item como
 * uma linha "ícone + nome + alça de arraste". Clique insere no centro do canvas;
 * arrastar solta na posição do cursor.
 */
export function ComponentLibrary({ onInsertComponent, onInsertAsset, focusSearchSignal }: ComponentLibraryProps) {
  const [query, setQuery] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(['shape:Fluxograma']));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSearchSignal) searchRef.current?.focus();
  }, [focusSearchSignal]);

  const normalizedQuery = useMemo(() => normalizeText(query.trim()), [query]);

  const groups = useMemo(() => {
    const shapeSections: Section[] = SHAPE_CATEGORIES.map((cat) => ({
      key: `shape:${cat}`,
      title: cat,
      items: COMPONENT_LIBRARY.filter(
        (c) => c.category === cat && matches(c, normalizedQuery, normalizeText(c.template.type)),
      ).map((c) => ({
        kind: 'shape' as const,
        id: c.id,
        name: c.name,
        description: c.description,
        iconName: c.iconName,
        data: c,
      })),
    }));
    const assetSections: Section[] = GRAPHIC_CATEGORIES.map((cat) => ({
      key: `asset:${cat}`,
      title: cat,
      items: GRAPHIC_ASSETS.filter((a) => a.category === cat && matches(a, normalizedQuery)).map((a) => ({
        kind: 'asset' as const,
        id: a.id,
        name: a.name,
        description: a.description,
        iconName: a.iconName,
        data: a,
      })),
    }));
    const iconSections: Section[] = ICON_CATEGORIES.map((cat) => {
      const FirstIcon = cat.icons[0].Icon;
      return {
        key: `icon:${cat.title}`,
        title: cat.title,
        layout: 'grid' as const,
        icon: <FirstIcon className="size-4 text-base-content/70" />,
        items: cat.icons
          .filter((i) =>
            matches({ name: i.label, description: i.key, category: cat.title, tags: i.tags }, normalizedQuery),
          )
          .map((i) => ({
            kind: 'icon' as const,
            id: `icon-${i.key}`,
            name: i.label,
            description: 'Ícone',
            iconName: i.key,
            data: i,
          })),
      };
    });
    const emojiSections: Section[] = EMOJI_CATEGORIES.map((cat) => ({
      key: `emoji:${cat.title}`,
      title: cat.title,
      layout: 'grid' as const,
      icon: <span className="text-base leading-none">{cat.emojis[0].char}</span>,
      items: cat.emojis
        .filter((e) => matches({ name: e.label, description: '', category: cat.title }, normalizedQuery))
        .map((e) => ({
          kind: 'emoji' as const,
          id: `emoji-${e.char}`,
          name: e.label,
          description: 'Emoji',
          iconName: '',
          data: e,
        })),
    }));
    return [
      { label: 'Formas & nós', sections: shapeSections },
      { label: 'Ícones', sections: iconSections },
      { label: 'Emojis', sections: emojiSections },
      { label: 'Gráficos prontos', sections: assetSections },
    ];
  }, [normalizedQuery]);

  const totalResults = groups.reduce((n, g) => n + g.sections.reduce((m, s) => m + s.items.length, 0), 0);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const insert = (item: LibraryItem) => {
    const media = mediaTemplate(item);
    if (media) onInsertComponent(media);
    else if (item.kind === 'shape') onInsertComponent(item.data.template);
    else if (item.kind === 'asset') onInsertAsset?.(item.data.elements, item.data.name);
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>, item: LibraryItem) => {
    const payload =
      mediaTemplate(item) ??
      (item.kind === 'shape'
        ? item.data.template
        : item.kind === 'asset'
          ? { isGraphicAsset: true, name: item.data.name, elements: item.data.elements }
          : null);
    if (!payload) return;
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Busca */}
      <div className="px-4 pt-4 pb-2">
        <label className="input input-sm w-full bg-base-200 border-transparent shadow-none focus-within:border-primary/60 focus-within:outline-none">
          <Search className="size-3.5 opacity-50" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
            placeholder="Buscar componentes"
            className="grow"
            aria-label="Buscar componentes e gráficos"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="opacity-50 hover:opacity-100" aria-label="Limpar busca">
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="kbd kbd-xs">/</kbd>
          )}
        </label>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        {totalResults === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium">Nada encontrado</p>
            <p className="text-xs text-base-content/55 mt-1">
              Tente &quot;decisão&quot;, &quot;banco&quot;, &quot;kanban&quot; ou &quot;post-it&quot;.
            </p>
          </div>
        )}

        {groups.map((group) => {
          const visible = group.sections.filter((s) => s.items.length > 0);
          if (visible.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-base-content/40">
                {group.label}
              </p>
              {visible.map((section) => {
                const open = normalizedQuery ? true : openSections.has(section.key);
                const CategoryIcon = CATEGORY_ICONS[section.title] ?? Sparkles;
                const sectionIcon = section.icon ?? <CategoryIcon className="size-4 text-base-content/70" />;
                return (
                  <div
                    key={section.key}
                    className={cn(
                      'collapse rounded-none border-b border-base-300/70',
                      open ? 'collapse-open' : 'collapse-close',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      aria-expanded={open}
                      className="collapse-title min-h-0 px-4 py-3.5 flex items-center gap-2.5 text-[15px] font-medium text-left"
                    >
                      <span className="size-4 grid place-items-center">{sectionIcon}</span>
                      <span className="flex-1 truncate">{section.title}</span>
                      <span className="text-xs text-base-content/40 tabular-nums">{section.items.length}</span>
                      <ChevronDown
                        className={cn(
                          'size-4 transition-transform',
                          open ? 'rotate-180 text-primary' : 'text-base-content/60',
                        )}
                      />
                    </button>

                    <div className="collapse-content px-2 pb-2!">
                      {section.layout === 'grid' ? (
                        <ul className="grid grid-cols-6 gap-1 px-1">
                          {section.items.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onClick={() => insert(item)}
                                title={`${item.name} — clique para inserir ou arraste para o canvas`}
                                aria-label={`Inserir ${item.description.toLowerCase()} ${item.name}`}
                                className="aspect-square w-full rounded-field grid place-items-center hover:bg-base-200 cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-primary"
                              >
                                {item.kind === 'emoji' ? (
                                  <span className="text-[22px] leading-none" style={{ fontFamily: EMOJI_FONT_STACK }}>
                                    {item.data.char}
                                  </span>
                                ) : item.kind === 'icon' ? (
                                  <item.data.Icon className="size-5" />
                                ) : null}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-0.5">
                          {section.items.map((item) => (
                            <li key={item.id}>
                              <div
                                role="button"
                                tabIndex={0}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onClick={() => insert(item)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    insert(item);
                                  }
                                }}
                                title={`${item.description} — clique para inserir ou arraste para o canvas`}
                                className="group flex items-center gap-3 rounded-field px-2 py-1.5 cursor-grab active:cursor-grabbing hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary"
                              >
                                <IconBubble className="group-hover:bg-base-100">
                                  {renderLibraryIcon(item.iconName)}
                                </IconBubble>
                                <span className="flex-1 min-w-0 truncate text-sm">{item.name}</span>
                                <GripVertical className="size-4 text-base-content/30 group-hover:text-base-content/60" />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
