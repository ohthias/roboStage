"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode, CodeNode } from "@lexical/code";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $nodesOfType,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
} from "lexical";
import { Check, Copy, CornerDownLeft } from "lucide-react";
import {
  CODE_LANGUAGES,
  normalizeLanguage,
  tokenize,
  type TokenType,
} from "../code-highlight";

type Overlay = { key: string; rect: DOMRect; language: string };

const TOKEN_TYPES: TokenType[] = [
  "comment",
  "string",
  "number",
  "keyword",
  "function",
  "type",
  "property",
  "tag",
  "operator",
];

type HighlightCtor = new (...ranges: Range[]) => unknown;
type HighlightRegistry = Map<string, unknown>;

function getRegistry(): {
  registry: HighlightRegistry;
  Highlight: HighlightCtor;
} | null {
  if (typeof window === "undefined") return null;
  const css = (
    window as unknown as { CSS?: { highlights?: HighlightRegistry } }
  ).CSS;
  const Highlight = (window as unknown as { Highlight?: HighlightCtor })
    .Highlight;
  if (!css?.highlights || !Highlight) return null;
  return { registry: css.highlights, Highlight };
}

/** Lê o texto visível do bloco (quebras <br> viram "\n") mapeando offsets → nós. */
function readCodeDom(el: HTMLElement) {
  const segs: { node: Text; from: number }[] = [];
  let text = "";
  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) {
      segs.push({ node: n as Text, from: text.length });
      text += (n as Text).data;
    } else if ((n as HTMLElement).tagName === "BR") {
      text += "\n";
    }
  }
  const locate = (index: number, preferEnd: boolean) => {
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i];
      const len = s.node.data.length;
      if (index > s.from + len) continue;
      if (index < s.from) continue;
      if (index === s.from + len && !preferEnd && i < segs.length - 1) continue;
      return { node: s.node, offset: index - s.from };
    }
    return null;
  };
  return { text, locate };
}

export function CodeToolsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [caretKey, setCaretKey] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [copied, setCopied] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef(0);

  /* ---------- realce de sintaxe + números de linha ---------- */
  const paint = useCallback(() => {
    const api = getRegistry();
    const buckets = new Map<TokenType, Range[]>(
      TOKEN_TYPES.map((t) => [t, []]),
    );

    editor.getEditorState().read(() => {
      for (const node of $nodesOfType(CodeNode)) {
        const el = editor.getElementByKey(node.getKey());
        if (!el) continue;
        const { text, locate } = readCodeDom(el);

        const lines = text.split("\n").length;
        const gutter = Array.from({ length: lines }, (_, i) => i + 1).join(
          "\n",
        );
        if (el.getAttribute("data-gutter") !== gutter)
          el.setAttribute("data-gutter", gutter);

        if (!api) continue;
        for (const tok of tokenize(text, node.getLanguage() ?? "plain")) {
          const a = locate(tok.start, false);
          const b = locate(tok.end, true);
          if (!a || !b) continue;
          try {
            const r = new Range();
            r.setStart(a.node, a.offset);
            r.setEnd(b.node, b.offset);
            buckets.get(tok.type)!.push(r);
          } catch {
            /* ignora intervalos inválidos */
          }
        }
      }
    });

    if (!api) return;
    for (const type of TOKEN_TYPES) {
      const ranges = buckets.get(type)!;
      if (ranges.length)
        api.registry.set(`code-${type}`, new api.Highlight(...ranges));
      else api.registry.delete(`code-${type}`);
    }
  }, [editor]);

  useEffect(() => {
    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(paint);
    };
    schedule();
    return mergeRegister(editor.registerUpdateListener(schedule), () => {
      cancelAnimationFrame(rafRef.current);
      const api = getRegistry();
      TOKEN_TYPES.forEach((t) => api?.registry.delete(`code-${t}`));
    });
  }, [editor, paint]);

  /* ---------- qual bloco mostra o cabeçalho ---------- */
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    const keyFromEl = (el: HTMLElement) => {
      let key: string | null = null;
      editor.read(() => {
        key = $getNearestNodeFromDOMNode(el)?.getKey() ?? null;
      });
      return key;
    };
    const onMove = (e: MouseEvent) => {
      const code = (e.target as HTMLElement).closest<HTMLElement>(
        ".editor-code",
      );
      if (code && root.contains(code)) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setHoverKey(keyFromEl(code));
      } else if (!(e.target as HTMLElement).closest("[data-code-overlay]")) {
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
            const code = $findMatchingParent(sel.anchor.getNode(), $isCodeNode);
            setCaretKey(code ? code.getKey() : null);
          } else {
            setCaretKey(null);
          }
        });
      }),
    [editor],
  );

  const activeKey = hoverKey ?? caretKey;

  const measure = useCallback(() => {
    if (!activeKey) return setOverlay(null);
    const el = editor.getElementByKey(activeKey);
    if (!el) return setOverlay(null);
    let language = "plain";
    editor.read(() => {
      const n = $getNodeByKey(activeKey);
      if (n && $isCodeNode(n)) language = normalizeLanguage(n.getLanguage());
    });
    setOverlay({ key: activeKey, rect: el.getBoundingClientRect(), language });
  }, [editor, activeKey]);

  useEffect(() => {
    measure();

    let frameId: number | null = null;

    const on = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        frameId = null;
        measure();
      });
    };

    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);

    const unregister = editor.registerUpdateListener(on);

    return () => {
      window.removeEventListener("scroll", on, true);
      window.removeEventListener("resize", on);

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      if (typeof unregister === "function") {
        unregister();
      }
    };
  }, [editor, measure]);

  /* ---------- Ctrl/Cmd + Enter sai do bloco de código ---------- */
  useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (e: KeyboardEvent | null) => {
          if (!e || !(e.metaKey || e.ctrlKey)) return false;
          const sel = $getSelection();
          if (!$isRangeSelection(sel)) return false;
          const code = $findMatchingParent(sel.anchor.getNode(), $isCodeNode);
          if (!code) return false;
          e.preventDefault();
          const next = code.getNextSibling();
          if (next && next.getType() === "paragraph") next.selectStart();
          else {
            const p = $createParagraphNode();
            code.insertAfter(p);
            p.select();
          }
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    [editor],
  );

  const setLanguage = (language: string) => {
    if (!overlay) return;
    editor.update(() => {
      const n = $getNodeByKey(overlay.key);
      if (n && $isCodeNode(n))
        n.setLanguage(language === "plain" ? "" : language);
    });
    editor.focus();
  };

  const copy = () => {
    if (!overlay) return;
    const text = editor.read(
      () => $getNodeByKey(overlay.key)?.getTextContent() ?? "",
    );
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (!overlay || typeof document === "undefined") return null;
  const { rect } = overlay;
  if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
  const top = Math.max(8, Math.min(rect.top + 8, rect.bottom - 40));

  return createPortal(
    <div
      data-code-overlay
      className="fixed z-[55] flex items-center gap-1 rounded-lg border border-white/10 bg-[#161b22]/95 p-1 text-[#c9d1d9] shadow-lg backdrop-blur"
      style={{ top, right: Math.max(8, window.innerWidth - rect.right + 8) }}
      onMouseEnter={() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setHoverKey(overlay.key);
      }}
      onMouseLeave={() => setHoverKey(null)}
    >
      <select
        aria-label="Linguagem do código"
        value={
          CODE_LANGUAGES.some((l) => l.value === overlay.language)
            ? overlay.language
            : "plain"
        }
        onChange={(e) => setLanguage(e.target.value)}
        className="h-7 cursor-pointer rounded-md border-0 bg-transparent px-2 text-xs text-[#c9d1d9] outline-none hover:bg-white/10 focus:bg-white/10"
      >
        {CODE_LANGUAGES.map((l) => (
          <option
            key={l.value}
            value={l.value}
            className="bg-[#161b22] text-[#c9d1d9]"
          >
            {l.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={copy}
        title="Copiar código"
        aria-label="Copiar código"
        className="flex h-7 items-center gap-1 rounded-md px-2 text-xs hover:bg-white/10"
      >
        {copied ? (
          <Check size={13} className="text-green-400" />
        ) : (
          <Copy size={13} />
        )}
        {copied ? "Copiado" : "Copiar"}
      </button>
      <span
        title="Ctrl/Cmd + Enter para sair do bloco de código"
        className="flex h-7 items-center gap-1 px-1.5 text-[11px] text-[#8b949e]"
      >
        <CornerDownLeft size={11} /> Ctrl+Enter
      </span>
    </div>,
    document.body,
  );
}
