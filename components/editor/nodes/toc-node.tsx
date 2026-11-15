import { type JSX, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { $isHeadingNode } from "@lexical/rich-text";
import {
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";
import { ListTree } from "lucide-react";
import {
  $isCollapsibleContainerNode,
  $isCollapsibleTitleNode,
} from "./collapsible-nodes";

export type TocEntry = { key: string; level: number; text: string };

/** Títulos do documento (inclusive títulos de blocos recolhíveis), em ordem. */
export function $collectHeadings(): TocEntry[] {
  const out: TocEntry[] = [];
  const walk = (node: LexicalNode) => {
    if ($isHeadingNode(node)) {
      out.push({ key: node.getKey(), level: Number(node.getTag().slice(1)), text: node.getTextContent() });
      return;
    }
    if ($isCollapsibleTitleNode(node)) {
      const level = node.getLevel();
      if (level !== "p") out.push({ key: node.getKey(), level: Number(level.slice(1)), text: node.getTextContent() });
      return;
    }
    if ($isElementNode(node) && !node.isInline() && node.getType() !== "table") {
      node.getChildren().forEach(walk);
    }
  };
  $getRoot().getChildren().forEach(walk);
  return out;
}

/** Abre os recolhíveis que escondem o nó e rola até ele. */
export function scrollToHeading(editor: LexicalEditor, key: string) {
  editor.update(
    () => {
      let node: LexicalNode | null = $getNodeByKey(key);
      while (node) {
        if ($isCollapsibleContainerNode(node) && !node.getOpen()) node.setOpen(true);
        node = node.getParent();
      }
    },
    {
      onUpdate: () => {
        const el = editor.getElementByKey(key);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("editor-flash");
        setTimeout(() => el.classList.remove("editor-flash"), 1200);
      },
    },
  );
}

function TocComponent({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [entries, setEntries] = useState<TocEntry[]>(() => editor.read($collectHeadings));
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
        const next = editorState.read($collectHeadings);
        setEntries((prev) =>
          prev.length === next.length &&
          prev.every((e, i) => e.key === next[i].key && e.text === next[i].text && e.level === next[i].level)
            ? prev
            : next,
        );
      }),
    [editor],
  );

  // Clique fora dos links seleciona o bloco (Delete remove).
  useEffect(
    () =>
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const root = editor.getElementByKey(nodeKey);
          const target = event.target as HTMLElement | null;
          if (!root || !target || !root.contains(target) || target.closest("button")) return false;
          if (!event.shiftKey) clearSelection();
          setSelected(true);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor, nodeKey, setSelected, clearSelection],
  );

  const min = entries.reduce((m, e) => Math.min(m, e.level), 6);

  return (
    <nav
      aria-label="Sumário"
      className={`editor-toc ${isSelected ? "is-selected" : ""}`}
    >
      <div className="editor-toc-header">
        <ListTree size={14} />
        Sumário
      </div>
      {entries.length === 0 ? (
        <p className="editor-toc-empty">Adicione títulos à página para montar o sumário.</p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.key} style={{ paddingLeft: `${(entry.level - min) * 1.1}rem` }}>
              <button type="button" onClick={() => scrollToHeading(editor, entry.key)}>
                {entry.text.trim() || <span className="opacity-50">Título sem texto</span>}
              </button>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

export class TocNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "toc";
  }

  static clone(node: TocNode): TocNode {
    return new TocNode(node.__key);
  }

  static importJSON(): TocNode {
    return $createTocNode();
  }

  exportJSON(): SerializedLexicalNode {
    return { ...super.exportJSON(), type: "toc", version: 1 };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement("div");
    el.className = "editor-toc-block";
    return el;
  }

  updateDOM(): false {
    return false;
  }

  getTextContent(): string {
    return "";
  }

  isInline(): false {
    return false;
  }

  decorate(): JSX.Element {
    return <TocComponent nodeKey={this.__key} />;
  }
}

export function $createTocNode(): TocNode {
  return new TocNode();
}

export function $isTocNode(node: LexicalNode | null | undefined): node is TocNode {
  return node instanceof TocNode;
}
