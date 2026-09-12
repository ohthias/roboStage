import { listBoards } from "./actions";
import { BoardList } from "./board-list";

export default async function KanbanPage() {
  const boards = await listBoards();

  return (
    <div className="mx-auto w-full px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kanban</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Organize tarefas em quadros, listas e cartões para gerenciar projetos de forma visual e eficiente.
        </p>
      </div>

      <BoardList
        boards={boards.map((b) => ({ id: b.id, name: b.name, description: b.description, icon: b.icon }))}
      />
    </div>
  );
}
