"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
  MenuOption
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import { buildBlockCommands, filterCommands, type BlockCommand } from "../block-catalog";

class SlashOption extends MenuOption {
  title: string;
  description: string;
  iconNode: ReactNode;
  keywords: string[];
  group: string;
  hint?: string;
  onSelect: () => void;

  constructor(
    title: string,
    options: {
      description: string;
      icon: ReactNode;
      keywords?: string[];
      group?: string;
      hint?: string;
      onSelect: () => void;
    },
  ) {
    super(title);
    this.title = title;
    this.description = options.description;
    this.iconNode = options.icon;
    this.keywords = options.keywords ?? [];
    this.group = options.group ?? "Blocos básicos";
    this.hint = options.hint;
    this.onSelect = options.onSelect;
  }
}

const toOption = (c: BlockCommand) =>
  new SlashOption(c.title, {
    description: c.description,
    icon: c.icon,
    keywords: c.keywords,
    group: c.group,
    hint: c.hint,
    onSelect: c.run,
  });

export function SlashMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);

  // Aceita espaço ("/titulo 5", "/2 colunas"), como no Notion.
  const triggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
    maxLength: 24,
    allowWhitespace: true,
  });

  const allOptions = useMemo(() => buildBlockCommands(editor).map(toOption), [editor]);
  const options = useMemo(() => filterCommands(allOptions, query), [allOptions, query]);

  const onSelectOption = useCallback(
    (
      option: SlashOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        option.onSelect();
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashOption>
      onQueryChange={setQuery}
      onSelectOption={onSelectOption}
      triggerFn={triggerMatch}
      options={options}
      anchorClassName="z-[70]"
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (!anchorElementRef.current) return null;
        // Com espaço e nada encontrado, a pessoa só está escrevendo: some.
        if (options.length === 0 && query?.includes(" ")) return null;
        return createPortal(
          <div
            role="listbox"
            aria-label="Inserir bloco"
            className="mt-1 max-h-80 w-72 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
            onMouseDown={(e) => e.preventDefault()}
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-base-content/50">
                Nenhum resultado
              </div>
            ) : (
              <>
                {options.map((option, i) => (
                  <div key={option.key}>
                    {(i === 0 || options[i - 1].group !== option.group) && (
                      <div className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-base-content/40">
                        {option.group}
                      </div>
                    )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedIndex === i}
                    ref={(el) => {
                      option.setRefElement(el);
                      if (el && selectedIndex === i) {
                        el.scrollIntoView({ block: "nearest" });
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      selectedIndex === i
                        ? "bg-base-200"
                        : "hover:bg-base-200/60"
                    }`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-100 text-base-content/70">
                      {option.iconNode}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {option.title}
                      </span>
                      <span className="block truncate text-xs text-base-content/50">
                        {option.description}
                      </span>
                    </span>
                    {option.hint && (
                      <span className="ml-auto shrink-0 rounded bg-base-200 px-1.5 py-0.5 font-mono text-[10px] text-base-content/45">
                        {option.hint}
                      </span>
                    )}
                  </button>
                  </div>
                ))}
              </>
            )}
          </div>,
          anchorElementRef.current,
        );
      }}
    />
  );
}
