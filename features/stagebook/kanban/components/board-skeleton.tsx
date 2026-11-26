/** Skeleton do quadro: mesmo layout do BoardView (cabeçalho + colunas). */
const COLUMN_CARD_COUNTS = [3, 2, 2, 1];

export function BoardSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-base-200/40" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando board…</span>

      <header className="px-8 pt-6">
        <div className="skeleton h-3 w-36 rounded" />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="skeleton size-8 rounded-lg" />
            <div className="skeleton h-7 w-56 rounded" />
          </div>
          <div className="flex gap-3">
            {[56, 40, 64, 72, 40].map((w, i) => (
              <div key={i} className="skeleton h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-start gap-4 overflow-hidden px-8 pb-8 pt-6">
        {COLUMN_CARD_COUNTS.map((count, col) => (
          <div key={col} className="flex w-[min(17.5rem,calc(100vw-4rem))] shrink-0 flex-col">
            <div className="mb-3 flex h-7 items-center gap-2">
              <div className="skeleton h-3.5 w-24 rounded" />
              <div className="skeleton h-4 w-5 rounded" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex gap-2.5 rounded-lg border border-base-300/70 bg-base-100 p-3">
                  <div className="skeleton size-4 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="skeleton h-3.5 rounded" style={{ width: `${70 - ((col + i) % 3) * 12}%` }} />
                      <div className="skeleton size-5 shrink-0 rounded-full" />
                    </div>
                    <div className="skeleton h-2.5 w-24 rounded" />
                  </div>
                </div>
              ))}
              <div className="skeleton mt-1 h-3 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
