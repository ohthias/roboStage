"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { TeamAvatar } from "./team-avatar";
import { RoleBadge } from "./role-badge";
import { CreateTeamButton } from "./create-team-modal";

export type RailTeam = { id: string; name: string; role: string };

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
 * Coluna fina de equipes à esquerda (como Teams/Discord): um ladrilho por
 * equipe, com o nome no tooltip e uma barra vermelha na equipe aberta. O
 * painel da própria equipe (nav, cargo, números) fica no workspace. Em telas
 * pequenas vira um seletor suspenso no topo.
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
  const view = useSearchParams().get("view");
  const onHub = pathname === "/dashboard/team" && (view === "all" || !activeTeamId);
  const urlTeamId = pathname.match(/^\/dashboard\/team\/([0-9a-f-]{36})/i)?.[1] ?? null;
  const activeId = urlTeamId ?? (pathname === "/dashboard/team" && !onHub ? activeTeamId : null);
  const current = teams.find((t) => t.id === activeId) ?? null;

  return (
    <>
      {/* Desktop: coluna fina de ladrilhos (o nome aparece no tooltip). */}
      <aside
        aria-label="Suas equipes"
        className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[4.5rem] shrink-0 flex-col items-center gap-2 border-r border-base-300 bg-base-100 py-3 md:flex"
      >
        <Link
          href="/dashboard/team?view=all"
          title="Todas as equipes"
          aria-label="Todas as equipes"
          className={`flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm transition-colors ${
            onHub
              ? "bg-primary text-primary-content"
              : "bg-base-200 text-base-content/60 hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <LayoutGrid size={18} />
        </Link>
        <span className="h-px w-8 bg-base-300" />

        <ul className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto overflow-x-visible py-1">
          {teams.map((team) => {
            const active = team.id === activeId;
            return (
              <li key={team.id} className="relative flex w-full justify-center">
                {/* Indicador da equipe aberta, como no Teams/Discord. */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all ${
                    active ? "h-8" : "h-0"
                  }`}
                />
                <Link
                  href={`/dashboard/team/${team.id}`}
                  aria-current={active ? "page" : undefined}
                  aria-label={team.name}
                  className="tooltip tooltip-right z-10"
                  data-tip={team.name}
                >
                  <TeamAvatar
                    name={team.name}
                    size="md"
                    className={`transition-all ${
                      active ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100" : "opacity-80 hover:opacity-100"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {canCreateTeam && (
          <div className="tooltip tooltip-right" data-tip="Criar equipe">
            <CreateTeamButton variant="icon" />
          </div>
        )}
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
