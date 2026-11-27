"use client";

import type { JSX } from "react";
import {
  $applyNodeReplacement,
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { FileText } from "lucide-react";
import { DocIcon } from "../doc-icon";
import { useStagebookEditor } from "../stagebook-context";

export type SerializedPageMentionNode = Spread<{ docId: string; title: string }, SerializedLexicalNode>;

function PageMentionView({ docId, title }: { docId: string; title: string }) {
  const { pages, navigate } = useStagebookEditor();
  const page = pages.find((p) => p.id === docId);
  // Título atual da página (se mudou depois da menção); sem acesso = guardado.
  const label = page?.title || title || "Página";
  const missing = pages.length > 0 && !page;
  const href = `/dashboard/documents/${docId}`;
  return (
    <a
      href={href}
      className={`editor-mention ${missing ? "is-missing" : ""}`}
      title={missing ? "Página removida ou sem acesso" : `Abrir “${label}”`}
      contentEditable={false}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        if (!missing) navigate(href);
      }}
    >
      {page?.icon ? <DocIcon value={page.icon} size={15} fallback={null} /> : <FileText size={14} />}
      <span>{label}</span>
    </a>
  );
}

/** Link vivo para outra página do Stagebook (mostra ícone e título atuais). */
export class PageMentionNode extends DecoratorNode<JSX.Element> {
  __docId: string;
  __title: string;

  constructor(docId: string, title = "", key?: NodeKey) {
    super(key);
    this.__docId = docId;
    this.__title = title;
  }

  static getType(): string {
    return "page-mention";
  }

  static clone(node: PageMentionNode): PageMentionNode {
    return new PageMentionNode(node.__docId, node.__title, node.__key);
  }

  static importJSON(json: SerializedPageMentionNode): PageMentionNode {
    return $createPageMentionNode(String(json.docId ?? ""), String(json.title ?? ""));
  }

  exportJSON(): SerializedPageMentionNode {
    return { ...super.exportJSON(), type: "page-mention", version: 1, docId: this.__docId, title: this.__title };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement("span");
    el.className = "editor-mention-host";
    return el;
  }

  updateDOM(): false {
    return false;
  }

  getTextContent(): string {
    return `@${this.__title}`;
  }

  isInline(): true {
    return true;
  }

  getDocId() {
    return this.getLatest().__docId;
  }

  decorate(): JSX.Element {
    return <PageMentionView docId={this.__docId} title={this.__title} />;
  }
}

export function $createPageMentionNode(docId: string, title = ""): PageMentionNode {
  return $applyNodeReplacement(new PageMentionNode(docId, title));
}

export function $isPageMentionNode(node: LexicalNode | null | undefined): node is PageMentionNode {
  return node instanceof PageMentionNode;
}
