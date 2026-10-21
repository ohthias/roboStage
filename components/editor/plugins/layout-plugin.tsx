"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { Columns2, Columns3, Rows3, Trash2 } from "lucide-react";
import {
  $isLayoutContainerNode,
  $isLayoutItemNode,
  $setLayoutColumns,
  $unwrapLayout,
  LAYOUT_PRESETS,
  LayoutContainerNode,
  LayoutItemNode,
  equalColumns,
} from "../nodes/layout-nodes";

type Info = { key: string; rect: DOMRect; template: string; columns: 2 | 3 };

/** Mini ícone que mostra a proporção das colunas. */
function Ratio({ value }: { value: string }) {
  const parts = value.split(" ").map((p) => parseFloat(p));
  const total = parts.reduce((a, b) => a + b, 0);
  return (
    <span className="flex h-3.5 w-8 gap-0.5">
      {parts.map((p, i) => (
        <span
          key={i}
          className="rounded-[2px] bg-current opacity-60"
          style={{ width: `${(p / total) * 100}%` }}
        />
      ))}
    </span>
  );
}

export function LayoutPlugin() {
  const [editor] = useLexicalComposerContext();
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [caretKey, setCaretKey] = useState<string | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- normalização da estrutura ---------- */
  useEffect(
    () =>
      mergeRegister(
        // Coluna solta (sem container) vira blocos normais.
        editor.registerNodeTransform(LayoutItemNode, (node) => {
          if (!$isLayoutContainerNode(node.getParent())) {
            node.getChildren().forEach((c) => node.insertBefore(c));
            node.remove();
          }
        }),
        editor.registerNodeTransform(LayoutContainerNode, (node) => {
          const items = node.getChildren().filter($isLayoutItemNode);
          // Itens inválidos dentro do container são descartados.
          node.getChildren().forEach((c) => {
            if (!$isLayoutItemNode(c)) c.remove();
          });
          if (items.length === 0) {
            node.remove();
            return;
          }
          // Se só restou uma coluna, a seção deixa de existir.
          if (items.length === 1) {
            $unwrapLayout(node);
            return;
          }
          if (node.getTemplateColumns().split(" ").length !== items.length) {
            node.setTemplateColumns(equalColumns(items.length));
          }
          // Garante um parágrafo depois da seção para o cursor poder sair.
          if (!node.getNextSibling()) node.insertAfter($createParagraphNode());
        }),
      ),
    [editor],
  );

  /* ---------- qual seção mostra a barra ---------- */
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    const onMove = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const el = t.closest<HTMLElement>("[data-layout-container]");
      if (el && root.contains(el)) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        let key: string | null = null;
        editor.read(() => {
          key = $getNearestNodeFromDOMNode(el)?.getKey() ?? null;
        });
        setHoverKey(key);
      } else if (!t.closest("[data-layout-bar]")) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHoverKey(null), 250);
      }
    };
    root.addEventListener("mousemove", onMove);
    return () => {
      root.removeEventListener("mousemove", onMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [editor]);

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const sel = $getSelection();
          if ($isRangeSelection(sel)) {
            const c = $findMatchingParent(sel.anchor.getNode(), $isLayoutContainerNode);
            setCaretKey(c ? c.getKey() : null);
          } else setCaretKey(null);
        });
      }),
    [editor],
  );

  const activeKey = hoverKey ?? caretKey;

  const measure = useCallback(() => {
    if (!activeKey) return setInfo(null);
    const el = editor.getElementByKey(activeKey);
    if (!el) return setInfo(null);
    let template = "";
    let columns: 2 | 3 = 2;
    editor.read(() => {
      const n = $getNodeByKey(activeKey);
      if (n && $isLayoutContainerNode(n)) {
        template = n.getTemplateColumns();
        columns = n.getChildrenSize() >= 3 ? 3 : 2;
      }
    });
    if (!template) return setInfo(null);
    setInfo({ key: activeKey, rect: el.getBoundingClientRect(), template, columns });
  }, [editor, activeKey]);

  useEffect(() => {
    measure();
    const on = () => requestAnimationFrame(measure);
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    const off = editor.registerUpdateListener(on);
    return () => {
      window.removeEventListener("scroll", on, true);
      window.removeEventListener("resize", on);
      off();
    };
  }, [editor, measure]);

  if (!info || typeof document === "undefined") return null;
  if (info.rect.bottom < 0 || info.rect.top > window.innerHeight) return null;

  const act = (fn: (c: LayoutContainerNode) => void) =>
    editor.update(() => {
      const n = $getNodeByKey(info.key);
      if ($isLayoutContainerNode(n)) fn(n);
    });

  const top = info.rect.top - 40 < 8 ? info.rect.top + 6 : info.rect.top - 40;
  const btn = (active: boolean) =>
    `btn btn-ghost btn-xs h-8 min-h-8 gap-1 px-2 font-normal ${active ? "bg-primary/15 text-primary" : ""}`;

  return createPortal(
    <div
      data-layout-bar
      role="toolbar"
      aria-label="Seção de colunas"
      className="fixed z-[55] flex items-center gap-0.5 rounded-xl border border-base-300 bg-base-100 p-1 shadow-lg"
      style={{ top, left: Math.max(8, info.rect.left) }}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setHoverKey(info.key);
      }}
      onMouseLeave={() => setHoverKey(null)}
    >
      <button type="button" className={btn(info.columns === 2)} onClick={() => act((c) => $setLayoutColumns(c, 2))}>
        <Columns2 size={15} /> 2 colunas
      </button>
      <button type="button" className={btn(info.columns === 3)} onClick={() => act((c) => $setLayoutColumns(c, 3))}>
        <Columns3 size={15} /> 3 colunas
      </button>
      <span className="mx-1 h-5 w-px bg-base-300" />
      {LAYOUT_PRESETS[info.columns].map((p) => (
        <button
          key={p.value}
          type="button"
          title={`Proporção ${p.label}`}
          aria-label={`Proporção ${p.label}`}
          aria-pressed={info.template === p.value}
          className={btn(info.template === p.value)}
          onClick={() => act((c) => c.setTemplateColumns(p.value))}
        >
          <Ratio value={p.value} />
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-base-300" />
      <button type="button" className={btn(false)} title="Desfazer colunas" onClick={() => act($unwrapLayout)}>
        <Rows3 size={15} /> Desfazer
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square h-8 min-h-8 w-8 text-error hover:bg-error/10"
        title="Excluir seção"
        aria-label="Excluir seção"
        onClick={() => act((c) => c.remove())}
      >
        <Trash2 size={15} />
      </button>
    </div>,
    document.body,
  );
}
