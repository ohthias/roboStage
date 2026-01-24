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
import { EditorState } from "lexical";

import theme from "./theme";
import FloatingToolbarPlugin from "./FloatingToolbarPlugin";
import SlashMenuPlugin from "./SlashMenuPlugin";

interface TextEditorProps {
  initialTitle: string;
  initialIcon: string;
  initialContent?: string;
  onUpdate: (data: { title?: string; icon?: string; content?: string }) => void;
}

export default function TextEditor({ initialTitle, initialIcon, initialContent, onUpdate }: TextEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const editorConfig = {
    namespace: "NotionClone",
    theme,
    editorState: initialContent, // Load saved content
    onError(error: Error) {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
    ],
  };

  // Debounce updates to parent for content
  const onChange = (editorState: EditorState) => {
    // We can serialize here. In a real app, maybe debounce this.
    const jsonString = JSON.stringify(editorState);
    onUpdate({ content: jsonString });
  };

  // Immediate update for Title and Icon
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
        
        {/* Cover Image */}
        <div className="group relative h-48 w-full bg-gradient-to-r from-pink-100 to-blue-100 border-b border-black/5">
          <button className="absolute bottom-4 right-12 bg-white/70 hover:bg-white text-xs px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Change cover
          </button>
        </div>

        {/* Editor Content Area */}
        <div className="max-w-[900px] w-full mx-auto px-12 sm:px-24 relative -mt-10">
          
          {/* Icon */}
          <div className="relative group w-fit">
            <div 
              className="text-7xl cursor-pointer hover:bg-notion-hover rounded-lg transition-colors select-none flex items-center justify-center w-[90px] h-[90px]"
              onClick={() => setShowIconPicker(!showIconPicker)}
            >
              {icon}
            </div>
            {/* Simple Icon Picker Mockup */}
            {showIconPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border rounded-lg p-2 z-50 grid grid-cols-4 gap-2 w-48">
                 {["🤖", "📄", "🚀", "💡", "⚠️", "✅", "🎉", "🔥", "💻", "🎨", "📈", "📅"].map(emoji => (
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

          {/* Title Input */}
          <div className="mt-4 mb-8 group">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="w-full text-4xl font-bold text-[#37352f] placeholder:text-gray-300 outline-none bg-transparent"
            />
          </div>

          {/* Lexical Editor */}
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="outline-none text-base leading-7 min-h-[400px]"
                />
              }
              placeholder={
                <div className="editor-placeholder">
                  Type '/' for commands
                </div>
              }
              ErrorBoundary={() => <div>Error</div>}
            />

            {/* Notion Characteristics Plugins */}
            <LinkPlugin />
            <ListPlugin />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <OnChangePlugin onChange={onChange} />
            <FloatingToolbarPlugin />
            <SlashMenuPlugin />
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
}