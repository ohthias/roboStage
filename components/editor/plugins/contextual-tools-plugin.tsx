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
import { $getSelectionStyleValueForProperty, $patchStyleText } from "@lexical/selection";
import {
  $isDividerNode,
  DIVIDER_STYLES,
  DIVIDER_WEIGHTS,
  DividerView,
  type DividerStyle,
  type DividerWeight,
} from "../nodes/divider-node";
import {
  COMBOS,
  DEFAULT_DIVIDER_COLOR,
  SWATCHES,
  bgVar,
  textVar,
} from "../editor-colors";
import {
  $getNodeByKey,
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
  Palette,
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

type Kind = "text" | "code" | "table" | "divider";

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
  textColor: string;
  bgColor: string;
  dividerStyle: DividerStyle;
  dividerColor: string;
  dividerWeight: DividerWeight;
};

const EMPTY_STATE = {
  blockType: null,
  blockKey: null,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false,
  link: false,
  linkUrl: "",
  textColor: "",
  bgColor: "",
  dividerStyle: "solid" as DividerStyle,
  dividerColor: DEFAULT_DIVIDER_COLOR,
  dividerWeight: "medium" as DividerWeight,
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

function $getDivider(key: string | null) {
  const n = key ? $getNodeByKey(key) : null;
  return $isDividerNode(n) ? n : null;
}

const chip =
  "flex h-6 w-6 items-center justify-center rounded-md border border-base-300 text-xs font-semibold transition-transform hover:scale-110";

/** Painel de cores: combinações com contraste, cor do texto e cor de fundo. */
function ColorPanel({
  textColor,
  bgColor,
  onApply,
}: {
  textColor: string;
  bgColor: string;
  onApply: (patch: Record<string, string | null>) => void;
}) {
  const ring = (on: boolean) => (on ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100" : "");
  return (
    <div
      role="dialog"
      aria-label="Cores"
      className="absolute left-0 top-full z-10 mt-2 w-64 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl"
    >
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-base-content/40">
        Combinações
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {COMBOS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.label}
            aria-label={c.label}
            className={`${chip} ${ring(bgColor === c.bg && textColor === c.color)}`}
            style={{ background: c.bg, color: c.color }}
            onClick={() => onApply({ color: c.color, "background-color": c.bg })}
          >
            Aa
          </button>
        ))}
      </div>

      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-base-content/40">
        Cor do texto
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          title="Padrão"
          aria-label="Cor do texto padrão"
          className={`${chip} ${ring(!textColor)}`}
          onClick={() => onApply({ color: null })}
        >
          A
        </button>
        {SWATCHES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            aria-label={`Texto ${s.label}`}
            className={`${chip} ${ring(textColor === textVar(s.id))}`}
            style={{ color: textVar(s.id) }}
            onClick={() => onApply({ color: textVar(s.id) })}
          >
            A
          </button>
        ))}
      </div>

      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-base-content/40">
        Cor de fundo
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          title="Sem fundo"
          aria-label="Sem cor de fundo"
          className={`${chip} ${ring(!bgColor)}`}
          onClick={() => onApply({ "background-color": null })}
        >
          <X size={12} />
        </button>
        {SWATCHES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            aria-label={`Fundo ${s.label}`}
            className={`${chip} ${ring(bgColor === bgVar(s.id))}`}
            style={{ background: bgVar(s.id) }}
            onClick={() => onApply({ "background-color": bgVar(s.id) })}
          />
        ))}
      </div>

      {(textColor || bgColor) && (
        <button
          type="button"
          className="btn btn-ghost btn-xs mt-3 w-full"
          onClick={() => onApply({ color: null, "background-color": null })}
        >
          Limpar cores
        </button>
      )}
    </div>
  );
}

export function ContextualToolsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<ToolbarState | null>(null);
  const [pointerDown, setPointerDown] = useState(false);
  const [linkInput, setLinkInput] = useState<string | null>(null);
  const [showTurnInto, setShowTurnInto] = useState(false);
  const [showColors, setShowColors] = useState(false);
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

      // Divisor selecionado (NodeSelection)
      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length === 1 && $isDividerNode(nodes[0])) {
          const d = nodes[0];
          const el = editor.getElementByKey(d.getKey());
          if (el) {
            return setState({
              ...EMPTY_STATE,
              kind: "divider",
              rect: rectOf(el.getBoundingClientRect()),
              blockKey: d.getKey(),
              dividerStyle: d.getDividerStyle(),
              dividerColor: d.getColor(),
              dividerWeight: d.getWeight(),
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
            ...EMPTY_STATE,
            kind: "table",
            rect: rectOf(r),
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
        textColor: $getSelectionStyleValueForProperty(selection, "color", ""),
        bgColor: $getSelectionStyleValueForProperty(selection, "background-color", ""),
        dividerStyle: "solid",
        dividerColor: DEFAULT_DIVIDER_COLOR,
        dividerWeight: "medium",
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
      setShowColors(false);
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
  }, [state, linkInput, showTurnInto, showColors]);

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

  const applyStyle = (patch: Record<string, string | null>) =>
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) $patchStyleText(selection, patch);
    });

  const patchDivider = (fn: (d: ReturnType<typeof $getDivider>) => void) =>
    editor.update(() => {
      const d = $getDivider(state?.blockKey ?? null);
      if (d) fn(d);
    });

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
      ) : state.kind === "divider" ? (
        <div className="flex flex-col gap-2 p-1.5">
          <div className="flex items-center gap-1">
            {DIVIDER_STYLES.map((d) => (
              <button
                key={d.value}
                type="button"
                title={d.label}
                aria-label={`Divisor ${d.label}`}
                aria-pressed={state.dividerStyle === d.value}
                onClick={() => patchDivider((n) => n?.setDividerStyle(d.value))}
                className={`flex h-9 w-16 items-center rounded-lg border px-2 transition-colors ${
                  state.dividerStyle === d.value
                    ? "border-primary bg-primary/10"
                    : "border-base-300 hover:bg-base-200"
                }`}
              >
                <div className="w-full">
                  <DividerView
                    uid={`preview-${d.value}`}
                    dividerStyle={d.value}
                    color="currentColor"
                    weight="thin"
                  />
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {DIVIDER_WEIGHTS.map((w) => (
              <button
                key={w.value}
                type="button"
                aria-pressed={state.dividerWeight === w.value}
                onClick={() => patchDivider((n) => n?.setWeight(w.value))}
                className={`btn btn-xs h-7 min-h-7 flex-1 font-normal ${
                  state.dividerWeight === w.value ? "btn-primary" : "btn-ghost"
                }`}
              >
                {w.label}
              </button>
            ))}
            <ToolButton
              label="Remover divisor"
              danger
              onClick={() => editor.update(() => state.blockKey && $deleteBlock(state.blockKey))}
            >
              <Trash2 size={15} />
            </ToolButton>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              title="Padrão"
              aria-label="Cor padrão do divisor"
              className={`${chip} ${state.dividerColor === DEFAULT_DIVIDER_COLOR ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100" : ""}`}
              onClick={() => patchDivider((n) => n?.setColor(DEFAULT_DIVIDER_COLOR))}
            >
              <span className="h-0.5 w-3 rounded bg-base-content/40" />
            </button>
            {SWATCHES.map((sw) => (
              <button
                key={sw.id}
                type="button"
                title={sw.label}
                aria-label={`Divisor ${sw.label}`}
                className={`${chip} ${state.dividerColor === textVar(sw.id) ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100" : ""}`}
                style={{ background: textVar(sw.id) }}
                onClick={() => patchDivider((n) => n?.setColor(textVar(sw.id)))}
              />
            ))}
          </div>
        </div>
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
              onClick={() => {
                setShowTurnInto((v) => !v);
                setShowColors(false);
              }}
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
              <div className="relative">
                <ToolButton
                  label="Cores do texto e do fundo"
                  active={showColors || !!state.textColor || !!state.bgColor}
                  onClick={() => {
                    setShowColors((v) => !v);
                    setShowTurnInto(false);
                  }}
                >
                  <Palette size={15} />
                </ToolButton>
                {showColors && (
                  <ColorPanel
                    textColor={state.textColor}
                    bgColor={state.bgColor}
                    onApply={applyStyle}
                  />
                )}
              </div>
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
