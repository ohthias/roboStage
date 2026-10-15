type ModuleCardProps = {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  featured?: boolean;
  index?: string;
};

export function ModuleCard({
  title,
  description,
  color,
  icon,
  featured = false,
  index,
}: ModuleCardProps) {
  return (
    <article
      className={`
        group relative isolate flex min-h-[300px] cursor-default flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl p-6 sm:p-8 text-white transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl ${color} ${featured ? "lg:scale-[1.03] lg:hover:scale-[1.04]" : ""}
      `}
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 -z-10 size-44 rounded-full border-[28px] border-white/5 transition-transform duration-700 group-hover:scale-110"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-10 -z-10 size-32 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-white/10"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl bg-white/15 ring-1 ring-white/15 transition-all duration-300 group-hover:bg-white/20 group-hover:ring-white/25 sm:size-14">
          <div className="transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
        </div>

        {index && (
          <span className="font-mono text-xs font-bold tracking-wider text-white/50">
            {index}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative mt-12 flex flex-1 flex-col">
        <h3 className="max-w-xs text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          {title}
        </h3>

        <div className="mt-auto pt-5">
          <p className="text-sm leading-relaxed text-white/85 transition-all duration-300 group-hover:text-white sm:text-base">
            {description}
          </p>

          <div
            aria-hidden="true"
            className="mt-5 h-1 w-10 rounded-full bg-white/60 transition-all duration-300 group-hover:w-16 group-hover:bg-white"
          />
        </div>
      </div>

      {/* Featured indicator */}
      {featured && (
        <span className="absolute right-0 top-0 rounded-bl-xl bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/90 z-10">
          Novo
        </span>
      )}
    </article>
  );
}