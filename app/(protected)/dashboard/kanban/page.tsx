import { listBoards } from "./actions";
import { BoardList } from "./board-list";

export default async function KanbanPage() {
  const boards = await listBoards();

  return (
    <div className="mx-auto w-full px-6 py-8">
      <BoardList
        boards={boards.map((b) => ({ id: b.id, name: b.name, description: b.description, icon: b.icon }))}
      />
    </div>
  );
}
