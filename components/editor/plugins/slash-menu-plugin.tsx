"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { $getSelection, $isRangeSelection, type TextNode } from "lexical";
import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Table2,
} from "lucide-react";
import {
  $getTopLevelBlock,
  $transformBlock,
  type BlockType,
} from "../block-utils";


class SlashOption extends MenuOption {
  title: string;
  description: string;
  iconNode: ReactNode;
  keywords: string[];
  onSelect: () => void;

  constructor(
    title: string,
    options: {
      description: string;
      icon: ReactNode;
      keywords?: string[];
      onSelect: () => void;
    },
  ) {
    super(title);
    this.title = title;
    this.description = options.description;
    this.iconNode = options.icon;
    this.keywords = options.keywords ?? [];
    this.onSelect = options.onSelect;
  }
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function SlashMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);

  const triggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
    maxLength: 24,
  });

  const options = useMemo(() => {
    const transform = (type: BlockType) => () =>
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const top = $getTopLevelBlock(selection.anchor.getNode());
        if (top) $transformBlock(top.getKey(), type);
      });

    const all = [
      new SlashOption("Texto", {
        description: "Parágrafo de texto simples",
        icon: <Pilcrow size={18} />,
        keywords: ["paragrafo", "texto", "text", "p"],
        onSelect: transform("paragraph"),
      }),
      new SlashOption("Título 1", {
        description: "Título grande de seção",
        icon: <Heading1 size={18} />,
        keywords: ["h1", "heading", "titulo", "cabecalho"],
        onSelect: transform("h1"),
      }),
      new SlashOption("Título 2", {
        description: "Título médio",
        icon: <Heading2 size={18} />,
        keywords: ["h2", "heading", "titulo", "subtitulo"],
        onSelect: transform("h2"),
      }),
      new SlashOption("Título 3", {
        description: "Título pequeno",
        icon: <Heading3 size={18} />,
        keywords: ["h3", "heading", "titulo"],
        onSelect: transform("h3"),
      }),
      new SlashOption("Lista com marcadores", {
        description: "Lista simples com bolinhas",
        icon: <List size={18} />,
        keywords: ["bullet", "ul", "lista", "marcadores", "unordered"],
        onSelect: transform("bullet"),
      }),
      new SlashOption("Lista numerada", {
        description: "Lista ordenada 1, 2, 3...",
        icon: <ListOrdered size={18} />,
        keywords: ["number", "ol", "lista", "numerada", "ordered"],
        onSelect: transform("number"),
      }),
      new SlashOption("Lista de tarefas", {
        description: "Acompanhe tarefas com checkbox",
        icon: <ListChecks size={18} />,
        keywords: ["todo", "check", "tarefa", "checklist", "task"],
        onSelect: transform("check"),
      }),
      new SlashOption("Citação", {
        description: "Destaque uma citação",
        icon: <Quote size={18} />,
        keywords: ["quote", "citacao", "blockquote"],
        onSelect: transform("quote"),
      }),
      new SlashOption("Código", {
        description: "Bloco de código",
        icon: <Code2 size={18} />,
        keywords: ["code", "codigo", "snippet", "pre"],
        onSelect: transform("code"),
      }),
      new SlashOption("Divisor", {
        description: "Linha horizontal separadora",
        icon: <Minus size={18} />,
        keywords: ["divider", "hr", "linha", "separador", "divisor"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
      }),
      new SlashOption("Tabela", {
        description: "Tabela 3×3",
        icon: <Table2 size={18} />,
        keywords: ["table", "tabela", "grid", "grade"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns: "3",
            rows: "3",
            includeHeaders: { rows: true, columns: false },
          }),
      }),
    ];

    if (!query) return all;
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return all.filter((o) => {
      const haystack = normalize([o.title, ...o.keywords].join(" "));
      return tokens.every((t) => haystack.includes(t));
    });
  }, [editor, query]);

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
                <div className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-base-content/40">
                  Blocos básicos
                </div>
                {options.map((option, i) => (
                  <button
                    key={option.key}
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
                  </button>
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
