"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Flag,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  KanbanSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Rocket,
  Star,
  Target,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { createBoard, deleteBoard, renameBoard } from "./actions";

type Board = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
};

const BOARD_ICON_PRESET: { name: string; label: string; icon: LucideIcon }[] = [
  { name: "LayoutDashboard", label: "Dashboard", icon: LayoutDashboard },
  { name: "ListTodo", label: "Tarefas", icon: ListTodo },
  { name: "FolderKanban", label: "Projetos", icon: FolderKanban },
  { name: "Rocket", label: "Lançamento", icon: Rocket },
  { name: "Target", label: "Metas", icon: Target },
  { name: "CalendarDays", label: "Agenda", icon: CalendarDays },
  { name: "Lightbulb", label: "Ideias", icon: Lightbulb },
  { name: "Briefcase", label: "Trabalho", icon: Briefcase },
  { name: "GraduationCap", label: "Estudos", icon: GraduationCap },
  { name: "Users", label: "Equipe", icon: Users },
  { name: "Star", label: "Favoritos", icon: Star },
  { name: "Flag", label: "Prioridades", icon: Flag },
];

const BOARD_ICON_MAP = new Map(
  BOARD_ICON_PRESET.map((item) => [item.name, item.icon]),
);

function BoardIcon({ name }: { name: string | null }) {
  const Icon = name ? BOARD_ICON_MAP.get(name) : undefined;
  return Icon ? (
    <Icon size={22} strokeWidth={1.8} />
  ) : (
    <span aria-hidden="true">🗂️</span>
  );
}

export function BoardList({ boards }: { boards: Board[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedIcon, setEditedIcon] = useState(BOARD_ICON_PRESET[0].name);

  useEffect(() => {
    if (editingBoard) {
      setEditedName(editingBoard.name);
      setEditedDescription(editingBoard.description ?? "");
      setEditedIcon(
        BOARD_ICON_MAP.has(editingBoard.icon ?? "")
          ? editingBoard.icon!
          : BOARD_ICON_PRESET[0].name,
      );
    }
  }, [editingBoard]);

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

  function openRename(board: Board) {
    setEditingBoard(board);
  }

  function closeRename() {
    if (!isPending) setEditingBoard(null);
  }

  function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = editedName.trim();
    const description = editedDescription.trim();
    const iconChanged = editedIcon !== editingBoard?.icon;
    if (
      !editingBoard ||
      !clean ||
      (clean === editingBoard.name &&
        description === (editingBoard.description ?? "") &&
        !iconChanged)
    )
      return;

    startTransition(async () => {
      await renameBoard(editingBoard.id, clean, description, editedIcon);
      setEditingBoard(null);
      router.refresh();
    });
  }

  return (
    <section className="mx-auto w-full p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
            Kanbans
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60">
            Separe suas tarefas em colunas e acompanhe o progresso de seus projetos com os boards kanban.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm gap-2 rounded-lg px-4"
          onClick={() => setCreating(true)}
        >
          <Plus size={15} />
          Novo board
        </button>
      </header>

      {/* Grade */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board.id}
            className="group relative flex min-h-[190px] flex-col rounded-tl-2xl rounded-br-2xl border border-base-300/80 bg-base-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <Link
              href={`/dashboard/kanban/${board.id}`}
              className="flex flex-1 flex-col p-5 pb-14 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-base-300/70 bg-base-200/60 text-xl transition-colors duration-200 group-hover:border-primary/20 group-hover:bg-primary/10">
                  <BoardIcon name={board.icon} />
                </div>

                <span
                  className="flex size-8 items-center justify-center rounded-lg text-base-content/35 transition-colors group-hover:text-primary"
                  aria-hidden="true"
                >
                  <ArrowUpRight size={17} strokeWidth={1.8} />
                </span>
              </div>

              <div className="mt-5 min-w-0">
                <h3 className="truncate text-base font-semibold tracking-tight text-base-content transition-colors group-hover:text-primary">
                  {board.name}
                </h3>
                <p
                  className={`mt-1.5 line-clamp-2 text-sm leading-5 ${
                    board.description
                      ? "text-base-content/60"
                      : "text-base-content/40 italic"
                  }`}
                >
                  {board.description || "Adicione uma descrição ao seu board."}
                </p>
              </div>
            </Link>

            <div className="absolute bottom-4 right-4">
              <div className="dropdown dropdown-end">
                <button
                  type="button"
                  tabIndex={0}
                  className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:bg-base-200 hover:text-base-content"
                  aria-label={`Ações do board ${board.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal size={16} />
                </button>

                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-20 mt-1 w-44 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-lg"
                >
                  <li>
                    <button type="button" onClick={() => openRename(board)}>
                      <Pencil size={14} />
                      Renomear board
                    </button>
                  </li>
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
          <div className="flex min-h-[190px] flex-col justify-between rounded-tl-2xl rounded-br-2xl border border-primary/40 bg-primary/[0.025] p-5">
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
            className="group flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 bg-base-100 p-5 text-center transition-all duration-200 hover:border-primary/45 hover:bg-primary/[0.02]"
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

      {editingBoard && (
        <dialog
          open
          className="modal modal-bottom sm:modal-middle"
          aria-labelledby="edit-board-title"
        >
          <div className="modal-box max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="edit-board-title" className="text-lg font-bold">
                  Editar board
                </h3>
                <p className="mt-1 text-sm text-base-content/60">
                  Atualize o nome e a descrição deste espaço de trabalho.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Fechar modal"
                onClick={closeRename}
                disabled={isPending}
              >
                <X size={18} />
              </button>
            </div>

            <form className="mt-6" onSubmit={submitRename}>
              <label className="form-control w-full">
                <span className="label-text mb-2 text-sm font-medium">
                  Nome do board
                </span>
                <input
                  autoFocus
                  type="text"
                  className="input input-bordered w-full"
                  value={editedName}
                  onChange={(event) => setEditedName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") closeRename();
                  }}
                  maxLength={120}
                  disabled={isPending}
                />
              </label>

              <fieldset className="mt-4">
                <legend className="mb-2 text-sm font-medium">Ícone</legend>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {BOARD_ICON_PRESET.map(({ name, label, icon: Icon }) => {
                    const selected = editedIcon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        className={`tooltip tooltip-bottom btn btn-square h-12 w-full ${
                          selected
                            ? "btn-primary"
                            : "btn-ghost border border-base-300"
                        }`}
                        data-tip={label}
                        aria-label={`Ícone: ${label}`}
                        aria-pressed={selected}
                        onClick={() => setEditedIcon(name)}
                        disabled={isPending}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="form-control mt-4 w-full">
                <span className="label-text mb-2 text-sm font-medium">
                  Descrição
                </span>
                <textarea
                  className="textarea textarea-bordered min-h-24 w-full resize-y"
                  placeholder="Descreva o objetivo deste board"
                  value={editedDescription}
                  onChange={(event) => setEditedDescription(event.target.value)}
                  maxLength={4000}
                  disabled={isPending}
                />
                <span className="label-text-alt mt-1 text-base-content/50">
                  {editedDescription.length}/4000
                </span>
              </label>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeRename}
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    isPending ||
                    !editedName.trim() ||
                    (editedName.trim() === editingBoard.name &&
                      editedDescription.trim() ===
                        (editingBoard.description ?? "") &&
                      editedIcon === editingBoard.icon)
                  }
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </form>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={closeRename}>
              Fechar
            </button>
          </form>
        </dialog>
      )}
    </section>
  );
}
