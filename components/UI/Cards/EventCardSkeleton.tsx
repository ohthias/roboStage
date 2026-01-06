export function EventCardSkeleton() {
  return (
    <div
      className="
        animate-pulse
        relative overflow-hidden rounded-2xl
        bg-base-100 border border-base-200
        shadow-sm
      "
    >
      {/* Header / imagem */}
      <div className="h-36 w-full bg-base-200" />

      {/* Conteúdo */}
      <div className="p-5 flex flex-col gap-4">
        {/* Título */}
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-base-200" />
          <div className="h-3 w-1/3 rounded bg-base-200" />
        </div>

        {/* Metadados */}
        <div className="flex gap-2">
          <div className="h-5 w-24 rounded-full bg-base-200" />
          <div className="h-5 w-20 rounded-full bg-base-200" />
        </div>

        {/* Botão */}
        <div className="h-9 w-full rounded-lg bg-base-200" />
      </div>
    </div>
  );
}
