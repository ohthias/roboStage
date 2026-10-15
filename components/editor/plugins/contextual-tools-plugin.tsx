"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type RefObject,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $createCodeNode } from "@lexical/code";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowDown,
  ArrowUp,
  Trash2,
  Table2,
  Minus,
  Plus,
  type LucideIcon,
} from "lucide-react";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableSelection,
  TableCellHeaderStates,
} from "@lexical/table";

type BlockAction =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "code"
  | "bullet"
  | "number"
  | "table"
  | "divider";

class SlashOption extends MenuOption {
  label: string;
  description: string;
  icon: ReactElement;
  action: BlockAction;

  constructor(
    key: string,
    label: string,
    description: string,
    icon: ReactElement,
    action: BlockAction,
  ) {
    super(key);
    this.label = label;
    this.description = description;
    this.icon = icon;
    this.action = action;
  }
}

const slashOptions = [
  new SlashOption("paragraph", "Texto", "Comece com um parágrafo", <span>¶</span>, "paragraph"),
  new SlashOption("h1", "Título 1", "Título grande", <span>H1</span>, "h1"),
  new SlashOption("h2", "Título 2", "Título médio", <span>H2</span>, "h2"),
  new SlashOption("h3", "Título 3", "Título pequeno", <span>H3</span>, "h3"),
  new SlashOption("bullet", "Lista", "Lista com marcadores", <span>•</span>, "bullet"),
  new SlashOption("number", "Lista numerada", "Lista ordenada", <span>1.</span>, "number"),
  new SlashOption("quote", "Citação", "Destaque uma citação", <span>“</span>, "quote"),
  new SlashOption("code", "Código", "Bloco de código", <Code size={16} />, "code"),
  new SlashOption("table", "Tabela", "Insira uma tabela editável", <Table2 size={16} />, "table"),
  new SlashOption("divider", "Divisor", "Separe seções do conteúdo", <Minus size={16} />, "divider"),
];

function executeSlashAction(
  editor: LexicalEditor,
  option: SlashOption,
  closeMenu: () => void,
) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    switch (option.action) {
      case "table":
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: "3",
          rows: "3",
          includeHeaders: true,
        });
        break;
      case "divider":
        selection.insertNodes([$createHorizontalRuleNode()]);
        break;
      case "bullet":
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        break;
      case "number":
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        break;
      default:
        $setBlocksType(selection, () => {
          switch (option.action) {
            case "h1":
              return $createHeadingNode("h1");
            case "h2":
              return $createHeadingNode("h2");
            case "h3":
              return $createHeadingNode("h3");
            case "quote":
              return $createQuoteNode();
            case "code":
              return $createCodeNode();
            default:
              return $createParagraphNode();
          }
        });
    }
  });
  closeMenu();
}

export function SlashCommandsPlugin() {
  const [editor] = useLexicalComposerContext();
  const triggerFn = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
    maxLength: 30,
  });

  const menuRenderFn = useCallback(
    (
      anchorElementRef: RefObject<HTMLElement | null>,
      {
        selectedIndex,
        options,
        selectOptionAndCleanUp,
        setHighlightedIndex,
      }: {
        selectedIndex: number | null;
        options: SlashOption[];
        selectOptionAndCleanUp: (option: SlashOption) => void;
        setHighlightedIndex: (index: number) => void;
      },
      matchingString: string,
    ) => (
      <div
        ref={(element) => {
          anchorElementRef.current = element;
        }}
        className="z-50 w-72 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl"
      >
        <div className="px-2 pb-2 text-xs font-semibold text-base-content/50">
          Inserir bloco
          {matchingString && ` · ${matchingString}`}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={option.key}
              ref={option.setRefElement}
              type="button"
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOptionAndCleanUp(option)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${
                selectedIndex === index ? "bg-base-200" : "hover:bg-base-200"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-base-300 text-xs font-semibold">
                {option.icon}
              </span>
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-xs text-base-content/50">
                  {option.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    ),
    [],
  );

  const options = useMemo(() => slashOptions, []);

  return (
    <LexicalTypeaheadMenuPlugin<SlashOption>
      triggerFn={triggerFn}
      options={options}
      menuRenderFn={menuRenderFn}
      onSelectOption={(option, _node, closeMenu) =>
        executeSlashAction(editor, option, closeMenu)
      }
      onQueryChange={() => undefined}
      preselectFirstItem
    />
  );
}

function selectedBlocks(editor: LexicalEditor) {
  const selection = $getSelection();
  if (!selection) return [];
  const nodes = new Map<string, ReturnType<typeof selection.getNodes>[number]>();
  selection.getNodes().forEach((node) => {
    const top = node.getTopLevelElement();
    if (top) nodes.set(top.getKey(), top);
  });
  return [...nodes.values()];
}

function moveSelectedBlocks(editor: LexicalEditor, direction: "up" | "down") {
  editor.update(() => {
    const nodes = selectedBlocks(editor);
    if (!nodes.length) return;
    if (direction === "up") {
      const target = nodes[0].getPreviousSibling();
      if (!target) return;
      nodes.forEach((node) => target.insertBefore(node));
    } else {
      const target = nodes[nodes.length - 1].getNextSibling();
      if (!target) return;
      let position = target;
      nodes.forEach((node) => {
        position.insertAfter(node);
        position = node;
      });
    }
  });
}

function SelectionToolsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [selectionCount, setSelectionCount] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tableContext, setTableContext] = useState(false);

  const update = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (
        (!$isRangeSelection(selection) && !$isTableSelection(selection)) ||
        ($isRangeSelection(selection) && selection.isCollapsed())
      ) {
        setSelectionCount(0);
        setRect(null);
        setTableContext(false);
        return;
      }
      const selectedNodes = selection.getNodes();
      const cell = selectedNodes
        .map((node) => $getTableCellNodeFromLexicalNode(node))
        .find((node) => node !== null);
      setTableContext(cell !== null);
      setSelectionCount(selectedBlocks(editor).length);
      const domSelection = window.getSelection();
      const domRect = domSelection?.rangeCount
        ? domSelection.getRangeAt(0).getBoundingClientRect()
        : null;
      setRect(
        domRect && (domRect.width || domRect.height)
          ? domRect
          : cell
            ? editor.getElementByKey(cell.getKey())?.closest("table")?.getBoundingClientRect() ?? null
            : null,
      );
    });
  }, [editor]);

  useEffect(() => {
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        update();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const onSelectionChange = () => update();
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      unregister();
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [editor, update]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        setSelectionCount(0);
        setRect(null);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  if (!rect || selectionCount === 0) return null;

  const actions: { label: string; icon: LucideIcon; onClick: () => void }[] = [
    {
      label: "Negrito",
      icon: Bold,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
    },
    {
      label: "Itálico",
      icon: Italic,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
    },
    {
      label: "Sublinhado",
      icon: Underline,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
    },
    {
      label: "Tachado",
      icon: Strikethrough,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
    },
    {
      label: "Esquerda",
      icon: AlignLeft,
      onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
    },
    {
      label: "Centro",
      icon: AlignCenter,
      onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
    },
    {
      label: "Direita",
      icon: AlignRight,
      onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
    },
    {
      label: "Justificar",
      icon: AlignJustify,
      onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
    },
  ];

  return (
    <div
      className="fixed z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl"
      style={{
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 360)),
        top: Math.max(8, rect.top - 48),
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {actions.map(({ label, icon: Icon, onClick }) => (
        <button
          key={label}
          type="button"
          title={label}
          aria-label={label}
          onClick={onClick}
          className="btn btn-ghost btn-xs btn-square"
        >
          <Icon size={15} />
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-base-300" />
      {tableContext && (
        <>
          <button
            type="button"
            title="Adicionar linha"
            aria-label="Adicionar linha"
            onClick={() => editor.update(() => $insertTableRowAtSelection(true))}
            className="btn btn-ghost btn-xs btn-square"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            title="Remover linha"
            aria-label="Remover linha"
            onClick={() => editor.update(() => $deleteTableRowAtSelection())}
            className="btn btn-ghost btn-xs btn-square"
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            title="Adicionar coluna"
            aria-label="Adicionar coluna"
            onClick={() => editor.update(() => $insertTableColumnAtSelection(true))}
            className="btn btn-ghost btn-xs btn-square"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            title="Remover coluna"
            aria-label="Remover coluna"
            onClick={() => editor.update(() => $deleteTableColumnAtSelection())}
            className="btn btn-ghost btn-xs btn-square"
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            title="Alternar cabeçalho"
            aria-label="Alternar cabeçalho"
            onClick={() =>
              editor.update(() => {
                const selection = $getSelection();
                const cell = selection
                  ?.getNodes()
                  .map((node) => $getTableCellNodeFromLexicalNode(node))
                  .find((node) => node !== null);
                cell?.toggleHeaderStyle(TableCellHeaderStates.BOTH);
              })
            }
            className="btn btn-ghost btn-xs"
          >
            <Table2 size={15} />
            <span className="hidden sm:inline">Cabeçalho</span>
          </button>
          <span className="mx-1 h-5 w-px bg-base-300" />
        </>
      )}
      <button
        type="button"
        title="Mover seleção para cima"
        aria-label="Mover seleção para cima"
        onClick={() => moveSelectedBlocks(editor, "up")}
        className="btn btn-ghost btn-xs btn-square"
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        title="Mover seleção para baixo"
        aria-label="Mover seleção para baixo"
        onClick={() => moveSelectedBlocks(editor, "down")}
        className="btn btn-ghost btn-xs btn-square"
      >
        <ArrowDown size={15} />
      </button>
      <button
        type="button"
        title="Excluir seleção"
        aria-label="Excluir seleção"
        onClick={() =>
          editor.update(() => selectedBlocks(editor).forEach((node) => node.remove()))
        }
        className="btn btn-ghost btn-xs btn-square text-error"
      >
        <Trash2 size={15} />
      </button>
      <span className="px-1 text-xs text-base-content/50">
        {selectionCount} bloco{selectionCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

export function ContextualToolsPlugin() {
  return (
    <>
      <SlashCommandsPlugin />
      <SelectionToolsPlugin />
    </>
  );
}
