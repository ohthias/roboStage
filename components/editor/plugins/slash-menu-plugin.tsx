"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
  MenuOption
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { $getSelection, $isRangeSelection, type TextNode } from "lexical";
import {
  CalendarDays,
  Code2,
  Columns2,
  Columns3,
  Heading1,
  Heading2,
  Heading3,
  FlaskConical,
  KanbanSquare,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Shapes,
  Table2,
} from "lucide-react";
import { $insertLayout } from "../nodes/layout-nodes";
import { OPEN_EMBED_PICKER_COMMAND } from "./embed-plugin";
import type { EmbedKind } from "../embeds/embed-types";
import { $insertTemplateAt, TEMPLATES } from "../templates";
import { DocIcon } from "../doc-icon";
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
  group: string;
  onSelect: () => void;

  constructor(
    title: string,
    options: {
      description: string;
      icon: ReactNode;
      keywords?: string[];
      group?: string;
      onSelect: () => void;
    },
  ) {
    super(title);
    this.title = title;
    this.description = options.description;
    this.iconNode = options.icon;
    this.keywords = options.keywords ?? [];
    this.group = options.group ?? "Blocos básicos";
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

    const insertColumns = (n: 2 | 3) => () =>
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $insertLayout(n, selection.anchor.getNode());
      });

    // Abre o seletor de itens (card, evento, gráfico, quadro). Guarda o bloco
    // atual: o foco sai do editor enquanto o diálogo está aberto.
    const openEmbedPicker = (kind: EmbedKind) => () => {
      const selection = $getSelection();
      const top = $isRangeSelection(selection)
        ? $getTopLevelBlock(selection.anchor.getNode())
        : null;
      editor.dispatchCommand(OPEN_EMBED_PICKER_COMMAND, {
        kind,
        anchorKey: top?.getKey() ?? null,
      });
    };

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
      new SlashOption("2 colunas", {
        description: "Seção com duas colunas lado a lado",
        icon: <Columns2 size={18} />,
        keywords: ["colunas", "coluna", "columns", "duas", "2", "layout", "secao"],
        onSelect: insertColumns(2),
      }),
      new SlashOption("3 colunas", {
        description: "Seção com três colunas lado a lado",
        icon: <Columns3 size={18} />,
        keywords: ["colunas", "coluna", "columns", "tres", "3", "layout", "secao"],
        onSelect: insertColumns(3),
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

    const integrations = [
      new SlashOption("Card do Kanban", {
        description: "Mostra um card de qualquer board, sempre atualizado",
        icon: <KanbanSquare size={18} />,
        keywords: ["card", "cartao", "kanban", "tarefa", "board", "quadro", "task"],
        group: "Integrações",
        onSelect: openEmbedPicker("kanban-card"),
      }),
      new SlashOption("Evento do calendário", {
        description: "Mostra um evento com data, horário e local",
        icon: <CalendarDays size={18} />,
        keywords: ["evento", "calendario", "agenda", "data", "reuniao", "prazo", "event"],
        group: "Integrações",
        onSelect: openEmbedPicker("calendar-event"),
      }),
      new SlashOption("Gráfico do LabTest", {
        description: "Gráfico dos resultados de um teste do LabTest",
        icon: <FlaskConical size={18} />,
        keywords: ["grafico", "labtest", "teste", "resultado", "chart", "runs", "calibrabot"],
        group: "Integrações",
        onSelect: openEmbedPicker("labtest-chart"),
      }),
      new SlashOption("Quadro do ThinkLab", {
        description: "Miniatura de um quadro do ThinkLab",
        icon: <Shapes size={18} />,
        keywords: ["thinklab", "quadro", "miniatura", "diagrama", "whiteboard", "board", "ideia"],
        group: "Integrações",
        onSelect: openEmbedPicker("thinklab-board"),
      }),
    ];
    all.push(...integrations);

    const layouts = TEMPLATES.map(
      (tpl) =>
        new SlashOption(tpl.title, {
          description: tpl.description,
          icon: <DocIcon value={tpl.emoji} size={20} fallback={null} />,
          keywords: ["layout", "modelo", "template", "pronto", tpl.id],
          group: "Layouts prontos",
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) $insertTemplateAt(tpl, selection.anchor.getNode());
            }),
        }),
    );
    all.push(...layouts);

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
