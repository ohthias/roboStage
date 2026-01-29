export function ThemeCardSkeleton() {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        h-40 sm:h-52
        bg-base-200
        animate-pulse
      "
    >
      {/* Menu contextual fake */}
      <div className="absolute top-3 right-3">
        <div className="w-5 h-5 rounded bg-base-300" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-base-300/60 via-base-200/40 to-transparent" />

      {/* Conteúdo */}
      <div className="relative z-10 h-full p-4 sm:p-5 flex flex-col justify-end gap-3">
        {/* Título */}
        <div className="h-4 sm:h-5 w-3/4 rounded bg-base-300" />

        {/* Paleta */}
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-base-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
