/**
 * Tela de carregamento do editor do ThinkLab.
 *
 * Reproduz o esqueleto do editor (barra superior + três colunas) para que a
 * troca para a interface real não "pule", com um indicador central no canvas.
 * Usada tanto pelo `loading.tsx` da rota quanto enquanto o quadro é buscado no banco.
 */
export function EditorLoader({ message = 'Carregando ThinkLab…' }: { message?: string }) {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={message}
      className="w-full h-dvh overflow-hidden bg-base-200 flex flex-col select-none"
    >
      {/* Barra superior */}
      <div className="h-16 shrink-0 px-4 border-b border-base-300 bg-base-100 flex items-center gap-3">
        <div className="skeleton h-8 w-24" />
        <div className="skeleton h-4 w-48 hidden md:block" />
        <div className="flex-1 hidden lg:flex justify-center gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton size-8" />
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <div className="skeleton h-8 w-20" />
          <div className="skeleton h-8 w-20" />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Coluna esquerda */}
        <div className="hidden lg:flex w-72 shrink-0 flex-col bg-base-100 border-r border-base-300">
          <div className="h-11 px-4 flex items-center gap-4 border-b border-base-300">
            <div className="skeleton h-4 w-14" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
          </div>
          <div className="p-4 space-y-4">
            <div className="skeleton h-8 w-full" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton size-9 rounded-full shrink-0" />
                <div className="skeleton h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          className="relative flex-1 min-w-0 grid place-items-center"
          style={{
            backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="flex flex-col items-center gap-4 rounded-box border border-base-300 bg-base-100 px-8 py-6 shadow-sm">
            <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
            <div className="text-center">
              <p className="text-sm font-medium">{message}</p>
              <p className="text-xs text-base-content/55 mt-1">Preparando o canvas, as camadas e as suas missões.</p>
            </div>
            <progress className="progress progress-primary w-48" aria-hidden="true" />
          </div>
        </div>

        {/* Coluna direita */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col bg-base-100 border-l border-base-300">
          <div className="h-14 px-4 flex items-center justify-between border-b border-base-300">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-5 w-10 rounded-full" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3 border-b border-base-300/70">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
