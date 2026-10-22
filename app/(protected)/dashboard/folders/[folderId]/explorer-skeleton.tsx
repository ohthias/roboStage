"use client";

import { useEffect, useState } from "react";
import {
  PAGE_SIZE,
  VIEW_STORAGE_KEY,
  type ViewMode,
} from "./explorer-types";

function useStoredView(): ViewMode {
  const [view, setView] = useState<ViewMode>("grid");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {
      /* localStorage indisponível: mantém grade */
    }
  }, []);
  return view;
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex min-h-[96px] animate-pulse items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4"
        >
          <div className="h-12 w-12 shrink-0 rounded-xl bg-base-200" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-3.5 w-3/4 rounded bg-base-200" />
            <div className="h-3 w-1/3 rounded bg-base-200" />
            <div className="flex gap-1.5">
              <div className="h-4 w-12 rounded-full bg-base-200" />
              <div className="h-4 w-10 rounded-full bg-base-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ count }: { count: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div className="hidden border-b border-base-300 bg-base-200/40 px-4 py-3 md:grid md:grid-cols-[minmax(0,2fr)_110px_minmax(0,1.2fr)_120px] md:gap-4">
        {[40, 24, 28, 36].map((w, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-base-200"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="grid animate-pulse grid-cols-[minmax(0,1fr)] items-center gap-4 border-b border-base-300/60 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,2fr)_110px_minmax(0,1.2fr)_120px]"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-base-200" />
            <div className="h-3.5 w-2/3 rounded bg-base-200" />
          </div>
          <div className="hidden h-3 w-16 rounded bg-base-200 md:block" />
          <div className="hidden gap-1.5 md:flex">
            <div className="h-4 w-12 rounded-full bg-base-200" />
            <div className="h-4 w-10 rounded-full bg-base-200" />
          </div>
          <div className="hidden h-3 w-20 rounded bg-base-200 md:block" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton do conteúdo da pasta; respeita o modo de visualização salvo. */
export function ExplorerContentSkeleton({
  view,
  count = PAGE_SIZE,
}: {
  view?: ViewMode;
  count?: number;
}) {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando conteúdo da pasta">
      {view === "list" ? (
        <ListSkeleton count={count} />
      ) : (
        <GridSkeleton count={count} />
      )}
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

/** Skeleton da página inteira (usado pelos loading.tsx). */
export function ExplorerPageSkeleton({ withBreadcrumb = true }: { withBreadcrumb?: boolean }) {
  const view = useStoredView();
  return (
    <section className="min-h-full space-y-6 bg-base-100 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      {withBreadcrumb && (
        <div className="flex animate-pulse items-center gap-2">
          <div className="h-4 w-16 rounded bg-base-200" />
          <div className="h-4 w-3 rounded bg-base-200" />
          <div className="h-4 w-28 rounded bg-base-200" />
        </div>
      )}
      <div className="flex animate-pulse flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-3">
          <div className="h-9 w-64 rounded-lg bg-base-200" />
          <div className="h-4 w-48 rounded bg-base-200" />
        </div>
        <div className="h-8 w-28 rounded-lg bg-base-200" />
      </div>
      <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />
      <div className="flex animate-pulse flex-wrap items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-3">
        <div className="h-8 w-56 rounded-lg bg-base-200" />
        <div className="h-8 w-72 rounded-lg bg-base-200" />
        <div className="h-8 w-24 rounded-lg bg-base-200" />
        <div className="ml-auto h-8 w-20 rounded-lg bg-base-200" />
      </div>
      <ExplorerContentSkeleton view={view} />
    </section>
  );
}
