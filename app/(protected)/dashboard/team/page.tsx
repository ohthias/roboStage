import Link from "next/link";
import { ArrowRight, KanbanSquare, Lock, Plus, ShieldCheck, Users } from "lucide-react";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import {
  listMyTeams,
  canCurrentUserCreateTeam,
} from "@/utils/stagebook/actions/teams";
import { TeamCreateForm } from "./team-create-form";
import { TeamContent } from "./team-content";

export default async function TeamHomePage() {
  const scope = await resolveStagebookScope();

  if (scope.type === "team") {
    return <TeamContent scope={scope} isActiveScope />;
  }

  const [myTeams, canCreateTeam] = await Promise.all([
    listMyTeams(),
    canCurrentUserCreateTeam(),
  ]);
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
    <div>
      {teams.length > 0 ? (
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
          {/* Cabeçalho */}
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users size={24} />
            </span>

            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/35">
              Contexto pessoal
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-base-content">
              Espaço de equipe
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-base-content/55">
              Escolha uma equipe para acessar seus projetos, documentos, testes
              e demais recursos. Você também pode trocar de contexto pelo
              seletor no topo da tela.
            </p>
          </div>

          {/* Equipes */}
          <section>
            <div className="mb-3 flex items-end justify-between px-1">
              <div>
                <h2 className="text-sm font-semibold text-base-content">
                  Suas equipes
                </h2>

                <p className="mt-0.5 text-xs text-base-content/40">
                  {teams.length}{" "}
                  {teams.length === 1
                    ? "equipe disponível"
                    : "equipes disponíveis"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/dashboard/team/${team.id}`}
                  className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
                      <Users size={17} />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-base-content">
                        {team.name}
                      </p>

                      <p className="mt-0.5 text-xs text-base-content/40">
                        Acessar equipe
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="badge badge-ghost badge-sm capitalize">
                      {team.role}
                    </span>

                    <span className="flex size-7 items-center justify-center rounded-lg text-base-content/25 transition-colors group-hover:text-primary">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Criar equipe */}
          {canCreateTeam ? (
            <section className="mt-8 rounded-2xl border border-dashed border-base-300 bg-base-200/30 p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus size={16} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-base-content">
                    Criar nova equipe
                  </h2>

                  <p className="mt-0.5 text-xs text-base-content/45">
                    Comece um novo espaço para organizar sua equipe.
                  </p>
                </div>
              </div>

              <TeamCreateForm />
            </section>
          ) : (
            <div className="mt-8 flex items-start justify-center gap-2 px-4 text-center">
              <Lock
                size={13}
                className="mt-0.5 shrink-0 text-base-content/30"
              />

              <p className="max-w-lg text-xs leading-relaxed text-base-content/40">
                Criar um espaço de equipe é permitido apenas para perfis de
                mentor técnico, entusiasta ou organizador.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Estado sem equipes */
        <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
          <section className="w-full rounded-3xl border border-base-300 bg-base-100 p-6 text-center sm:p-10">
            <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users size={28} />
            </span>

            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/35">
              Primeiro passo
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
              Você ainda não tem uma equipe
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-base-content/55">
              Este é o seu espaço pessoal. Para começar a usar os recursos
              colaborativos do RoboStage, você precisa fazer parte de uma equipe
              ou criar uma nova.
            </p>

            {/* Informações */}
            <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
              <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users size={15} />
                </div>

                <p className="text-xs font-semibold text-base-content">
                  Equipe
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-base-content/45">
                  Organize pessoas e responsabilidades em um único espaço.
                </p>
              </div>

              <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <KanbanSquare size={15} />
                </div>

                <p className="text-xs font-semibold text-base-content">
                  Projetos
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-base-content/45">
                  Gerencie boards, páginas, tarefas e outros recursos.
                </p>
              </div>

              <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck size={15} />
                </div>

                <p className="text-xs font-semibold text-base-content">
                  Colaboração
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-base-content/45">
                  Convide membros e defina os papéis de cada pessoa.
                </p>
              </div>
            </div>

            {/* Criação da primeira equipe */}
            <div className="mx-auto mt-8 max-w-md">
              {canCreateTeam ? (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/30 p-5 text-left">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Plus size={16} />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-base-content">
                        Criar sua primeira equipe
                      </h2>

                      <p className="mt-0.5 text-xs leading-relaxed text-base-content/45">
                        Dê um nome à equipe para começar a organizar seu espaço.
                      </p>
                    </div>
                  </div>

                  <TeamCreateForm />
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-base-300 bg-base-200/30 px-4 py-3 text-left">
                  <Lock
                    size={13}
                    className="mt-0.5 shrink-0 text-base-content/30"
                  />

                  <p className="text-xs leading-relaxed text-base-content/40">
                    Criar um espaço de equipe é permitido apenas para perfis de
                    mentor técnico, entusiasta ou organizador.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
