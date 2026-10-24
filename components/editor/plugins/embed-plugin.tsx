"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  COMMAND_PRIORITY_LOW,
  createCommand,
  type LexicalCommand,
} from "lexical";
import {
  CalendarDays,
  FlaskConical,
  KanbanSquare,
  Loader2,
  Search,
  Shapes,
  X,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { getModeDefinition } from "@/utils/labtest/modes";
import {
  linkDocumentToEmbed,
  listEmbeddableCards,
  listEmbeddableEvents,
  listEmbeddableLabTests,
  listEmbeddableThinkLabs,
} from "@/app/(protected)/dashboard/documents/embed-actions";
import { $createEmbedNode } from "../nodes/embed-node";
import { EVENT_TYPE_COLOR } from "../embeds/calendar-event-embed";
import {
  EMBED_LABELS,
  type CardPickerItem,
  type EmbedKind,
  type EmbedOptions,
  type EventPickerItem,
  type LabTestPickerItem,
  type PickerItemMap,
  type ThinkLabPickerItem,
} from "../embeds/embed-types";

export type OpenEmbedPickerPayload = {
  kind: EmbedKind;
  /** Bloco (chave do nó) onde o menu "/" foi aberto — o embed entra ali. */
  anchorKey: string | null;
};

export const OPEN_EMBED_PICKER_COMMAND: LexicalCommand<OpenEmbedPickerPayload> =
  createCommand("OPEN_EMBED_PICKER_COMMAND");

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

type PickerConfig<K extends EmbedKind> = {
  icon: LucideIcon;
  title: string;
  placeholder: string;
  empty: string;
  load: () => Promise<PickerItemMap[K][]>;
  id: (item: PickerItemMap[K]) => string;
  label: (item: PickerItemMap[K]) => string;
  searchText: (item: PickerItemMap[K]) => string;
  options?: (item: PickerItemMap[K]) => EmbedOptions;
  row: (item: PickerItemMap[K]) => ReactNode;
};

const PICKERS: { [K in EmbedKind]: PickerConfig<K> } = {
  "kanban-card": {
    icon: KanbanSquare,
    title: "Inserir card do Kanban",
    placeholder: "Buscar card, board ou coluna…",
    empty: "Nenhum card encontrado neste espaço.",
    load: listEmbeddableCards,
    id: (c) => c.id,
    label: (c) => c.title,
    searchText: (c: CardPickerItem) => `${c.title} ${c.boardName} ${c.columnName}`,
    options: (c: CardPickerItem) => ({ boardId: c.boardId }),
    row: (c: CardPickerItem) => (
      <>
        <span className="block truncate text-sm font-medium">{c.title}</span>
        <span className="block truncate text-xs text-base-content/50">
          {c.boardName} › {c.columnName}
          {c.dueAt ? ` · prazo ${shortDate(c.dueAt)}` : ""}
        </span>
      </>
    ),
  },
  "calendar-event": {
    icon: CalendarDays,
    title: "Inserir evento do calendário",
    placeholder: "Buscar evento…",
    empty: "Nenhum evento encontrado neste espaço.",
    load: async () => {
      const items = await listEmbeddableEvents();
      const now = Date.now();
      const upcoming = items
        .filter((e) => new Date(e.endAt ?? e.startAt).getTime() >= now)
        .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
      const past = items
        .filter((e) => new Date(e.endAt ?? e.startAt).getTime() < now)
        .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
      return [...upcoming, ...past];
    },
    id: (e) => e.id,
    label: (e) => e.title,
    searchText: (e: EventPickerItem) => `${e.title} ${e.type} ${shortDate(e.startAt)}`,
    row: (e: EventPickerItem) => (
      <span className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: e.color ?? EVENT_TYPE_COLOR[e.type] ?? EVENT_TYPE_COLOR.outro }}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{e.title}</span>
          <span className="block truncate text-xs text-base-content/50">
            {shortDate(e.startAt)}
            {e.allDay ? " · dia inteiro" : ""}
          </span>
        </span>
      </span>
    ),
  },
  "labtest-chart": {
    icon: FlaskConical,
    title: "Inserir gráfico do LabTest",
    placeholder: "Buscar teste…",
    empty: "Você ainda não criou nenhum teste no LabTest.",
    load: listEmbeddableLabTests,
    id: (t) => t.id,
    label: (t) => t.name,
    searchText: (t: LabTestPickerItem) => `${t.name} ${getModeDefinition(t.mode as never).label} ${t.season ?? ""}`,
    row: (t: LabTestPickerItem) => (
      <>
        <span className="block truncate text-sm font-medium">{t.name}</span>
        <span className="block truncate text-xs text-base-content/50">
          {getModeDefinition(t.mode as never).label}
          {t.season ? ` · ${t.season}` : ""} · atualizado em {shortDate(t.updatedAt)}
        </span>
      </>
    ),
  },
  "thinklab-board": {
    icon: Shapes,
    title: "Inserir quadro do ThinkLab",
    placeholder: "Buscar quadro…",
    empty: "Nenhum quadro encontrado neste espaço.",
    load: listEmbeddableThinkLabs,
    id: (b) => b.id,
    label: (b) => b.name,
    searchText: (b: ThinkLabPickerItem) => `${b.name} ${b.description ?? ""}`,
    row: (b: ThinkLabPickerItem) => (
      <>
        <span className="block truncate text-sm font-medium">{b.name}</span>
        <span className="block truncate text-xs text-base-content/50">
          {b.description || `Atualizado em ${shortDate(b.updatedAt)}`}
        </span>
      </>
    ),
  },
};

function EmbedPickerDialog({
  kind,
  onPick,
  onClose,
}: {
  kind: EmbedKind;
  onPick: (kind: EmbedKind, id: string, label: string, options: EmbedOptions) => void;
  onClose: () => void;
}) {
  // O mapa é indexado por tipo; aqui o tipo é dinâmico, então tratamos como genérico.
  const config = PICKERS[kind] as unknown as PickerConfig<EmbedKind>;
  const [items, setItems] = useState<PickerItemMap[EmbedKind][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    config
      .load()
      .then((rows) => alive && setItems(rows))
      .catch((err: unknown) => alive && setError(err instanceof Error ? err.message : "Erro ao carregar."));
    return () => {
      alive = false;
    };
  }, [config]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return items;
    return items.filter((item) => {
      const hay = normalize(config.searchText(item));
      return tokens.every((t) => hay.includes(t));
    });
  }, [items, query, config]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (index: number) => {
    const item = filtered[index];
    if (item) onPick(kind, config.id(item), config.label(item), config.options?.(item) ?? {});
  };

  const Icon = config.icon;

  return createPortal(
    <div
      className="no-print modal modal-open modal-bottom z-[100] sm:modal-middle"
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        else if (e.key === "ArrowDown") {
          e.preventDefault();
          setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          choose(active);
        }
      }}
    >
      <div className="modal-box flex max-h-[80vh] max-w-lg flex-col p-0">
        <div className="flex items-center gap-2 border-b border-base-200 px-4 py-3">
          <Icon size={18} className="text-primary" />
          <h2 className="flex-1 text-base font-semibold">{config.title}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Fechar" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <label className="flex items-center gap-2 border-b border-base-200 px-4 py-2.5">
          <Search size={15} className="text-base-content/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.placeholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-base-content/35"
          />
        </label>

        <div ref={listRef} className="min-h-40 flex-1 overflow-y-auto p-1.5" role="listbox">
          {error ? (
            <p className="px-3 py-8 text-center text-sm text-error">{error}</p>
          ) : !items ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-base-content/50">
              <Loader2 size={15} className="animate-spin" /> Carregando…
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-base-content/50">
              {items.length === 0 ? config.empty : "Nenhum resultado para a busca."}
            </p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={config.id(item)}
                type="button"
                role="option"
                aria-selected={i === active}
                data-idx={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`block w-full rounded-lg px-3 py-2 text-left transition-colors ${
                  i === active ? "bg-base-200" : "hover:bg-base-200/60"
                }`}
              >
                {config.row(item)}
              </button>
            ))
          )}
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
    </div>,
    document.body,
  );
}

/**
 * Seletor + inserção dos blocos embed. O menu "/" dispara
 * OPEN_EMBED_PICKER_COMMAND; ao escolher um item, o bloco entra no lugar do
 * parágrafo vazio (ou logo abaixo do bloco atual).
 */
export function EmbedPlugin({ documentId }: { documentId: string }) {
  const [editor] = useLexicalComposerContext();
  const { addToast } = useToast();
  const [open, setOpen] = useState<OpenEmbedPickerPayload | null>(null);

  useEffect(
    () =>
      editor.registerCommand(
        OPEN_EMBED_PICKER_COMMAND,
        (payload) => {
          setOpen(payload);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  const close = useCallback(() => {
    setOpen(null);
    editor.focus();
  }, [editor]);

  const handlePick = useCallback(
    (kind: EmbedKind, refId: string, label: string, options: EmbedOptions) => {
      const anchorKey = open?.anchorKey ?? null;
      setOpen(null);

      editor.update(() => {
        const node = $createEmbedNode(kind, refId, label, options);
        const anchor = anchorKey ? $getNodeByKey(anchorKey) : null;

        if (anchor && anchor.isAttached()) {
          const isEmptyParagraph =
            anchor.getType() === "paragraph" &&
            $isElementNode(anchor) &&
            anchor.getTextContentSize() === 0;
          if (isEmptyParagraph) anchor.replace(node);
          else anchor.insertAfter(node);
        } else {
          $getRoot().append(node);
        }

        // Sempre sobra um parágrafo depois do bloco para continuar escrevendo.
        let next = node.getNextSibling();
        if (!next || !$isElementNode(next)) {
          next = $createParagraphNode();
          node.insertAfter(next);
        }
        if ($isElementNode(next)) next.selectStart();
      });
      editor.focus();

      if (kind === "kanban-card" || kind === "calendar-event") {
        linkDocumentToEmbed(documentId, kind, refId)
          .then(() =>
            addToast(
              `${EMBED_LABELS[kind]} inserido. Esta página agora aparece nos vínculos dele.`,
              "success",
            ),
          )
          .catch((err) => console.warn("Não foi possível vincular a página ao item", err));
      }
    },
    [addToast, documentId, editor, open],
  );

  if (!open) return null;
  return <EmbedPickerDialog kind={open.kind} onPick={handlePick} onClose={close} />;
}
