import { DecoratorNode, NodeKey, SerializedLexicalNode, LexicalNode, $applyNodeReplacement } from "lexical";
import { ReactNode } from "react";
import ImageComponent from "./ImageComponent";

export type ImageAlignment = 'left' | 'center' | 'right';

export interface SerializedImageNode extends SerializedLexicalNode {
  src: string;
  altText: string;
  width?: number | "inherit";
  height?: number | "inherit";
  alignment?: ImageAlignment;
  type: "image";
  version: 1;
}

export class ImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __altText: string;
  __width: "inherit" | number;
  __height: "inherit" | number;
  __alignment: ImageAlignment;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__alignment,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { width, height, src, altText, alignment } = serializedNode;
    const node = $createImageNode({
      src,
      altText,
      width,
      height,
      alignment,
    });
    return node;
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      alignment: this.__alignment,
      type: "image",
      version: 1,
    };
  }

  constructor(
    src: string,
    altText: string,
    width?: "inherit" | number,
    height?: "inherit" | number,
    alignment?: ImageAlignment,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__alignment = alignment || "center";
  }

  updateDOM(): false {
    return false;
  }

  setWidthAndHeight(width: number | "inherit", height: number | "inherit"): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
  
  setAlignment(alignment: ImageAlignment): void {
      const writable = this.getWritable();
      writable.__alignment = alignment;
  }

  decorate(): ReactNode {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        nodeKey={this.getKey()}
        width={this.__width}
        height={this.__height}
        alignment={this.__alignment}
      />
    );
  }
}

export function $createImageNode({
  src,
  altText,
  width,
  height,
  alignment,
}: {
  src: string;
  altText: string;
  width?: number | "inherit";
  height?: number | "inherit";
  alignment?: ImageAlignment;
}): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, height, alignment));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}