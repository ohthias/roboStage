import { type JSX, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $applyNodeReplacement,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { DEFAULT_DIVIDER_COLOR } from "../editor-colors";

export type DividerStyle = "solid" | "dashed" | "dotted" | "serrated" | "brush";
export type DividerWeight = "thin" | "medium" | "thick";

export const DIVIDER_STYLES: { value: DividerStyle; label: string }[] = [
  { value: "solid", label: "Sólido" },
  { value: "dashed", label: "Tracejado" },
  { value: "dotted", label: "Pontilhado" },
  { value: "serrated", label: "Serrilhado" },
  { value: "brush", label: "Pincelado" },
];
export const DIVIDER_WEIGHTS: { value: DividerWeight; label: string }[] = [
  { value: "thin", label: "Fino" },
  { value: "medium", label: "Médio" },
  { value: "thick", label: "Grosso" },
];

const WEIGHT_PX: Record<DividerWeight, number> = { thin: 2, medium: 4, thick: 7 };

export type SerializedDividerNode = Spread<
  { dividerStyle: DividerStyle; color: string; weight: DividerWeight },
  SerializedLexicalNode
>;

/* ---------- traços ---------- */

/** Zigue-zague (serrilhado) como máscara, para pintar com qualquer cor. */
const SERRATED_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' viewBox='0 0 16 10'%3E%3Cpath d='M0 9 L4 1 L8 9 L12 1 L16 9' fill='none' stroke='black' stroke-width='2.2' stroke-linejoin='miter'/%3E%3C/svg%3E")`;

const BRUSH_PATH =
  "M2 15 C 40 8, 90 17, 160 12 S 300 7, 380 13 S 520 18, 610 12 S 760 7, 850 13 S 960 16, 998 11 " +
  "L 998 14 C 950 20, 880 19, 800 18 S 650 21, 560 19 S 400 22, 300 19 S 130 21, 60 20 S 8 19, 2 17 Z";

export function DividerView({
  uid,
  dividerStyle,
  color,
  weight,
}: {
  uid: string;
  dividerStyle: DividerStyle;
  color: string;
  weight: DividerWeight;
}) {
  const px = WEIGHT_PX[weight];

  if (dividerStyle === "brush") {
    const h = px * 3 + 6;
    const id = `brush-${uid}`;
    return (
      <svg
        role="presentation"
        width="100%"
        height={h}
        viewBox="0 0 1000 30"
        preserveAspectRatio="none"
        style={{ display: "block", color }}
      >
        <defs>
          <filter id={id} x="-2%" y="-40%" width="104%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path d={BRUSH_PATH} fill="currentColor" filter={`url(#${id})`} />
      </svg>
    );
  }

  const common = { width: "100%", color } as const;

  if (dividerStyle === "serrated") {
    const size = px + 6;
    return (
      <div
        role="presentation"
        style={{
          ...common,
          height: size,
          backgroundColor: "currentColor",
          WebkitMaskImage: SERRATED_MASK,
          maskImage: SERRATED_MASK,
          WebkitMaskRepeat: "repeat-x",
          maskRepeat: "repeat-x",
          WebkitMaskSize: `${size * 1.6}px ${size}px`,
          maskSize: `${size * 1.6}px ${size}px`,
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    );
  }

  if (dividerStyle === "dotted") {
    const gap = px * 3 + 4;
    return (
      <div
        role="presentation"
        style={{
          ...common,
          height: px + 2,
          backgroundImage: `radial-gradient(circle at center, currentColor ${(px + 2) / 2 - 0.3}px, transparent ${(px + 2) / 2}px)`,
          backgroundSize: `${gap}px ${px + 2}px`,
          backgroundRepeat: "repeat-x",
        }}
      />
    );
  }

  return (
    <div
      role="presentation"
      style={{
        ...common,
        height: 0,
        borderTopWidth: px,
        borderTopStyle: dividerStyle === "dashed" ? "dashed" : "solid",
        borderTopColor: "currentColor",
        borderRadius: 999,
      }}
    />
  );
}

function DividerComponent({
  nodeKey,
  dividerStyle,
  color,
  weight,
}: {
  nodeKey: NodeKey;
  dividerStyle: DividerStyle;
  color: string;
  weight: DividerWeight;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  useEffect(
    () =>
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const root = editor.getElementByKey(nodeKey);
          const target = event.target as Node | null;
          if (root && target && root.contains(target)) {
            if (!event.shiftKey) clearSelection();
            setSelected(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [clearSelection, editor, nodeKey, setSelected],
  );

  useEffect(() => {
    const el = editor.getElementByKey(nodeKey);
    el?.classList.toggle("editor-divider-selected", isSelected);
  }, [editor, isSelected, nodeKey]);

  return (
    <div className="editor-divider-hit">
      <DividerView uid={nodeKey} dividerStyle={dividerStyle} color={color} weight={weight} />
    </div>
  );
}

export class DividerNode extends DecoratorNode<JSX.Element> {
  __dividerStyle: DividerStyle;
  __color: string;
  __weight: DividerWeight;

  constructor(
    dividerStyle: DividerStyle = "solid",
    color: string = DEFAULT_DIVIDER_COLOR,
    weight: DividerWeight = "medium",
    key?: NodeKey,
  ) {
    super(key);
    this.__dividerStyle = dividerStyle;
    this.__color = color;
    this.__weight = weight;
  }

  static getType(): string {
    return "divider";
  }

  static clone(node: DividerNode): DividerNode {
    return new DividerNode(node.__dividerStyle, node.__color, node.__weight, node.__key);
  }

  static importJSON(json: SerializedDividerNode): DividerNode {
    return $createDividerNode(json.dividerStyle, json.color, json.weight);
  }

  exportJSON(): SerializedDividerNode {
    return {
      type: "divider",
      version: 1,
      dividerStyle: this.__dividerStyle,
      color: this.__color,
      weight: this.__weight,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement("div");
    el.className = "editor-divider";
    el.setAttribute("data-divider", "true");
    return el;
  }

  updateDOM(): false {
    return false;
  }

  getTextContent(): string {
    return "\n";
  }

  isInline(): false {
    return false;
  }

  getDividerStyle() {
    return this.getLatest().__dividerStyle;
  }
  getColor() {
    return this.getLatest().__color;
  }
  getWeight() {
    return this.getLatest().__weight;
  }
  setDividerStyle(v: DividerStyle): this {
    const w = this.getWritable();
    w.__dividerStyle = v;
    return w;
  }
  setColor(v: string): this {
    const w = this.getWritable();
    w.__color = v;
    return w;
  }
  setWeight(v: DividerWeight): this {
    const w = this.getWritable();
    w.__weight = v;
    return w;
  }

  decorate(): JSX.Element {
    return (
      <DividerComponent
        nodeKey={this.__key}
        dividerStyle={this.__dividerStyle}
        color={this.__color}
        weight={this.__weight}
      />
    );
  }
}

export function $createDividerNode(
  dividerStyle: DividerStyle = "solid",
  color: string = DEFAULT_DIVIDER_COLOR,
  weight: DividerWeight = "medium",
): DividerNode {
  return $applyNodeReplacement(new DividerNode(dividerStyle, color, weight));
}

export function $isDividerNode(node: LexicalNode | null | undefined): node is DividerNode {
  return node instanceof DividerNode;
}
