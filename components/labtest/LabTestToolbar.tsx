import { Grid2X2, List, Plus } from "lucide-react";
import Link from "next/link";
import type { ModeKey } from "@/utils/labtest/catalog";

export function LabTestToolbar({
  viewMode,
  validMode,
}: {
  viewMode: "grid" | "list";
  validMode: ModeKey | null;
}) {
  const modeQuery = validMode ? `modo=${validMode}&` : "";

  return (
    <div className="flex items-center gap-2">
      <div className="join" role="group" aria-label="Modo de visualização">
        <Link
          href={`/dashboard/labtest?${modeQuery}visualizacao=list`}
          className={`btn btn-sm join-item ${viewMode === "list" ? "btn-neutral" : "btn-ghost border-base-300 text-base-content/55"}`}
          aria-label="Visualização em lista"
          aria-current={viewMode === "list" ? "page" : undefined}
        >
          <List size={16} />
        </Link>
        <Link
          href={`/dashboard/labtest?${modeQuery}visualizacao=grid`}
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
