import Link from "next/link";
import { ArrowRight, Lock, Users } from "lucide-react";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { canCurrentUserCreateTeam, listMyTeams } from "@/utils/stagebook/actions/teams";
import { TeamContent, parseTab } from "./team-content";
import { CreateTeamButton } from "./_components/create-team-modal";
import { RoleBadge } from "./_components/role-badge";
import { TeamAvatar } from "./_components/team-avatar";

/**
 * /dashboard/team: com uma equipe ativa abre o workspace dela; sem equipe ativa
 * (ou com `?view=all`) mostra o hub com todas as equipes do usuário.
 */
export default async function TeamHomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string }>;
}) {
  const { tab, view } = await searchParams;
  const scope = await resolveStagebookScope();

  if (scope.type === "team" && view !== "all") {
    return <TeamContent scope={scope} isActiveScope tab={parseTab(tab)} />;
  }

  const [teams, canCreateTeam] = await Promise.all([listMyTeams(), canCurrentUserCreateTeam()]);

  return (
    <div className="mx-auto w-full px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Equipes</h1>
        </div>
        {canCreateTeam && <CreateTeamButton />}
      </div>

      {teams.length === 0 ? (
        <div className="card border border-dashed border-base-300 bg-base-100">
          <div className="card-body items-center py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users size={26} />
            </span>
            <h2 className="text-lg font-semibold">Comece por uma equipe</h2>
            <p className="max-w-md text-sm text-base-content/60">
              Equipes reúnem Kanbans, ThinkLab, LabTests, marcos e membros num só lugar.
              {canCreateTeam
                ? " Crie a sua ou aceite um convite por e-mail."
                : " Peça a um técnico ou mentor que te convide por e-mail."}
            </p>
            {canCreateTeam ? (
              <div className="mt-2">
                <CreateTeamButton />
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-base-content/45">
                <Lock size={12} />
                Criar equipe é permitido a mentores técnicos, entusiastas e organizadores.
              </p>
            )}
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const active = scope.type === "team" && scope.teamId === team.id;
            return (
              <li key={team.id}>
                <Link
                  href={`/dashboard/team/${team.id}`}
                  className="card h-full border border-base-300 bg-base-100 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="card-body gap-4 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <TeamAvatar name={team.name} size="lg" />
                      {active && <span className="badge badge-success badge-soft badge-sm">Ativa</span>}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">{team.name}</h2>
                      <div className="mt-1.5">
                        <RoleBadge role={team.role} />
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      Abrir equipe <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
