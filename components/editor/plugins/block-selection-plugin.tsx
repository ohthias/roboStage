"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { $isListItemNode, $isListNode, type ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
} from "lexical";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Copy,
  GripVertical,
  List as ListIcon,
  Plus,
  Repeat2,
  Trash2,
} from "lucide-react";
import {
  $deleteBlock,
  $duplicateBlock,
  $getTopLevelBlock,
  $getBlockType,
  $insertParagraphAfter,
  $moveBlock,
  $moveListItem,
  $transformBlock,
  BLOCK_LABELS,
  type BlockType,
} from "../block-utils";
import { blockTypeIcon, TURN_INTO_TYPES } from "../block-icons";
import {
  $getListMarker,
  $setListMarker,
  BULLET_MARKERS,
  EMOJI_MARKERS,
  NUMBER_MARKERS,
} from "../list-markers";

const TYPE_ICONS = (type: BlockType) => blockTypeIcon(type);
const TURN_INTO = TURN_INTO_TYPES;

type OpenMenu = {
  key: string;
  blockType: BlockType | null;
  isHeading: boolean;
  label: string;
  /** Tipo da lista (para o menu de marcadores) e marcador atual. */
  listType: "bullet" | "number" | null;
  marker: string;
  top: number;
  left: number;
};

const MENU_CLASS = "block-menu-popover";
const HANDLE_CLASS = "block-handle";

/**
 * Handle estilo Notion: botão "+" (insere bloco e abre o menu "/") e grip
 * (arrasta para reordenar; clique abre o menu de controle do bloco).
 * Também registra Ctrl/Cmd+Shift+↑/↓ para mover blocos / itens de lista.
 */
export function BlockSelectionPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}) {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef<HTMLElement | null>(null);
  const [menu, setMenu] = useState<OpenMenu | null>(null);
  const [showTurnInto, setShowTurnInto] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [customMarker, setCustomMarker] = useState("");

  const isOnMenu = useCallback(
    (el: HTMLElement) =>
      !!el.closest(`.${HANDLE_CLASS}`) || !!el.closest(`.${MENU_CLASS}`),
    [],
  );

  const getHoveredKey = useCallback((): string | null => {
    const elem = hoveredRef.current;
    if (!elem) return null;
    let key: string | null = null;
    editor.read(() => {
      key = $getNearestNodeFromDOMNode(elem)?.getKey() ?? null;
    });
    return key;
  }, [editor]);

  // "+" → novo parágrafo abaixo com "/" para já abrir o menu de comandos.
  const handleAdd = () => {
    const key = getHoveredKey();
    if (!key) return;
    editor.update(() => {
      const node = $getNodeByKey(key);
      if (!node) return;
      const isEmptyParagraph =
        node.getType() === "paragraph" &&
        $isElementNode(node) &&
        node.getTextContentSize() === 0;
      const target = isEmptyParagraph ? node : $insertParagraphAfter(key);
      if (!target || !$isElementNode(target)) return;
      target.append($createTextNode("/"));
      target.selectEnd();
    });
    editor.focus();
  };

  // Grip → menu de controle do bloco.
  const handleGrip = (e: React.MouseEvent<HTMLButtonElement>) => {
    const key = getHoveredKey();
    if (!key) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let blockType: BlockType | null = null;
    let isHeading = false;
    let label = "Bloco";
    let listType: "bullet" | "number" | null = null;
    let marker = "";
    editor.read(() => {
      const node = $getNodeByKey(key);
      if (!node) return;
      if ($isListNode(node) && node.getListType() !== "check") {
        listType = node.getListType() as "bullet" | "number";
        marker = $getListMarker(node);
      }
      blockType = $getBlockType(node);
      isHeading = $isHeadingNode(node);
      if (blockType) label = BLOCK_LABELS[blockType];
      else if (node.getType() === "layout-container") label = "Seção de colunas";
      else if (node.getType() === "divider") label = "Divisor";
      else if (node.getType() === "table") label = "Tabela";
      else if (node.getType() === "toc") label = "Sumário";
      else if (node.getType() === "timeline") label = "Linha do tempo";
      else if (node.getType() === "equation") label = "Equação";
    });
    setShowTurnInto(false);
    setShowMarkers(false);
    setMenu({
      key,
      blockType,
      isHeading,
      label,
      listType,
      marker,
      top: rect.top,
      left: rect.right + 8,
    });
  };

  const closeMenu = () => {
    setMenu(null);
    setShowTurnInto(false);
    setShowMarkers(false);
    setCustomMarker("");
  };

  const setMarker = (value: string) => {
    if (!menu) return;
    const key = menu.key;
    run(() => {
      const node = $getNodeByKey(key);
      if ($isListNode(node)) $setListMarker(node as ListNode, value);
    });
  };

  // Destaca o bloco selecionado enquanto o menu estiver aberto.
  useEffect(() => {
    if (!menu) return;
    const el = editor.getElementByKey(menu.key);
    el?.classList.add("block-selected");
    return () => el?.classList.remove("block-selected");
  }, [editor, menu]);

  // Fecha ao clicar fora / Esc.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(`.${MENU_CLASS}`) || t?.closest(`.${HANDLE_CLASS}`))
        return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // Mantém o popover dentro da viewport.
  useLayoutEffect(() => {
    const el = popoverRef.current;
    if (!menu || !el) return;
    const h = el.offsetHeight;
    const w = el.offsetWidth;
    if (menu.top + h > window.innerHeight - 8) {
      el.style.top = `${Math.max(8, window.innerHeight - h - 8)}px`;
    }
    if (menu.left + w > window.innerWidth - 8) {
      el.style.left = `${Math.max(8, window.innerWidth - w - 8)}px`;
    }
  }, [menu, showTurnInto, showMarkers]);

  // Atalho: Ctrl/Cmd + Shift + ↑/↓ move o bloco (ou o item da lista).
  useEffect(
    () =>
      mergeRegister(
        editor.registerCommand(
          KEY_DOWN_COMMAND,
          (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (!mod || !e.shiftKey) return false;
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return false;
            const dir = e.key === "ArrowUp" ? "up" : "down";
            let moved = false;
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return false;
            const anchor = selection.anchor.getNode();
            const item = $findMatchingParent(anchor, $isListItemNode);
            if (item) {
              moved = $moveListItem(item.getKey(), dir);
            } else {
              const top = $getTopLevelBlock(anchor);
              if (top) moved = $moveBlock(top.getKey(), dir, true);
            }
            e.preventDefault();
            if (moved) {
              requestAnimationFrame(() =>
                window
                  .getSelection()
                  ?.focusNode?.parentElement?.scrollIntoView({
                    block: "nearest",
                  }),
              );
            }
            return true;
          },
          COMMAND_PRIORITY_HIGH,
        ),
      ),
    [editor],
  );

  const run = (fn: () => void) => {
    editor.update(fn);
    closeMenu();
  };

  if (!anchorElem) return null;

  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-base-200";

  return (
    <>
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef}
        targetLineRef={targetLineRef}
        isOnMenu={isOnMenu}
        onElementChanged={(el) => {
          // Mantém o último bloco enquanto o mouse está sobre o handle/menu.
          if (el) hoveredRef.current = el;
        }}
        menuComponent={
          <div
            ref={menuRef}
            className={`${HANDLE_CLASS} absolute left-0 top-0`}
            style={{ opacity: 0 }}
          >
            <button
              type="button"
              className="block-handle-btn"
              title="Clique para adicionar um bloco abaixo"
              aria-label="Adicionar bloco"
              onClick={handleAdd}
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="block-handle-btn block-handle-grip"
              title="Arraste para mover · Clique para opções"
              aria-label="Mover ou editar bloco"
              onClick={handleGrip}
            >
              <GripVertical size={16} />
            </button>
          </div>
        }
        targetLineComponent={
          <div ref={targetLineRef} className="block-target-line" />
        }
      />

      {menu &&
        createPortal(
          <div
            ref={popoverRef}
            role="menu"
            aria-label="Opções do bloco"
            className={`${MENU_CLASS} fixed z-[80] max-h-[calc(100vh-16px)] w-60 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl`}
            style={{ top: menu.top, left: menu.left }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="px-2 pb-1 pt-1.5 text-xs font-medium uppercase tracking-wide text-base-content/40">
              {menu.label}
            </div>

            {menu.blockType && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  aria-expanded={showTurnInto}
                  onClick={() => setShowTurnInto((v) => !v)}
                >
                  <Repeat2 size={15} />
                  <span className="flex-1">Transformar em</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${showTurnInto ? "rotate-90" : ""}`}
                  />
                </button>
                {showTurnInto && (
                  <div className="mb-1 ml-3 border-l border-base-300 pl-1">
                    {TURN_INTO.map((type) => (
                      <button
                        key={type}
                        type="button"
                        role="menuitemradio"
                        aria-checked={menu.blockType === type}
                        className={`${itemClass} ${menu.blockType === type ? "bg-base-200 font-medium" : ""}`}
                        onClick={() => run(() => $transformBlock(menu.key, type))}
                      >
                        {TYPE_ICONS(type)}
                        {BLOCK_LABELS[type]}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {menu.listType && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  aria-expanded={showMarkers}
                  onClick={() => setShowMarkers((v) => !v)}
                >
                  <ListIcon size={15} />
                  <span className="flex-1">Estilo do marcador</span>
                  <ChevronRight size={14} className={`transition-transform ${showMarkers ? "rotate-90" : ""}`} />
                </button>
                {showMarkers && (
                  <div className="mb-1 space-y-1.5 px-1 pb-1" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-3 gap-1">
                      {(menu.listType === "number" ? NUMBER_MARKERS : BULLET_MARKERS).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={menu.marker === m.id}
                          title={m.label}
                          className={`flex h-9 flex-col items-center justify-center rounded-lg text-sm leading-none transition-colors ${
                            menu.marker === m.id ? "bg-primary/10 text-primary ring-1 ring-primary/40" : "hover:bg-base-200"
                          }`}
                          onClick={() => setMarker(m.id)}
                        >
                          <span className="text-base">{m.preview}</span>
                          <span className="mt-0.5 text-[9px] text-base-content/50">{m.label}</span>
                        </button>
                      ))}
                    </div>
                    {menu.listType === "bullet" && (
                      <>
                        <div className="grid grid-cols-5 gap-1">
                          {EMOJI_MARKERS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              role="menuitemradio"
                              aria-checked={menu.marker === `c:${emoji}`}
                              className={`flex h-8 items-center justify-center rounded-lg text-base ${
                                menu.marker === `c:${emoji}` ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-base-200"
                              }`}
                              onClick={() => setMarker(`c:${emoji}`)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <form
                          className="flex gap-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const value = customMarker.trim();
                            if (value) setMarker(`c:${value.slice(0, 4)}`);
                          }}
                        >
                          <input
                            className="input input-xs input-bordered min-w-0 flex-1"
                            placeholder="Outro (ex.: ▸, 🔧)"
                            maxLength={4}
                            value={customMarker}
                            onChange={(e) => setCustomMarker(e.target.value)}
                            aria-label="Marcador personalizado"
                          />
                          <button type="submit" className="btn btn-xs">OK</button>
                        </form>
                      </>
                    )}
                    <button
                      type="button"
                      className="w-full rounded-md px-2 py-1 text-left text-xs text-base-content/60 hover:bg-base-200"
                      onClick={() => setMarker("")}
                    >
                      Voltar ao padrão
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => run(() => void $moveBlock(menu.key, "up"))}
            >
              <ArrowUp size={15} />
              {menu.isHeading ? "Mover seção para cima" : "Mover para cima"}
            </button>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => run(() => void $moveBlock(menu.key, "down"))}
            >
              <ArrowDown size={15} />
              {menu.isHeading ? "Mover seção para baixo" : "Mover para baixo"}
            </button>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => run(() => $duplicateBlock(menu.key))}
            >
              <Copy size={15} />
              Duplicar
            </button>

            <div className="my-1 border-t border-base-300" />

            <button
              type="button"
              role="menuitem"
              className={`${itemClass} text-error hover:bg-error/10`}
              onClick={() => run(() => $deleteBlock(menu.key))}
            >
              <Trash2 size={15} />
              Excluir
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
