"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $selectAll,
  COMMAND_PRIORITY_LOW,
  SELECT_ALL_COMMAND,
} from "lexical";
import { $isBlockFullySelected } from "@lexical/utils";

function SelectBlocksPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterSelectAll = editor.registerCommand(
      SELECT_ALL_COMMAND,
      () => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          $selectAll();
          return true;
        }

        const anchorBlock = selection.anchor.getNode().getTopLevelElement();

        const focusBlock = selection.focus.getNode().getTopLevelElement();

        // Primeira utilização: seleciona o bloco atual.
        if (
          anchorBlock &&
          focusBlock &&
          anchorBlock.is(focusBlock) &&
          !$isBlockFullySelected(anchorBlock, selection)
        ) {
          anchorBlock.select(0, anchorBlock.getChildrenSize());
          return true;
        }

        // Próxima utilização: seleciona o documento.
        $selectAll();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return unregisterSelectAll;
  }, [editor]);

  return null;
}

export function BlockSelectionPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SelectBlocksPlugin />

      {anchorElem && (
        <DraggableBlockPlugin_EXPERIMENTAL
          anchorElem={anchorElem}
          menuRef={menuRef}
          targetLineRef={targetLineRef}
          menuComponent={
            <div
              ref={menuRef}
              className="
                group flex select-none items-center gap-1
                rounded-md border border-base-300
                bg-base-100/95 px-1.5 py-1
                text-xs text-base-content/50 shadow-sm
                transition-colors hover:bg-base-200
                hover:text-base-content
                active:cursor-grabbing
              "
              aria-label="Arrastar bloco"
              title="Arrastar para mover"
              role="button"
            >
              <span aria-hidden="true" className="text-base leading-none">
                ⠿
              </span>
            </div>
          }
          targetLineComponent={
            <div
              ref={targetLineRef}
              className="pointer-events-none relative h-1 rounded-full bg-primary"
            >
              <span
                className="
                  absolute -top-5 left-0 rounded-md
                  bg-primary px-2 py-0.5
                  text-[10px] font-medium
                  text-primary-content shadow-sm
                "
              >
                Soltar aqui
              </span>
            </div>
          }
          isOnMenu={(element) => Boolean(menuRef.current?.contains(element))}
        />
      )}
    </>
  );
}

/**
 * Retorna os blocos de nível superior que participam
 * da seleção atual, preservando a ordem do documento.
 *
 * Deve ser chamado dentro de editorState.read()
 * ou de editor.update().
 */
export function getSelectedTopLevelNodes() {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return [];
  }

  const selectedKeys = new Set<string>();

  for (const node of selection.getNodes()) {
    const topLevelNode = node.getTopLevelElement();

    if (topLevelNode) {
      selectedKeys.add(topLevelNode.getKey());
    }
  }

  return $getRoot()
    .getChildren()
    .filter((node) => selectedKeys.has(node.getKey()));
}

export function getSelectedBlockCount() {
  return getSelectedTopLevelNodes().length;
}
