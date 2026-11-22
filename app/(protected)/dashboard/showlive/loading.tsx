export default function Loading() {
  return (
    <div
      className="min-h-full animate-pulse space-y-6 bg-base-100 px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-busy="true"
      aria-label="Carregando eventos do ShowLive"
    >
      <div className="space-y-3">
        <div className="h-9 w-56 rounded-lg bg-base-200" />
        <div className="h-4 w-96 max-w-full rounded bg-base-200" />
      </div>
      <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-200/40" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-200/40" />
        ))}
      </div>
    </div>
  );
}
