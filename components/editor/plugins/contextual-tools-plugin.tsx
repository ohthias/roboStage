"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isCodeNode } from "@lexical/code";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableSelection,
} from "@lexical/table";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { $isHorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type TextFormatType,
} from "lexical";
import {
  Bold,
  Check,
  ChevronDown,
  Code,
  Copy,
  Italic,
  Link2,
  Link2Off,
  Strikethrough,
  Trash2,
  Underline,
  X,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";
import {
  $deleteBlock,
  $getBlockType,
  $getTopLevelBlock,
  $transformBlock,
  BLOCK_LABELS,
  type BlockType,
} from "../block-utils";

type Kind = "text" | "code" | "table" | "node";

type ToolbarState = {
  kind: Kind;
  rect: { top: number; left: number; width: number; height: number };
  blockType: BlockType | null;
  blockKey: string | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  code: boolean;
  link: boolean;
  linkUrl: string;
};

const TURN_INTO: BlockType[] = [
  "paragraph",
  "h1",
  "h2",
  "h3",
  "bullet",
  "number",
  "check",
  "quote",
  "code",
];

function rectOf(r: DOMRect) {
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function ToolButton({
  label,
  active,
  danger,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`btn btn-ghost btn-xs btn-square h-8 min-h-8 w-8 ${
        active ? "bg-primary/15 text-primary" : ""
      } ${danger ? "text-error hover:bg-error/10" : ""}`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-base-300" />;

export function ContextualToolsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<ToolbarState | null>(null);
  const [pointerDown, setPointerDown] = useState(false);
  const [linkInput, setLinkInput] = useState<string | null>(null);
  const [showTurnInto, setShowTurnInto] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const linkLocked = useRef(false);
  linkLocked.current = linkInput !== null;

  const compute = useCallback(() => {
    if (linkLocked.current) return;
    const root = editor.getRootElement();
    const domSel = window.getSelection();

    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if (!root || !editor.isEditable()) return setState(null);

      // Hr / outros nós selecionados como objeto
      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length === 1 && $isHorizontalRuleNode(nodes[0])) {
          const el = editor.getElementByKey(nodes[0].getKey());
          if (el) {
            return setState({
              kind: "node",
              rect: rectOf(el.getBoundingClientRect()),
              blockType: null,
              blockKey: nodes[0].getKey(),
              bold: false,
              italic: false,
              underline: false,
              strikethrough: false,
              code: false,
              link: false,
              linkUrl: "",
            });
          }
        }
        return setState(null);
      }

      // Várias células de tabela selecionadas
      if ($isTableSelection(selection)) {
        const cellEl = editor.getElementByKey(selection.anchor.key);
        const table = cellEl?.closest("table");
        if (cellEl) {
          const r = table
            ? (() => {
                const c = cellEl.getBoundingClientRect();
                const t = table.getBoundingClientRect();
                return new DOMRect(c.left, t.top, c.width, c.height);
              })()
            : cellEl.getBoundingClientRect();
          return setState({
            kind: "table",
            rect: rectOf(r),
            blockType: null,
            blockKey: null,
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            code: false,
            link: false,
            linkUrl: "",
          });
        }
        return setState(null);
      }

      if (
        !$isRangeSelection(selection) ||
        selection.isCollapsed() ||
        selection.getTextContent() === "" ||
        !domSel ||
        domSel.rangeCount === 0 ||
        !root.contains(domSel.anchorNode)
      ) {
        return setState(null);
      }

      const anchorNode = selection.anchor.getNode();
      const top = $getTopLevelBlock(anchorNode);
      const inCode =
        !!$findMatchingParent(anchorNode, $isCodeNode) ||
        (top ? $isCodeNode(top) : false);

      const linkNode = $findMatchingParent(
        selection.focus.getNode(),
        $isLinkNode,
      );
      const rect = domSel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return setState(null);

      setState({
        kind: inCode ? "code" : "text",
        rect: rectOf(rect),
        blockType: top ? $getBlockType(top) : null,
        blockKey: top ? top.getKey() : null,
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
        code: selection.hasFormat("code"),
        link: !!linkNode,
        linkUrl: linkNode ? linkNode.getURL() : "",
      });
    });
  }, [editor]);

  // Mantém o estado sincronizado com o editor / seleção.
  useEffect(() => {
    const onSelection = () => requestAnimationFrame(compute);
    document.addEventListener("selectionchange", onSelection);
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return mergeRegister(
      () => {
        document.removeEventListener("selectionchange", onSelection);
        window.removeEventListener("scroll", compute, true);
        window.removeEventListener("resize", compute);
      },
      editor.registerUpdateListener(() => compute()),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          compute();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      // Ctrl/Cmd + K abre o campo de link
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
            const hasSelection = editor.read(() => {
              const s = $getSelection();
              return $isRangeSelection(s) && !s.isCollapsed();
            });
            if (!hasSelection) return false;
            e.preventDefault();
            compute();
            setLinkInput((prev) => prev ?? "https://");
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, compute]);

  // Esconde a barra enquanto o mouse seleciona texto.
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    const down = () => setPointerDown(true);
    const up = () => {
      setPointerDown(false);
      requestAnimationFrame(compute);
    };
    root.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    return () => {
      root.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
    };
  }, [editor, compute]);

  // Fecha submenus quando a seleção some.
  useEffect(() => {
    if (!state) {
      setLinkInput(null);
      setShowTurnInto(false);
    }
  }, [state]);

  // Posiciona acima da seleção (ou abaixo se não houver espaço).
  useLayoutEffect(() => {
    if (!state || !ref.current) return setPos(null);
    const el = ref.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const gap = 8;
    let top = state.rect.top - h - gap;
    if (top < gap) top = state.rect.top + state.rect.height + gap;
    let left = state.rect.left + state.rect.width / 2 - w / 2;
    left = Math.max(gap, Math.min(left, window.innerWidth - w - gap));
    setPos({ top, left });
  }, [state, linkInput, showTurnInto]);

  const format = (type: TextFormatType) =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);

  const turnInto = (type: BlockType) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const keys = new Set<string>();
      selection.getNodes().forEach((n) => {
        const t = $getTopLevelBlock(n);
        if (t) keys.add(t.getKey());
      });
      keys.forEach((key) => $transformBlock(key, type));
    });
    setShowTurnInto(false);
  };

  const applyLink = () => {
    const url = (linkInput ?? "").trim();
    linkLocked.current = false;
    setLinkInput(null);
    if (url && url !== "https://") {
      const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(url)
        ? url
        : `https://${url}`;
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, safe);
    }
    editor.focus();
  };

  const tableAction = (fn: () => void) => {
    editor.update(fn);
  };

  if (!state || pointerDown || typeof document === "undefined") return null;

  const current = state.blockType ? BLOCK_LABELS[state.blockType] : "Texto";

  return createPortal(
    <div
      ref={ref}
      role="toolbar"
      aria-label="Ferramentas de formatação"
      className="fixed z-[60] flex items-center rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        visibility: pos ? "visible" : "hidden",
      }}
      // Evita perder a seleção do editor ao clicar nos botões.
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).tagName !== "INPUT") e.preventDefault();
      }}
    >
      {linkInput !== null ? (
        <div className="flex items-center gap-1 px-1">
          <input
            autoFocus
            className="input input-sm input-bordered w-64"
            placeholder="Cole ou digite um link"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              } else if (e.key === "Escape") {
                e.preventDefault();
                linkLocked.current = false;
                setLinkInput(null);
                editor.focus();
              }
            }}
          />
          <ToolButton label="Aplicar link" onClick={applyLink}>
            <Check size={15} />
          </ToolButton>
          <ToolButton
            label="Cancelar"
            onClick={() => {
              linkLocked.current = false;
              setLinkInput(null);
              editor.focus();
            }}
          >
            <X size={15} />
          </ToolButton>
        </div>
      ) : state.kind === "node" ? (
        <ToolButton
          label="Remover divisor"
          danger
          onClick={() =>
            editor.update(() => {
              if (state.blockKey) $deleteBlock(state.blockKey);
            })
          }
        >
          <Trash2 size={15} />
        </ToolButton>
      ) : state.kind === "table" ? (
        <>
          <ToolButton
            label="Inserir linha acima"
            onClick={() =>
              tableAction(() => void $insertTableRowAtSelection(false))
            }
          >
            <ArrowUpToLine size={15} />
          </ToolButton>
          <ToolButton
            label="Inserir linha abaixo"
            onClick={() =>
              tableAction(() => void $insertTableRowAtSelection(true))
            }
          >
            <ArrowDownToLine size={15} />
          </ToolButton>
          <ToolButton
            label="Inserir coluna à esquerda"
            onClick={() =>
              tableAction(() => void $insertTableColumnAtSelection(false))
            }
          >
            <ArrowLeftToLine size={15} />
          </ToolButton>
          <ToolButton
            label="Inserir coluna à direita"
            onClick={() =>
              tableAction(() => void $insertTableColumnAtSelection(true))
            }
          >
            <ArrowRightToLine size={15} />
          </ToolButton>
          <Divider />
          <button
            type="button"
            className="btn btn-ghost btn-xs h-8 min-h-8 text-error hover:bg-error/10"
            onClick={() => tableAction(() => $deleteTableRowAtSelection())}
          >
            Excluir linha
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs h-8 min-h-8 text-error hover:bg-error/10"
            onClick={() => tableAction(() => $deleteTableColumnAtSelection())}
          >
            Excluir coluna
          </button>
          <ToolButton
            label="Excluir tabela"
            danger
            onClick={() =>
              tableAction(() => {
                const sel = $getSelection();
                if (!$isTableSelection(sel)) return;
                $getTableNodeFromLexicalNodeOrThrow(
                  sel.anchor.getNode(),
                ).remove();
              })
            }
          >
            <Trash2 size={15} />
          </ToolButton>
        </>
      ) : (
        <>
          {/* Seletor do tipo de bloco */}
          <div className="relative">
            <button
              type="button"
              className="btn btn-ghost btn-xs h-8 min-h-8 gap-1 px-2 font-normal"
              aria-haspopup="listbox"
              aria-expanded={showTurnInto}
              onClick={() => setShowTurnInto((v) => !v)}
            >
              {state.kind === "code" ? "Código" : current}
              <ChevronDown size={13} />
            </button>
            {showTurnInto && (
              <ul
                role="listbox"
                className="menu absolute left-0 top-full z-10 mt-2 w-52 rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
              >
                {TURN_INTO.map((type) => (
                  <li key={type}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={state.blockType === type}
                      className={state.blockType === type ? "menu-active" : ""}
                      onClick={() => turnInto(type)}
                    >
                      {BLOCK_LABELS[type]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Divider />

          {state.kind === "code" ? (
            <ToolButton
              label="Copiar código"
              onClick={() => {
                const text = editor.read(() => {
                  const s = $getSelection();
                  return s ? s.getTextContent() : "";
                });
                void navigator.clipboard?.writeText(text);
              }}
            >
              <Copy size={15} />
            </ToolButton>
          ) : (
            <>
              <ToolButton
                label="Negrito (Ctrl+B)"
                active={state.bold}
                onClick={() => format("bold")}
              >
                <Bold size={15} />
              </ToolButton>
              <ToolButton
                label="Itálico (Ctrl+I)"
                active={state.italic}
                onClick={() => format("italic")}
              >
                <Italic size={15} />
              </ToolButton>
              <ToolButton
                label="Sublinhado (Ctrl+U)"
                active={state.underline}
                onClick={() => format("underline")}
              >
                <Underline size={15} />
              </ToolButton>
              <ToolButton
                label="Tachado"
                active={state.strikethrough}
                onClick={() => format("strikethrough")}
              >
                <Strikethrough size={15} />
              </ToolButton>
              <ToolButton
                label="Código em linha"
                active={state.code}
                onClick={() => format("code")}
              >
                <Code size={15} />
              </ToolButton>
              <Divider />
              {state.link ? (
                <ToolButton
                  label="Remover link"
                  active
                  onClick={() =>
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
                  }
                >
                  <Link2Off size={15} />
                </ToolButton>
              ) : (
                <ToolButton
                  label="Adicionar link (Ctrl+K)"
                  onClick={() => setLinkInput("https://")}
                >
                  <Link2 size={15} />
                </ToolButton>
              )}
            </>
          )}
        </>
      )}
    </div>,
    document.body,
  );
}
