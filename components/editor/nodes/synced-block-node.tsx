import type { JSX } from "react";
import dynamic from "next/dynamic";
import {
  $applyNodeReplacement,
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { EmbedSkeleton } from "../embeds/embed-shell";

// O editor aninhado (e os plugins dele) só carregam se a página tiver um.
const SyncedBlockView = dynamic(() => import("./synced-block-view").then((m) => m.SyncedBlockView), {
  ssr: false,
  loading: () => <EmbedSkeleton height="h-24" />,
});

export type SerializedSyncedBlockNode = Spread<{ syncId: string }, SerializedLexicalNode>;

/**
 * Bloco sincronizado: a página guarda só o id; o conteúdo vive na tabela
 * synced_blocks e é editado num editor aninhado. Mudou em uma página, muda
 * em todas.
 */
export class SyncedBlockNode extends DecoratorNode<JSX.Element> {
  __syncId: string;

  constructor(syncId: string, key?: NodeKey) {
    super(key);
    this.__syncId = syncId;
  }

  static getType(): string {
    return "synced-block";
  }

  static clone(node: SyncedBlockNode): SyncedBlockNode {
    return new SyncedBlockNode(node.__syncId, node.__key);
  }

  static importJSON(json: SerializedSyncedBlockNode): SyncedBlockNode {
    return $createSyncedBlockNode(String(json.syncId ?? ""));
  }

  exportJSON(): SerializedSyncedBlockNode {
    return { ...super.exportJSON(), type: "synced-block", version: 1, syncId: this.__syncId };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement("div");
    el.className = "editor-synced-host";
    return el;
  }

  updateDOM(): false {
    return false;
  }

  getTextContent(): string {
    return "[Bloco sincronizado]";
  }

  isInline(): false {
    return false;
  }

  getSyncId() {
    return this.getLatest().__syncId;
  }

  decorate(): JSX.Element {
    return <SyncedBlockView nodeKey={this.__key} syncId={this.__syncId} />;
  }
}

export function $createSyncedBlockNode(syncId: string): SyncedBlockNode {
  return $applyNodeReplacement(new SyncedBlockNode(syncId));
}

export function $isSyncedBlockNode(node: LexicalNode | null | undefined): node is SyncedBlockNode {
  return node instanceof SyncedBlockNode;
}
