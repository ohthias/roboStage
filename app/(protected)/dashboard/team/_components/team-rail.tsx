"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid, Search } from "lucide-react";
import { TeamAvatar } from "./team-avatar";
import { RoleBadge } from "./role-badge";
import { CreateTeamButton } from "./create-team-modal";

export type RailTeam = { id: string; name: string; role: string };

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function TeamList({
  teams,
  activeId,
  onNavigate,
}: {
  teams: RailTeam[];
  activeId: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ul className="menu w-full gap-0.5 p-0">
      {teams.map((team) => {
        const active = team.id === activeId;
        return (
          <li key={team.id}>
            <Link
              href={`/dashboard/team/${team.id}`}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-2 py-2 ${active ? "menu-active" : ""}`}
            >
              <TeamAvatar name={team.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{team.name}</span>
                <span className="mt-0.5 block">
                  <RoleBadge role={team.role} size="xs" />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Painel de equipes à esquerda, como o Microsoft Teams: lista de equipes com o
 * ladrilho colorido, busca e atalho para criar. Em telas pequenas vira um
 * seletor suspenso no topo da página.
 */
export function TeamRail({
  teams,
  activeTeamId,
  canCreateTeam,
}: {
  teams: RailTeam[];
  /** Equipe do espaço ativo (cookie) — usada quando a URL é só /dashboard/team. */
  activeTeamId: string | null;
  canCreateTeam: boolean;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const urlTeamId = pathname.match(/^\/dashboard\/team\/([0-9a-f-]{36})/i)?.[1] ?? null;
  const activeId = urlTeamId ?? (pathname === "/dashboard/team" ? activeTeamId : null);
  const current = teams.find((t) => t.id === activeId) ?? null;

  const filtered = useMemo(() => {
    const q = norm(search.trim());
    return q ? teams.filter((t) => norm(t.name).includes(q)) : teams;
  }, [teams, search]);

  return (
    <>
      {/* Desktop */}
      <aside
        aria-label="Suas equipes"
        className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 flex-col border-r border-base-300 bg-base-100 md:flex"
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 className="text-base font-semibold">Equipes</h2>
          {canCreateTeam && <CreateTeamButton variant="icon" />}
        </div>

        {teams.length > 6 && (
          <div className="px-3 pb-2">
            <label className="input input-sm w-full">
              <Search size={14} className="opacity-50" />
              <input
                type="search"
                placeholder="Buscar equipe"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {teams.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-base-content/45">Você ainda não está em nenhuma equipe.</p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-base-content/45">Nenhuma equipe encontrada.</p>
          ) : (
            <TeamList teams={filtered} activeId={activeId} />
          )}
        </div>

        <div className="border-t border-base-300 p-2">
          <Link href="/dashboard/team?view=all" className="btn btn-ghost btn-sm w-full justify-start gap-2">
            <LayoutGrid size={15} />
            Todas as equipes
          </Link>
        </div>
      </aside>

      {/* Mobile */}
      <div className="border-b border-base-300 bg-base-100 p-2 md:hidden">
        <div className="dropdown w-full">
          <div tabIndex={0} role="button" className="btn btn-ghost w-full justify-between">
            <span className="flex min-w-0 items-center gap-2">
              {current ? <TeamAvatar name={current.name} size="xs" /> : <LayoutGrid size={16} />}
              <span className="truncate">{current?.name ?? "Equipes"}</span>
            </span>
            <ChevronDown size={16} className="opacity-50" />
          </div>
          <div
            tabIndex={0}
            className="dropdown-content z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <TeamList teams={teams} activeId={activeId} onNavigate={() => (document.activeElement as HTMLElement | null)?.blur()} />
            <div className="mt-1 border-t border-base-300 pt-1">
              <Link href="/dashboard/team?view=all" className="btn btn-ghost btn-sm w-full justify-start gap-2">
                <LayoutGrid size={15} /> Todas as equipes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
