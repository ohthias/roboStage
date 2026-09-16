"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, KanbanSquare, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { createBoard, deleteBoard } from "./actions";

type Board = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
};

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
    if (
      !window.confirm(
        "Excluir este board? Todas as colunas e cards dele serão apagados.",
      )
    )
      return;
    startTransition(async () => {
      await deleteBoard(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Seus boards
          </h2>

          <p className="mt-1 text-sm text-base-content/55">
            Organize tarefas, projetos e o seu trabalho, ou da sua equipe.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-base-content/40">
            {boards.length} {boards.length === 1 ? "board" : "boards"}
          </span>

          {!creating && (
            <button
              type="button"
              className="btn btn-primary btn-sm h-10 gap-2 rounded-lg px-4 normal-case"
              onClick={() => setCreating(true)}
            >
              <Plus size={15} />
              Novo board
            </button>
          )}
        </div>
      </div>

      {/* Grade */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board.id}
            className="group relative flex min-h-[190px] flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
          >
            {/* Accent decorativo */}
            <div className="absolute left-0 top-0 h-1 w-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />

            <Link
              href={`/dashboard/kanban/${board.id}`}
              className="flex flex-1 flex-col p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-xl">
                  {board.icon ?? "🗂️"}
                </span>

                <span className="flex h-7 w-7 items-center justify-center rounded-md text-base-content/25 transition-colors group-hover:text-primary">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <div className="mt-5">
                <h3 className="truncate text-base font-semibold tracking-tight">
                  {board.name}
                </h3>

                {board.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-base-content/55">
                    {board.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-base-content/30">
                    Sem descrição
                  </p>
                )}
              </div>
            </Link>

            {/* Menu */}
            <div className="absolute bottom-4 right-4">
              <div className="dropdown dropdown-end">
                <button
                  type="button"
                  tabIndex={0}
                  className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:bg-base-200 hover:text-base-content"
                  aria-label={`Ações do board ${board.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={16} />
                </button>

                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-20 mt-1 w-44 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-lg"
                >
                  <li>
                    <button
                      type="button"
                      className="text-error hover:bg-error/10"
                      onClick={() => remove(board.id)}
                    >
                      <Trash2 size={14} />
                      Excluir board
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}

        {/* Novo board */}
        {creating ? (
          <div className="flex min-h-[190px] flex-col justify-between rounded-2xl border border-primary/40 bg-primary/[0.025] p-5">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus size={16} />
                </span>

                <span className="text-sm font-semibold">Novo board</span>
              </div>

              <input
                autoFocus
                className="input input-bordered input-sm h-10 w-full rounded-lg bg-base-100"
                placeholder="Nome do board"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                  if (e.key === "Escape") setCreating(false);
                }}
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm flex-1 rounded-lg"
                onClick={submit}
                disabled={isPending || !name.trim()}
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Criar board"
                )}
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-lg"
                onClick={() => setCreating(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="group flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 p-5 text-center transition-all duration-200 hover:border-primary/45 hover:bg-primary/[0.02]"
            onClick={() => setCreating(true)}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-base-300 text-base-content/35 transition-colors group-hover:border-primary/40 group-hover:text-primary">
              <Plus size={20} strokeWidth={1.8} />
            </span>

            <div>
              <p className="text-sm font-semibold text-base-content/65 group-hover:text-base-content">
                Novo board
              </p>

              <p className="mt-1 text-xs text-base-content/40">
                Comece a organizar seu trabalho
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Estado vazio */}
      {boards.length === 0 && !creating && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <KanbanSquare size={26} strokeWidth={1.6} />
          </div>

          <h3 className="text-base font-semibold">
            Seu espaço de trabalho começa aqui
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-base-content/50">
            Crie seu primeiro board para organizar tarefas, acompanhar projetos
            e colaborar com sua equipe.
          </p>

          <button
            type="button"
            className="btn btn-primary btn-sm mt-6 gap-2 rounded-lg px-4"
            onClick={() => setCreating(true)}
          >
            <Plus size={15} />
            Criar primeiro board
          </button>
        </div>
      )}
    </div>
  );
}
