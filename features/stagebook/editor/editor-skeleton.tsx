/**
 * Skeletons de carregamento. Sem "use client": podem ser usados em
 * loading.tsx (Server Component) e dentro do editor.
 */
const bar = "animate-pulse rounded-md bg-base-content/10";

export function EditorBodySkeleton({ lines = 7 }: { lines?: number }) {
  const widths = ["92%", "78%", "86%", "40%", "0", "88%", "64%", "82%", "55%"];
  return (
    <div role="status" aria-label="Carregando conteúdo" className="space-y-3 py-2">
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
    <div className="min-h-[calc(100vh-3.5rem)]" aria-busy="true">
      {/* barra superior: caminho + ações */}
      <div className="flex h-11 items-center gap-2 border-b border-base-300/50 px-3 sm:px-5">
        <div className={`${bar} h-3 w-14`} />
        <div className={`${bar} h-3 w-3`} />
        <div className={`${bar} h-3 w-28`} />
        <div className="ml-auto flex items-center gap-2">
          <div className={`${bar} h-6 w-20`} />
          <div className={`${bar} h-6 w-6`} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[50rem] px-5 pb-32 pt-10 sm:px-10 sm:pt-14">
        {/* ícone */}
        <div className={`${bar} mb-4 h-16 w-16 rounded-2xl`} />

        {/* título */}
        <div className={`${bar} h-11 w-3/5`} />

        <div className="mt-8">
          <EditorBodySkeleton />
        </div>
      </div>
    </div>
  );
}
