import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  FileText,
  FlaskConical,
  KanbanSquare,
  Play,
  Trophy,
  Users,
} from "lucide-react";
import type { DashboardData } from "@/app/(protected)/dashboard/data";
import { TestImagePreview } from "@/components/labtest/LabTestCard";
import {
  ActivityChart,
  Avatar,
  EmptyState,
  MODE_META,
  ProfileCard,
  SectionHeader,
  WeekStrip,
  firstName,
  formatDate,
  greeting,
} from "./shared";
import { getModeMeta, getTestImage } from "@/utils/labtest/catalog";

const ROLE_LABEL: Record<string, string> = {
  owner: "Técnico",
  mentor: "Mentor",
  competidor: "Competidor",
  colaborador: "Colaborador",
};

/* Fundo geométrico do card de teste — muda a composição por modo. */
/**
 * Mentor / Técnico — inspirado no layout "cursos + instrutores":
 * foco em acompanhar testes da equipe, membros e tarefas.
 */
export function MentorDashboard({ data }: { data: DashboardData }) {
  const {
    currentUser,
    activeTeamName,
    recentTests,
    totalExecutions,
    weeklyExecutions,
    teamMembers,
    upcomingEvents,
    pendingCards,
    recentDocuments,
    dailyExecutions,
    leagueInterests,
  } = data;

  return (
    <div className="grid gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* ---------------- Coluna principal ---------------- */}
      <div className="min-w-0 space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {greeting()}, {firstName(currentUser.name)}! 👋
            </h1>
            <p className="mt-1 text-sm text-base-content/50">
              Vamos ver como sua equipe está evoluindo hoje.
            </p>
          </div>
          <Link
            href="/dashboard/team"
            className="btn btn-outline btn-sm rounded-full border-base-300"
          >
            <Users size={15} />
            {activeTeamName ?? "Gerenciar equipes"}
          </Link>
        </header>

        {/* Banner */}
        <section className="relative overflow-hidden rounded-tl-2xl rounded-br-2xl bg-[linear-gradient(100deg,var(--color-primary)_0%,color-mix(in_oklch,var(--color-primary),var(--color-accent))_55%,var(--color-accent)_100%)] p-6 text-primary-content sm:p-8 group shadow-sm">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/15 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute bottom-[-70px] right-40 h-40 w-40 rounded-full bg-white/10 group-hover:scale-105 transition-transform duration-500" />
          <div className="relative max-w-lg">
            <h2 className="text-2xl font-black leading-tight sm:text-3xl">
              Prepare sua equipe para a próxima rodada
            </h2>
            <p className="mt-2 text-sm opacity-85">
              {weeklyExecutions} execuções nesta semana · {totalExecutions} no
              total. Crie um teste novo e acompanhe a evolução do robô.
            </p>
            <Link
              href="/dashboard/labtest/new"
              className="btn btn-sm mt-5 rounded-full border-none bg-base-100 text-base-content hover:bg-base-200"
            >
              Novo teste
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Testes da equipe (cards tipo "cursos") */}
        <section>
          <SectionHeader
            title="Testes em andamento"
            href="/dashboard/labtest"
            action="Todos os testes"
          />
          {recentTests.length === 0 ? (
            <EmptyState
              icon={<FlaskConical size={20} />}
              title="Nenhum teste ainda"
              text="Crie o primeiro teste para acompanhar o desempenho da equipe."
              href="/dashboard/labtest/new"
              cta="Criar teste"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recentTests.slice(0, 3).map((test) => {
                const meta = MODE_META[test.type] ?? MODE_META.custom;
                const modeMeta = getModeMeta(test.type);
                const testImage = getTestImage({
                  mode: test.type,
                  season: test.season,
                  config: test.config,
                });
                const progress = Math.min(100, test.executionCount * 10);
                return (
                  <Link
                    key={test.id}
                    href={`/dashboard/labtest/${test.id}`}
                    className="card group border border-base-300 bg-base-100 p-3 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-28 overflow-hidden rounded-xl bg-base-200/50">
                      <TestImagePreview image={testImage} modeIcon={modeMeta.icon} />
                      <span className="badge badge-sm absolute bottom-2 left-2 border-none bg-base-100 text-base-content">
                        {meta.label}
                      </span>
                    </div>
                    <div className="px-1 pt-3">
                      <p className="line-clamp-2 min-h-10 text-sm font-bold group-hover:text-primary">
                        {test.name}
                      </p>
                      <p className="truncate text-[11px] text-base-content/45">
                        {test.description || "Sem descrição"}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-base-content/55">
                        <span className="inline-flex items-center gap-1">
                          <Play size={11} />
                          {test.executionCount}
                        </span>
                        <span className="inline-flex items-center gap-1 capitalize">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              test.status === "draft"
                                ? "bg-warning"
                                : "bg-success"
                            }`}
                          />
                          {test.status === "draft" ? "Rascunho" : test.status}
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary mt-3 h-1.5 w-full"
                        value={progress}
                        max={100}
                      />
                      <p className="mt-1 text-[10px] text-base-content/40">
                        {test.executionCount} de 10 execuções sugeridas
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Membros (tipo "melhores instrutores") */}
        <section>
          <SectionHeader
            title="Sua equipe"
            href="/dashboard/team"
            action="Gerenciar"
          />
          {teamMembers.length === 0 ? (
            <EmptyState
              icon={<Users size={20} />}
              title="Nenhuma equipe ativa"
              text="Selecione ou crie uma equipe para acompanhar seus membros aqui."
              href="/dashboard/team"
              cta="Ver equipes"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {teamMembers.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-3"
                >
                  <div
                    className={`rounded-xl p-1 ${
                      ["bg-accent/30", "bg-secondary/20", "bg-primary/15", "bg-info/20"][i % 4]
                    }`}
                  >
                    <Avatar name={m.name} src={m.avatarUrl} size="w-10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {m.name ?? "Membro"}
                    </p>
                    <p className="text-[11px] text-base-content/45">
                      {ROLE_LABEL[m.role] ?? m.role}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/team"
                    className={`btn btn-sm rounded-xl ${
                      i === 0 ? "btn-neutral" : "btn-outline border-base-300"
                    }`}
                  >
                    Perfil
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ---------------- Coluna lateral ---------------- */}
      <aside className="space-y-4">
        <ProfileCard
          data={data}
          stats={[
            { icon: <FlaskConical size={14} />, value: recentTests.length, label: "Testes" },
            { icon: <Play size={14} />, value: totalExecutions, label: "Execuções" },
            { icon: <Users size={14} />, value: teamMembers.length, label: "Membros" },
            { icon: <FileText size={14} />, value: recentDocuments.length, label: "Páginas" },
            { icon: <Trophy size={14} />, value: leagueInterests.length, label: "Ligas" },
          ]}
        />
        <WeekStrip events={upcomingEvents} />
        <ActivityChart points={dailyExecutions} title="Atividade da equipe" />

        <section>
          <SectionHeader
            title="Próximas tarefas"
            href="/dashboard/kanban"
          />
          {pendingCards.length === 0 ? (
            <EmptyState
              icon={<KanbanSquare size={20} />}
              title="Tudo em dia"
              text="Nenhum card com prazo próximo."
            />
          ) : (
            <ul className="space-y-2">
              {pendingCards.map((card, i) => (
                <li key={card.id}>
                  <Link
                    href={`/dashboard/kanban/${card.boardId}`}
                    className="group flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 transition-colors hover:border-primary/40"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        i % 2 === 0
                          ? "bg-primary/12 text-primary"
                          : "bg-accent/25 text-accent-content"
                      }`}
                    >
                      {i % 2 === 0 ? (
                        <KanbanSquare size={18} />
                      ) : (
                        <CalendarDays size={18} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {card.title}
                      </p>
                      <p className="text-[11px] text-base-content/45">
                        {formatDate(card.dueAt)} · {card.boardName}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-base-content/30 group-hover:text-primary"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
