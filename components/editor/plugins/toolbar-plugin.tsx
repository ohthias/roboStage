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
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text";
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
  List,
  ListOrdered,
  Quote,
  Pilcrow,
  Undo2,
  Redo2,
  type LucideIcon,
  Heading3,
} from "lucide-react";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "ul" | "ol";

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setFormat({
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      strikethrough: selection.hasFormat("strikethrough"),
    });

    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();

    if ($isListNode(element)) {
      setBlockType(element.getListType() === "number" ? "ol" : "ul");
    } else if ($isHeadingNode(element)) {
      setBlockType(element.getTag() as "h1" | "h2");
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
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbar);
    });
  }, [editor, updateToolbar]);

  function toggleBlock(type: BlockType) {
    if (type === "ul") {
      editor.dispatchCommand(
        blockType === "ul" ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
        undefined
      );
      return;
    }
    if (type === "ol") {
      editor.dispatchCommand(
        blockType === "ol" ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined
      );
      return;
    }

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      $setBlocksType(selection, () => {
        if (type === "h1" || type === "h2") return $createHeadingNode(type);
        if (type === "quote") return $createQuoteNode();
        return $createParagraphNode();
      });
    });
  }

  const inlineButtons: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }[] = [
    {
      icon: Bold,
      label: "Negrito",
      active: format.bold,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
    },
    {
      icon: Italic,
      label: "Itálico",
      active: format.italic,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
    },
    {
      icon: Underline,
      label: "Sublinhado",
      active: format.underline,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
    },
    {
      icon: Strikethrough,
      label: "Tachado",
      active: format.strikethrough,
      onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
    },
  ];

  const blockButtons: { icon: LucideIcon; label: string; type: BlockType }[] = [
    { icon: Pilcrow, label: "Parágrafo", type: "paragraph" },
    { icon: Heading1, label: "Título 1", type: "h1" },
    { icon: Heading2, label: "Título 2", type: "h2" },
    { icon: Heading3, label: "Título 3", type: "h3" },
    { icon: Quote, label: "Citação", type: "quote" },
    { icon: List, label: "Lista", type: "ul" },
    { icon: ListOrdered, label: "Lista numerada", type: "ol" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-base-300 p-2">
      {inlineButtons.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.label}
          onClick={b.onClick}
          className={`btn btn-ghost btn-xs btn-square ${b.active ? "btn-active text-warning" : ""}`}
        >
          <b.icon size={15} />
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-base-300" />

      {blockButtons.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.label}
          onClick={() => toggleBlock(b.type)}
          className={`btn btn-ghost btn-xs btn-square ${blockType === b.type ? "btn-active text-warning" : ""}`}
        >
          <b.icon size={15} />
        </button>
      ))}

      <div className="mx-1 h-4 w-px bg-base-300" />

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