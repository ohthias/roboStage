"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
  createCard,
  createColumn,
  deleteColumn,
  moveCard,
  renameColumn,
} from "./actions";
import { CardModal } from "./card-modal";

type Column = { id: string; name: string; position: number; color: string | null };
type Card = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  dueAt: string | null;
  priority: string;
};
type Assignee = { cardId: string; userId: string; name: string | null; avatarUrl: string | null };
type CardTag = { cardId: string; tagId: string; name: string };
type TeamMember = { userId: string; name: string | null; avatarUrl: string | null; role: string };

const PRIORITY_STYLE: Record<string, string> = {
  baixa: "badge-ghost",
  media: "badge-info badge-outline",
  alta: "badge-warning badge-outline",
  urgente: "badge-error",
};

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function BoardView({
  boardId,
  boardName,
  columns,
  cards,
  assignees,
  cardTags,
  teamMembers,
  isTeamScope,
}: {
  boardId: string;
  boardName: string;
  columns: Column[];
  cards: Card[];
  assignees: Assignee[];
  cardTags: CardTag[];
  teamMembers: TeamMember[];
  isTeamScope: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const card of cards) {
      if (!map.has(card.columnId)) map.set(card.columnId, []);
      map.get(card.columnId)!.push(card);
    }
    for (const list of map.values()) list.sort((a, b) => a.position - b.position);
    return map;
  }, [cards]);

  const assigneesByCard = useMemo(() => {
    const map = new Map<string, Assignee[]>();
    for (const a of assignees) {
      if (!map.has(a.cardId)) map.set(a.cardId, []);
      map.get(a.cardId)!.push(a);
    }
    return map;
  }, [assignees]);

  const tagsByCard = useMemo(() => {
    const map = new Map<string, CardTag[]>();
    for (const t of cardTags) {
      if (!map.has(t.cardId)) map.set(t.cardId, []);
      map.get(t.cardId)!.push(t);
    }
    return map;
  }, [cardTags]);

  function refresh() {
    router.refresh();
  }

  function handleAddColumn() {
    const clean = newColumnName.trim();
    if (!clean) return;
    startTransition(async () => {
      await createColumn(boardId, clean);
      setNewColumnName("");
      setAddingColumn(false);
      refresh();
    });
  }

  function handleAddCard(columnId: string) {
    startTransition(async () => {
      const card = await createCard(boardId, columnId, "Novo card");
      refresh();
      if (card) setSelectedCardId(card.id);
    });
  }

  function handleRenameColumn(column: Column) {
    const next = window.prompt("Nome da coluna", column.name);
    if (!next || !next.trim() || next.trim() === column.name) return;
    startTransition(async () => {
      await renameColumn(boardId, column.id, next.trim());
      refresh();
    });
  }

  function handleDeleteColumn(columnId: string) {
    if (!window.confirm("Excluir esta coluna? Os cards dentro dela também serão apagados.")) return;
    startTransition(async () => {
      await deleteColumn(boardId, columnId);
      refresh();
    });
  }

  function dropOnColumnEnd(columnId: string) {
    if (!draggedCardId) return;
    const columnCards = cardsByColumn.get(columnId) ?? [];
    const last = columnCards[columnCards.length - 1];
    startTransition(async () => {
      await moveCard(boardId, draggedCardId, columnId, last?.position ?? null, null);
      setDraggedCardId(null);
      refresh();
    });
  }

  function dropBeforeCard(columnId: string, targetCard: Card) {
    if (!draggedCardId || draggedCardId === targetCard.id) return;
    const columnCards = cardsByColumn.get(columnId) ?? [];
    const idx = columnCards.findIndex((c) => c.id === targetCard.id);
    const prev = columnCards[idx - 1];
    startTransition(async () => {
      await moveCard(boardId, draggedCardId, columnId, prev?.position ?? null, targetCard.position);
      setDraggedCardId(null);
      refresh();
    });
  }

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b border-base-300 px-6 py-4">
        <h1 className="text-xl font-bold">{boardName}</h1>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto px-6 py-5">
        {columns.map((column) => {
          const columnCards = cardsByColumn.get(column.id) ?? [];
          return (
            <div
              key={column.id}
              className="flex w-72 shrink-0 flex-col rounded-xl bg-base-200/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropOnColumnEnd(column.id)}
            >
              <div className="group flex items-center justify-between px-3 py-2.5">
                <button
                  type="button"
                  className="truncate text-sm font-semibold hover:underline"
                  onClick={() => handleRenameColumn(column)}
                >
                  {column.name}
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-base-content/40">{columnCards.length}</span>
                  <div className="dropdown dropdown-end opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" tabIndex={0} className="btn btn-ghost btn-xs btn-square">
                      <MoreHorizontal size={13} />
                    </button>
                    <ul tabIndex={0} className="menu dropdown-content z-10 mt-1 w-36 rounded-lg border border-base-300 bg-base-100 p-1 shadow-xl">
                      <li>
                        <button type="button" className="text-error" onClick={() => handleDeleteColumn(column.id)}>
                          <Trash2 size={12} />
                          Excluir
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                {columnCards.map((card) => {
                  const cardAssignees = assigneesByCard.get(card.id) ?? [];
                  const cardTagList = tagsByCard.get(card.id) ?? [];
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDraggedCardId(card.id)}
                      onDragEnd={() => setDraggedCardId(null)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropBeforeCard(column.id, card);
                      }}
                      onClick={() => setSelectedCardId(card.id)}
                      className="flex cursor-pointer flex-col gap-2 rounded-lg border border-base-300 bg-base-100 p-3 text-sm shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="font-medium">{card.title}</span>

                      {cardTagList.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cardTagList.map((t) => (
                            <span key={t.tagId} className="badge badge-ghost badge-xs">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`badge badge-xs ${PRIORITY_STYLE[card.priority] ?? "badge-ghost"}`}>
                            {card.priority}
                          </span>
                          {card.dueAt && (
                            <span className="text-[10px] text-base-content/40">
                              {new Date(card.dueAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </span>
                          )}
                        </div>

                        {cardAssignees.length > 0 && (
                          <div className="flex -space-x-1.5">
                            {cardAssignees.slice(0, 3).map((a) => (
                              <span
                                key={a.userId}
                                title={a.name ?? undefined}
                                className="flex h-5 w-5 items-center justify-center rounded-full border border-base-100 bg-primary/20 text-[9px] font-semibold"
                              >
                                {initials(a.name)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs text-base-content/40 hover:bg-base-300/50 hover:text-base-content"
                  onClick={() => handleAddCard(column.id)}
                >
                  <Plus size={13} />
                  Adicionar card
                </button>
              </div>
            </div>
          );
        })}

        <div className="w-64 shrink-0">
          {addingColumn ? (
            <div className="flex flex-col gap-2 rounded-xl bg-base-200/50 p-3">
              <input
                autoFocus
                className="input input-bordered input-sm"
                placeholder="Nome da coluna"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") setAddingColumn(false);
                }}
              />
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary btn-xs" onClick={handleAddColumn}>
                  Adicionar
                </button>
                <button type="button" className="btn btn-xs" onClick={() => setAddingColumn(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-1.5 rounded-xl border border-dashed border-base-300 px-3 py-2.5 text-sm text-base-content/40 hover:border-primary/40 hover:text-base-content"
              onClick={() => setAddingColumn(true)}
            >
              <Plus size={15} />
              Nova coluna
            </button>
          )}
        </div>
      </div>

      {selectedCard && (
        <CardModal
          boardId={boardId}
          card={selectedCard}
          assignees={assigneesByCard.get(selectedCard.id) ?? []}
          tags={tagsByCard.get(selectedCard.id) ?? []}
          teamMembers={teamMembers}
          isTeamScope={isTeamScope}
          onClose={() => setSelectedCardId(null)}
          onChanged={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
