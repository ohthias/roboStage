import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, SearchX, ShieldAlert } from "lucide-react";
import { db } from "@/db/client";
import { teams } from "@/db/schema";
import { requireStagebookAccess, StagebookAuthError } from "@/utils/stagebook/scope";
import { canEditRoster, roleCan } from "@/utils/stagebook/team-permissions";
import { getTeamMembers } from "@/utils/stagebook/team-queries";
import { getTrainingSessionDetail } from "@/utils/stagebook/training-queries";
import { LiveRefresh } from "@/components/stagebook/live-refresh";
import { SessionView } from "../../../_components/session/session-view";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Página de uma sessão de treino/competição: presença, escala, execuções e resumo. */
export default async function TrainingSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  if (!UUID_RE.test(id) || !UUID_RE.test(sessionId)) return <NotFound teamId={null} />;

  let scope;
  try {
    scope = await requireStagebookAccess(id);
  } catch (error) {
    if (error instanceof StagebookAuthError) return <NoAccess />;
    throw error;
  }
  if (scope.type !== "team") return <NoAccess />;

  const [detail, members, team] = await Promise.all([
    getTrainingSessionDetail(scope.teamId, sessionId),
    getTeamMembers(scope.teamId, scope.role),
    db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, scope.teamId))
      .limit(1)
      .then((rows) => rows[0]),
  ]);
  if (!detail) return <NotFound teamId={scope.teamId} />;

  return (
    <div className="mx-auto w-full p-4 sm:p-6">
      {detail.session.status !== "encerrada" && <LiveRefresh />}
      <div className="breadcrumbs mb-3 text-sm">
        <ul>
          <li>
            <Link href={`/dashboard/team/${scope.teamId}`}>{team?.name ?? "Equipe"}</Link>
          </li>
          <li>
            <Link href={`/dashboard/team/${scope.teamId}?tab=treinos`}>Treinos</Link>
          </li>
          <li className="max-w-[16rem] truncate">{detail.session.title}</li>
        </ul>
      </div>
      <SessionView
        detail={detail}
        members={members.map((m) => ({ userId: m.userId, name: m.name, avatarUrl: m.avatarUrl }))}
        viewerId={scope.userId}
        canDelete={detail.session.createdBy === scope.userId || roleCan(scope.role, "session.delete.any")}
        canEditRoster={canEditRoster(scope.role, detail.session.kind)}
        canChangeKindToCompetition={roleCan(scope.role, "roster.manage")}
      />
    </div>
  );
}

function NoAccess() {
  return (
    <div className="mx-auto flex flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <ShieldAlert size={24} />
      </span>
      <h1 className="text-lg font-bold">Sem acesso a esta equipe</h1>
      <p className="mt-2 text-sm text-base-content/60">Ou essa equipe não existe, ou você não é mais membro dela.</p>
    </div>
  );
}

function NotFound({ teamId }: { teamId: string | null }) {
  return (
    <div className="mx-auto flex flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/50">
        <SearchX size={24} />
      </span>
      <h1 className="text-lg font-bold">Sessão não encontrada</h1>
      <p className="mt-2 text-sm text-base-content/60">Ela pode ter sido excluída.</p>
      {teamId && (
        <Link href={`/dashboard/team/${teamId}?tab=treinos`} className="btn btn-ghost btn-sm mt-4 gap-1.5">
          <ArrowLeft size={14} /> Voltar aos treinos
        </Link>
      )}
    </div>
  );
}
