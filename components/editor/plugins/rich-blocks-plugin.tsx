"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListNode } from "@lexical/list";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_BACKSPACE_COMMAND,
  type LexicalNode,
} from "lexical";
import {
  $createCollapsibleContentNode,
  $createCollapsibleTitleNode,
  $isCollapsibleContainerNode,
  $isCollapsibleContentNode,
  $isCollapsibleTitleNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
} from "../nodes/collapsible-nodes";
import {
  $isCalloutNode,
  CALLOUT_VARIANTS,
  type CalloutVariant,
} from "../nodes/callout-node";
import { $getListMarker, markerToCss } from "../list-markers";
import { Info, SquareCheckBig, TriangleAlert } from "lucide-react";

type CalloutMenu = { key: string; top: number; left: number; variant: CalloutVariant };

const QUICK_EMOJIS = ["💡", "📌", "🚨", "🔥", "📝", "🎯", "🤖", "🏁", "❓", "⭐", "🔧", "🧪"];

const VARIANT_ICON = { info: Info, alerta: TriangleAlert, fazer: SquareCheckBig } as const;

function CalloutIcon({ variant }: { variant: CalloutVariant }) {
  const Icon = VARIANT_ICON[variant];
  return <Icon size={18} strokeWidth={2.2} className="editor-callout-swatch-icon" />;
}

/**
 * Comportamento dos blocos "ricos": recolhíveis (seta, Enter, setas do
 * teclado), destaques (troca de tipo/ícone) e marcadores de lista.
 */
function useRichBlocks() {
  const [editor] = useLexicalComposerContext();
  const [calloutMenu, setCalloutMenu] = useState<CalloutMenu | null>(null);
  const [customEmoji, setCustomEmoji] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  /* ---------- recolhíveis: estrutura sempre válida ---------- */
  useEffect(
    () =>
      mergeRegister(
        // Container sem título/conteúdo é consertado; título e conteúdo
        // soltos (colados fora do lugar) viram blocos comuns.
        editor.registerNodeTransform(CollapsibleContainerNode, (node) => {
          const children = node.getChildren();
          let title = children.find($isCollapsibleTitleNode) ?? null;
          let content = children.find($isCollapsibleContentNode) ?? null;
          if (!title && !content) {
            node.remove();
            return;
          }
          if (!title) {
            title = $createCollapsibleTitleNode();
            node.splice(0, 0, [title]);
          }
          if (!content) {
            content = $createCollapsibleContentNode();
            content.append($createParagraphNode());
            node.append(content);
          }
          // Só título + conteúdo, nessa ordem; o resto vai para o conteúdo.
          for (const child of node.getChildren()) {
            if (child.is(title) || child.is(content)) continue;
            if ($isElementNode(child) && ($isCollapsibleTitleNode(child) || $isCollapsibleContentNode(child))) {
              content.append(...child.getChildren());
              child.remove();
            } else {
              content.append(child);
            }
          }
          if (!node.getFirstChild()?.is(title)) node.splice(0, 0, [title]);
          if (!node.getLastChild()?.is(content)) node.append(content);
        }),
        editor.registerNodeTransform(CollapsibleTitleNode, (node) => {
          if (!$isCollapsibleContainerNode(node.getParent())) {
            const p = $createParagraphNode();
            p.append(...node.getChildren());
            node.replace(p);
          }
        }),
        editor.registerNodeTransform(CollapsibleContentNode, (node) => {
          const parent = node.getParent();
          if (!$isCollapsibleContainerNode(parent)) {
            const children = node.getChildren();
            if (children.length === 0) node.remove();
            else {
              let anchor: LexicalNode = node;
              children.forEach((c) => {
                anchor.insertAfter(c);
                anchor = c;
              });
              node.remove();
            }
            return;
          }
          if (node.getChildrenSize() === 0) node.append($createParagraphNode());
        }),
      ),
    [editor],
  );

  /* ---------- recolhíveis: teclado ---------- */
  useEffect(
    () =>
      mergeRegister(
        // Enter numa linha vazia no fim do conteúdo sai do recolhível (Notion).
        editor.registerCommand(
          INSERT_PARAGRAPH_COMMAND,
          () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
            const block = selection.anchor.getNode();
            const paragraph = $isParagraphNode(block) ? block : block.getParent();
            if (!$isParagraphNode(paragraph) || paragraph.getTextContentSize() > 0) return false;
            const content = paragraph.getParent();
            if (!$isCollapsibleContentNode(content) || paragraph.getNextSibling()) return false;
            if (!paragraph.getPreviousSibling()) return false;
            const container = content.getParent();
            if (!$isCollapsibleContainerNode(container)) return false;
            container.insertAfter(paragraph);
            paragraph.select();
            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
        // Backspace no começo de um destaque ou do título de um recolhível
        // desfaz o bloco (o Lexical só faz isso no início do documento).
        editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          (event: KeyboardEvent) => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed() || selection.anchor.offset !== 0) return false;
            const anchor = selection.anchor.getNode();
            let block: LexicalNode | null = anchor;
            while (block && !$isCalloutNode(block) && !$isCollapsibleTitleNode(block)) {
              if (block.getPreviousSibling()) return false; // não está no começo
              block = block.getParent();
              if (block && ($isCollapsibleContentNode(block) || block.getType() === "root")) return false;
            }
            if (!block || !$isElementNode(block)) return false;
            if (!block.collapseAtStart()) return false;
            event.preventDefault();
            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
        // Seta para baixo no último bloco de um recolhível que fecha a página:
        // cria um parágrafo depois, para o cursor nunca ficar preso.
        editor.registerCommand(
          KEY_ARROW_DOWN_COMMAND,
          () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
            let node: LexicalNode | null = selection.anchor.getNode();
            let container: CollapsibleContainerNode | null = null;
            while (node) {
              if ($isCollapsibleContainerNode(node)) container = node;
              node = node.getParent();
            }
            if (!container || container.getNextSibling()) return false;
            const lastText = (container.getOpen() ? container : container.getTitle())?.getLastDescendant();
            const anchor = selection.anchor.getNode();
            if (lastText && anchor.getKey() !== lastText.getKey() && !anchor.is(lastText.getParent())) return false;
            const p = $createParagraphNode();
            container.insertAfter(p);
            p.select();
            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
      ),
    [editor],
  );

  /* ---------- cliques: seta do recolhível e ícone do destaque ---------- */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const chevron = target?.closest<HTMLElement>(".editor-toggle-chevron");
      if (chevron) {
        event.preventDefault();
        const dom = chevron.parentElement;
        if (!dom) return;
        editor.update(() => {
          const node = $getNearestNodeFromDOMNode(dom);
          if ($isCollapsibleContainerNode(node)) {
            node.toggleOpen();
            // Fechou com o cursor lá dentro → leva o cursor para o título.
            const sel = $getSelection();
            if (!node.getOpen() && $isRangeSelection(sel)) {
              const anchor = sel.anchor.getNode();
              const content = node.getContent();
              if (content && (anchor.is(content) || content.isParentOf(anchor))) node.getTitle()?.selectEnd();
            }
          }
        });
        return;
      }
      const icon = target?.closest<HTMLElement>(".editor-callout-icon");
      if (icon && editor.isEditable()) {
        event.preventDefault();
        const dom = icon.parentElement;
        if (!dom) return;
        let info: CalloutMenu | null = null;
        editor.read(() => {
          const node = $getNearestNodeFromDOMNode(dom);
          if ($isCalloutNode(node)) {
            const rect = icon.getBoundingClientRect();
            info = { key: node.getKey(), top: rect.bottom + 6, left: rect.left, variant: node.getVariant() };
          }
        });
        setCustomEmoji("");
        setCalloutMenu(info);
      }
    };
    // mousedown na seta não deve mover o cursor para dentro do bloco.
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".editor-toggle-chevron, .editor-callout-icon")) event.preventDefault();
    };
    return editor.registerRootListener((root, prev) => {
      prev?.removeEventListener("click", onClick);
      prev?.removeEventListener("mousedown", onMouseDown);
      root?.addEventListener("click", onClick);
      root?.addEventListener("mousedown", onMouseDown);
    });
  }, [editor]);

  /* ---------- marcadores de lista personalizados ---------- */
  useEffect(
    () =>
      editor.registerMutationListener(
        ListNode,
        (mutations) => {
          editor.read(() => {
            for (const [key, type] of mutations) {
              if (type === "destroyed") continue;
              const node = $getNodeByKey<ListNode>(key);
              const el = editor.getElementByKey(key);
              if (!node || !el) continue;
              const marker = node.getListType() === "check" ? "" : $getListMarker(node);
              const css = markerToCss(marker);
              el.style.listStyleType = css ?? "";
              if (css) el.dataset.marker = marker;
              else delete el.dataset.marker;
            }
          });
        },
        { skipInitialization: false },
      ),
    [editor],
  );

  /* ---------- popover do destaque ---------- */
  useEffect(() => {
    if (!calloutMenu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setCalloutMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCalloutMenu(null);
    const onScroll = () => setCalloutMenu(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [calloutMenu]);

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!calloutMenu || !el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (calloutMenu.left + w > window.innerWidth - 8) el.style.left = `${Math.max(8, window.innerWidth - w - 8)}px`;
    if (calloutMenu.top + h > window.innerHeight - 8) el.style.top = `${Math.max(8, calloutMenu.top - h - 40)}px`;
  }, [calloutMenu]);

  const updateCallout = (fn: (node: import("../nodes/callout-node").CalloutNode) => void) => {
    if (!calloutMenu) return;
    editor.update(() => {
      const node = $getNodeByKey(calloutMenu.key);
      if ($isCalloutNode(node)) fn(node);
    });
    setCalloutMenu(null);
  };

  return { calloutMenu, customEmoji, setCustomEmoji, menuRef, updateCallout };
}

type RichBlocksState = ReturnType<typeof useRichBlocks>;

function CalloutPopover({ state }: { state: RichBlocksState }) {
  const { calloutMenu, customEmoji, setCustomEmoji, menuRef, updateCallout } = state;
  if (!calloutMenu) return null;
  return createPortal(
    <div
      ref={menuRef}
      role="dialog"
      aria-label="Tipo do destaque"
      className="fixed z-[80] w-64 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl"
      style={{ top: calloutMenu.top, left: calloutMenu.left }}
    >
      <div className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wider text-base-content/45">Tipo</div>
      <div className="grid grid-cols-3 gap-1">
        {CALLOUT_VARIANTS.map((v) => (
          <button
            key={v.value}
            type="button"
            data-variant={v.value}
            className={`editor-callout-swatch flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-xs transition ${
              calloutMenu.variant === v.value ? "ring-2 ring-primary/50" : "hover:brightness-95"
            }`}
            onClick={() => updateCallout((n) => n.setVariant(v.value).setEmoji(null))}
          >
            <CalloutIcon variant={v.value} />
            {v.label}
          </button>
        ))}
      </div>
      <div className="px-1 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-base-content/45">Ou um emoji</div>
      <div className="grid grid-cols-6 gap-0.5">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="flex h-8 items-center justify-center rounded-md text-lg hover:bg-base-200"
            onClick={() => updateCallout((n) => n.setEmoji(emoji))}
          >
            {emoji}
          </button>
        ))}
      </div>
      <form
        className="mt-2 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          const seg = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(customEmoji.trim())][0]?.segment;
          if (seg) updateCallout((n) => n.setEmoji(seg));
        }}
      >
        <input
          className="input input-xs input-bordered flex-1"
          placeholder="Colar outro emoji…"
          value={customEmoji}
          onChange={(e) => setCustomEmoji(e.target.value)}
          aria-label="Emoji personalizado"
        />
        <button type="submit" className="btn btn-xs">OK</button>
      </form>
      <button
        type="button"
        className="mt-1 w-full rounded-md px-2 py-1 text-left text-xs text-base-content/60 hover:bg-base-200"
        onClick={() => updateCallout((n) => n.setEmoji(null))}
      >
        Usar ícone padrão (Lucide)
      </button>
    </div>,
    document.body,
  );
}

export function RichBlocksPlugin() {
  const state = useRichBlocks();
  return <CalloutPopover state={state} />;
}
