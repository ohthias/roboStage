import { listBoards } from "@/features/stagebook/kanban/actions/boards";
import { BoardList } from "@/features/stagebook/kanban/components/board-list";

export default async function KanbanPage() {
  const boards = await listBoards();

  return (
    <div className="bg-base-100">
      <BoardList
        boards={boards.map((b) => ({ id: b.id, name: b.name, description: b.description, icon: b.icon }))}
      />
    </div>
  );
}
