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
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_BACKSPACE_COMMAND,
  type ElementNode,
  type LexicalNode,
} from "lexical";
import { ArrowDown, ArrowUp, CircleCheckBig, CircleDashed, CircleDot, ListPlus, Rows3, Trash2, X } from "lucide-react";
import {
  $addTimelineItem,
  $buildTimelineItem,
  $createTimelineItemNode,
  $isTimelineItemNode,
  $isTimelineNode,
  $unwrapTimeline,
  nextTimelineStatus,
  TimelineItemNode,
  TimelineNode,
  type TimelineStatus,
} from "../nodes/timeline-nodes";

type Info = { key: string; itemKey: string | null; status: TimelineStatus | null; rect: DOMRect; index: number; count: number };

const STATUS_BUTTONS: { value: TimelineStatus; label: string; Icon: typeof CircleDot }[] = [
  { value: "pending", label: "Pendente", Icon: CircleDashed },
  { value: "active", label: "Em andamento", Icon: CircleDot },
  { value: "done", label: "Concluída", Icon: CircleCheckBig },
];

/**
 * Linha do tempo: estrutura sempre válida, marcador clicável (status),
 * "Adicionar etapa", Enter/Backspace no estilo de lista e barra de ações.
 */
export function TimelinePlugin() {
  const [editor] = useLexicalComposerContext();
  const [hover, setHover] = useState<{ key: string; itemKey: string | null } | null>(null);
  const [caret, setCaret] = useState<{ key: string; itemKey: string | null } | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- estrutura ---------- */
  useEffect(
    () =>
      mergeRegister(
        editor.registerNodeTransform(TimelineNode, (node) => {
          // Bloco solto dentro da linha do tempo entra na etapa anterior
          // (ou vira uma etapa nova, se for o primeiro).
          for (const child of node.getChildren()) {
            if ($isTimelineItemNode(child)) continue;
            const prev = child.getPreviousSibling();
            if ($isTimelineItemNode(prev)) prev.append(child);
            else {
              const item = $createTimelineItemNode();
              child.insertBefore(item);
              item.append(child);
            }
          }
          if (node.getChildrenSize() === 0) {
            node.remove();
            return;
          }
          if (!node.getNextSibling()) node.insertAfter($createParagraphNode());
        }),
        editor.registerNodeTransform(TimelineItemNode, (node) => {
          if (!$isTimelineNode(node.getParent())) {
            node.getChildren().forEach((c) => node.insertBefore(c));
            node.remove();
            return;
          }
          if (node.getChildrenSize() === 0) node.append($createParagraphNode());
        }),
      ),
    [editor],
  );

  /* ---------- teclado ---------- */
  useEffect(
    () =>
      mergeRegister(
        // Enter numa linha vazia no fim da etapa: cria a próxima etapa.
        // Numa etapa vazia (só a linha vazia), sai da linha do tempo.
        editor.registerCommand(
          INSERT_PARAGRAPH_COMMAND,
          () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
            const node = selection.anchor.getNode();
            const block = $isElementNode(node) && !node.isInline() ? node : node.getParent();
            if (!block || !$isTimelineItemNode(block.getParent())) return false;
            const isBlank = (n: LexicalNode | null) => $isParagraphNode(n) && n.getChildrenSize() === 0;

            // Fim de um bloco com só linhas vazias depois (ex.: título da
            // etapa nova): vai para a linha vazia em vez de criar outra.
            if (!isBlank(block)) {
              const next = block.getNextSibling();
              const atEnd = selection.anchor.offset === (node.is(block) ? block.getChildrenSize() : node.getTextContentSize()) &&
                (node.is(block) || block.getLastDescendant()?.is(node));
              if (!atEnd || !$isParagraphNode(block) || !isBlank(next) || next!.getNextSiblings().some((n) => !isBlank(n))) return false;
              (next as ElementNode).select();
              return true;
            }

            const paragraph = block as ElementNode;
            const item = paragraph.getParent() as TimelineItemNode;
            // Só conta como "fim da etapa" se depois só houver linhas vazias.
            const rest = paragraph.getNextSiblings();
            if (rest.some((n) => !isBlank(n))) return false;
            rest.forEach((n) => n.remove());
            const timeline = item.getParent();
            if (!$isTimelineNode(timeline)) return false;
            if (paragraph.getPreviousSibling()) {
              paragraph.remove();
              // Próxima etapa ainda vazia: só pula para ela.
              const following = item.getNextSibling();
              if ($isTimelineItemNode(following) && following.getChildren().every(isBlank)) {
                following.getFirstChild<ElementNode>()?.select();
                return true;
              }
              const next = $buildTimelineItem("pending", [$createParagraphNode(), $createParagraphNode()]);
              item.insertAfter(next);
              next.getFirstChild<ElementNode>()?.selectStart();
              return true;
            }
            // Etapa vazia → some e o cursor vai para depois da linha do tempo.
            const after = $createParagraphNode();
            if (item.getNextSibling()) {
              // No meio: só tira a etapa vazia.
              const prev = item.getPreviousSibling();
              item.remove();
              if ($isElementNode(prev)) prev.selectEnd();
              return true;
            }
            item.remove();
            timeline.insertAfter(after);
            after.select();
            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
        // Backspace no começo de uma etapa vazia apaga a etapa.
        editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          (event: KeyboardEvent) => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed() || selection.anchor.offset !== 0) return false;
            const node = selection.anchor.getNode();
            const item = $findMatchingParent(node, $isTimelineItemNode);
            if (!item) return false;
            const first = item.getFirstChild();
            const inFirst = first && (first.is(node) || ($isElementNode(first) && first.isParentOf(node)));
            if (!inFirst) return false;
            // Só apaga a etapa se ela estiver toda vazia (só linhas em branco).
            if (!item.getChildren().every((c) => $isParagraphNode(c) && c.getChildrenSize() === 0)) return false;
            const timeline = item.getParent();
            const prev = item.getPreviousSibling();
            event.preventDefault();
            if ($isTimelineItemNode(prev)) {
              item.remove();
              prev.selectEnd();
            } else if ($isTimelineNode(timeline) && timeline.getChildrenSize() > 1) {
              const next = item.getNextSibling();
              item.remove();
              if ($isElementNode(next)) next.selectStart();
            } else if ($isTimelineNode(timeline)) {
              const p = $createParagraphNode();
              timeline.replace(p);
              p.select();
            }
            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
      ),
    [editor],
  );

  /* ---------- cliques: marcador e "Adicionar etapa" ---------- */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const marker = target?.closest<HTMLElement>(".editor-timeline-marker");
      const add = target?.closest<HTMLElement>(".editor-timeline-add");
      if (!marker && !add) return;
      event.preventDefault();
      if (!editor.isEditable()) return;
      const dom = (marker ?? add)!.parentElement;
      if (!dom) return;
      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(dom);
        if (marker && $isTimelineItemNode(node)) node.setStatus(nextTimelineStatus(node.getStatus()));
        if (add && $isTimelineNode(node)) $addTimelineItem(node);
      });
      if (add) editor.focus();
    };
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".editor-timeline-marker, .editor-timeline-add")) event.preventDefault();
    };
    return editor.registerRootListener((root, prev) => {
      prev?.removeEventListener("click", onClick);
      prev?.removeEventListener("mousedown", onMouseDown);
      root?.addEventListener("click", onClick);
      root?.addEventListener("mousedown", onMouseDown);
    });
  }, [editor]);

  /* ---------- qual linha do tempo / etapa mostra a barra ---------- */
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    const onMove = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const el = t.closest<HTMLElement>("[data-timeline]");
      if (el && root.contains(el)) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        const itemEl = t.closest<HTMLElement>(".editor-timeline-item");
        let next: { key: string; itemKey: string | null } | null = null;
        editor.read(() => {
          const key = $getNearestNodeFromDOMNode(el)?.getKey();
          const itemKey = itemEl ? ($getNearestNodeFromDOMNode(itemEl)?.getKey() ?? null) : null;
          if (key) next = { key, itemKey };
        });
        setHover((prev) => (prev?.key === next?.key && prev?.itemKey === next?.itemKey ? prev : next));
      } else if (!t.closest("[data-timeline-bar]")) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHover(null), 250);
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
          let next: { key: string; itemKey: string | null } | null = null;
          if ($isRangeSelection(sel)) {
            const item = $findMatchingParent(sel.anchor.getNode(), $isTimelineItemNode);
            const timeline = item?.getParent();
            if (item && $isTimelineNode(timeline)) next = { key: timeline.getKey(), itemKey: item.getKey() };
          }
          setCaret((prev) => (prev?.key === next?.key && prev?.itemKey === next?.itemKey ? prev : next));
          // Cursor foi para fora: some a barra que ficou do mouse.
          if (!next && $isRangeSelection(sel)) setHover(null);
        });
      }),
    [editor],
  );

  // O cursor manda na etapa; o mouse só decide a linha do tempo.
  const active = caret && (!hover || hover.key === caret.key) ? caret : hover;

  const measure = useCallback(() => {
    if (!active) return setInfo(null);
    const el = editor.getElementByKey(active.key);
    if (!el) return setInfo(null);
    let next: Info | null = null;
    editor.read(() => {
      const timeline = $getNodeByKey(active.key);
      if (!$isTimelineNode(timeline)) return;
      const items = timeline.getChildren().filter($isTimelineItemNode);
      const item = active.itemKey ? $getNodeByKey(active.itemKey) : null;
      const current = $isTimelineItemNode(item) ? item : null;
      next = {
        key: active.key,
        itemKey: current?.getKey() ?? null,
        status: current?.getStatus() ?? null,
        rect: el.getBoundingClientRect(),
        index: current ? items.findIndex((i) => i.is(current)) : -1,
        count: items.length,
      };
    });
    setInfo(next);
  }, [editor, active]);

  useEffect(() => {
    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };
    schedule();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const unregister = editor.registerUpdateListener(schedule);
    return () => {
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
      unregister();
    };
  }, [editor, measure]);

  if (!info || typeof document === "undefined") return null;
  if (info.rect.bottom < 0 || info.rect.top > window.innerHeight) return null;

  const withItem = (fn: (item: TimelineItemNode, timeline: TimelineNode) => void) =>
    editor.update(() => {
      const timeline = $getNodeByKey(info.key);
      const item = info.itemKey ? $getNodeByKey(info.itemKey) : null;
      if ($isTimelineNode(timeline) && $isTimelineItemNode(item)) fn(item, timeline);
    });
  const withTimeline = (fn: (timeline: TimelineNode) => void) =>
    editor.update(() => {
      const timeline = $getNodeByKey(info.key);
      if ($isTimelineNode(timeline)) fn(timeline);
    });

  const move = (dir: "up" | "down") =>
    withItem((item) => {
      const sibling: LexicalNode | null = dir === "up" ? item.getPreviousSibling() : item.getNextSibling();
      if (!$isTimelineItemNode(sibling)) return;
      if (dir === "up") sibling.insertBefore(item);
      else sibling.insertAfter(item);
    });

  const top = info.rect.top - 40 < 8 ? info.rect.top + 6 : info.rect.top - 40;
  const btn = (on = false) =>
    `btn btn-ghost btn-xs h-8 min-h-8 gap-1 px-2 font-normal ${on ? "bg-primary/15 text-primary" : ""}`;
  const square = "btn btn-ghost btn-xs btn-square h-8 min-h-8 w-8";

  return createPortal(
    <div
      data-timeline-bar
      role="toolbar"
      aria-label="Linha do tempo"
      className="no-print fixed z-[55] flex max-w-[calc(100vw-16px)] flex-wrap items-center gap-0.5 rounded-xl border border-base-300 bg-base-100 p-1 shadow-lg"
      style={{ top, left: Math.max(8, info.rect.left) }}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => hideTimer.current && clearTimeout(hideTimer.current)}
      onMouseLeave={() => setHover(null)}
    >
      <button
        type="button"
        className={btn()}
        title="Adicionar etapa"
        onClick={() =>
          info.itemKey ? withItem((item, t) => $addTimelineItem(t, item)) : withTimeline((t) => $addTimelineItem(t))
        }
      >
        <ListPlus size={15} /> Etapa
      </button>
      {info.itemKey && (
        <>
          <span className="mx-1 h-5 w-px bg-base-300" />
          <span className="px-1 text-[11px] text-base-content/50">
            Etapa {info.index + 1} de {info.count}
          </span>
          {STATUS_BUTTONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={btn(info.status === value)}
              aria-pressed={info.status === value}
              title={label}
              onClick={() => withItem((item) => item.setStatus(value))}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-base-300" />
          <button type="button" className={square} title="Mover etapa para cima" aria-label="Mover etapa para cima" disabled={info.index <= 0} onClick={() => move("up")}>
            <ArrowUp size={15} />
          </button>
          <button type="button" className={square} title="Mover etapa para baixo" aria-label="Mover etapa para baixo" disabled={info.index >= info.count - 1} onClick={() => move("down")}>
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            className={square}
            title="Remover etapa"
            aria-label="Remover etapa"
            onClick={() =>
              withItem((item, t) => {
                const near = item.getPreviousSibling() ?? item.getNextSibling();
                if (t.getChildrenSize() <= 1) {
                  const p = $createParagraphNode();
                  t.replace(p);
                  p.select();
                  return;
                }
                item.remove();
                if ($isElementNode(near)) near.selectEnd();
              })
            }
          >
            <X size={15} />
          </button>
        </>
      )}
      <span className="mx-1 h-5 w-px bg-base-300" />
      <button type="button" className={btn()} title="Desfazer linha do tempo (mantém o texto)" onClick={() => withTimeline($unwrapTimeline)}>
        <Rows3 size={15} /> Desfazer
      </button>
      <button
        type="button"
        className={`${square} text-error hover:bg-error/10`}
        title="Excluir linha do tempo"
        aria-label="Excluir linha do tempo"
        onClick={() => withTimeline((t) => t.remove())}
      >
        <Trash2 size={15} />
      </button>
    </div>,
    document.body,
  );
}
