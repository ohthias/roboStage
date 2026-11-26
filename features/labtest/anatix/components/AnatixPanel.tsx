// Moldura comum dos blocos de análise do Anatix.
export function AnatixPanel({
  title,
  hint,
  actions,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5 ${className}`}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          {hint && <p className="text-xs text-base-content/50">{hint}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function AnatixEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/50">
      {children}
    </div>
  );
}
