import { Grid2X2, List, Plus } from "lucide-react";
import Link from "next/link";
import { listHref, type ListParams } from "@/features/labtest/lib/list-filters";

export function LabTestToolbar({
  viewMode,
  params,
}: {
  viewMode: "grid" | "list";
  /** Parâmetros atuais da lista — trocar a visualização mantém os filtros. */
  params: ListParams;
}) {

  return (
    <div className="flex items-center gap-2">
      <div className="join" role="group" aria-label="Modo de visualização">
        <Link
          href={listHref(params, { visualizacao: "list", pagina: undefined })}
          className={`btn btn-sm join-item ${viewMode === "list" ? "btn-neutral" : "btn-ghost border-base-300 text-base-content/55"}`}
          aria-label="Visualização em lista"
          aria-current={viewMode === "list" ? "page" : undefined}
        >
          <List size={16} />
        </Link>
        <Link
          href={listHref(params, { visualizacao: "grid", pagina: undefined })}
          className={`btn btn-sm join-item ${viewMode === "grid" ? "btn-neutral" : "btn-ghost border-base-300 text-base-content/55"}`}
          aria-label="Visualização em grid"
          aria-current={viewMode === "grid" ? "page" : undefined}
        >
          <Grid2X2 size={16} />
        </Link>
      </div>

      <Link href="/dashboard/labtest/new" className="btn btn-primary btn-sm gap-2 rounded-full px-4 font-semibold">
        <Plus size={16} />
        Novo teste
      </Link>
    </div>
  );
}
