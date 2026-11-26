'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Download,
  LayoutTemplate,
  Trash2,
  Keyboard,
  PackageOpen,
  Database,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Check,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { cn } from './editor-ui';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface NavbarProps {
  /** Nome do ThinkLab exibido no breadcrumb. */
  title?: string;
  /** Destino do botão "Voltar". */
  backHref?: string;
  /** Slot central (ferramentas do canvas). */
  children?: React.ReactNode;

  saveStatus: SaveStatus;
  onSave: () => void;
  onOpenExport: () => void;
  onOpenTemplates: () => void;
  onOpenShortcuts: () => void;
  onOpenDatabase?: () => void;
  onOpenGraphicAssets?: () => void;
  onClearCanvas: () => void;
  elementCount: number;

  isLibraryOpen: boolean;
  onToggleLibrary: () => void;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="hidden md:flex items-center gap-1.5 text-xs text-base-content/50">
        <Loader2 className="size-3.5 animate-spin" /> Salvando…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="hidden md:flex items-center gap-1.5 text-xs text-error">
        <AlertCircle className="size-3.5" /> Não salvo
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="hidden md:flex items-center gap-1.5 text-xs text-base-content/50">
        <Check className="size-3.5" /> Salvo
      </span>
    );
  }
  return null;
}

export function Navbar({
  title,
  backHref = '/dashboard/thinklab',
  children,
  saveStatus,
  onSave,
  onOpenExport,
  onOpenTemplates,
  onOpenShortcuts,
  onOpenDatabase,
  onOpenGraphicAssets,
  onClearCanvas,
  elementCount,
  isLibraryOpen,
  onToggleLibrary,
  isInspectorOpen,
  onToggleInspector,
}: NavbarProps) {
  return (
    <header className="shrink-0 px-3 sm:px-4 py-2 lg:py-0 lg:h-16 border-b border-base-300 bg-base-100 grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-2 z-30 select-none">
      {/* Esquerda: voltar + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href={backHref} className="btn btn-sm btn-outline border-base-300 gap-1 font-normal shrink-0">
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-base-content/45 shrink-0">ThinkLab /</span>
          <span className="font-medium truncate">{title || 'Sem título'}</span>
        </div>

        {/* Alternadores dos painéis em telas menores */}
        <div className="flex lg:hidden items-center gap-1 ml-auto">
          <button
            onClick={onToggleLibrary}
            className={cn('btn btn-sm btn-square btn-ghost', isLibraryOpen && 'bg-primary/10 text-primary')}
            aria-label="Alternar painel de componentes"
            aria-pressed={isLibraryOpen}
          >
            <PanelLeft className="size-4" />
          </button>
        </div>
      </div>

      {/* Centro: ferramentas */}
      <div className="col-span-2 row-start-2 lg:col-span-1 lg:row-start-1 lg:col-start-2 min-w-0 flex justify-start lg:justify-center overflow-x-auto [scrollbar-width:none]">
        {children}
      </div>

      {/* Direita: ações */}
      <div className="flex items-center justify-end gap-2 lg:col-start-3">
        <SaveIndicator status={saveStatus} />

        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-sm btn-square btn-ghost"
            aria-label="Mais ações"
          >
            <MoreHorizontal className="size-4" />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-sm z-40 mt-2 w-60 rounded-box border border-base-300 bg-base-100 p-1.5 shadow-lg"
          >
            <li>
              <button onClick={onOpenTemplates}>
                <LayoutTemplate className="size-4" /> Modelos prontos
              </button>
            </li>
            {onOpenGraphicAssets && (
              <li>
                <button onClick={onOpenGraphicAssets}>
                  <PackageOpen className="size-4" /> Galeria de gráficos
                </button>
              </li>
            )}
            <li>
              <button onClick={onOpenShortcuts}>
                <Keyboard className="size-4" /> Atalhos do teclado
              </button>
            </li>
            <li className="menu-title px-0 py-1">
              <div className="h-px bg-base-300" />
            </li>
            <li className={cn(elementCount === 0 && 'menu-disabled')}>
              <button onClick={onClearCanvas} disabled={elementCount === 0} className="text-error">
                <Trash2 className="size-4" /> Limpar canvas
              </button>
            </li>
          </ul>
        </div>

        <button
          onClick={onToggleInspector}
          className={cn('btn btn-sm btn-square btn-ghost lg:hidden', isInspectorOpen && 'bg-primary/10 text-primary')}
          aria-label="Alternar painel de propriedades"
          aria-pressed={isInspectorOpen}
        >
          <PanelRight className="size-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="btn btn-sm btn-outline border-base-300 font-normal"
          title="Exportar em SVG, PNG, PDF ou JSON (Ctrl+E)"
        >
          <Download className="size-4 sm:hidden" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        <button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="btn btn-sm btn-primary font-normal"
          title="Salvar agora (Ctrl+S)"
        >
          <Save className="size-4 sm:hidden" />
          <span className="hidden sm:inline">Salvar</span>
        </button>
      </div>
    </header>
  );
}
