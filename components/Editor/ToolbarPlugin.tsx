"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";

import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";

import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";

import { $createCodeNode } from "@lexical/code";

import { $setBlocksType } from "@lexical/selection";

import { useEffect, useState } from "react";

type BlockType = "paragraph" | "h1" | "h2" | "h3";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));

        const anchor = selection.anchor.getNode();
        const parent = anchor.getParent();

        setIsLink($isLinkNode(anchor) || $isLinkNode(parent));

        const element = anchor.getTopLevelElementOrThrow();

        if ($isHeadingNode(element)) {
          setBlockType(element.getTag() as BlockType);
        } else {
          setBlockType("paragraph");
        }
      });
    });
  }, [editor]);

  function applyBlockType(type: BlockType) {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (type === "paragraph") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(type));
      }
    });
  }

  function toggleLink() {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    const url = prompt("Digite a URL");
    if (!url) return;

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  }

  function insertCodeBlock() {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      $setBlocksType(selection, () => $createCodeNode());
    });
  }

  function align(type: "left" | "center" | "right") {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, type);
  }

  function Button({
    label,
    active,
    onClick,
  }: {
    label: string;
    active?: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-2 py-1 rounded text-sm ${
          active ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-300"
        } hover:bg-neutral-700`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 border-b border-neutral-700 p-2 bg-neutral-900">
      <select
        value={blockType}
        onChange={(e) => applyBlockType(e.target.value as BlockType)}
        className="bg-neutral-800 text-white text-sm rounded px-2 py-1"
      >
        <option value="paragraph">Parágrafo</option>
        <option value="h1">Título 1</option>
        <option value="h2">Título 2</option>
        <option value="h3">Título 3</option>
      </select>

      <Button
        label="B"
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      />
      <Button
        label="I"
        active={isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      />
      <Button
        label="U"
        active={isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      />

      <Button label="Link" active={isLink} onClick={toggleLink} />
      <Button label="Code" onClick={insertCodeBlock} />

      <Button
        label="• Lista"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      />
      <Button
        label="1. Lista"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      />
      <Button
        label="Remover Lista"
        onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
      />

      <select
        onChange={(e) => align(e.target.value as "left" | "center" | "right")}
        className="bg-neutral-800 text-white text-sm rounded px-2 py-1"
        defaultValue=""
      >
        <option value="" disabled>
          Alinhar
        </option>
        <option value="left">Esquerda</option>
        <option value="center">Centro</option>
        <option value="right">Direita</option>
      </select>

      <Button
        label="Undo"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      />
      <Button
        label="Redo"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      />
    </div>
  );
}
