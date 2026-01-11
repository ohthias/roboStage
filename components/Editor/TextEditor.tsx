"use client";

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

import { EditorState } from "lexical";
import theme from "./theme";
import ToolbarPlugin from "./ToolbarPlugin";

const editorConfig = {
  namespace: "BasicEditor",
  theme,
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

export default function TextEditor() {
  function onChange(editorState: EditorState) {
    editorState.read(() => {
      // console.log(editorState.toJSON());
    });
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="min-h-full bg-base-100 text-base-content">
        {/* Toolbar */}
        <div
          className="
      sticky top-0 z-20
      border-b border-base-300
      bg-base-100/80
      backdrop-blur
    "
        >
          <ToolbarPlugin />
        </div>

        {/* Editor */}
        <div className="mx-auto max-w-[720px] px-8 py-10">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="
              min-h-[400px]
              outline-none
              text-base
              leading-7
              prose
              prose-neutral
              max-w-none
            "
              />
            }
            placeholder={
              <div className="pointer-events-none text-base-content/40">
                Seja bem-vindo ao seu workspace roboStage! Comece a editar seu documento, crie novas páginas e organize seu conteúdo de forma eficiente.
              </div>
            }
            ErrorBoundary={() => <div>Erro no editor</div>}
          />

          <LinkPlugin />
          <ListPlugin />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}
