import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $isListNode } from "@lexical/list";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { 
  Bold, Italic, Underline, Strikethrough, Code, 
  List, ListOrdered, Quote, Undo, Redo, 
  Heading1, Heading2, BrainCircuit
} from "lucide-react";

const LowPriority = 1;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update Text Formatting
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      // Update Block Type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = element.getParent();
          if ($isListNode(parentList)) {
            const listType = parentList.getListType();
            setBlockType(listType === "number" ? "ol" : "ul");
          }
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        return false;
      },
      LowPriority
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      LowPriority
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      LowPriority
    );
  }, [editor]);

  const formatHeading = (headingTag: "h1" | "h2") => {
    if (blockType !== headingTag) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingTag));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatList = (listType: "ul" | "ol") => {
    if (blockType !== listType) {
      editor.dispatchCommand(
        listType === "ol"
          ? INSERT_ORDERED_LIST_COMMAND
          : INSERT_UNORDERED_LIST_COMMAND,
        undefined
      );
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  // Helper for button styling
  const btnClass = (isActive: boolean) => `
    p-2 rounded-md transition-all duration-200 
    ${isActive 
      ? "bg-indigo-100 text-indigo-700 shadow-sm" 
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
  `;

  const Divider = () => <div className="w-px h-6 bg-slate-200 mx-1" />;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 w-full max-w-[720px] mx-auto">
      {/* History */}
      <button
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
        className={`${btnClass(false)} ${!canUndo ? "opacity-30 cursor-not-allowed" : ""}`}
        title="Desfazer (Ctrl+Z)"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
        className={`${btnClass(false)} ${!canRedo ? "opacity-30 cursor-not-allowed" : ""}`}
        title="Refazer (Ctrl+Shift+Z)"
      >
        <Redo size={18} />
      </button>

      <Divider />

      {/* Headings */}
      <button
        onClick={() => formatHeading("h1")}
        className={btnClass(blockType === "h1")}
        title="Título 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => formatHeading("h2")}
        className={btnClass(blockType === "h2")}
        title="Título 2"
      >
        <Heading2 size={18} />
      </button>

      <Divider />

      {/* Basic Formatting */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={btnClass(isBold)}
        title="Negrito (Ctrl+B)"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={btnClass(isItalic)}
        title="Itálico (Ctrl+I)"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={btnClass(isUnderline)}
        title="Sublinhado (Ctrl+U)"
      >
        <Underline size={18} />
      </button>
       <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
        className={btnClass(isStrikethrough)}
        title="Tachado"
      >
        <Strikethrough size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        className={btnClass(isCode)}
        title="Código Inline"
      >
        <Code size={18} />
      </button>

      <Divider />

      {/* Lists & Quote */}
      <button
        onClick={() => formatList("ul")}
        className={btnClass(blockType === "ul")}
        title="Lista com Marcadores"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => formatList("ol")}
        className={btnClass(blockType === "ol")}
        title="Lista Numerada"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => formatQuote()}
        className={btnClass(blockType === "quote")}
        title="Citação"
      >
        <Quote size={18} />
      </button>

      <div className="flex-grow" />

      {/* AI Button */}
      <button
        onClick={() => setIsAIModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-md hover:scale-105 transition-all text-sm font-medium"
      >
        <BrainCircuit size={16} />
        <span>AI Assistant</span>
      </button>
    </div>
  );
}