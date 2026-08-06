"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

const UPDATE_PRIORITY = 1;

type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "code"
  | "bullet"
  | "number"
  | "check";

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCodeText, setIsCodeText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsStrikethrough(selection.hasFormat("strikethrough"));
    setIsCodeText(selection.hasFormat("code"));

    const anchorNode = selection.anchor.getNode();
    const parent = anchorNode.getParent();
    setIsLink($isLinkNode(parent) || $isLinkNode(anchorNode));

    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();

    if ($isListNode(element)) {
      const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
      const type = parentList ? parentList.getListType() : element.getListType();
      setBlockType(type === "bullet" ? "bullet" : type === "number" ? "number" : "check");
    } else if ($isHeadingNode(element)) {
      setBlockType(element.getTag() as BlockType);
    } else if ($isQuoteNode(element)) {
      setBlockType("quote");
    } else if ($isCodeNode(element)) {
      setBlockType("code");
    } else {
      setBlockType("paragraph");
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar());
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        UPDATE_PRIORITY
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        UPDATE_PRIORITY
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        UPDATE_PRIORITY
      )
    );
  }, [editor, updateToolbar]);

  function formatParagraph() {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }

  function formatHeading(tag: HeadingTagType) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () =>
          blockType === tag ? $createParagraphNode() : $createHeadingNode(tag)
        );
      }
    });
  }

  function formatQuote() {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () =>
          blockType === "quote" ? $createParagraphNode() : $createQuoteNode()
        );
      }
    });
  }

  function formatCode() {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () =>
          blockType === "code" ? $createParagraphNode() : $createCodeNode()
        );
      }
    });
  }

  function toggleList(type: "bullet" | "number" | "check") {
    if (blockType === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      return;
    }
    if (type === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (type === "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    }
  }

  function insertLink() {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    const url = window.prompt("Cole a URL do link:");
    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-base-200 px-4 py-2">
      <ToolbarButton
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
        label="Desfazer"
      >
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
        label="Refazer"
      >
        <Redo2 size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={formatParagraph} active={blockType === "paragraph"} label="Texto normal">
        <Pilcrow size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("h1")} active={blockType === "h1"} label="Título 1">
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("h2")} active={blockType === "h2"} label="Título 2">
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("h3")} active={blockType === "h3"} label="Título 3">
        <Heading3 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={formatQuote} active={blockType === "quote"} label="Citação">
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={formatCode} active={blockType === "code"} label="Bloco de código">
        <Code size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        active={isBold}
        label="Negrito (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        active={isItalic}
        label="Itálico (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        active={isUnderline}
        label="Sublinhado (Ctrl+U)"
      >
        <Underline size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
        active={isStrikethrough}
        label="Riscado"
      >
        <Strikethrough size={16} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        active={isCodeText}
        label="Código inline"
      >
        <Code size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={insertLink} active={isLink} label="Link">
        <LinkIcon size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={() => toggleList("bullet")} active={blockType === "bullet"} label="Lista com marcadores">
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => toggleList("number")} active={blockType === "number"} label="Lista numerada">
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => toggleList("check")} active={blockType === "check"} label="Lista de tarefas">
        <ListChecks size={16} />
      </ToolbarButton>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-base-300" />;
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()} // não tira o foco do editor
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={[
        "btn btn-ghost btn-xs btn-square",
        active ? "bg-primary/10 text-primary" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
