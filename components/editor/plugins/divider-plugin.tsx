"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createDividerNode } from "../nodes/divider-node";

/**
 * Converte qualquer HorizontalRuleNode (comando "/divisor", markdown `---` e
 * documentos antigos) no DividerNode personalizável.
 */
export function DividerPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(
    () =>
      editor.registerNodeTransform(HorizontalRuleNode, (node) => {
        node.replace($createDividerNode());
      }),
    [editor],
  );
  return null;
}
