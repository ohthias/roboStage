import { Filter, Grid2X2, List, Plus } from "lucide-react";
import Link from "next/link";
import { MODE_META, type ModeKey } from "@/utils/labtest/catalog";

export function LabTestToolbar({
  viewMode,
  validMode,
}: {
  viewMode: "grid" | "list";
  validMode: ModeKey | null;
}) {
  const viewQuery = `visualizacao=${viewMode}`;
  const modeQuery = validMode ? `modo=${validMode}&` : "";

  return (
    <div className="flex items-center gap-2">
      <div className="join gap-2" aria-label="Modo de visualização">
        <Link
          href={`/dashboard/labtest?${modeQuery}visualizacao=list`}
          className={`btn btn-sm join-item gap-2 ${viewMode === "list" ? "btn-active" : "btn-ghost text-base-content/50"}`}
          aria-label="Visualização em lista"
          aria-current={viewMode === "list" ? "page" : undefined}
        >
          <List size={16} />
          <span className="hidden lg:inline">Lista</span>
        </Link>
        <Link
          href={`/dashboard/labtest?${modeQuery}visualizacao=grid`}
          className={`btn btn-sm join-item gap-2 ${viewMode === "grid" ? "btn-active" : "btn-ghost text-base-content/50"}`}
          aria-label="Visualização em grid"
          aria-current={viewMode === "grid" ? "page" : undefined}
        >
          <Grid2X2 size={16} />
          <span className="hidden lg:inline">Grid</span>
        </Link>
      </div>

      <div className="dropdown dropdown-end">
        <button
          type="button"
          tabIndex={0}
          className={`btn btn-sm gap-2 ${validMode ? "btn-primary" : "btn-ghost text-base-content/50"}`}
          aria-label="Filtrar testes por modo"
        >
          <Filter size={16} />
          <span className="hidden sm:inline">{validMode ? MODE_META[validMode].label : "Filtrar"}</span>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-10 mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
        >
          <li>
            <Link href={`/dashboard/labtest?${viewQuery}`} className={!validMode ? "active" : ""}>
              Todos os modos
            </Link>
          </li>
          {Object.entries(MODE_META).map(([mode, meta]) => (
            <li key={mode}>
              <Link
                href={`/dashboard/labtest?modo=${mode}&${viewQuery}`}
                className={validMode === mode ? "active" : ""}
              >
                {meta.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-5 w-px bg-base-content/10" />

      <Link href="/dashboard/labtest/new" className="btn btn-primary btn-sm gap-2 px-3 font-medium">
        <Plus size={16} />
        Novo teste
      </Link>
    </div>
  );
}
