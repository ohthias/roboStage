import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  $getSelection, $isRangeSelection, $createParagraphNode, 
  KEY_ARROW_DOWN_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_LOW,
  $isTextNode
} from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { createPortal } from 'react-dom';
import { Heading1, Heading2, List, ListOrdered, Quote, Text as TextIcon, Code } from 'lucide-react';

export default function SlashMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [position, setPosition] = useState<{top: number, left: number} | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { label: "Text", icon: <TextIcon size={18}/>, command: () => formatBlock("paragraph") },
    { label: "Heading 1", icon: <Heading1 size={18}/>, command: () => formatBlock("h1") },
    { label: "Heading 2", icon: <Heading2 size={18}/>, command: () => formatBlock("h2") },
    { label: "Bullet List", icon: <List size={18}/>, command: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined) },
    { label: "Numbered List", icon: <ListOrdered size={18}/>, command: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined) },
    { label: "Quote", icon: <Quote size={18}/>, command: () => formatBlock("quote") },
  ];

  const formatBlock = (type: "h1" | "h2" | "quote" | "paragraph") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => {
          if (type === "h1") return $createHeadingNode("h1");
          if (type === "h2") return $createHeadingNode("h2");
          if (type === "quote") return $createQuoteNode();
          return $createParagraphNode();
        });
      }
    });
  };

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          setQueryString(null);
          return;
        }

        const anchor = selection.anchor;
        const textContent = anchor.getNode().getTextContent();
        const offset = anchor.offset;
        
        // Check for slash command pattern at start of block or after space
        // Simple implementation: just check if the current text content starts with /
        // or the last character typed was /
        // A robust implementation would need to track the slash node.
        
        // Simplified Logic: if the block starts with / and contains query
        const match = textContent.match(/^\/([^ ]*)$/);
        
        if (match) {
           const nativeSelection = window.getSelection();
           if (nativeSelection && nativeSelection.rangeCount > 0) {
              const rect = nativeSelection.getRangeAt(0).getBoundingClientRect();
              setPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX
              });
           }
           setQueryString(match[1]);
        } else {
           setQueryString(null);
        }
      });
    });
  }, [editor]);

  // Handle Keyboard Navigation
  useEffect(() => {
    if (queryString === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(i => (i + 1) % items.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(i => (i - 1 + items.length) % items.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        executeCommand(selectedIndex);
      } else if (event.key === 'Escape') {
        setQueryString(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [queryString, selectedIndex]);

  const executeCommand = (index: number) => {
    const item = items[index];
    // Remove the slash command text first
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        // Delete the slash and query
        const anchorNode = anchor.getNode();
        if ($isTextNode(anchorNode)) {
          anchorNode.setTextContent(""); 
        }
      }
    });
    // Execute
    item.command();
    setQueryString(null);
  };

  if (queryString === null || !position) return null;

  return createPortal(
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-64 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
        Basic blocks
      </div>
      <div className="max-h-64 overflow-y-auto p-1">
        {items.map((item, idx) => (
          <button
            key={item.label}
            onClick={() => executeCommand(idx)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded text-left
              ${idx === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            <div className={`p-1 rounded border shadow-sm ${idx === selectedIndex ? 'bg-white border-blue-200' : 'bg-white border-gray-200'}`}>
              {item.icon}
            </div>
            {item.label}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}