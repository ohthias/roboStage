"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  type BaseSelection,
  type TextNode,
} from "lexical";
import { Search } from "lucide-react";
import {
  EMOJI_GROUP_LABELS,
  loadEmojis,
  searchEmojis,
  type Emoji,
} from "../emoji-data";

/** Abre a grade de emojis na posição do cursor (comando "/emoji"). */
export const OPEN_EMOJI_PICKER_COMMAND = createCommand<void>("OPEN_EMOJI_PICKER_COMMAND");

class EmojiOption extends MenuOption {
  emoji: Emoji;
  constructor(emoji: Emoji) {
    super(emoji.emoji);
    this.emoji = emoji;
  }
}

function useEmojis() {
  const [emojis, setEmojis] = useState<Emoji[] | null>(null);
  const load = useCallback(() => {
    if (emojis) return;
    loadEmojis().then(setEmojis).catch(() => setEmojis([]));
  }, [emojis]);
  return { emojis, load };
}

/**
 * Emojis no texto:
 *  - ":" + termo abre sugestões (":foguete", ":rocket", ":ok");
 *  - "/emoji" abre a grade completa com busca.
 */
export function EmojiPlugin() {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);
  const { emojis, load } = useEmojis();
  const [picker, setPicker] = useState<{ top: number; left: number; selection: BaseSelection | null } | null>(
    null,
  );

  const triggerMatch = useBasicTypeaheadTriggerMatch(":", { minLength: 1, maxLength: 30 });

  useEffect(() => {
    if (query !== null) load();
  }, [query, load]);

  const options = useMemo(() => {
    if (!emojis || query === null) return [];
    return searchEmojis(emojis, query, 8).map((e) => new EmojiOption(e));
  }, [emojis, query]);

  const insertEmoji = useCallback(
    (option: EmojiOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || option.emoji == null) return;
        nodeToRemove?.remove();
        selection.insertNodes([$createTextNode(option.emoji.emoji)]);
        closeMenu();
      });
    },
    [editor],
  );

  useEffect(
    () =>
      editor.registerCommand(
        OPEN_EMOJI_PICKER_COMMAND,
        () => {
          load();
          const domSelection = window.getSelection();
          const rect = domSelection?.rangeCount ? domSelection.getRangeAt(0).getBoundingClientRect() : null;
          const fallback = editor.getRootElement()?.getBoundingClientRect();
          const top = (rect && rect.bottom ? rect.bottom : (fallback?.top ?? 100)) + 6;
          const left = rect && rect.left ? rect.left : (fallback?.left ?? 100);
          setPicker({ top, left, selection: $getSelection()?.clone() ?? null });
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor, load],
  );

  const pick = (emoji: string) => {
    const saved = picker?.selection ?? null;
    setPicker(null);
    editor.update(() => {
      if (saved) $setSelection(saved.clone());
      const selection = $getSelection();
      if ($isRangeSelection(selection)) selection.insertText(emoji);
    });
    editor.focus();
  };

  return (
    <>
      <LexicalTypeaheadMenuPlugin<EmojiOption>
        onQueryChange={setQuery}
        onSelectOption={insertEmoji}
        triggerFn={triggerMatch}
        options={options}
        anchorClassName="z-[70]"
        menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
          if (!anchorElementRef.current || options.length === 0) return null;
          return createPortal(
            <div
              role="listbox"
              aria-label="Emojis"
              className="mt-1 w-64 overflow-hidden rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
              onMouseDown={(e) => e.preventDefault()}
            >
              {options.map((option, i) => (
                <button
                  key={option.key}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === i}
                  ref={option.setRefElement}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm ${
                    selectedIndex === i ? "bg-base-200" : "hover:bg-base-200/60"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => {
                    setHighlightedIndex(i);
                    selectOptionAndCleanUp(option);
                  }}
                >
                  <span className="text-lg leading-none">{option.emoji.emoji}</span>
                  <span className="min-w-0 flex-1 truncate">{option.emoji.label}</span>
                  {option.emoji.shortcodes[0] && (
                    <span className="truncate text-[11px] text-base-content/40">:{option.emoji.shortcodes[0]}:</span>
                  )}
                </button>
              ))}
            </div>,
            anchorElementRef.current,
          );
        }}
      />
      {picker && (
        <EmojiGrid
          emojis={emojis}
          top={picker.top}
          left={picker.left}
          onPick={pick}
          onClose={() => {
            setPicker(null);
            editor.focus();
          }}
        />
      )}
    </>
  );
}

/** Grade de emojis com busca, agrupada por categoria. */
export function EmojiGrid({
  emojis,
  top,
  left,
  onPick,
  onClose,
}: {
  emojis: Emoji[] | null;
  top: number;
  left: number;
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (left + el.offsetWidth > window.innerWidth - 8) el.style.left = `${Math.max(8, window.innerWidth - el.offsetWidth - 8)}px`;
    if (top + el.offsetHeight > window.innerHeight - 8) el.style.top = `${Math.max(8, top - el.offsetHeight - 30)}px`;
  }, [top, left]);

  const groups = useMemo(() => {
    if (!emojis) return [];
    if (search.trim()) return [{ label: "Resultados", items: searchEmojis(emojis, search, 120) }];
    const byGroup = new Map<number, Emoji[]>();
    for (const e of emojis) {
      const list = byGroup.get(e.group) ?? [];
      list.push(e);
      byGroup.set(e.group, list);
    }
    return [
      { label: "Populares", items: searchEmojis(emojis, "", 24) },
      ...[...byGroup.entries()].sort(([a], [b]) => a - b).map(([g, items]) => ({ label: EMOJI_GROUP_LABELS[g] ?? "Outros", items })),
    ];
  }, [emojis, search]);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Escolher emoji"
      className="fixed z-[80] flex h-80 w-80 flex-col rounded-xl border border-base-300 bg-base-100 shadow-xl"
      style={{ top, left }}
    >
      <label className="m-2 flex items-center gap-2 rounded-lg bg-base-200 px-2 py-1.5">
        <Search size={14} className="text-base-content/50" />
        <input
          autoFocus
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Buscar emoji (ex.: foguete, robot)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const first = groups[0]?.items[0];
              if (first) onPick(first.emoji);
            }
          }}
        />
      </label>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {!emojis ? (
          <p className="p-3 text-sm text-base-content/50">Carregando emojis…</p>
        ) : groups.every((g) => g.items.length === 0) ? (
          <p className="p-3 text-sm text-base-content/50">Nenhum emoji encontrado.</p>
        ) : (
          groups.map((g) =>
            g.items.length ? (
              <div key={g.label}>
                <div className="sticky top-0 bg-base-100 py-1 text-[11px] font-medium uppercase tracking-wider text-base-content/45">
                  {g.label}
                </div>
                <div className="grid grid-cols-8 gap-0.5">
                  {g.items.map((e) => (
                    <button
                      key={e.emoji}
                      type="button"
                      title={e.label}
                      className="flex h-8 items-center justify-center rounded-md text-xl hover:bg-base-200"
                      onClick={() => onPick(e.emoji)}
                    >
                      {e.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : null,
          )
        )}
      </div>
    </div>,
    document.body,
  );
}
