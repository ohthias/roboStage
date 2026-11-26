"use client";

import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createTextNode, $getSelection, $isRangeSelection, type TextNode } from "lexical";
import { FileText } from "lucide-react";
import { DocIcon } from "../doc-icon";
import { $createPageMentionNode } from "../nodes/page-mention-node";
import { useStagebookEditor, type StagebookPage } from "../stagebook-context";
import { foldText } from "@/features/stagebook/lib/page-links";

class PageOption extends MenuOption {
  page: StagebookPage;
  constructor(page: StagebookPage) {
    super(page.id);
    this.page = page;
  }
}

/** "@" ou "[[" abre a lista de páginas; escolher insere uma menção (backlink). */
export function MentionPlugin() {
  const [editor] = useLexicalComposerContext();
  const { pages, documentId } = useStagebookEditor();
  const [query, setQuery] = useState<string | null>(null);
  const atMatch = useBasicTypeaheadTriggerMatch("@", { minLength: 0, maxLength: 40, allowWhitespace: true });

  // "[[termo" funciona igual ao "@termo" (atalho do Obsidian/Notion).
  const triggerFn = useCallback(
    (text: string, ed: Parameters<typeof atMatch>[1]) => {
      const bracket = /(^|\s|\()\[\[([^\]\n]{0,40})$/.exec(text);
      if (bracket) {
        return {
          leadOffset: bracket.index + bracket[1].length,
          matchingString: bracket[2],
          replaceableString: `[[${bracket[2]}`,
        };
      }
      return atMatch(text, ed);
    },
    [atMatch],
  );

  const options = useMemo(() => {
    if (query === null) return [];
    const q = foldText(query.trim());
    return pages
      .filter((p) => p.id !== documentId)
      .filter((p) => !q || foldText(p.title).includes(q))
      .sort((a, b) => Number(foldText(b.title).startsWith(q)) - Number(foldText(a.title).startsWith(q)))
      .slice(0, 8)
      .map((p) => new PageOption(p));
  }, [pages, query, documentId]);

  const onSelect = useCallback(
    (option: PageOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        nodeToRemove?.remove();
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([$createPageMentionNode(option.page.id, option.page.title), $createTextNode(" ")]);
        }
        closeMenu();
      });
    },
    [editor],
  );

  if (pages.length === 0) return null;

  return (
    <LexicalTypeaheadMenuPlugin<PageOption>
      onQueryChange={setQuery}
      onSelectOption={onSelect}
      triggerFn={triggerFn}
      options={options}
      anchorClassName="z-[70]"
      menuRenderFn={(anchorRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
        if (!anchorRef.current) return null;
        if (options.length === 0 && query?.includes(" ")) return null;
        return createPortal(
          <div
            role="listbox"
            aria-label="Mencionar página"
            className="mt-1 w-72 overflow-hidden rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-base-content/45">
              Mencionar página
            </div>
            {options.length === 0 ? (
              <p className="px-2 py-2 text-sm text-base-content/50">Nenhuma página encontrada.</p>
            ) : (
              options.map((option, i) => (
                <button
                  key={option.key}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === i}
                  ref={option.setRefElement}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                    selectedIndex === i ? "bg-base-200" : "hover:bg-base-200/60"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => {
                    setHighlightedIndex(i);
                    selectOptionAndCleanUp(option);
                  }}
                >
                  {option.page.icon ? <DocIcon value={option.page.icon} size={16} fallback={null} /> : <FileText size={15} />}
                  <span className="truncate">{option.page.title || "Sem título"}</span>
                </button>
              ))
            )}
          </div>,
          anchorRef.current,
        );
      }}
    />
  );
}
