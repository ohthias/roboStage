import { ArrowUpRight, FolderOpen } from "lucide-react";

type TestCardProps = {
  test: {
    id: string;
    name: string;
    description?: string;
    status: string;
    season?: string;
    updated_at: string;
    execution_count?: number;
    success_rate?: number;
    mode: string;
    folderId?: number;
  };

  onOpen?: () => void;
};

export default function TestCard({ test, onOpen }: TestCardProps) {
  return (
    <button onClick={onOpen} className="group relative w-full overflow-hidden rounded-[24px] text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Fundo */}
      <div className="absolute inset-0 bg-gradient-to-b from-base-100 via-base-100 to-warning/20" />

      {/* Glow */}
      <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-warning/10 blur-3xl" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-3xl font-extrabold tracking-tight line-clamp-1">
              {test.name}
            </h3>

            <p className="mt-1 text-sm italic text-base-content/70 line-clamp-1">
              {test.description || "Sem descrição"}
            </p>
          </div>
          <div className="flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {test.folderId && (
              <FolderOpen size={20} className="text-base-content/70 mb-1" aria-label="Está em uma pasta" role="img" />
            )}
            <ArrowUpRight size={24} className="text-warning transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>

        {/* Categoria */}
        <div className="mt-3">
          <span
            className="rounded-full border border-warning/40 px-3 py-1 text-xs font-medium text-warning bg-warning/5"
          >
            {test.mode.toUpperCase() || "Grupo"}
          </span>
        </div>

        {/* Rodapé */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-warning">
              {test.execution_count ?? 0}
            </p>

            <p className="text-sm italic text-base-content/70">lançamentos</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-extrabold text-error">
              {test.success_rate != null ? `${test.success_rate}%` : " "}
            </p>

            <p className="text-sm font-medium italic text-base-content/80">
              Aproveitamento
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
