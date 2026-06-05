import { ArrowRight, FolderOpen, PieChart } from "lucide-react";

type TestListItemProps = {
  test: {
    id: string;
    name: string;
    description?: string;
    season?: string;
    execution_count?: number;
    success_rate?: number;
    mode: string;
    folderId?: number;
  };

  onOpen?: () => void;
};

export default function TestListItem({ test, onOpen }: TestListItemProps) {
  return (
    <button
      onClick={onOpen}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-base-100 px-4 py-4 text-left transition-all duration-300 hover:bg-base-300 hover:shadow-lg"
    >
      {/* Ícone */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-warning/25 text-warning">
        <PieChart size={28} strokeWidth={1.8} />
      </div>

      {/* Conteúdo */}
      <div className="relative min-w-0 flex-1">
        <h3 className="truncate text-xl font-extrabold">{test.name}</h3>

        <p className="truncate text-sm italic text-base-content/70">
          {test.description || "Sem descrição"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {test.mode && (
            <span className="badge badge-warning badge-outline badge-sm">
              {test.mode.toUpperCase()}
            </span>
          )}

          <span className="text-xs text-base-content/60">
            {test.execution_count ?? 0} execuções
          </span>

          {test.success_rate !== undefined && (
            <>
              <span className="text-base-content/30">•</span>
              <span className="text-xs font-semibold text-success">
                {test.success_rate}% aproveitamento
              </span>
            </>
          )}

          {test.season && (
            <>
              <span className="text-base-content/30">•</span>
              <span className="text-xs text-base-content/60">
                Temporada {test.season.toUpperCase()}
              </span>
            </>
          )}

          {test.folderId && (
            <>
              <span className="text-base-content/30">•</span>
              <FolderOpen size={16} className="inline text-base-content/60 mb-1" aria-label="Está em uma pasta" role="img" />
              <span className="text-xs text-base-content/60">Em pasta</span>
            </>
          )}
        </div>
      </div>

      {/* Ação */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/25 text-error-content transition-transform duration-300 group-hover:scale-105">
        <ArrowRight
          size={20}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}
