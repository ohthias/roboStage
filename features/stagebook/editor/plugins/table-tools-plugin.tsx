"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $findCellNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumnAtNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtNode,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  $isTableSelection,
  $mergeCells,
  $unmergeCell,
  TableCellHeaderStates,
  type TableCellNode,
  type TableNode,
} from "@lexical/table";
import { mergeRegister } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_TAB_COMMAND,
  type LexicalNode,
} from "lexical";
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Columns2,
  ChevronDown,
  Combine,
  Eraser,
  PanelLeft,
  PanelTop,
  Plus,
  Rows2,
  Split,
  Trash2,
} from "lucide-react";

const CELL_COLORS: { label: string; value: string | null }[] = [
  { label: "Sem cor", value: null },
  { label: "Cinza", value: "rgba(120,120,120,0.16)" },
  { label: "Vermelho", value: "rgba(239,68,68,0.18)" },
  { label: "Laranja", value: "rgba(249,115,22,0.20)" },
  { label: "Amarelo", value: "rgba(234,179,8,0.24)" },
  { label: "Verde", value: "rgba(34,197,94,0.20)" },
  { label: "Azul", value: "rgba(59,130,246,0.20)" },
  { label: "Roxo", value: "rgba(168,85,247,0.20)" },
  { label: "Rosa", value: "rgba(236,72,153,0.20)" },
];

type CellInfo = {
  rect: DOMRect;
  multi: boolean;
  merged: boolean;
  rowHeader: boolean;
  colHeader: boolean;
};

type HoverTable = { el: HTMLTableElement; rect: DOMRect; wrapRight: number };

const MIN_COL = 64;

/** Acha o TableNode a partir de um elemento <table> do DOM. */
function $tableFromElement(el: HTMLElement): TableNode | null {
  const node = $getNearestNodeFromDOMNode(el);
  if (!node) return null;
  if ($isTableNode(node)) return node;
  try {
    return $getTableNodeFromLexicalNodeOrThrow(node);
  } catch {
    return null;
  }
}

function $tableCells(table: TableNode): TableCellNode[][] {
  return table
    .getChildren()
    .filter($isTableRowNode)
    .map((r) => r.getChildren().filter($isTableCellNode));
}

function MenuItem({
  icon,
  children,
  danger,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        danger ? "text-error hover:bg-error/10" : "hover:bg-base-200"
      }`}
    >
      <span className="flex w-4 justify-center">{icon}</span>
      {children}
    </button>
  );
}

/**
 * Ferramentas de tabela:
 *  - botão ▾ na célula ativa com menu completo (linhas, colunas, cabeçalhos,
 *    mesclar, cor de fundo, excluir)
 *  - barras "+" nas bordas para adicionar linha/coluna ao passar o mouse
 *  - arrastar a borda de uma coluna para redimensioná-la
 *  - Tab na última célula cria uma nova linha
 */
export function TableToolsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [cell, setCell] = useState<CellInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hover, setHover] = useState<HoverTable | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizing = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ---------- célula ativa ---------- */
  const computeCell = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      let cellNode: TableCellNode | null = null;
      let multi = false;
      if ($isTableSelection(selection)) {
        cellNode = $findCellNode(selection.anchor.getNode());
        multi = true;
      } else if ($isRangeSelection(selection)) {
        cellNode = $findCellNode(selection.anchor.getNode());
      }
      const el = cellNode ? editor.getElementByKey(cellNode.getKey()) : null;
      if (!cellNode || !el || !editor.isEditable()) return setCell(null);

      const table = $getTableNodeFromLexicalNodeOrThrow(cellNode);
      const rows = $tableCells(table);
      const first = rows[0]?.[0];
      setCell({
        rect: el.getBoundingClientRect(),
        multi,
        merged: cellNode.getColSpan() > 1 || cellNode.getRowSpan() > 1,
        rowHeader: !!first && (first.getHeaderStyles() & TableCellHeaderStates.ROW) !== 0,
        colHeader: !!first && (first.getHeaderStyles() & TableCellHeaderStates.COLUMN) !== 0,
      });
    });
  }, [editor]);

  useEffect(() => {
    const on = () => requestAnimationFrame(computeCell);
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    return mergeRegister(
      () => {
        window.removeEventListener("scroll", on, true);
        window.removeEventListener("resize", on);
      },
      editor.registerUpdateListener(() => computeCell()),
    );
  }, [editor, computeCell]);

  useEffect(() => {
    if (!cell) setMenuOpen(false);
  }, [cell]);

  // Fecha o menu clicando fora.
  useEffect(() => {
    if (!menuOpen) return;
    const down = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-table-menu]")) setMenuOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [menuOpen]);

  /* ---------- hover da tabela + resize de colunas ---------- */
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const showTable = (table: HTMLTableElement) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      const wrap = (table.parentElement as HTMLElement) ?? table;
      setHover({
        el: table,
        rect: table.getBoundingClientRect(),
        wrapRight: wrap.getBoundingClientRect().right,
      });
    };
    const scheduleHide = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setHover(null), 350);
    };

    const edgeCell = (e: MouseEvent): HTMLTableCellElement | null => {
      const cellEl = (e.target as HTMLElement).closest("td,th");
      if (!cellEl || !root.contains(cellEl)) return null;
      const r = cellEl.getBoundingClientRect();
      return Math.abs(e.clientX - r.right) <= 4 ? (cellEl as HTMLTableCellElement) : null;
    };

    const onMove = (e: MouseEvent) => {
      if (resizing.current) return;
      const target = e.target as HTMLElement;
      const table = target.closest("table") as HTMLTableElement | null;
      if (table && root.contains(table)) showTable(table);
      else scheduleHide();
      root.classList.toggle("col-resize-hover", !!edgeCell(e));
    };

    const onDown = (e: MouseEvent) => {
      const cellEl = edgeCell(e);
      if (!cellEl || e.button !== 0) return;
      const tableEl = cellEl.closest("table") as HTMLTableElement;
      e.preventDefault();
      e.stopPropagation(); // evita que o Lexical inicie uma seleção de células

      let colIndex = -1;
      let widths: number[] = [];
      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(cellEl);
        const cellNode = node && $findCellNode(node);
        const table = cellNode && $tableFromElement(tableEl);
        if (!cellNode || !table) return;
        colIndex = $getTableColumnIndexFromTableCellNode(cellNode) + cellNode.getColSpan() - 1;
        // Mede as colunas pela primeira linha (colSpan dividido igualmente).
        const first = tableEl.rows[0];
        if (first) {
          Array.from(first.cells).forEach((c) => {
            const span = c.colSpan || 1;
            for (let i = 0; i < span; i++) widths.push(c.getBoundingClientRect().width / span);
          });
        }
      });
      if (colIndex < 0 || colIndex >= widths.length) return;

      resizing.current = true;
      const startX = e.clientX;
      const startW = widths[colIndex];
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      let raf = 0;

      const move = (ev: MouseEvent) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const next = widths.slice();
          next[colIndex] = Math.max(MIN_COL, Math.round(startW + ev.clientX - startX));
          editor.update(() => {
            const table = $tableFromElement(tableEl);
            table?.setColWidths(next);
          });
        });
      };
      const up = () => {
        resizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        requestAnimationFrame(() => {
          computeCell();
          if (tableEl.isConnected) showTable(tableEl);
        });
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };

    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", scheduleHide);
    root.addEventListener("mousedown", onDown, true);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", scheduleHide);
      root.removeEventListener("mousedown", onDown, true);
      root.classList.remove("col-resize-hover");
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [editor, computeCell]);

  // Reposiciona as barras quando o conteúdo muda.
  useEffect(
    () =>
      editor.registerUpdateListener(() => {
        setHover((h) =>
          h && h.el.isConnected
            ? {
                ...h,
                rect: h.el.getBoundingClientRect(),
                wrapRight: (h.el.parentElement ?? h.el).getBoundingClientRect().right,
              }
            : null,
        );
      }),
    [editor],
  );

  /* ---------- Tab na última célula adiciona linha ---------- */
  useEffect(
    () =>
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (e: KeyboardEvent) => {
          if (e.shiftKey) return false;
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const cellNode = $findCellNode(selection.anchor.getNode());
          if (!cellNode) return false;
          const row = cellNode.getParent();
          const table = $getTableNodeFromLexicalNodeOrThrow(cellNode);
          if (!row || row.getNextSibling() || cellNode.getNextSibling()) return false;
          e.preventDefault();
          const newRow = $insertTableRowAtNode(cellNode, true);
          (newRow?.getFirstChild() as TableCellNode | null)?.selectStart();
          void table;
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    [editor],
  );

  /* ---------- ações ---------- */
  const run = (fn: () => void, keepOpen = false) => {
    editor.update(fn);
    if (!keepOpen) setMenuOpen(false);
  };

  const selectedCells = (): TableCellNode[] => {
    const selection = $getSelection();
    if ($isTableSelection(selection)) {
      return selection.getNodes().filter($isTableCellNode);
    }
    if ($isRangeSelection(selection)) {
      const c = $findCellNode(selection.anchor.getNode());
      return c ? [c] : [];
    }
    return [];
  };

  const currentTable = (): TableNode | null => {
    const c = selectedCells()[0];
    return c ? $getTableNodeFromLexicalNodeOrThrow(c) : null;
  };

  const toggleRowHeader = () =>
    run(() => {
      const table = currentTable();
      if (!table) return;
      const first = table.getChildren().filter($isTableRowNode)[0];
      first
        ?.getChildren()
        .filter($isTableCellNode)
        .forEach((c) => c.toggleHeaderStyle(TableCellHeaderStates.ROW));
    }, true);

  const toggleColHeader = () =>
    run(() => {
      const table = currentTable();
      if (!table) return;
      table
        .getChildren()
        .filter($isTableRowNode)
        .forEach((r) => {
          const c = r.getChildren().filter($isTableCellNode)[0];
          c?.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
        });
    }, true);

  const setColor = (value: string | null) =>
    run(() => selectedCells().forEach((c) => c.setBackgroundColor(value)));

  const addAtEnd = (kind: "row" | "col", tableEl: HTMLTableElement) =>
    editor.update(() => {
      const table = $tableFromElement(tableEl);
      if (!table) return;
      const rows = $tableCells(table);
      if (kind === "row") {
        const last = rows[rows.length - 1]?.[0];
        if (last) $insertTableRowAtNode(last, true);
      } else {
        const lastRow = rows[0];
        const c = lastRow?.[lastRow.length - 1];
        if (c) $insertTableColumnAtNode(c, true, false);
      }
    });

  const deleteTable = () =>
    run(() => {
      const c = selectedCells()[0];
      if (!c) return;
      const table = $getTableNodeFromLexicalNodeOrThrow(c);
      const next = table.getNextSibling() ?? table.getPreviousSibling();
      table.remove();
      (next as (LexicalNode & { selectStart?: () => void }) | null)?.selectStart?.();
    });

  /* ---------- render ---------- */
  if (typeof document === "undefined") return null;
  const keep = (e: React.MouseEvent) => e.preventDefault();

  const menuLeft = cell ? Math.min(cell.rect.right - 224, window.innerWidth - 240) : 0;

  return createPortal(
    <>
      {cell && (
        <div data-table-menu>
          <button
            type="button"
            aria-label="Opções da célula"
            aria-expanded={menuOpen}
            title="Opções da célula"
            onMouseDown={keep}
            onClick={() => setMenuOpen((v) => !v)}
            className="fixed z-[55] flex h-5 w-5 items-center justify-center rounded-md border border-base-300 bg-base-100 text-base-content/60 shadow-sm transition-colors hover:bg-base-200 hover:text-base-content"
            style={{ top: cell.rect.top + 4, left: cell.rect.right - 24 }}
          >
            <ChevronDown size={13} />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Menu da tabela"
              onMouseDown={keep}
              className="fixed z-[80] max-h-[70vh] w-56 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1 shadow-xl"
              style={{
                top: Math.min(cell.rect.top + 28, window.innerHeight - 480 > 0 ? cell.rect.top + 28 : 16),
                left: Math.max(8, menuLeft),
              }}
            >
              <MenuItem icon={<ArrowUpToLine size={14} />} onClick={() => run(() => void $insertTableRowAtSelection(false))}>
                Inserir linha acima
              </MenuItem>
              <MenuItem icon={<ArrowDownToLine size={14} />} onClick={() => run(() => void $insertTableRowAtSelection(true))}>
                Inserir linha abaixo
              </MenuItem>
              <MenuItem icon={<ArrowLeftToLine size={14} />} onClick={() => run(() => void $insertTableColumnAtSelection(false))}>
                Inserir coluna à esquerda
              </MenuItem>
              <MenuItem icon={<ArrowRightToLine size={14} />} onClick={() => run(() => void $insertTableColumnAtSelection(true))}>
                Inserir coluna à direita
              </MenuItem>

              <div className="my-1 border-t border-base-300" />

              <MenuItem icon={<PanelTop size={14} />} onClick={toggleRowHeader}>
                {cell.rowHeader ? "Remover linha de cabeçalho" : "Linha de cabeçalho"}
              </MenuItem>
              <MenuItem icon={<PanelLeft size={14} />} onClick={toggleColHeader}>
                {cell.colHeader ? "Remover coluna de cabeçalho" : "Coluna de cabeçalho"}
              </MenuItem>
              <MenuItem
                icon={<Combine size={14} />}
                disabled={!cell.multi}
                onClick={() =>
                  run(() => {
                    const cells = selectedCells();
                    if (cells.length > 1) $mergeCells(cells);
                  })
                }
              >
                Mesclar células
              </MenuItem>
              <MenuItem icon={<Split size={14} />} disabled={!cell.merged} onClick={() => run(() => $unmergeCell())}>
                Desfazer mesclagem
              </MenuItem>

              <div className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-base-content/40">
                Cor de fundo
              </div>
              <div className="grid grid-cols-9 gap-1 px-2 pb-2">
                {CELL_COLORS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    title={c.label}
                    aria-label={c.label}
                    onClick={() => setColor(c.value)}
                    className="flex h-5 w-5 items-center justify-center rounded border border-base-300"
                    style={{ background: c.value ?? "transparent" }}
                  >
                    {c.value === null && <Eraser size={11} className="text-base-content/50" />}
                  </button>
                ))}
              </div>

              <div className="my-1 border-t border-base-300" />

              <MenuItem danger icon={<Rows2 size={14} />} onClick={() => run(() => $deleteTableRowAtSelection())}>
                Excluir linha
              </MenuItem>
              <MenuItem danger icon={<Columns2 size={14} />} onClick={() => run(() => $deleteTableColumnAtSelection())}>
                Excluir coluna
              </MenuItem>
              <MenuItem danger icon={<Trash2 size={14} />} onClick={deleteTable}>
                Excluir tabela
              </MenuItem>
            </div>
          )}
        </div>
      )}

      {hover && hover.el.isConnected && (
        <>
          {/* + linha no fim */}
          <button
            type="button"
            aria-label="Adicionar linha"
            title="Adicionar linha"
            onMouseDown={keep}
            onMouseEnter={() => hideTimer.current && clearTimeout(hideTimer.current)}
            onMouseLeave={() => {
              if (hideTimer.current) clearTimeout(hideTimer.current);
              hideTimer.current = setTimeout(() => setHover(null), 350);
            }}
            onClick={() => addAtEnd("row", hover.el)}
            className="group fixed z-[50] flex items-center justify-center rounded-md bg-base-200/70 text-base-content/40 transition-colors hover:bg-primary/15 hover:text-primary"
            style={{
              top: hover.rect.bottom + 2,
              left: hover.rect.left,
              width: Math.min(hover.rect.width, hover.wrapRight - hover.rect.left),
              height: 16,
            }}
          >
            <Plus size={14} />
          </button>
          {/* + coluna no fim */}
          <button
            type="button"
            aria-label="Adicionar coluna"
            title="Adicionar coluna"
            onMouseDown={keep}
            onMouseEnter={() => hideTimer.current && clearTimeout(hideTimer.current)}
            onMouseLeave={() => {
              if (hideTimer.current) clearTimeout(hideTimer.current);
              hideTimer.current = setTimeout(() => setHover(null), 350);
            }}
            onClick={() => addAtEnd("col", hover.el)}
            className="fixed z-[50] flex items-center justify-center rounded-md bg-base-200/70 text-base-content/40 transition-colors hover:bg-primary/15 hover:text-primary"
            style={{
              top: hover.rect.top,
              left: Math.min(hover.rect.right, hover.wrapRight) + 2,
              width: 16,
              height: hover.rect.height,
            }}
          >
            <Plus size={14} />
          </button>
        </>
      )}
    </>,
    document.body,
  );
}
