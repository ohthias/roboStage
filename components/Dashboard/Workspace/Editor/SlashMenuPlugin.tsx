import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
} from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createCodeNode } from "@lexical/code";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import {
  $createTableNodeWithDimensions,
} from "@lexical/table";
import { $setBlocksType } from "@lexical/selection";
import {
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Text as TextIcon,
  Code,
  Table,
} from "lucide-react";

interface Position {
  top: number;
  left: number;
}

export default function SlashMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { label: "Text", icon: <TextIcon size={18} />, action: () => formatBlock("paragraph") },
    { label: "Heading 1", icon: <Heading1 size={18} />, action: () => formatBlock("h1") },
    { label: "Heading 2", icon: <Heading2 size={18} />, action: () => formatBlock("h2") },
    {
      label: "Bullet List",
      icon: <List size={18} />,
      action: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    },
    {
      label: "Numbered List",
      icon: <ListOrdered size={18} />,
      action: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    },
    { label: "Quote", icon: <Quote size={18} />, action: () => formatBlock("quote") },
    {
      label: "Code Block",
      icon: <Code size={18} />,
      action: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode());
          }
        }),
    },
    {
      label: "Table (3x3)",
      icon: <Table size={18} />,
      action: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const tableNode = $createTableNodeWithDimensions(3, 3);
            selection.insertNodes([tableNode]);
          }
        }),
    },
  ];

  function formatBlock(type: "paragraph" | "h1" | "h2" | "quote") {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      $setBlocksType(selection, () => {
        if (type === "h1") return $createHeadingNode("h1");
        if (type === "h2") return $createHeadingNode("h2");
        if (type === "quote") return $createQuoteNode();
        return $createParagraphNode();
      });
    });
  }

  /** Detecta /comando olhando APENAS texto antes do cursor */
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          setQuery(null);
          return;
        }

        const anchor = selection.anchor;
        const node = anchor.getNode();
        const text = node.getTextContent();
        const beforeCursor = text.slice(0, anchor.offset);
        const match = beforeCursor.match(/(?:^|\s)\/([^\s]*)$/);

        if (!match) {
          setQuery(null);
          return;
        }

        const nativeSelection = window.getSelection();
        if (!nativeSelection || nativeSelection.rangeCount === 0) return;

        const rect = nativeSelection.getRangeAt(0).getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 6,
          left: rect.left + window.scrollX,
        });

        setQuery(match[1]);
      });
    });
  }, [editor]);

  /** Navegação por teclado */
  useEffect(() => {
    if (!query) return;

    const unregister = [
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        () => {
          execute(selectedIndex);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          setQuery(null);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
    ];

    return () => unregister.forEach((u) => u());
  }, [query, selectedIndex]);

  useEffect(() => {
    if (query !== null) setSelectedIndex(0);
  }, [query]);

  function execute(index: number) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.removeText();
      }
    });

    items[index].action();
    setQuery(null);
  }

  if (!query || !position) return null;

  return createPortal(
    <div
      className="fixed z-50 w-64 bg-white border rounded-lg shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
        Insert block
      </div>

      <div className="p-1 max-h-64 overflow-y-auto">
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={() => execute(i)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm
              ${i === selectedIndex ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}
            `}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}