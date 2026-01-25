"use client";

import React, { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { EditorState, ParagraphNode, TextNode } from "lexical";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";

import theme from "./theme";
import FloatingToolbarPlugin from "./FloatingToolbarPlugin";
import SlashMenuPlugin from "./SlashMenuPlugin";
import TableOfContents from "./TableOfContents";
import ImagesPlugin from "./Images/ImagesPlugin";
import { ImageNode } from "./Images/ImageNode";

interface TextEditorProps {
  initialTitle: string;
  initialIcon: string;
  initialContent?: string;
  onUpdate: (data: { title?: string; icon?: string; content?: string }) => void;
}

export default function TextEditor({
  initialTitle,
  initialIcon,
  initialContent,
  onUpdate,
}: TextEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const editorConfig = {
    namespace: "RobostageEditor",
    theme,
    editorState: initialContent,
    onError(error: Error) {
      console.error(error);
    },
    nodes: [
      ParagraphNode,
      TextNode,
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      ImageNode,
    ],
  };

  const onChange = (editorState: EditorState) => {
    editorState.read(() => {
      const json = editorState.toJSON();
      onUpdate({ content: JSON.stringify(json) });
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  const handleIconSelect = (newIcon: string) => {
    setIcon(newIcon);
    setShowIconPicker(false);
    onUpdate({ icon: newIcon });
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="flex flex-col min-h-full pb-32">
        <div className="group relative h-48 w-full bg-gradient-to-r from-primary/20 to-secondary/10"></div>

        <div className="max-w-[900px] w-full mx-auto px-12 sm:px-24 relative -mt-10">
          <div className="relative group w-fit">
            <div
              className="text-7xl cursor-pointer hover:bg-notion-hover rounded-lg transition-colors select-none flex items-center justify-center w-[90px] h-[90px]"
              onClick={() => setShowIconPicker(!showIconPicker)}
            >
              {icon}
            </div>
            {showIconPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border rounded-lg p-2 z-50 grid grid-cols-4 gap-2 w-48">
                {[
                  "🤖",
                  "📄",
                  "🚀",
                  "💡",
                  "⚠️",
                  "✅",
                  "🎉",
                  "🔥",
                  "💻",
                  "🎨",
                  "📈",
                  "📅",
                ].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleIconSelect(emoji)}
                    className="text-2xl hover:bg-slate-100 rounded p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 mb-8 group">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="w-full text-4xl font-bold text-[#37352f] placeholder:text-gray-300 outline-none bg-transparent"
            />
          </div>

          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="outline-none text-base leading-7" />
              }
              placeholder={
                <div className="editor-placeholder">Type '/' for commands</div>
              }
              ErrorBoundary={() => <div>Error</div>}
            />

            <LinkPlugin />
            <ListPlugin />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <OnChangePlugin onChange={onChange} />
            <FloatingToolbarPlugin />
            <SlashMenuPlugin />
            <ImagesPlugin />
            <TablePlugin />
            <TableOfContents />
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
}
