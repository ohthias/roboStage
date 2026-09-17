import Link from "next/link";
import { Lock, Users } from "lucide-react";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { listMyTeams, canCurrentUserCreateTeam } from "@/utils/stagebook/actions/teams";
import { TeamCreateForm } from "./team-create-form";
import { TeamContent } from "./team-content";

export default async function TeamHomePage() {
  const scope = await resolveStagebookScope();

  if (scope.type === "team") {
    return <TeamContent scope={scope} isActiveScope />;
  }

  const [myTeams, canCreateTeam] = await Promise.all([listMyTeams(), canCurrentUserCreateTeam()]);
  return <PersonalEmptyState teams={myTeams} canCreateTeam={canCreateTeam} />;
}

function PersonalEmptyState({
  teams,
  canCreateTeam,
}: {
  teams: { id: string; name: string; role: string }[];
  canCreateTeam: boolean;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Users size={24} />
      </span>
      <h1 className="text-xl font-bold">Espaço de equipe</h1>
      <p className="mt-2 text-sm text-base-content/60">
        Você está no espaço pessoal. Escolha uma equipe abaixo para ver a página dela, troque o
        contexto pelo seletor no topo da tela, ou crie uma nova equipe.
      </p>

      {teams.length > 0 && (
        <div className="mt-6 flex flex-col gap-2 text-left">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/dashboard/team/${team.id}`}
              className="flex items-center justify-between rounded-xl border border-base-300 px-4 py-3 text-sm transition-colors hover:border-primary/40"
            >
              <span className="font-medium">{team.name}</span>
              <span className="badge badge-ghost badge-sm capitalize">{team.role}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        {canCreateTeam ? (
          <TeamCreateForm />
        ) : (
          <p className="flex items-center justify-center gap-2 text-xs text-base-content/40">
            <Lock size={13} />
            Criar um espaço de equipe é permitido só para perfis de mentor técnico, entusiasta ou
            organizador.
          </p>
        )}
      </div>
    </div>
  );
}
