/**
 * Skeletons de carregamento. Sem "use client": podem ser usados em
 * loading.tsx (Server Component) e dentro do editor.
 */
const bar = "animate-pulse rounded-md bg-base-content/10";

export function EditorBodySkeleton({ lines = 7 }: { lines?: number }) {
  const widths = ["92%", "78%", "86%", "40%", "0", "88%", "64%", "82%", "55%"];
  return (
    <div role="status" aria-label="Carregando conteúdo" className="space-y-3 py-2 pl-14">
      <div className={`${bar} h-7 w-1/3`} />
      {Array.from({ length: lines }).map((_, i) =>
        widths[i % widths.length] === "0" ? (
          <div key={i} className="h-3" />
        ) : (
          <div key={i} className={`${bar} h-4`} style={{ width: widths[i % widths.length] }} />
        ),
      )}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className={`${bar} h-20`} />
        <div className={`${bar} h-20`} />
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

export function DocumentSkeleton() {
  return (
    <div className="min-h-[calc(100vh-5rem)]" aria-busy="true">
      <div className={`${bar} h-44 w-full rounded-b-xl rounded-t-none opacity-60`} />
      <div className="w-full px-6 pb-32">
        {/* breadcrumb */}
        <div className="mb-8 mt-4 flex items-center gap-2">
          <div className={`${bar} h-3 w-14`} />
          <div className={`${bar} h-3 w-3`} />
          <div className={`${bar} h-3 w-28`} />
        </div>

        {/* ícone + capa */}
        <div className="mb-3 flex items-center gap-3">
          <div className={`${bar} h-16 w-16 rounded-xl`} />
          <div className={`${bar} h-6 w-28`} />
        </div>

        {/* título */}
        <div className={`${bar} h-11 w-2/5`} />
        <div className="mt-4 flex items-center gap-3">
          <div className={`${bar} h-3 w-14`} />
          <div className={`${bar} h-3 w-24`} />
          <div className={`${bar} h-3 w-40`} />
        </div>

        <div className="mt-8">
          <EditorBodySkeleton />
        </div>
      </div>
    </div>
  );
}
