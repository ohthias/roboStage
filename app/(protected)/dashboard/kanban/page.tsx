import { listBoards } from "./actions";
import { BoardList } from "./board-list";

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
