import { ArrowRight, CalendarDays, Lock, Radio, User, Users } from "lucide-react";
import { roleLabel } from "@/utils/stagebook/team-permissions";
import type { MyTeamSummary } from "@/utils/stagebook/team-queries";
import { CreateTeamButton } from "./create-team-modal";
import { TeamAvatar } from "./team-avatar";
import { EnterSpaceCard } from "./enter-space-card";
import { CORNER } from "./team-ui";

/** Hub "Suas equipes": espaço pessoal + um cartão por equipe. */
export function TeamsHub({
  teams,
  activeId,
  canCreateTeam,
}: {
  teams: MyTeamSummary[];
  activeId: string | null;
  canCreateTeam: boolean;
}) {
  const card = `group flex h-full w-full flex-col gap-4 border bg-base-100 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-base-content/5 ${CORNER.lg}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-base-content/40">/ ESPAÇOS</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Suas equipes</h1>
          <p className="mt-1 max-w-lg text-sm text-base-content/55">
            Entrar numa equipe também a torna seu espaço ativo: Kanban, LabTest e StageBook passam a abrir nela.
          </p>
        </div>
        {canCreateTeam && <CreateTeamButton />}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Espaço pessoal */}
        <li>
          <EnterSpaceCard
            teamId={null}
            isActive={activeId === null}
            href="/dashboard"
            className={`${card} ${activeId === null ? "border-primary/50 ring-1 ring-primary/30" : "border-base-300 hover:border-base-content/20"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`flex size-12 items-center justify-center bg-base-content text-base-100 ${CORNER.md}`}>
                <User size={20} />
              </span>
              {activeId === null && <ActiveBadge />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">Espaço pessoal</h2>
              <p className="mt-0.5 text-xs text-base-content/50">Seus testes, páginas e quadros — só seus.</p>
            </div>
            <EnterHint label={activeId === null ? "Ir para a visão geral" : "Entrar"} />
          </EnterSpaceCard>
        </li>

        {teams.map((team) => {
          const active = team.id === activeId;
          return (
            <li key={team.id}>
              <EnterSpaceCard
                teamId={team.id}
                isActive={active}
                href={`/dashboard/team/${team.id}`}
                className={`${card} ${active ? "border-primary/50 ring-1 ring-primary/30" : "border-base-300 hover:border-base-content/20"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <TeamAvatar name={team.name} size="lg" />
                  <div className="flex flex-col items-end gap-1">
                    {active && <ActiveBadge />}
                    {team.liveSession && (
                      <span className="badge badge-sm gap-1 border-0 bg-primary/10 text-primary" title={team.liveSession}>
                        <Radio size={11} className="animate-pulse" /> Treino ao vivo
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{team.name}</h2>
                  <p className="mt-0.5 truncate text-xs text-base-content/50">{team.subtitle || roleLabel(team.role)}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/55">
                  <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 font-medium text-base-content/70">
                    {roleLabel(team.role)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} /> {team.memberCount}
                  </span>
                  {team.upcomingEvents > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={12} /> {team.upcomingEvents}
                    </span>
                  )}
                </div>
                <EnterHint label={active ? "Abrir" : "Entrar"} />
              </EnterSpaceCard>
            </li>
          );
        })}

        {teams.length === 0 && (
          <li className="sm:col-span-1 lg:col-span-2">
            <div className={`flex h-full flex-col items-center justify-center gap-2 border-2 border-dashed border-base-300 p-8 text-center ${CORNER.lg}`}>
              <span className={`flex size-11 items-center justify-center bg-primary/10 text-primary ${CORNER.md}`}>
                <Users size={20} />
              </span>
              <h2 className="font-semibold">Comece por uma equipe</h2>
              <p className="max-w-sm text-sm text-base-content/60">
                Equipes reúnem Kanbans, ThinkLab, LabTests, treinos e marcos num só lugar.
                {canCreateTeam
                  ? " Crie a sua ou aceite um convite por e-mail."
                  : " Peça a um técnico ou mentor que te convide por e-mail."}
              </p>
              {canCreateTeam ? (
                <div className="mt-1">
                  <CreateTeamButton />
                </div>
              ) : (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/45">
                  <Lock size={12} />
                  Criar equipe é permitido a mentores técnicos, entusiastas e organizadores.
                </p>
              )}
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

function ActiveBadge() {
  return (
    <span className="badge badge-sm gap-1 border-0 bg-success/12 text-success">
      <span className="size-1.5 rounded-full bg-success" /> Espaço ativo
    </span>
  );
}

function EnterHint({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1 border-t border-base-200 pt-3 text-xs font-medium text-base-content/50 transition-colors group-hover:text-primary">
      {label}
      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
    </span>
  );
}
