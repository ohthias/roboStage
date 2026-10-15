"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CircleAlert,
  Flag,
  GripVertical,
  MoreHorizontal,
  Milestone as MilestoneIcon,
  Palette,
  Pencil,
  Plus,
  Settings2,
  Tags,
  Trash2,
} from "lucide-react";
import {
  createCard,
  createColumn,
  createTag,
  deleteColumn,
  moveCard,
  renameColumn,
  renameTag,
  updateColumnColor,
} from "./actions";
import { CardModal } from "./card-modal";
import { ColumnRulesModal, type ColumnRules } from "./column-rules-modal";
import { MilestonesModal } from "./milestones-modal";
import { LiveRefresh } from "@/components/stagebook/live-refresh";
import { BoardAlternativeViews, VIEW_OPTIONS } from "./board-view-modes";

type Column = { id: string; name: string; position: number; color: string | null; rules: ColumnRules };
type Card = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  dueAt: string | null;
  priority: string;
  milestoneId: string | null;
};
type Assignee = { cardId: string; userId: string; name: string | null; avatarUrl: string | null };
type CardTag = { cardId: string; tagId: string; name: string };
type Tag = { id: string; name: string };
type Milestone = { id: string; name: string; dueAt: string | Date | null };
type TeamMember = { userId: string; name: string | null; avatarUrl: string | null; role: string };

const PRIORITY_STYLE: Record<string, string> = {
  baixa: "text-base-content/45",
  media: "text-info",
  alta: "text-warning",
  urgente: "text-error",
};

const PRIORITY_LABEL: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const COLUMN_COLORS = ["#64748b", "#2563eb", "#0891b2", "#16a34a", "#ca8a04", "#ea580c", "#dc2626", "#9333ea", "#db2777"];

function isDueToday(dueAt: string | null) {
  if (!dueAt) return false;
  const due = new Date(dueAt);
  const today = new Date();
  return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth() && due.getDate() === today.getDate();
}

function isOverdue(dueAt: string | null) {
  if (!dueAt) return false;
  const due = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today && !isDueToday(dueAt);
}

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
  allTags,
  milestones,
  teamMembers,
  isTeamScope,
}: {
  boardId: string;
  boardName: string;
  columns: Column[];
  cards: Card[];
  assignees: Assignee[];
  cardTags: CardTag[];
  allTags: Tag[];
  milestones: Milestone[];
  teamMembers: TeamMember[];
  isTeamScope: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [rulesColumn, setRulesColumn] = useState<Column | null>(null);
  const [milestonesModalOpen, setMilestonesModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar" | "timeline">("kanban");

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

  function handleCreateTag() {
    const clean = newTagName.trim();
    if (!clean) return;
    startTransition(async () => {
      await createTag(clean);
      setNewTagName("");
      refresh();
    });
  }

  function handleRenameTag() {
    const clean = editingTagName.trim();
    if (!editingTagId || !clean) return;
    startTransition(async () => {
      await renameTag(editingTagId, clean);
      setEditingTagId(null);
      setEditingTagName("");
      refresh();
    });
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

  function openRules(column: Column) {
    setRulesColumn(column);
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

  function handleColumnColor(column: Column, color: string | null) {
    startTransition(async () => {
      await updateColumnColor(boardId, column.id, color);
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
      <LiveRefresh />
      <div className="flex items-center justify-between border-b border-base-300 bg-base-100 px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary/70">Board view</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight">{boardName}</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <div className="join border border-base-300 bg-base-200/50 p-0.5">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button key={option.value} type="button" className={`btn btn-sm join-item gap-1.5 border-0 ${viewMode === option.value ? "btn-primary" : "btn-ghost"}`} onClick={() => setViewMode(option.value)} title={`Visualização ${option.label}`}>
                  <Icon size={14} />
                  <span className="hidden md:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            onClick={() => setTagsModalOpen(true)}
          >
            <Tags size={15} />
            Gerenciar tags
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            onClick={() => setMilestonesModalOpen(true)}
          >
            <MilestoneIcon size={15} />
            Milestones
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-5 overflow-x-auto bg-base-200/30 px-6 py-6">
        {viewMode !== "kanban" && (
          <div className="w-full min-w-[min(42rem,100%)]">
            <BoardAlternativeViews mode={viewMode} columns={columns} cards={cards} milestones={milestones} onSelectCard={setSelectedCardId} />
          </div>
        )}
        {viewMode === "kanban" && (
          <>
          {columns.map((column) => {
          const columnCards = cardsByColumn.get(column.id) ?? [];
          return (
            <div
              key={column.id}
              className="flex w-[min(22rem,calc(100vw-3rem))] shrink-0 flex-col overflow-hidden rounded-2xl border border-base-300/80 bg-base-200/70 shadow-sm"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropOnColumnEnd(column.id)}
            >
              <div className="group border-t-4 bg-base-100/80 px-4 py-3" style={{ borderTopColor: column.color ?? "hsl(var(--p))" }}>
                <div className="flex items-center justify-between gap-3">
                  <button type="button" className="flex min-w-0 items-center gap-2 text-left text-sm font-semibold hover:underline" onClick={() => handleRenameColumn(column)}>
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: column.color ?? "hsl(var(--p))" }} />
                    <span className="truncate">{column.name}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-base-200 px-2 py-0.5 text-xs font-medium text-base-content/55">{columnCards.length}</span>
                    <div className="dropdown dropdown-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button type="button" tabIndex={0} className="btn btn-ghost btn-xs btn-square">
                      <MoreHorizontal size={13} />
                    </button>
                    <ul tabIndex={0} className="menu dropdown-content z-10 mt-1 w-48 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl">
                      <li>
                        <button type="button" onClick={() => openRules(column)}>
                          <Settings2 size={13} />
                          Regras da coluna
                        </button>
                      </li>
                      <li className="menu-title flex-row items-center gap-2 px-2 py-1 text-xs"><Palette size={13} /> Cor da coluna</li>
                      <li>
                        <div className="flex flex-wrap gap-2 px-2 py-2">
                          {COLUMN_COLORS.map((color) => (
                            <button key={color} type="button" aria-label={`Usar cor ${color}`} className="flex size-6 items-center justify-center rounded-full border border-base-300" style={{ backgroundColor: color }} onClick={() => handleColumnColor(column, color)}>
                              {column.color === color && <Check size={13} className="text-white" />}
                            </button>
                          ))}
                          {column.color && <button type="button" className="text-xs text-base-content/60 underline" onClick={() => handleColumnColor(column, null)}>Limpar</button>}
                        </div>
                      </li>
                      <li>
                        <button type="button" className="text-error" onClick={() => handleDeleteColumn(column.id)}>
                          <Trash2 size={12} />
                          Excluir
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                {Object.values(column.rules ?? {}).some(Boolean) && (
                  <p className="mt-2 flex items-center gap-1 pl-4 text-[10px] font-medium text-primary/70">
                    <Settings2 size={11} /> Regras ativas
                  </p>
                )}

                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-2">
                {columnCards.map((card) => {
                  const cardAssignees = assigneesByCard.get(card.id) ?? [];
                  const cardTagList = tagsByCard.get(card.id) ?? [];
                  const dueToday = isDueToday(card.dueAt);
                  const overdue = isOverdue(card.dueAt);
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
                      className="flex cursor-grab flex-col gap-2 rounded-xl border border-base-300/80 bg-base-100 p-3.5 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={15} className="mt-0.5 shrink-0 text-base-content/25" />
                        <span className="font-medium leading-5">{card.title}</span>
                      </div>

                      {cardTagList.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cardTagList.map((t) => (
                            <span key={t.tagId} className="badge badge-ghost badge-xs border-0 bg-primary/10 text-primary">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${PRIORITY_STYLE[card.priority] ?? "text-base-content/45"}`} title={`Prioridade: ${PRIORITY_LABEL[card.priority] ?? card.priority}`}>
                            {card.priority === "urgente" || card.priority === "alta" ? <AlertTriangle size={13} /> : <Flag size={13} />}
                            {PRIORITY_LABEL[card.priority] ?? card.priority}
                          </span>
                          {card.dueAt && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${dueToday ? "text-warning" : overdue ? "text-error" : "text-base-content/40"}`} title={dueToday ? "Entrega hoje" : overdue ? "Prazo vencido" : "Prazo de entrega"}>
                              {dueToday || overdue ? <CircleAlert size={12} /> : <CalendarClock size={12} />}
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
          </>
        )}
      </div>

      {milestonesModalOpen && (
        <MilestonesModal
          boardId={boardId}
          milestones={milestones}
          cards={cards}
          onClose={() => setMilestonesModalOpen(false)}
          onChanged={refresh}
        />
      )}

      {rulesColumn && (
        <ColumnRulesModal
          boardId={boardId}
          columnId={rulesColumn.id}
          columnName={rulesColumn.name}
          initialRules={rulesColumn.rules ?? {}}
          milestones={milestones}
          onClose={() => setRulesColumn(null)}
          onChanged={refresh}
        />
      )}

      {selectedCard && (
        <CardModal
          boardId={boardId}
          card={selectedCard}
          assignees={assigneesByCard.get(selectedCard.id) ?? []}
          tags={tagsByCard.get(selectedCard.id) ?? []}
          teamMembers={teamMembers}
          milestones={milestones}
          isTeamScope={isTeamScope}
          onClose={() => setSelectedCardId(null)}
          onChanged={() => {
            router.refresh();
          }}
        />
      )}

      {tagsModalOpen && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="tags-modal-title">
          <div className="modal-box max-w-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="tags-modal-title" className="text-lg font-bold">Tags do workspace</h2>
                <p className="mt-1 text-sm text-base-content/55">
                  Crie e renomeie tags reutilizáveis nos seus cards.
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Fechar gerenciador de tags" onClick={() => setTagsModalOpen(false)}>×</button>
            </div>

            <form
              className="mt-5 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateTag();
              }}
            >
              <input
                className="input input-bordered input-sm flex-1"
                placeholder="Nome da nova tag"
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                maxLength={40}
              />
              <button type="submit" className="btn btn-primary btn-sm gap-2">
                <Plus size={14} />
                Criar tag
              </button>
            </form>

            <label className="input input-bordered input-sm mt-4 flex items-center gap-2">
              <Tags size={14} className="text-base-content/40" />
              <input
                type="search"
                className="grow"
                placeholder="Buscar tags..."
                value={tagSearch}
                onChange={(event) => setTagSearch(event.target.value)}
              />
            </label>

            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {allTags.filter((tag) => tag.name.toLocaleLowerCase().includes(tagSearch.trim().toLocaleLowerCase())).map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-200/40 p-2">
                  {editingTagId === tag.id ? (
                    <>
                      <input
                        autoFocus
                        className="input input-bordered input-sm flex-1"
                        value={editingTagName}
                        onChange={(event) => setEditingTagName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleRenameTag();
                          if (event.key === "Escape") setEditingTagId(null);
                        }}
                        maxLength={40}
                      />
                      <button type="button" className="btn btn-primary btn-xs" onClick={handleRenameTag}>Salvar</button>
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => setEditingTagId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <span className="badge badge-primary badge-outline">{tag.name}</span>
                      <span className="flex-1" />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs gap-1"
                        onClick={() => {
                          setEditingTagId(tag.id);
                          setEditingTagName(tag.name);
                        }}
                      >
                        <Pencil size={13} />
                        Renomear
                      </button>
                    </>
                  )}

                </div>
              ))}
              {allTags.filter((tag) => tag.name.toLocaleLowerCase().includes(tagSearch.trim().toLocaleLowerCase())).length === 0 && (
                <p className="py-8 text-center text-sm text-base-content/45">Nenhuma tag encontrada.</p>
              )}
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-sm" onClick={() => setTagsModalOpen(false)}>Fechar</button>
            </div>
          </div>
          <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={() => setTagsModalOpen(false)} />
        </div>
      )}
    </div>
  );
}
