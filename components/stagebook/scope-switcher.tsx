"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, User, Users } from "lucide-react";
import { createTeam, switchStagebookScope } from "@/lib/stagebook/actions/teams";

type TeamOption = { id: string; name: string; role: string };

export function ScopeSwitcher({
  teams,
  activeTeamId,
}: {
  teams: TeamOption[];
  activeTeamId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const activeTeam = teams.find((t) => t.id === activeTeamId) ?? null;
  const label = activeTeam ? activeTeam.name : "Espaço pessoal";

  function switchTo(teamId: string | null) {
    startTransition(async () => {
      await switchStagebookScope(teamId);
      router.refresh();
    });
  }

  function submitNewTeam() {
    const name = newTeamName.trim();
    if (!name) return;
    startTransition(async () => {
      const team = await createTeam(name);
      setNewTeamName("");
      setCreating(false);
      await switchStagebookScope(team.id);
      router.refresh();
    });
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        disabled={isPending}
        className="btn btn-sm btn-ghost gap-2 normal-case"
      >
        {activeTeam ? <Users size={15} /> : <User size={15} />}
        <span className="max-w-32 truncate text-sm">{label}</span>
        <ChevronDown size={14} className="text-base-content/40" />
      </button>

      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-2 w-72 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl"
      >
        <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
          Contexto do Stagebook
        </p>

        <button
          type="button"
          className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-base-200 ${
            !activeTeam ? "bg-base-200 font-medium" : ""
          }`}
          onClick={() => switchTo(null)}
        >
          <User size={15} className="text-base-content/50" />
          Espaço pessoal
        </button>

        {teams.length > 0 && (
          <div className="my-1 border-t border-base-300" />
        )}

        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-base-200 ${
              activeTeamId === team.id ? "bg-base-200 font-medium" : ""
            }`}
            onClick={() => switchTo(team.id)}
          >
            <span className="flex items-center gap-2 truncate">
              <Users size={15} className="text-base-content/50" />
              <span className="truncate">{team.name}</span>
            </span>
            <span className="badge badge-ghost badge-sm capitalize">
              {team.role}
            </span>
          </button>
        ))}

        <div className="my-1 border-t border-base-300" />

        {creating ? (
          <div className="flex items-center gap-1 px-1 py-1">
            <input
              autoFocus
              className="input input-xs input-bordered flex-1"
              placeholder="Nome da equipe"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNewTeam();
                if (e.key === "Escape") setCreating(false);
              }}
            />
            <button
              type="button"
              className="btn btn-xs btn-primary"
              onClick={submitNewTeam}
              disabled={isPending}
            >
              Criar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content"
            onClick={() => setCreating(true)}
          >
            <Plus size={15} />
            Nova equipe
          </button>
        )}
      </div>
    </div>
  );
}
