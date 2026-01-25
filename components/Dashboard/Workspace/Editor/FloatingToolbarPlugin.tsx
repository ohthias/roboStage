import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Strikethrough,
  Palette,
} from "lucide-react";

const TEXT_COLORS = [
  { label: "Default", color: "inherit" },
  { label: "Gray", color: "#9B9A97" },
  { label: "Brown", color: "#64473A" },
  { label: "Orange", color: "#D9730D" },
  { label: "Yellow", color: "#DFAB01" },
  { label: "Green", color: "#0F7B6C" },
  { label: "Blue", color: "#0B6E99" },
  { label: "Purple", color: "#6940A5" },
  { label: "Pink", color: "#AD1A72" },
  { label: "Red", color: "#E03E3E" },
];

const BACKGROUND_COLORS = [
  { label: "Default", color: "inherit" },
  { label: "Gray", color: "#EBEAEA" },
  { label: "Brown", color: "#E9E2DF" },
  { label: "Orange", color: "#FBE9E0" },
  { label: "Yellow", color: "#FEF3C7" },
  { label: "Green", color: "#DFF6F5" },
  { label: "Blue", color: "#E0F2FE" },
  { label: "Purple", color: "#F3E8FF" },
  { label: "Pink", color: "#FCE7F3" },
  { label: "Red", color: "#FEE2E2" },
];

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

  const [showColorPicker, setShowColorPicker] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection &&
        nativeSelection.rangeCount > 0 &&
        rootElement &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
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
    setShowColorPicker(false);
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
      1,
    );
  }, [editor, updateToolbar]);

  const applyColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color });
      }
    });
    setShowColorPicker(false);
  };

  if (!show) return null;

  const btnClass = (isActive: boolean) => `
    p-1.5 rounded transition-colors
    ${isActive ? "text-blue-500 bg-blue-50" : "text-[#37352f] hover:bg-notion-hover"}
  `;

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
      }}
      className="absolute flex items-center gap-1 bg-white shadow-xl border border-gray-200 rounded-md p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
      onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
    >
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={btnClass(isBold)}
      >
        <Bold size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={btnClass(isItalic)}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={btnClass(isUnderline)}
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        className={btnClass(isStrikethrough)}
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        className={btnClass(isCode)}
      >
        <Code size={16} />
      </button>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`${btnClass(false)} ${showColorPicker ? "bg-blue-50 text-blue-500" : ""}`}
          title="Text Color"
        >
          <Palette size={16} />
        </button>
        {showColorPicker && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-lg p-2 grid grid-cols-5 gap-1.5 w-40 z-50">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                onClick={() => applyColor(c.color)}
                className="w-6 h-6 rounded-full hover:scale-110 hover:shadow-sm transition-all border border-gray-200 flex items-center justify-center group"
                title={c.label}
                style={{
                  backgroundColor:
                    c.color === "inherit" ? "transparent" : c.color,
                }}
              >
                {c.color === "inherit" && (
                  <div className="w-full h-px bg-red-400 rotate-45" />
                )}
              </button>
            ))}

            {BACKGROUND_COLORS.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      $patchStyleText(selection, { backgroundColor: c.color });
                    }
                  });
                }}
                className="w-6 h-6 rounded-full hover:scale-110 hover:shadow-sm transition-all border border-gray-200 flex items-center justify-center group"
                title={`Background: ${c.label}`}
                style={{
                  backgroundColor:
                    c.color === "inherit" ? "transparent" : c.color,
                }}
              >
                {c.color === "inherit" && (
                  <div className="w-full h-px bg-red-400 rotate-45" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
