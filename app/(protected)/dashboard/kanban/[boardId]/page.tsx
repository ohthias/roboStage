import { notFound } from "next/navigation";
import { getBoardDetail, listTeamMembersForAssignment } from "./actions";
import { resolveStagebookScope } from "@/lib/stagebook/scope";
import { BoardView } from "./board-view";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  let detail;
  try {
    detail = await getBoardDetail(boardId);
  } catch {
    notFound();
  }

  const scope = await resolveStagebookScope();
  const teamMembers = scope.type === "team" ? await listTeamMembersForAssignment(scope.teamId) : [];

  return (
    <BoardView
      boardId={boardId}
      boardName={detail.board.name}
      columns={detail.columns}
      cards={detail.cards.map((c) => ({ ...c, dueAt: c.dueAt ? c.dueAt.toISOString() : null }))}
      assignees={detail.assignees}
      cardTags={detail.cardTags}
      teamMembers={teamMembers}
      isTeamScope={scope.type === "team"}
    />
  );
}
