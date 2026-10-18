"use client";

import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $isTextNode,
  $isElementNode,
  type TextNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Pilcrow,
  Undo2,
  Redo2,
  Code,
  Minus,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Palette,
  Table2,
  Settings2,
  Rows3,
  Columns3,
  PaintBucket,
  ArrowDown,
  ArrowUp,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  getSelectedBlockCount,
  getSelectedTopLevelNodes,
} from "./block-selection-plugin";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  INSERT_TABLE_COMMAND,
  $isTableSelection,
  $isTableRowNode,
  TableCellHeaderStates,
} from "@lexical/table";

type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "code"
  | "ul"
  | "ol";

type TextColor = {
  name: string;
  value: string;
};

const TEXT_COLORS: TextColor[] = [
  {
    name: "Padrão",
    value: "",
  },
  {
    name: "Vermelho",
    value: "#ef4444",
  },
  {
    name: "Laranja",
    value: "#f97316",
  },
  {
    name: "Amarelo",
    value: "#eab308",
  },
  {
    name: "Verde",
    value: "#22c55e",
  },
  {
    name: "Azul",
    value: "#3b82f6",
  },
  {
    name: "Roxo",
    value: "#a855f7",
  },
  {
    name: "Rosa",
    value: "#ec4899",
  },
];

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
  });

  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  const [colorOpen, setColorOpen] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [insertTableMenuOpen, setInsertTableMenuOpen] = useState(false);
  const [newTableSize, setNewTableSize] = useState({ rows: 3, columns: 3 });
  const [tableContext, setTableContext] = useState<{
    columns: number;
    rows: number;
    widths: readonly number[] | undefined;
    heights: readonly (number | undefined)[];
    isHeader: boolean;
    backgroundColor: string | null;
  } | null>(null);
  const [alignment, setAlignment] = useState<
    "left" | "center" | "right" | "justify"
  >("left");
  const [selectedBlockCount, setSelectedBlockCount] = useState(0);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection) && !$isTableSelection(selection)) {
      setTableContext(null);
      setTableMenuOpen(false);
      setSelectedBlockCount(0);
      return;
    }
    setSelectedBlockCount(
      $isRangeSelection(selection) ? getSelectedBlockCount() : 0,
    );
    if ($isRangeSelection(selection)) {
      setFormat({
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
        code: selection.hasFormat("code"),
      });
    }
    const anchorNode = selection.anchor.getNode();

    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
    if ($isElementNode(element)) {
      setAlignment(
        (element.getFormatType() as "left" | "center" | "right" | "justify") ||
          "left",
      );
    } else {
      setAlignment("left");
    }

    if ($isListNode(element)) {
      setBlockType(element.getListType() === "number" ? "ol" : "ul");
    } else if ($isHeadingNode(element)) {
      setBlockType(element.getTag() as "h1" | "h2" | "h3");
    } else if ($isCodeNode(element)) {
      setBlockType("code");
    } else if (element.getType() === "quote") {
      setBlockType("quote");
    } else {
      setBlockType("paragraph");
    }

    const cellNode = $getTableCellNodeFromLexicalNode(
      selection.anchor.getNode(),
    );
    if (!cellNode) {
      setTableContext(null);
      setTableMenuOpen(false);
      return;
    }

    const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
    setTableContext({
      columns: tableNode.getColumnCount(),
      rows: tableNode.getChildrenSize(),
      widths: tableNode.getColWidths(),
      heights: tableNode
        .getChildren()
        .map((row) => ($isTableRowNode(row) ? row.getHeight() : undefined)),
      isHeader: cellNode.hasHeader(),
      backgroundColor: cellNode.getBackgroundColor(),
    });
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbar);
    });
  }, [editor, updateToolbar]);

  function toggleBlock(type: BlockType) {
    if (type === "ul") {
      editor.dispatchCommand(
        blockType === "ul"
          ? REMOVE_LIST_COMMAND
          : INSERT_UNORDERED_LIST_COMMAND,
        undefined,
      );

      return;
    }

    if (type === "ol") {
      editor.dispatchCommand(
        blockType === "ol" ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );

      return;
    }

    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) return;

      const isCurrentBlockType = blockType === type;

      $setBlocksType(selection, () => {
        switch (type) {
          case "h1":
            return isCurrentBlockType
              ? $createParagraphNode()
              : $createHeadingNode("h1");

          case "h2":
            return isCurrentBlockType
              ? $createParagraphNode()
              : $createHeadingNode("h2");

          case "h3":
            return isCurrentBlockType
              ? $createParagraphNode()
              : $createHeadingNode("h3");

          case "quote":
            return isCurrentBlockType
              ? $createParagraphNode()
              : $createQuoteNode();

          case "code":
            return isCurrentBlockType
              ? $createParagraphNode()
              : $createCodeNode();

          default:
            return $createParagraphNode();
        }
      });
    });
  }

  function applyTextColor(color: string) {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) && !$isTableSelection(selection)) {
        return;
      }

      const nodes = selection.getNodes();

      nodes.forEach((node) => {
        if (!$isTextNode(node)) return;

        const textNode = node as TextNode;

        if (color) {
          textNode.setStyle(`color: ${color};`);
        } else {
          textNode.setStyle("");
        }
      });
    });

    setColorOpen(false);
  }

  function insertTable() {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: String(newTableSize.columns),
      rows: String(newTableSize.rows),
      includeHeaders: true,
    });
    setInsertTableMenuOpen(false);
  }

  function insertDivider() {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
  }

  function setTextAlignment(value: "left" | "center" | "right" | "justify") {
    setAlignment(value);
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value);
  }

  function updateTable(
    operation:
      | "add-row"
      | "remove-row"
      | "add-column"
      | "remove-column"
      | "wider"
      | "narrower"
      | "reset-width"
      | "taller"
      | "shorter"
      | "reset-height"
      | "toggle-header"
      | "clear-cell-background"
      | "cell-background",
    backgroundColor?: string,
  ) {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) && !$isTableSelection(selection)) {
        return;
      }

      const cellNode = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode(),
      );
      if (!cellNode) return;

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode);
      switch (operation) {
        case "add-row":
          $insertTableRowAtSelection(true);
          break;
        case "remove-row":
          if (tableNode.getChildrenSize() > 1) {
            $deleteTableRowAtSelection();
          }
          break;
        case "add-column":
          $insertTableColumnAtSelection(true);
          break;
        case "remove-column":
          if (tableNode.getColumnCount() > 1) {
            $deleteTableColumnAtSelection();
          }
          break;
        case "toggle-header":
          cellNode.toggleHeaderStyle(TableCellHeaderStates.BOTH);
          break;
        case "clear-cell-background":
          cellNode.setBackgroundColor(null);
          break;
        case "cell-background":
          cellNode.setBackgroundColor(backgroundColor ?? null);
          break;
        default: {
          if (operation === "reset-width") {
            tableNode.setColWidths(undefined);
            break;
          }

          if (operation === "reset-height") {
            tableNode.getChildren().forEach((row) => {
              if ($isTableRowNode(row)) row.setHeight(undefined);
            });
            break;
          }

          if (operation === "taller" || operation === "shorter") {
            const delta = operation === "taller" ? 16 : -16;
            tableNode.getChildren().forEach((row) => {
              if (!$isTableRowNode(row)) return;
              row.setHeight(Math.max(32, (row.getHeight() ?? 48) + delta));
            });
            break;
          }

          const columnCount = tableNode.getColumnCount();
          const currentWidths =
            tableNode.getColWidths() ??
            Array.from({ length: columnCount }, () => 160);
          const delta = operation === "wider" ? 40 : -40;
          tableNode.setColWidths(
            currentWidths.map((width) => Math.max(80, width + delta)),
          );
          break;
        }
      }
    });
  }

  function updateSelectedBlocks(operation: "delete" | "up" | "down") {
    editor.update(() => {
      const nodes = getSelectedTopLevelNodes();

      if (nodes.length === 0) return;

      if (operation === "delete") {
        nodes.forEach((node) => node.remove());
        return;
      }

      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];

      if (operation === "up") {
        const previous = firstNode.getPreviousSibling();

        if (previous) {
          lastNode.insertAfter(previous);
        }

        return;
      }

      const next = lastNode.getNextSibling();

      if (next) {
        firstNode.insertBefore(next);
      }
    });
  }

  const createFormatButton = (
    icon: LucideIcon,
    label: string,
    formatType: keyof typeof format,
  ) => ({
    icon,
    label,
    active: format[formatType],
    onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType),
  });

  const inlineButtons = [
    createFormatButton(Bold, "Negrito", "bold"),
    createFormatButton(Italic, "Itálico", "italic"),
    createFormatButton(Underline, "Sublinhado", "underline"),
    createFormatButton(Strikethrough, "Tachado", "strikethrough"),
    createFormatButton(Code, "Código inline", "code"),
  ];

  const alignmentButtons: {
    icon: LucideIcon;
    label: string;
    value: "left" | "center" | "right" | "justify";
  }[] = [
    { icon: AlignLeft, label: "Alinhar à esquerda", value: "left" },
    { icon: AlignCenter, label: "Centralizar", value: "center" },
    { icon: AlignRight, label: "Alinhar à direita", value: "right" },
    { icon: AlignJustify, label: "Justificar", value: "justify" },
  ];

  const blockButtons: {
    icon: LucideIcon;
    label: string;
    type: BlockType;
  }[] = [
    {
      icon: Pilcrow,
      label: "Parágrafo",
      type: "paragraph",
    },
    {
      icon: Heading1,
      label: "Título 1",
      type: "h1",
    },
    {
      icon: Heading2,
      label: "Título 2",
      type: "h2",
    },
    {
      icon: Heading3,
      label: "Título 3",
      type: "h3",
    },
    {
      icon: Quote,
      label: "Citação",
      type: "quote",
    },
    {
      icon: Code,
      label: "Bloco de código",
      type: "code",
    },
    {
      icon: List,
      label: "Lista",
      type: "ul",
    },
    {
      icon: ListOrdered,
      label: "Lista numerada",
      type: "ol",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-base-300 p-2">
      {/* Formatação de texto */}
      {inlineButtons.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.label}
          onClick={b.onClick}
          className={`btn btn-ghost btn-xs btn-square ${
            b.active ? "btn-active text-info" : ""
          }`}
        >
          <b.icon size={15} />
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-base-300" />

      {alignmentButtons.map((button) => (
        <button
          key={button.label}
          type="button"
          title={button.label}
          aria-label={button.label}
          onClick={() => setTextAlignment(button.value)}
          className={`btn btn-ghost btn-xs btn-square ${
            alignment === button.value ? "btn-active text-info" : ""
          }`}
        >
          <button.icon size={15} />
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-base-300" />

      {/* Cores */}
      <div className="relative">
        <button
          type="button"
          title="Cor do texto"
          onClick={() => setColorOpen((value) => !value)}
          className={`btn btn-ghost btn-xs btn-square ${
            colorOpen ? "btn-active text-info" : ""
          }`}
        >
          <Palette size={15} />
        </button>

        {colorOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl w-36">
            <div className="grid grid-cols-4 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={color.name}
                  onClick={() => applyTextColor(color.value)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-base-300 transition hover:scale-110 hover:bg-base-200"
                >
                  {color.value ? (
                    <span
                      className="h-4 w-4 rounded-full border border-base-content/20"
                      style={{
                        backgroundColor: color.value,
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold">A</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-1 h-4 w-px bg-base-300" />

      {/* Blocos */}
      {blockButtons.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.label}
          onClick={() => toggleBlock(b.type)}
          className={`btn btn-ghost btn-xs btn-square ${
            blockType === b.type ? "btn-active text-info" : ""
          }`}
        >
          <b.icon size={15} />
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-base-300" />

      <div className="relative" onMouseDown={(event) => event.preventDefault()}>
        <button
          type="button"
          title="Inserir tabela"
          aria-label="Inserir tabela"
          aria-expanded={insertTableMenuOpen}
          onClick={() => setInsertTableMenuOpen((open) => !open)}
          className={`btn btn-ghost btn-xs gap-1 ${
            insertTableMenuOpen ? "btn-active text-info" : ""
          }`}
        >
          <Table2 size={15} />
          Tabela
        </button>
        {insertTableMenuOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-3 shadow-xl">
            <div className="mb-2 text-xs font-semibold text-base-content/60">
              Nova tabela
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-base-content/60">
                Linhas
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newTableSize.rows}
                  onChange={(event) =>
                    setNewTableSize((size) => ({
                      ...size,
                      rows: Math.min(
                        20,
                        Math.max(1, Number(event.target.value) || 1),
                      ),
                    }))
                  }
                  className="input input-bordered input-xs mt-1 w-full"
                />
              </label>
              <label className="text-xs text-base-content/60">
                Colunas
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={newTableSize.columns}
                  onChange={(event) =>
                    setNewTableSize((size) => ({
                      ...size,
                      columns: Math.min(
                        12,
                        Math.max(1, Number(event.target.value) || 1),
                      ),
                    }))
                  }
                  className="input input-bordered input-xs mt-1 w-full"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={insertTable}
              className="btn btn-primary btn-xs mt-3 w-full"
            >
              Inserir tabela
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        title="Divisor"
        aria-label="Inserir divisor"
        onClick={insertDivider}
        className="btn btn-ghost btn-xs btn-square"
      >
        <Minus size={15} />
      </button>

      {tableContext && (
        <div
          className="relative"
          onMouseDown={(event) => event.preventDefault()}
        >
          <button
            type="button"
            title="Opções da tabela"
            aria-label="Opções da tabela"
            aria-expanded={tableMenuOpen}
            onClick={() => setTableMenuOpen((open) => !open)}
            className={`btn btn-ghost btn-xs gap-1 ${
              tableMenuOpen ? "btn-active text-info" : ""
            }`}
          >
            <Settings2 size={15} />
            Tabela {tableContext.rows}×{tableContext.columns}
          </button>

          {tableMenuOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-box border border-base-300 bg-base-100 p-3 shadow-xl">
              <div className="mb-3 text-xs font-semibold text-base-content/60">
                Editar tabela
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateTable("add-row")}
                  className="btn btn-outline btn-xs justify-start gap-2"
                >
                  <Rows3 size={14} /> Adicionar linha
                </button>
                <button
                  type="button"
                  disabled={tableContext.rows <= 1}
                  onClick={() => updateTable("remove-row")}
                  className="btn btn-outline btn-xs justify-start gap-2"
                >
                  <Rows3 size={14} /> Remover linha
                </button>
                <button
                  type="button"
                  onClick={() => updateTable("add-column")}
                  className="btn btn-outline btn-xs justify-start gap-2"
                >
                  <Columns3 size={14} /> Adicionar coluna
                </button>
                <button
                  type="button"
                  disabled={tableContext.columns <= 1}
                  onClick={() => updateTable("remove-column")}
                  className="btn btn-outline btn-xs justify-start gap-2"
                >
                  <Columns3 size={14} /> Remover coluna
                </button>
              </div>

              <div className="mb-3 border-t border-base-200 pt-3">
                <div className="mb-2 text-xs font-medium text-base-content/60">
                  Tamanho
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateTable("wider")}
                    className="btn btn-ghost btn-xs"
                  >
                    Colunas mais largas
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTable("narrower")}
                    className="btn btn-ghost btn-xs"
                  >
                    Colunas mais estreitas
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTable("taller")}
                    className="btn btn-ghost btn-xs"
                  >
                    Linhas mais altas
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTable("shorter")}
                    className="btn btn-ghost btn-xs"
                  >
                    Linhas mais baixas
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTable("reset-width")}
                    className="btn btn-ghost btn-xs"
                  >
                    Largura automática
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTable("reset-height")}
                    className="btn btn-ghost btn-xs"
                  >
                    Altura automática
                  </button>
                </div>
              </div>

              <div className="border-t border-base-200 pt-3">
                <div className="mb-2 text-xs font-medium text-base-content/60">
                  Célula atual
                </div>
                <button
                  type="button"
                  onClick={() => updateTable("toggle-header")}
                  className={`btn btn-ghost btn-xs mb-2 w-full justify-start ${
                    tableContext.isHeader ? "btn-active text-info" : ""
                  }`}
                >
                  <Rows3 size={14} />
                  {tableContext.isHeader
                    ? "Remover cabeçalho"
                    : "Usar como cabeçalho"}
                </button>
                <div className="flex items-center gap-2">
                  <PaintBucket size={14} className="text-base-content/50" />
                  {["#ffffff", "#fef3c7", "#dcfce7", "#dbeafe", "#fce7f3"].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        title={`Aplicar cor ${color}`}
                        aria-label={`Aplicar cor ${color}`}
                        onClick={() => updateTable("cell-background", color)}
                        className={`h-6 w-6 rounded border ${
                          tableContext.backgroundColor === color
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-base-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => updateTable("clear-cell-background")}
                    className="btn btn-ghost btn-xs"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedBlockCount > 1 && (
        <>
          <div className="mx-1 h-4 w-px bg-base-300" />
          <span className="px-1 text-xs text-base-content/50">
            {selectedBlockCount} blocos selecionados
          </span>
          <button
            type="button"
            title="Mover blocos para cima"
            aria-label="Mover blocos para cima"
            onClick={() => updateSelectedBlocks("up")}
            className="btn btn-ghost btn-xs btn-square"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            title="Mover blocos para baixo"
            aria-label="Mover blocos para baixo"
            onClick={() => updateSelectedBlocks("down")}
            className="btn btn-ghost btn-xs btn-square"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            title="Excluir blocos selecionados"
            aria-label="Excluir blocos selecionados"
            onClick={() => updateSelectedBlocks("delete")}
            className="btn btn-ghost btn-xs btn-square text-error"
          >
            <Trash2 size={15} />
          </button>
        </>
      )}

      <div className="mx-1 h-4 w-px bg-base-300" />

      {/* Histórico */}
      <button
        type="button"
        title="Desfazer"
        className="btn btn-ghost btn-xs btn-square"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 size={15} />
      </button>

      <button
        type="button"
        title="Refazer"
        className="btn btn-ghost btn-xs btn-square"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 size={15} />
      </button>
    </div>
  );
}
