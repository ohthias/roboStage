"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection, $setSelection, type BaseSelection } from "lexical";
import { CornerDownLeft, FileText, Hash, Search } from "lucide-react";
import { buildBlockCommands, filterCommands } from "../block-catalog";
import { $collectHeadings, scrollToHeading } from "../nodes/toc-node";
import { DocIcon } from "../doc-icon";

/** Ação de página oferecida na paleta (exportar, histórico, mover…). */
export type PaletteAction = {
  id: string;
  title: string;
  icon: ReactNode;
  keywords?: string[];
  shortcut?: string;
  run: () => void;
};

export type PalettePage = { id: string; title: string; icon: string | null; href: string };

type Item = {
  key: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  keywords: string[];
  group: string;
  shortcut?: string;
  run: () => void;
};

export const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * Paleta de comandos (Ctrl/Cmd+K sem texto selecionado, ou Ctrl/Cmd+Shift+P):
 * inserir blocos, ações da página, ir para um título ou outra página.
 */
export function CommandPalette({
  actions,
  pages,
  onNavigate,
  open,
  onOpenChange,
}: {
  actions: PaletteAction[];
  pages: PalettePage[];
  onNavigate: (href: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Atalhos globais.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return; // Ctrl+K com texto selecionado = link
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if ((key === "k" && !e.shiftKey) || (key === "p" && e.shiftKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return open ? (
    <PaletteDialog actions={actions} pages={pages} onNavigate={onNavigate} onClose={() => onOpenChange(false)} />
  ) : null;
}

function PaletteDialog({
  actions,
  pages,
  onNavigate,
  onClose,
}: {
  actions: PaletteAction[];
  pages: PalettePage[];
  onNavigate: (href: string) => void;
  onClose: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Ao abrir: guarda onde estava o cursor e lê os títulos da página.
  const [headings] = useState(() =>
    editor.getEditorState().read($collectHeadings).filter((h) => h.text.trim()),
  );
  const [savedSelection] = useState<BaseSelection | null>(() =>
    editor.getEditorState().read(() => $getSelection()?.clone() ?? null),
  );
  const listRef = useRef<HTMLDivElement>(null);
  const close = onClose;

  /** Volta o cursor para onde estava antes de rodar um comando de bloco. */
  const restoreSelection = useCallback(() => {
    editor.update(
      () => {
        const saved = savedSelection;
        if (saved) $setSelection(saved.clone());
        else $getRoot().selectEnd();
      },
      { discrete: true },
    );
    editor.focus();
  }, [editor, savedSelection]);

  const items = useMemo<Item[]>(() => {
    const blockItems: Item[] = buildBlockCommands(editor)
      .filter((c) => !c.id.startsWith("template-"))
      .map((c) => ({
        key: `block:${c.id}`,
        title: c.title,
        subtitle: c.description,
        icon: c.icon,
        keywords: [...c.keywords, "inserir", "bloco", "transformar", c.group],
        group: "Inserir ou transformar bloco",
        shortcut: c.hint,
        run: () => {
          restoreSelection();
          c.run();
        },
      }));
    const actionItems: Item[] = actions.map((a) => ({
      key: `action:${a.id}`,
      title: a.title,
      icon: a.icon,
      keywords: a.keywords ?? [],
      group: "Página",
      shortcut: a.shortcut,
      run: a.run,
    }));
    const headingItems: Item[] = headings.map((h) => ({
      key: `heading:${h.key}`,
      title: h.text,
      subtitle: `Título ${h.level}`,
      icon: <Hash size={16} />,
      keywords: ["titulo", "secao", "ir"],
      group: "Ir para título",
      run: () => scrollToHeading(editor, h.key),
    }));
    const pageItems: Item[] = pages.map((p) => ({
      key: `page:${p.id}`,
      title: p.title || "Sem título",
      icon: p.icon ? <DocIcon value={p.icon} size={16} fallback={null} /> : <FileText size={16} />,
      keywords: ["pagina", "abrir", "ir"],
      group: "Abrir página",
      run: () => onNavigate(p.href),
    }));

    if (!query.trim()) {
      return [...actionItems, ...headingItems.slice(0, 8), ...blockItems.slice(0, 12)];
    }
    return [
      ...filterCommands(actionItems, query),
      ...filterCommands(headingItems, query).slice(0, 8),
      ...filterCommands(blockItems, query),
      ...filterCommands(pageItems, query).slice(0, 8),
    ];
  }, [editor, actions, headings, pages, query, restoreSelection, onNavigate]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const runItem = (item: Item | undefined) => {
    if (!item) return;
    close();
    // Deixa o diálogo fechar antes (foco volta ao editor).
    requestAnimationFrame(() => item.run());
  };

  return createPortal(
    <div className="no-print fixed inset-0 z-[90] flex items-start justify-center bg-black/30 px-3 pt-[12vh] backdrop-blur-[1px]" onMouseDown={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <label className="flex items-center gap-2 border-b border-base-300 px-4 py-3">
          <Search size={16} className="text-base-content/45" />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={items[active] ? `cmd-${active}` : undefined}
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-base-content/40"
            placeholder="Buscar comando, bloco, título ou página…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(items.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                runItem(items[active]);
              } else if (e.key === "Escape") {
                e.preventDefault();
                close();
                editor.focus();
              }
            }}
          />
          <kbd className="kbd kbd-xs">Esc</kbd>
        </label>
        <div ref={listRef} id="command-palette-list" role="listbox" className="flex-1 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-base-content/50">Nada encontrado para “{query}”.</p>
          ) : (
            items.map((item, i) => (
              <div key={item.key}>
                {(i === 0 || items[i - 1].group !== item.group) && (
                  <div className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-base-content/40">
                    {item.group}
                  </div>
                )}
                <button
                  id={`cmd-${i}`}
                  data-index={i}
                  type="button"
                  role="option"
                  aria-selected={active === i}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left ${
                    active === i ? "bg-base-200" : "hover:bg-base-200/60"
                  }`}
                  onMouseMove={() => active !== i && setActive(i)}
                  onClick={() => runItem(item)}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-base-300 text-base-content/70">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{item.title}</span>
                    {item.subtitle && <span className="block truncate text-xs text-base-content/45">{item.subtitle}</span>}
                  </span>
                  {item.shortcut && (
                    <span className="shrink-0 rounded bg-base-200 px-1.5 py-0.5 font-mono text-[10px] text-base-content/50">
                      {item.shortcut}
                    </span>
                  )}
                  {active === i && <CornerDownLeft size={13} className="shrink-0 text-base-content/40" />}
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-base-300 px-4 py-2 text-[11px] text-base-content/45">
          <span><kbd className="kbd kbd-xs">↑</kbd> <kbd className="kbd kbd-xs">↓</kbd> navegar</span>
          <span><kbd className="kbd kbd-xs">Enter</kbd> executar</span>
          <span className="ml-auto">{isMac() ? "⌘K" : "Ctrl+K"} abre/fecha</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
