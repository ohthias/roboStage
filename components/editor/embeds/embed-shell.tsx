"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { EMBED_LABELS, type EmbedKind } from "./embed-types";

/**
 * Moldura comum dos blocos embed: cabeçalho com tipo do item, atalhos
 * (atualizar / abrir / remover) e estados de carregamento e indisponível.
 * Os atalhos usam `no-print`: ficam fora do PDF exportado.
 */
export function EmbedShell({
  kind,
  icon: Icon,
  href,
  loading,
  error,
  fallbackLabel,
  onRefresh,
  onRemove,
  toolbar,
  children,
}: {
  kind: EmbedKind;
  icon: LucideIcon;
  href?: string;
  loading: boolean;
  error: string | null;
  /** Título guardado no documento — mostrado se o item foi excluído. */
  fallbackLabel?: string;
  onRefresh: () => void;
  onRemove: () => void;
  toolbar?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className="editor-embed-card overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
      contentEditable={false}
      data-embed={kind}
    >
      <div className="flex items-center gap-2 border-b border-base-200 bg-base-200/40 px-3 py-1.5 text-xs text-base-content/55">
        <Icon size={13} className="shrink-0" />
        <span className="font-medium uppercase tracking-wide">{EMBED_LABELS[kind]}</span>
        {loading && <Loader2 size={12} className="animate-spin" />}
        <span className="flex-1" />
        <div className="no-print flex items-center gap-0.5">
          {toolbar}
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            title="Atualizar dados"
            aria-label="Atualizar dados"
            onClick={onRefresh}
          >
            <RefreshCw size={13} />
          </button>
          {href && (
            <Link
              href={href}
              className="btn btn-ghost btn-xs btn-square"
              title="Abrir no módulo"
              aria-label="Abrir no módulo"
            >
              <ExternalLink size={13} />
            </Link>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square hover:text-error"
            title="Remover bloco"
            aria-label="Remover bloco"
            onClick={onRemove}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
          <div className="min-w-0">
            <p className="truncate font-medium">{fallbackLabel || "Item indisponível"}</p>
            <p className="text-xs text-base-content/55">
              Não foi possível carregar este item — ele pode ter sido excluído ou
              pertencer a outro espaço. ({error})
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function EmbedSkeleton({ height = "h-24" }: { height?: string }) {
  return <div className={`${height} animate-pulse bg-base-200/50`} />;
}
