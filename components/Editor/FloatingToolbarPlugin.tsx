import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Bold, Italic, Underline, Code, Strikethrough } from "lucide-react";

export default function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (nativeSelection && nativeSelection.rangeCount > 0 && rootElement && rootElement.contains(nativeSelection.anchorNode)) {
        const range = nativeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position above the selection
        setPosition({
          top: rect.top - 50 + window.scrollY,
          left: rect.left + rect.width / 2,
        });
        
        // Update states
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));
        setIsStrikethrough(selection.hasFormat("strikethrough"));
        setIsCode(selection.hasFormat("code"));
        
        setShow(true);
        return;
      }
    }
    setShow(false);
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
      () => {
        updateToolbar();
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  if (!show) return null;

  const btnClass = (isActive: boolean) => `
    p-1.5 rounded transition-colors
    ${isActive ? "text-blue-500 bg-blue-50" : "text-[#37352f] hover:bg-notion-hover"}
  `;

  return createPortal(
    <div
      ref={toolbarRef}
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
      className="absolute flex items-center gap-1 bg-white shadow-xl border border-gray-200 rounded-md p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
    >
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} className={btnClass(isBold)}>
        <Bold size={16} strokeWidth={2.5} />
      </button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} className={btnClass(isItalic)}>
        <Italic size={16} />
      </button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")} className={btnClass(isUnderline)}>
        <Underline size={16} />
      </button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} className={btnClass(isStrikethrough)}>
        <Strikethrough size={16} />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")} className={btnClass(isCode)}>
        <Code size={16} />
      </button>
    </div>,
    document.body
  );
}