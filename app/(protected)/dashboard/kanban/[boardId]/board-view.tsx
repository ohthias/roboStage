"use client";

import { createElement, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  LayoutDashboard,
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
  deleteColumn,
  moveCard,
  renameColumn,
  setCardCompleted,
  updateColumnColor,
} from "./actions";
import { CardModal } from "./card-modal";
import { ColumnRulesModal, type ColumnRules } from "./column-rules-modal";
import { MilestonesModal } from "./milestones-modal";
import { BoardSettingsModal } from "./board-settings-modal";
import { BOARD_ICON_MAP } from "../board-icons";
import { TagChip } from "@/components/stagebook/labels/tag-chip";
import { LabelsManagerModal } from "@/components/stagebook/labels/labels-manager-modal";
import { LiveRefresh } from "@/components/stagebook/live-refresh";
import { BoardAlternativeViews, VIEW_OPTIONS } from "./board-view-modes";
import Link from "next/link";

import { unwrapAction } from "@/utils/stagebook/action-result";
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
  completedAt: string | null;
};
type Assignee = { cardId: string; userId: string; name: string | null; avatarUrl: string | null };
type CardTag = { cardId: string; tagId: string; name: string; color: string | null };
type Tag = { id: string; name: string; color: string | null };
type Milestone = { id: string; name: string; color?: string | null; dueAt: string | Date | null };
type TeamMember = { userId: string; name: string | null; avatarUrl: string | null; role: string };

const PRIORITY_STYLE: Record<string, string> = {
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

/**
 * Fundo do card na cor da coluna. Mistura com --color-base-100 para manter o
 * texto legível nos temas claro e escuro; concluídos ficam mais suaves.
 */
function cardTint(color: string | null, done: boolean) {
  if (!color) return null;
  const amount = done ? 5 : 10;
  return {
    bg: `color-mix(in oklab, ${color} ${amount}%, var(--color-base-100))`,
    border: `color-mix(in oklab, ${color} ${amount * 2.5}%, var(--color-base-100))`,
  };
}

function formatDue(dueAt: string) {
  return new Date(dueAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
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
  boardDescription,
  boardIcon,
  columns,
  cards,
  assignees,
  cardTags,
  allTags,
  milestones,
  teamMembers,
  isTeamScope,
  canManageLabels,
}: {
  boardId: string;
  boardName: string;
  boardDescription: string | null;
  boardIcon: string | null;
  columns: Column[];
  cards: Card[];
  assignees: Assignee[];
  cardTags: CardTag[];
  allTags: Tag[];
  milestones: Milestone[];
  teamMembers: TeamMember[];
  isTeamScope: boolean;
  /** Pode excluir/mesclar tags e milestones (owner/mentor em equipes). */
  canManageLabels: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [rulesColumn, setRulesColumn] = useState<Column | null>(null);
  const [milestonesModalOpen, setMilestonesModalOpen] = useState(false);
  const [boardSettingsOpen, setBoardSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar" | "timeline">("kanban");
  // Atualização otimista do check de conclusão (o servidor confirma no refresh).
  const [completionOverride, setCompletionOverride] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const isCompleted = (card: Card) => completionOverride[card.id] ?? Boolean(card.completedAt);

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

  function handleToggleCompleted(card: Card) {
    const next = !isCompleted(card);
    setCompletionOverride((prev) => ({ ...prev, [card.id]: next }));
    startTransition(async () => {
      const result = await setCardCompleted(boardId, card.id, next);
      if (!result.ok) setNotice(result.error);
      setCompletionOverride((prev) => {
        const { [card.id]: _, ...rest } = prev;
        return rest;
      });
      refresh();
    });
  }

  function handleAddColumn() {
    const clean = newColumnName.trim();
    if (!clean) return;
    startTransition(async () => {
      unwrapAction(await createColumn(boardId, clean));
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
      const card = unwrapAction(await createCard(boardId, columnId, "Novo card"));
      refresh();
      if (card) setSelectedCardId(card.id);
    });
  }

  function handleRenameColumn(column: Column) {
    const next = window.prompt("Nome da coluna", column.name);
    if (!next || !next.trim() || next.trim() === column.name) return;
    startTransition(async () => {
      unwrapAction(await renameColumn(boardId, column.id, next.trim()));
      refresh();
    });
  }

  function handleColumnColor(column: Column, color: string | null) {
    startTransition(async () => {
      unwrapAction(await updateColumnColor(boardId, column.id, color));
      refresh();
    });
  }

  function handleDeleteColumn(columnId: string) {
    if (!window.confirm("Excluir esta coluna? Os cards dentro dela também serão apagados.")) return;
    startTransition(async () => {
      unwrapAction(await deleteColumn(boardId, columnId));
      refresh();
    });
  }

  function dropOnColumnEnd(columnId: string) {
    if (!draggedCardId) return;
    const columnCards = cardsByColumn.get(columnId) ?? [];
    const last = columnCards[columnCards.length - 1];
    startTransition(async () => {
      const result = await moveCard(boardId, draggedCardId, columnId, last?.position ?? null, null);
      if (!result.ok) setNotice(result.error);
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
      const result = await moveCard(boardId, draggedCardId, columnId, prev?.position ?? null, targetCard.position);
      if (!result.ok) setNotice(result.error);
      setDraggedCardId(null);
      refresh();
    });
  }

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  function renderCard(card: Card, column: Column, compact = false) {
    const cardAssignees = assigneesByCard.get(card.id) ?? [];
    const cardTagList = tagsByCard.get(card.id) ?? [];
    const done = isCompleted(card);
    const dueToday = !done && isDueToday(card.dueAt);
    const overdue = !done && isOverdue(card.dueAt);
    const locked = Boolean(column.rules?.autoComplete);
    const tint = cardTint(column.color, done);
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
        style={tint ? { backgroundColor: tint.bg, borderColor: tint.border } : undefined}
        className={`group/card flex cursor-pointer gap-2.5 rounded-lg border border-base-300/70 bg-base-100 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:border-base-content/15 active:cursor-grabbing ${compact ? "px-3 py-2" : "p-3"} ${draggedCardId === card.id ? "opacity-40" : ""}`}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Reabrir tarefa ${card.title}` : `Marcar ${card.title} como concluída`}
          title={locked ? "Concluída automaticamente por esta coluna" : done ? "Reabrir tarefa" : "Marcar como concluída"}
          disabled={locked}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCompleted(card);
          }}
          className={`mt-px flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            done
              ? "border-success bg-success text-success-content"
              : "border-base-content/25 hover:border-success hover:bg-success/10"
          } ${locked ? "cursor-default" : ""}`}
        >
          {done && <Check size={10} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-[13px] font-medium leading-[1.35] ${done ? "text-base-content/45 line-through decoration-base-content/30" : "text-base-content"}`}>
              {card.title}
            </span>
            {cardAssignees.length > 0 && (
              <div className="flex shrink-0 -space-x-1.5">
                {cardAssignees.slice(0, 2).map((a) =>
                  a.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={a.userId} src={a.avatarUrl} alt={a.name ?? ""} title={a.name ?? undefined} className="size-5 rounded-full border border-base-100 object-cover" />
                  ) : (
                    <span key={a.userId} title={a.name ?? undefined} className="flex size-5 items-center justify-center rounded-full border border-base-100 bg-base-300 text-[8px] font-semibold text-base-content/70">
                      {initials(a.name)}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {!compact && (card.dueAt || PRIORITY_STYLE[card.priority] || cardTagList.length > 0) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-base-content/45">
              {card.dueAt && (
                <span className={dueToday ? "font-medium text-warning" : overdue ? "font-medium text-error" : ""} title={dueToday ? "Entrega hoje" : overdue ? "Prazo vencido" : "Prazo de entrega"}>
                  {dueToday ? "Entrega hoje" : `Prazo ${formatDue(card.dueAt)}`}
                </span>
              )}
              {!done && PRIORITY_STYLE[card.priority] && (
                <span className={`inline-flex items-center gap-0.5 ${PRIORITY_STYLE[card.priority]}`} title={`Prioridade: ${PRIORITY_LABEL[card.priority]}`}>
                  <AlertTriangle size={11} />
                  {PRIORITY_LABEL[card.priority]}
                </span>
              )}
              {cardTagList.map((t) => (
                <TagChip key={t.tagId} tag={t} size="xs" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <LiveRefresh />

      <header className="px-8 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-base-content/45" aria-label="Navegação">
          <Link href="/dashboard/kanban" className="hover:text-base-content">Kanban</Link>
          <span>/</span>
          <span className="truncate text-base-content/65">{boardName}</span>
        </nav>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setBoardSettingsOpen(true)}
              className="group/title flex items-center gap-3 text-left"
              title="Editar board"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-base-300/60 text-base-content/70">
                {createElement((boardIcon && BOARD_ICON_MAP.get(boardIcon)) || LayoutDashboard, { size: 17, strokeWidth: 1.8 })}
              </span>
              <h1 className="truncate text-2xl font-semibold tracking-tight">{boardName}</h1>
              <Pencil size={14} className="shrink-0 text-base-content/30 opacity-0 transition-opacity group-hover/title:opacity-100 group-focus-visible/title:opacity-100" />
            </button>
            {boardDescription && (
              <p className="mt-1.5 max-w-2xl pl-11 text-[13px] leading-relaxed text-base-content/50">{boardDescription}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = viewMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setViewMode(option.value)}
                  title={`Visualização ${option.label}`}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors ${active ? "font-medium text-base-content" : "text-base-content/50 hover:text-base-content"}`}
                >
                  <Icon size={14} />
                  <span className="hidden md:inline">{option.label}</span>
                </button>
              );
            })}
            <span className="mx-1 h-4 w-px bg-base-300" />
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-base-content/50 hover:text-base-content" onClick={() => setTagsModalOpen(true)}>
              <Tags size={14} />
              <span className="hidden md:inline">Tags</span>
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-base-content/50 hover:text-base-content" onClick={() => setMilestonesModalOpen(true)}>
              <MilestoneIcon size={14} />
              <span className="hidden md:inline">Milestones</span>
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-base-content/50 hover:text-base-content" onClick={() => setBoardSettingsOpen(true)}>
              <Pencil size={14} />
              <span className="hidden md:inline">Editar</span>
            </button>
          </div>
        </div>
      </header>

      {notice && (
        <div role="alert" className="mx-8 mt-4 flex items-center justify-between gap-3 rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-xs text-error">
          <span>{notice}</span>
          <button type="button" className="text-error/70 hover:text-error" onClick={() => setNotice(null)}>Fechar</button>
        </div>
      )}

      <div className="flex flex-1 items-start gap-4 overflow-x-auto px-8 pb-8 pt-6">
        {viewMode !== "kanban" && (
          <div className="w-full min-w-[min(42rem,100%)]">
            <BoardAlternativeViews mode={viewMode} columns={columns} cards={cards} milestones={milestones} onSelectCard={setSelectedCardId} />
          </div>
        )}
        {viewMode === "kanban" && (
          <>
            {columns.map((column) => {
              const columnCards = cardsByColumn.get(column.id) ?? [];
              const autoComplete = Boolean(column.rules?.autoComplete);
              // Coluna de conclusão automática: tudo nela já está concluído.
              // Demais colunas: as concluídas vão para o menu suspenso.
              const openCards = autoComplete ? columnCards : columnCards.filter((c) => !isCompleted(c));
              const doneCards = autoComplete ? [] : columnCards.filter((c) => isCompleted(c));
              const hasRules = Object.entries(column.rules ?? {}).some(([key, value]) => key !== "autoComplete" && (Array.isArray(value) ? value.length > 0 : Boolean(value)));
              return (
                <section
                  key={column.id}
                  aria-label={column.name}
                  className="flex w-[min(17.5rem,calc(100vw-4rem))] shrink-0 flex-col"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropOnColumnEnd(column.id)}
                >
                  <div className="group mb-3 flex h-7 items-center justify-between gap-2">
                    <button type="button" className="flex min-w-0 items-center gap-2 text-left text-[13px] text-base-content/75 hover:text-base-content" onClick={() => handleRenameColumn(column)} title="Renomear coluna">
                      {column.color && <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: column.color }} />}
                      <span className="truncate">{column.name}</span>
                      <span className="rounded bg-base-300/70 px-1.5 text-[10px] font-medium leading-4 text-base-content/55">{openCards.length}</span>
                      {autoComplete && <CircleCheck size={13} className="shrink-0 text-success" aria-label="Conclusão automática" />}
                      {hasRules && <Settings2 size={12} className="shrink-0 text-base-content/35" aria-label="Regras ativas" />}
                    </button>

                    <div className="dropdown dropdown-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button type="button" tabIndex={0} className="btn btn-ghost btn-xs btn-square text-base-content/50" aria-label="Opções da coluna">
                        <MoreHorizontal size={14} />
                      </button>
                      <ul tabIndex={0} className="menu dropdown-content z-10 mt-1 w-52 rounded-lg border border-base-300 bg-base-100 p-1.5 text-xs shadow-lg">
                        <li>
                          <button type="button" onClick={() => openRules(column)}>
                            <Settings2 size={13} />
                            Regras da coluna
                          </button>
                        </li>
                        <li className="menu-title flex-row items-center gap-2 px-2 py-1 text-[11px]"><Palette size={12} /> Cor</li>
                        <li>
                          <div className="flex flex-wrap gap-1.5 px-2 py-1.5">
                            {COLUMN_COLORS.map((color) => (
                              <button key={color} type="button" aria-label={`Usar cor ${color}`} className="flex size-5 items-center justify-center rounded-full" style={{ backgroundColor: color }} onClick={() => handleColumnColor(column, color)}>
                                {column.color === color && <Check size={11} className="text-white" />}
                              </button>
                            ))}
                            {column.color && <button type="button" className="text-[11px] text-base-content/60 underline" onClick={() => handleColumnColor(column, null)}>Limpar</button>}
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

                  <div className="flex flex-col gap-2">
                    {openCards.map((card) => renderCard(card, column))}

                    <button
                      type="button"
                      className="flex items-center gap-2 px-1 py-1.5 text-left text-xs text-base-content/45 transition-colors hover:text-base-content"
                      onClick={() => handleAddCard(column.id)}
                    >
                      <Plus size={14} />
                      Adicionar tarefa
                    </button>

                    {doneCards.length > 0 && (
                      <details className="group/done mt-1">
                        <summary className="flex cursor-pointer list-none items-center gap-1.5 px-1 py-1 text-xs text-base-content/45 hover:text-base-content [&::-webkit-details-marker]:hidden">
                          <ChevronRight size={13} className="group-open/done:hidden" />
                          <ChevronDown size={13} className="hidden group-open/done:block" />
                          Concluídas
                          <span className="rounded bg-base-300/70 px-1.5 text-[10px] font-medium leading-4">{doneCards.length}</span>
                        </summary>
                        <div className="mt-2 flex flex-col gap-1.5">
                          {doneCards.map((card) => renderCard(card, column, true))}
                        </div>
                      </details>
                    )}
                  </div>
                </section>
              );
            })}

            <div className="w-[min(17.5rem,calc(100vw-4rem))] shrink-0">
              {addingColumn ? (
                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    className="input input-bordered input-sm w-full"
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
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => setAddingColumn(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex h-7 items-center gap-2 text-[13px] text-base-content/40 transition-colors hover:text-base-content"
                  onClick={() => setAddingColumn(true)}
                >
                  <Plus size={14} />
                  Nova coluna
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {boardSettingsOpen && (
        <BoardSettingsModal
          boardId={boardId}
          name={boardName}
          description={boardDescription}
          icon={boardIcon}
          onClose={() => setBoardSettingsOpen(false)}
          onSaved={refresh}
        />
      )}

      {milestonesModalOpen && (
        <MilestonesModal
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
          completed={isCompleted(selectedCard)}
          completionLocked={Boolean(columns.find((c) => c.id === selectedCard.columnId)?.rules?.autoComplete)}
          onToggleCompleted={() => handleToggleCompleted(selectedCard)}
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
        <LabelsManagerModal
          initialTab="tags"
          canDelete={canManageLabels}
          onClose={() => {
            setTagsModalOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
