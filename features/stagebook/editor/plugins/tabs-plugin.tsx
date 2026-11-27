"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  type ElementNode,
  type LexicalEditor,
} from "lexical";
import {
  $buildTab,
  $createTabNode,
  $isTabNode,
  $isTabsNode,
  $unwrapTabs,
  TabNode,
  TabsNode,
} from "../nodes/tabs-nodes";

/** Esconde os painéis das abas inativas (atributo; o Lexical não desfaz). */
function syncPanels(editor: LexicalEditor, key: string) {
  editor.read(() => {
    const node = $getNodeByKey(key);
    if (!$isTabsNode(node)) return;
    const active = node.getActive();
    node.getChildren().forEach((tab, i) => {
      const panel = editor.getElementByKey(tab.getKey());
      if (!panel) return;
      if (i === active) panel.removeAttribute("data-hidden");
      else panel.setAttribute("data-hidden", "true");
    });
  });
}

type Rename = { key: string; index: number; value: string; rect: DOMRect };

/**
 * Abas: estrutura válida, barra clicável (abrir, renomear, excluir, nova
 * aba, desfazer) e a aba com o cursor sempre visível.
 */
export function TabsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [rename, setRename] = useState<Rename | null>(null);

  /* ---------- estrutura ---------- */
  useEffect(
    () =>
      mergeRegister(
        editor.registerNodeTransform(TabsNode, (node) => {
          for (const child of node.getChildren()) {
            if ($isTabNode(child)) continue;
            const prev = child.getPreviousSibling();
            if ($isTabNode(prev)) prev.append(child);
            else {
              const tab = $createTabNode("Aba");
              child.insertBefore(tab);
              tab.append(child);
            }
          }
          if (node.getChildrenSize() === 0) {
            node.remove();
            return;
          }
          if (!node.getNextSibling()) node.insertAfter($createParagraphNode());
        }),
        editor.registerNodeTransform(TabNode, (node) => {
          if (!$isTabsNode(node.getParent())) {
            node.getChildren().forEach((c) => node.insertBefore(c));
            node.remove();
            return;
          }
          if (node.getChildrenSize() === 0) node.append($createParagraphNode());
        }),
      ),
    [editor],
  );

  /* ---------- barra: redesenha quando as abas mudam ---------- */
  useEffect(() => {
    const pending = new Set<string>();
    let frame: number | null = null;
    const schedule = (key: string) => {
      pending.add(key);
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const keys = [...pending];
        pending.clear();
        keys.forEach((k) => syncPanels(editor, k));
      });
    };
    return mergeRegister(
      editor.registerMutationListener(
        TabsNode,
        (mutations) => {
          for (const [key, type] of mutations) if (type !== "destroyed") schedule(key);
        },
        { skipInitialization: false },
      ),
      editor.registerMutationListener(
        TabNode,
        (_mutations, { prevEditorState }) => {
          editor.read(() => {
            for (const [key] of _mutations) {
              const parent = $getNodeByKey(key)?.getParent();
              if ($isTabsNode(parent)) schedule(parent.getKey());
            }
          });
          prevEditorState.read(() => {
            for (const [key, type] of _mutations) {
              if (type !== "destroyed") continue;
              const parent = $getNodeByKey(key)?.getParent();
              if (parent) schedule(parent.getKey());
            }
          });
        },
        { skipInitialization: false },
      ),
      () => {
        if (frame !== null) cancelAnimationFrame(frame);
      },
    );
  }, [editor]);

  /* ---------- a aba com o cursor fica visível ---------- */
  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState, tags }) => {
        if (tags.has("tabs-reveal")) return;
        const reveal: { key: string; index: number }[] = [];
        editorState.read(() => {
          const sel = $getSelection();
          if (!$isRangeSelection(sel)) return;
          let node = $findMatchingParent(sel.anchor.getNode(), $isTabNode);
          while (node) {
            const parent = node.getParent();
            if ($isTabsNode(parent) && parent.getActive() !== node.getIndexWithinParent()) {
              reveal.push({ key: parent.getKey(), index: node.getIndexWithinParent() });
            }
            node = parent ? $findMatchingParent(parent, $isTabNode) : null;
          }
        });
        if (reveal.length) {
          editor.update(
            () => {
              reveal.forEach(({ key, index }) => {
                const tabs = $getNodeByKey(key);
                if ($isTabsNode(tabs)) tabs.setActive(index);
              });
            },
            { tag: "tabs-reveal" },
          );
        }
      }),
    [editor],
  );

  /* ---------- cliques na barra ---------- */
  useEffect(() => {
    const tabsKeyOf = (el: HTMLElement) => {
      const dom = el.closest<HTMLElement>(".editor-tabs");
      if (!dom) return null;
      let key: string | null = null;
      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(dom);
        if ($isTabsNode(node)) key = node.getKey();
      });
      return key;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".editor-tabs-bar") || target.closest("input")) return;
      event.preventDefault();
      const key = tabsKeyOf(target);
      if (!key) return;
      const close = target.closest<HTMLElement>(".editor-tab-close");
      const btn = target.closest<HTMLElement>(".editor-tab-btn");
      const index = btn ? Number(btn.dataset.index) : -1;

      if (close && editor.isEditable()) {
        let hasContent = false;
        editor.read(() => {
          const tabs = $getNodeByKey(key);
          const tab = $isTabsNode(tabs) ? tabs.getChildAtIndex(index) : null;
          hasContent = !!tab && $isElementNode(tab) && tab.getTextContent().trim().length > 0;
        });
        if (hasContent && !window.confirm("Excluir esta aba e todo o conteúdo dela?")) return;
        editor.update(() => {
          const tabs = $getNodeByKey(key);
          if (!$isTabsNode(tabs)) return;
          tabs.getChildAtIndex(index)?.remove();
          const next = Math.max(0, Math.min(index, tabs.getChildrenSize() - 1));
          tabs.setActive(next);
          tabs.getChildAtIndex<TabNode>(next)?.getFirstChild<ElementNode>()?.selectStart();
        });
        return;
      }
      if (target.closest(".editor-tab-add")) {
        editor.update(() => {
          const tabs = $getNodeByKey(key);
          if (!$isTabsNode(tabs)) return;
          const tab = $buildTab(`Aba ${tabs.getChildrenSize() + 1}`);
          tabs.append(tab);
          tabs.setActive(tabs.getChildrenSize() - 1);
          tab.getFirstChild<ElementNode>()?.selectStart();
        });
        editor.focus();
        return;
      }
      if (target.closest(".editor-tab-unwrap")) {
        editor.update(() => {
          const tabs = $getNodeByKey(key);
          if ($isTabsNode(tabs))
            $unwrapTabs(tabs, (text) => {
              const h = $createHeadingNode("h3");
              h.append($createTextNode(text));
              return h;
            });
        });
        return;
      }
      if (btn) {
        editor.update(() => {
          const tabs = $getNodeByKey(key);
          if (!$isTabsNode(tabs)) return;
          tabs.setActive(index);
          if (editor.isEditable()) tabs.getChildAtIndex<TabNode>(index)?.getFirstChild<ElementNode>()?.selectStart();
        });
      }
    };

    const onDblClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const btn = target?.closest<HTMLElement>(".editor-tab-btn");
      if (!btn || target?.closest(".editor-tab-close") || !editor.isEditable()) return;
      event.preventDefault();
      const key = tabsKeyOf(btn);
      if (key) {
        setRename({
          key,
          index: Number(btn.dataset.index),
          value: btn.querySelector(".editor-tab-label")?.textContent ?? "",
          rect: btn.getBoundingClientRect(),
        });
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".editor-tabs-bar") && !target.closest("input")) event.preventDefault();
    };

    return editor.registerRootListener((root, prev) => {
      prev?.removeEventListener("click", onClick);
      prev?.removeEventListener("dblclick", onDblClick);
      prev?.removeEventListener("mousedown", onMouseDown);
      root?.addEventListener("click", onClick);
      root?.addEventListener("dblclick", onDblClick);
      root?.addEventListener("mousedown", onMouseDown);
    });
  }, [editor]);

  const finishRename = (save: boolean) => {
    if (!rename) return;
    const { key, index, value } = rename;
    setRename(null);
    if (save) {
      editor.update(() => {
        const tabs = $getNodeByKey(key);
        const tab = $isTabsNode(tabs) ? tabs.getChildAtIndex(index) : null;
        if ($isTabNode(tab) && value.trim()) tab.setTitle(value.trim());
      });
    }
    editor.focus();
  };

  // Campo de renomear fica fora do editor (o Lexical apagaria um input lá dentro).
  return rename
    ? createPortal(
        <input
          autoFocus
          className="editor-tab-input fixed z-[80]"
          style={{ top: rename.rect.top + 2, left: rename.rect.left + 4, width: Math.max(120, rename.rect.width), height: rename.rect.height - 4 }}
          value={rename.value}
          maxLength={60}
          aria-label="Nome da aba"
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setRename({ ...rename, value: e.target.value })}
          onBlur={() => finishRename(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              finishRename(true);
            } else if (e.key === "Escape") {
              e.preventDefault();
              finishRename(false);
            }
          }}
        />,
        document.body,
      )
    : null;
}
