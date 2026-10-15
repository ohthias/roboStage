"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import {
  $getSelection,
  $isRangeSelection,
  $selectAll,
  COMMAND_PRIORITY_LOW,
  SELECT_ALL_COMMAND,
} from "lexical";
import { $isBlockFullySelected } from "@lexical/utils";

function SelectBlocksPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        SELECT_ALL_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          const anchorBlock = selection.anchor.getNode().getTopLevelElement();
          const focusBlock = selection.focus.getNode().getTopLevelElement();

          if (
            anchorBlock &&
            focusBlock &&
            anchorBlock.is(focusBlock) &&
            !$isBlockFullySelected(anchorBlock, selection)
          ) {
            anchorBlock.select(0, anchorBlock.getChildrenSize());
            return true;
          }

          $selectAll();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor],
  );

  return null;
}

export function BlockSelectionPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);

  if (!anchorElem) return <SelectBlocksPlugin />;

  return (
    <>
      <SelectBlocksPlugin />
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef}
        targetLineRef={targetLineRef}
        menuComponent={
          <div
            ref={menuRef}
            className="flex cursor-grab items-center gap-1 rounded-md border border-base-300 bg-base-100/95 px-1 py-1 text-xs text-base-content/50 shadow-sm hover:text-base-content active:cursor-grabbing"
            aria-label="Arrastar bloco"
            title="Arrastar bloco"
          >
            <span className="text-base">⋮⋮</span>
            <span>Mover</span>
          </div>
        }
        targetLineComponent={
          <div
            ref={targetLineRef}
            className="pointer-events-none flex h-6 items-center rounded-full border-t-2 border-primary"
          >
            <span className="-mt-5 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-content">
              Soltar aqui
            </span>
          </div>
        }
        isOnMenu={(element) => Boolean(menuRef.current?.contains(element))}
      />
    </>
  );
}

export function getSelectedTopLevelNodes() {
  const selection = $getSelection();
  if (!selection) return [];

  const nodes = selection.getNodes();
  const selected = new Map<string, (typeof nodes)[number]>();
  nodes.forEach((node) => {
    const topLevelNode = node.getTopLevelElement();
    if (topLevelNode) selected.set(topLevelNode.getKey(), topLevelNode);
  });
  return [...selected.values()];
}

export function getSelectedBlockCount() {
  return getSelectedTopLevelNodes().length;
}
