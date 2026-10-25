import { type JSX, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $applyNodeReplacement,
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { KanbanCardEmbed } from "../embeds/kanban-card-embed";
import { CalendarEventEmbed } from "../embeds/calendar-event-embed";
import { LabTestChartEmbed } from "../embeds/labtest-chart-embed";
import { ThinkLabEmbed } from "../embeds/thinklab-embed";
import {
  EMBED_KINDS,
  type EmbedKind,
  type EmbedOptions,
  type LabTestChartOptions,
} from "../embeds/embed-types";

export type SerializedEmbedNode = Spread<
  { embedKind: EmbedKind; refId: string; label: string; options: EmbedOptions },
  SerializedLexicalNode
>;

function EmbedComponent({
  editor,
  nodeKey,
  embedKind,
  refId,
  label,
  options,
}: {
  editor: LexicalEditor;
  nodeKey: NodeKey;
  embedKind: EmbedKind;
  refId: string;
  label: string;
  options: EmbedOptions;
}) {
  const [composerEditor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  // Clique no bloco (fora dos botões/links) seleciona o nó — Delete/Backspace remove.
  useEffect(
    () =>
      composerEditor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const root = composerEditor.getElementByKey(nodeKey);
          const target = event.target as HTMLElement | null;
          if (!root || !target || !root.contains(target)) return false;
          if (target.closest("button, a, input, select, textarea")) return false;
          if (!event.shiftKey) clearSelection();
          setSelected(true);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [clearSelection, composerEditor, nodeKey, setSelected],
  );

  useEffect(() => {
    composerEditor.getElementByKey(nodeKey)?.classList.toggle("editor-embed-selected", isSelected);
  }, [composerEditor, isSelected, nodeKey]);

  const update = (fn: (node: EmbedNode) => void) =>
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isEmbedNode(node)) fn(node);
    });
  const onRemove = () => update((node) => node.remove());
  const onOptionsChange = (next: EmbedOptions) => update((node) => node.setOptions(next));

  switch (embedKind) {
    case "kanban-card":
      return <KanbanCardEmbed refId={refId} label={label} onRemove={onRemove} />;
    case "calendar-event":
      return <CalendarEventEmbed refId={refId} label={label} onRemove={onRemove} />;
    case "thinklab-board":
      return <ThinkLabEmbed refId={refId} label={label} onRemove={onRemove} />;
    case "labtest-chart":
      return (
        <LabTestChartEmbed
          refId={refId}
          label={label}
          options={options as LabTestChartOptions}
          onOptionsChange={onOptionsChange}
          onRemove={onRemove}
        />
      );
    default:
      return null;
  }
}

/**
 * Bloco que referencia um item de outro módulo (card do Kanban, evento do
 * calendário, gráfico do LabTest ou quadro do ThinkLab). Guarda só o id, um
 * rótulo de reserva e opções de exibição; os dados vêm ao vivo do servidor.
 */
export class EmbedNode extends DecoratorNode<JSX.Element> {
  __embedKind: EmbedKind;
  __refId: string;
  __label: string;
  __options: EmbedOptions;

  constructor(
    embedKind: EmbedKind,
    refId: string,
    label = "",
    options: EmbedOptions = {},
    key?: NodeKey,
  ) {
    super(key);
    this.__embedKind = embedKind;
    this.__refId = refId;
    this.__label = label;
    this.__options = options;
  }

  static getType(): string {
    return "stagebook-embed";
  }

  static clone(node: EmbedNode): EmbedNode {
    return new EmbedNode(node.__embedKind, node.__refId, node.__label, node.__options, node.__key);
  }

  static importJSON(json: SerializedEmbedNode): EmbedNode {
    const kind = EMBED_KINDS.includes(json.embedKind) ? json.embedKind : "kanban-card";
    return $createEmbedNode(kind, json.refId, json.label, json.options ?? {});
  }

  exportJSON(): SerializedEmbedNode {
    return {
      type: "stagebook-embed",
      version: 1,
      embedKind: this.__embedKind,
      refId: this.__refId,
      label: this.__label,
      options: this.__options,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement("div");
    el.className = "editor-embed";
    el.setAttribute("data-embed-block", this.__embedKind);
    return el;
  }

  updateDOM(): false {
    return false;
  }

  getTextContent(): string {
    return `[${this.__label || this.__embedKind}]`;
  }

  isInline(): false {
    return false;
  }

  getEmbedKind() {
    return this.getLatest().__embedKind;
  }
  getRefId() {
    return this.getLatest().__refId;
  }
  getOptions() {
    return this.getLatest().__options;
  }
  setOptions(options: EmbedOptions): this {
    const writable = this.getWritable();
    writable.__options = options;
    return writable;
  }

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <EmbedComponent
        editor={editor}
        nodeKey={this.__key}
        embedKind={this.__embedKind}
        refId={this.__refId}
        label={this.__label}
        options={this.__options}
      />
    );
  }
}

export function $createEmbedNode(
  embedKind: EmbedKind,
  refId: string,
  label = "",
  options: EmbedOptions = {},
): EmbedNode {
  return $applyNodeReplacement(new EmbedNode(embedKind, refId, label, options));
}

export function $isEmbedNode(node: LexicalNode | null | undefined): node is EmbedNode {
  return node instanceof EmbedNode;
}
