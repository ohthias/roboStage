"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KanbanSquare, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { createBoard, deleteBoard } from "./actions";

type Board = { id: string; name: string; description: string | null; icon: string | null };

export function BoardList({ boards }: { boards: Board[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  function submit() {
    const clean = name.trim();
    if (!clean) return;
    startTransition(async () => {
      const board = await createBoard(clean);
      setName("");
      setCreating(false);
      if (board) router.push(`/dashboard/kanban/${board.id}`);
    });
  }

  function remove(id: string) {
    if (!window.confirm("Excluir este board? Todas as colunas e cards dele serão apagados.")) return;
    startTransition(async () => {
      await deleteBoard(id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board.id}
            className="group relative flex flex-col gap-2 rounded-2xl border border-base-300 bg-base-100 p-5 transition-colors hover:border-primary/40"
          >
            <Link href={`/dashboard/kanban/${board.id}`} className="flex flex-1 flex-col gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
                {board.icon ?? "🗂️"}
              </span>
              <h3 className="font-semibold">{board.name}</h3>
              {board.description && (
                <p className="line-clamp-2 text-sm text-base-content/60">{board.description}</p>
              )}
            </Link>

            <div
              className="dropdown dropdown-end absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" tabIndex={0} className="btn btn-ghost btn-xs btn-square">
                <MoreHorizontal size={14} />
              </button>
              <ul tabIndex={0} className="menu dropdown-content z-10 mt-1 w-40 rounded-lg border border-base-300 bg-base-100 p-1 shadow-xl">
                <li>
                  <button type="button" className="text-error" onClick={() => remove(board.id)}>
                    <Trash2 size={13} />
                    Excluir
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ))}

        {creating ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-base-300 bg-base-100 p-5">
            <input
              autoFocus
              className="input input-bordered input-sm"
              placeholder="Nome do board"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") setCreating(false);
              }}
            />
            <div className="flex gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={isPending}>
                Criar
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setCreating(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-base-300 p-5 text-base-content/40 transition-colors hover:border-primary/40 hover:text-base-content"
            onClick={() => setCreating(true)}
          >
            <Plus size={22} />
            Novo board
          </button>
        )}
      </div>

      {boards.length === 0 && !creating && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 py-16 text-center">
          <KanbanSquare size={36} className="mb-3 text-base-content/25" />
          <p className="text-sm text-base-content/50">Nenhum board ainda. Crie o primeiro acima.</p>
        </div>
      )}
    </div>
  );
}
