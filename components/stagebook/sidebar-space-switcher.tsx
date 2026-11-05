"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, LayoutGrid, Loader2, Plus, User } from "lucide-react";
import { switchStagebookScope } from "@/utils/stagebook/actions/teams";
import { useToast } from "@/app/context/ToastContext";
import { roleLabel } from "@/utils/stagebook/team-permissions";
import { TeamAvatar } from "@/app/(protected)/dashboard/team/_components/team-avatar";

type TeamOption = { id: string; name: string; role: string };

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/**
 * Para onde ir depois de trocar de espaço. Uma página de item (um teste, uma
 * página do StageBook...) pertence ao espaço anterior e não abriria no novo,
 * então voltamos para a lista da ferramenta. Na área de equipes, abrimos a
 * equipe escolhida.
 */
export function pathAfterSwitch(pathname: string, teamId: string | null): string | null {
  if (pathname.startsWith("/dashboard/team")) {
    return teamId ? `/dashboard/team/${teamId}` : "/dashboard/team?view=all";
  }
  const match = pathname.match(new RegExp(`^(/dashboard/[a-z-]+)/(${UUID}|trash)(/|$)`, "i"));
  return match ? match[1] : null;
}

function closeDropdown() {
  (document.activeElement as HTMLElement | null)?.blur();
}

/**
 * Troca de espaço (pessoal ↔ equipes) no topo da barra lateral. Com a barra
 * recolhida vira só o ladrilho do espaço, e a lista abre ao lado.
 */
export function SidebarSpaceSwitcher({
  teams,
  activeTeamId,
  canCreateTeam,
  userName,
}: {
  teams: TeamOption[];
  activeTeamId: string | null;
  canCreateTeam: boolean;
  userName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const active = teams.find((t) => t.id === activeTeamId) ?? null;

  function switchTo(teamId: string | null) {
    closeDropdown();
    if (teamId === (active?.id ?? null)) return;
    startTransition(async () => {
      try {
        await switchStagebookScope(teamId);
        const next = pathAfterSwitch(pathname, teamId);
        if (next) router.push(next);
        router.refresh();
        addToast(
          teamId ? `Agora em ${teams.find((t) => t.id === teamId)?.name ?? "equipe"}.` : "Agora no espaço pessoal.",
          "success",
        );
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível trocar de espaço.", "error");
      }
    });
  }

  const tile = (team: TeamOption | null, size: "xs" | "sm" = "sm") =>
    team ? (
      <TeamAvatar name={team.name} size={size} />
    ) : (
      <span
        className={`inline-flex shrink-0 items-center justify-center bg-base-content text-base-100 ${
          size === "xs" ? "size-7 rounded-md" : "size-9 rounded-lg"
        }`}
        aria-hidden="true"
      >
        <User size={size === "xs" ? 13 : 16} />
      </span>
    );

  const row = (team: TeamOption | null) => {
    const selected = (team?.id ?? null) === (active?.id ?? null);
    return (
      <li key={team?.id ?? "personal"}>
        <button
          type="button"
          onClick={() => switchTo(team?.id ?? null)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left ${selected ? "bg-base-200" : ""}`}
        >
          {tile(team, "xs")}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{team ? team.name : "Espaço pessoal"}</span>
            <span className="block truncate text-[11px] text-base-content/50">
              {team ? roleLabel(team.role) : (userName ?? "Só você")}
            </span>
          </span>
          {selected && <Check size={14} className="shrink-0 text-primary" />}
        </button>
      </li>
    );
  };

  return (
    <div className="dropdown dropdown-bottom w-full lg:is-drawer-close:dropdown-right lg:is-drawer-close:dropdown-start">
      <div
        tabIndex={0}
        role="button"
        aria-label={`Espaço atual: ${active ? active.name : "Espaço pessoal"}. Trocar de espaço`}
        data-tip={active ? active.name : "Espaço pessoal"}
        className="group flex w-full items-center gap-2.5 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border border-base-300 bg-base-100 p-2 text-left transition-colors hover:border-primary/40 lg:is-drawer-close:tooltip lg:is-drawer-close:tooltip-right lg:is-drawer-close:justify-center lg:is-drawer-close:border-transparent lg:is-drawer-close:bg-transparent lg:is-drawer-close:p-0"
      >
        <span className="relative">
          {tile(active)}
          {isPending && (
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-base-100/70">
              <Loader2 size={14} className="animate-spin" />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1 lg:is-drawer-close:hidden">
          <span className="block font-mono text-[9px] tracking-[0.18em] text-base-content/40">/ ESPAÇO</span>
          <span className="block truncate text-sm font-semibold leading-tight">
            {active ? active.name : "Pessoal"}
          </span>
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-base-content/35 lg:is-drawer-close:hidden" />
      </div>

      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-1.5 w-full min-w-60 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl lg:is-drawer-close:ml-2 lg:is-drawer-close:mt-0 lg:is-drawer-close:w-64"
      >
        <p className="px-2 pb-1 pt-0.5 font-mono text-[10px] tracking-[0.18em] text-base-content/40">/ TROCAR DE ESPAÇO</p>
        <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
          {row(null)}
          {teams.length > 0 && <li className="my-1 border-t border-base-300" aria-hidden="true" />}
          {teams.map((t) => row(t))}
        </ul>
        <div className="mt-1 flex gap-1 border-t border-base-300 pt-1.5">
          <Link
            href={active ? `/dashboard/team/${active.id}` : "/dashboard/team?view=all"}
            onClick={closeDropdown}
            className="btn btn-ghost btn-xs flex-1 justify-start gap-1.5"
          >
            <LayoutGrid size={12} /> {active ? "Abrir equipe" : "Equipes"}
          </Link>
          {canCreateTeam && (
            <Link
              href="/dashboard/team?view=all"
              onClick={closeDropdown}
              className="btn btn-ghost btn-xs gap-1"
            >
              <Plus size={12} /> Nova equipe
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
