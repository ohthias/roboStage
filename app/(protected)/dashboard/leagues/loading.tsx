export default function Loading() {
  return (
    <div
      className="min-h-full animate-pulse space-y-6 bg-base-100 px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-busy="true"
      aria-label="Carregando ligas"
    >
      <div className="space-y-3">
        <div className="h-9 w-56 rounded-lg bg-base-200" />
        <div className="h-4 w-80 max-w-full rounded bg-base-200" />
      </div>
      <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />
      <div className="h-12 rounded-xl border border-base-300 bg-base-200/40" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-base-300 p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-base-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-base-200" />
                <div className="h-3 w-1/3 rounded bg-base-200" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-base-200" />
            <div className="flex gap-2">
              <div className="h-5 w-20 rounded-full bg-base-200" />
              <div className="h-5 w-24 rounded-full bg-base-200" />
            </div>
            <div className="h-8 w-full rounded-lg bg-base-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
