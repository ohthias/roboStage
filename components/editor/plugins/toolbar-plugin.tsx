"use client";

import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $isTextNode,
  type TextNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import {
  $createCodeNode,
  $isCodeNode,
} from "@lexical/code";
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
  Palette,
  type LucideIcon,
} from "lucide-react";

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

  const [blockType, setBlockType] =
    useState<BlockType>("paragraph");

  const [colorOpen, setColorOpen] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) return;

    setFormat({
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      strikethrough: selection.hasFormat("strikethrough"),
      code: selection.hasFormat("code"),
    });

    const anchorNode = selection.anchor.getNode();

    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();

    if ($isListNode(element)) {
      setBlockType(
        element.getListType() === "number"
          ? "ol"
          : "ul"
      );
    } else if ($isHeadingNode(element)) {
      setBlockType(
        element.getTag() as "h1" | "h2" | "h3"
      );
    } else if ($isCodeNode(element)) {
      setBlockType("code");
    } else if (element.getType() === "quote") {
      setBlockType("quote");
    } else {
      setBlockType("paragraph");
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(updateToolbar);
      }
    );
  }, [editor, updateToolbar]);

  function toggleBlock(type: BlockType) {
    if (type === "ul") {
      editor.dispatchCommand(
        blockType === "ul"
          ? REMOVE_LIST_COMMAND
          : INSERT_UNORDERED_LIST_COMMAND,
        undefined
      );

      return;
    }

    if (type === "ol") {
      editor.dispatchCommand(
        blockType === "ol"
          ? REMOVE_LIST_COMMAND
          : INSERT_ORDERED_LIST_COMMAND,
        undefined
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

      if (!$isRangeSelection(selection)) return;

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

  const createFormatButton = (
    icon: LucideIcon,
    label: string,
    formatType: keyof typeof format
  ) => ({
    icon,
    label,
    active: format[formatType],
    onClick: () =>
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType),
  });

  const inlineButtons = [
    createFormatButton(Bold, "Negrito", "bold"),
    createFormatButton(Italic, "Itálico", "italic"),
    createFormatButton(Underline, "Sublinhado", "underline"),
    createFormatButton(Strikethrough, "Tachado", "strikethrough"),
    createFormatButton(Code, "Código inline", "code"),
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
            b.active
              ? "btn-active text-info"
              : ""
          }`}
        >
          <b.icon size={15} />
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-base-300" />

      {/* Cores */}
      <div className="relative">
        <button
          type="button"
          title="Cor do texto"
          onClick={() =>
            setColorOpen((value) => !value)
          }
          className={`btn btn-ghost btn-xs btn-square ${
            colorOpen
              ? "btn-active text-info"
              : ""
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
                  onClick={() =>
                    applyTextColor(color.value)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-base-300 transition hover:scale-110 hover:bg-base-200"
                >
                  {color.value ? (
                    <span
                      className="h-4 w-4 rounded-full border border-base-content/20"
                      style={{
                        backgroundColor:
                          color.value,
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      A
                    </span>
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
            blockType === b.type
              ? "btn-active text-info"
              : ""
          }`}
        >
          <b.icon size={15} />
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-base-300" />

      {/* Histórico */}
      <button
        type="button"
        title="Desfazer"
        className="btn btn-ghost btn-xs btn-square"
        onClick={() =>
          editor.dispatchCommand(
            UNDO_COMMAND,
            undefined
          )
        }
      >
        <Undo2 size={15} />
      </button>

      <button
        type="button"
        title="Refazer"
        className="btn btn-ghost btn-xs btn-square"
        onClick={() =>
          editor.dispatchCommand(
            REDO_COMMAND,
            undefined
          )
        }
      >
        <Redo2 size={15} />
      </button>
    </div>
  );
}