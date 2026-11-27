"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlignCenter, AlignLeft, AlignRight, X } from "lucide-react";
import type { EmbedAlign, EmbedHeight, EmbedLayoutOptions } from "./embed-types";
import {
  ALIGN_LABELS,
  HEIGHT_LABELS,
  MAX_EMBED_WIDTH,
  MIN_EMBED_WIDTH,
  WIDTH_PRESETS,
  embedLayoutStyle,
  normalizeEmbedLayout,
  widthFromDrag,
} from "./embed-options";

// ---------------------------------------------------------------------------
// Moldura: largura + posição + alças de arraste
// ---------------------------------------------------------------------------

/**
 * Envolve o card do embed aplicando largura (%) e posição (esquerda, centro,
 * direita). Com `editable`, mostra alças nas laterais para redimensionar
 * arrastando (encaixa de 5 em 5%). Em telas estreitas o bloco ocupa 100%.
 */
export function EmbedLayoutFrame({
  layout,
  editable,
  onChange,
  children,
}: {
  layout: EmbedLayoutOptions;
  editable: boolean;
  onChange: (next: EmbedLayoutOptions) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, align } = normalizeEmbedLayout(layout);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const shown = dragWidth ?? width;

  const startDrag = (edge: "left" | "right") => (event: React.PointerEvent) => {
    const block = ref.current;
    const container = block?.parentElement;
    if (!block || !container) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);

    const containerWidth = container.getBoundingClientRect().width;
    const rect = block.getBoundingClientRect();
    let latest = width;

    const move = (e: PointerEvent) => {
      latest = widthFromDrag({
        pointerX: e.clientX,
        blockLeft: rect.left,
        blockRight: rect.right,
        containerWidth,
        align,
        edge,
      });
      setDragWidth(latest);
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      setDragWidth(null);
      if (latest !== width) onChange({ ...layout, width: latest });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  };

  // Alça do lado "livre": à esquerda o bloco cresce para a direita, etc.
  const edges: ("left" | "right")[] =
    align === "left" ? ["right"] : align === "right" ? ["left"] : ["left", "right"];

  return (
    <div
      ref={ref}
      className="editor-embed-frame group/embed relative"
      data-embed-align={align}
      style={embedLayoutStyle({ width: shown, align })}
    >
      {children}
      {editable &&
        edges.map((edge) => (
          <div
            key={edge}
            role="separator"
            aria-orientation="vertical"
            aria-label="Arraste para redimensionar"
            title="Arraste para redimensionar"
            contentEditable={false}
            onPointerDown={startDrag(edge)}
            className={`editor-embed-resize no-print ${edge === "left" ? "-left-2" : "-right-2"}`}
          >
            <span />
          </div>
        ))}
      {dragWidth !== null && (
        <span className="no-print pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-md bg-neutral px-2 py-0.5 text-xs font-medium text-neutral-content shadow">
          {dragWidth}%
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Popover (em portal: o card tem overflow-hidden e fica dentro do editor)
// ---------------------------------------------------------------------------

export function EmbedPopover({
  icon,
  label,
  badge,
  width = 300,
  children,
}: {
  icon: ReactNode;
  label: string;
  /** Número pequeno no botão (ex.: filtros ativos). */
  badge?: number;
  width?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, r.right - width));
    setPos({ top: r.bottom + 6, left });
  }, [width]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`btn btn-ghost btn-xs btn-square relative ${open ? "btn-active" : ""}`}
        title={label}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        {!!badge && (
          <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-content">
            {badge}
          </span>
        )}
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={label}
            className="fixed z-[80] max-h-[70vh] overflow-y-auto rounded-2xl border border-base-300 bg-base-100 p-3 text-sm text-base-content shadow-xl"
            style={{ top: pos.top, left: pos.left, width }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-base-content/55">
                {label}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
              >
                <X size={13} />
              </button>
            </div>
            <div className="space-y-4">{children}</div>
          </div>,
          document.body,
        )}
    </>
  );
}

/** Título de grupo dentro do popover. */
export function PopoverSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-base-content/45">{title}</h5>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Controles de tamanho e posição
// ---------------------------------------------------------------------------

const ALIGN_ICONS: Record<EmbedAlign, typeof AlignLeft> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

export function LayoutControls({
  layout,
  onChange,
}: {
  layout: EmbedLayoutOptions;
  onChange: (next: EmbedLayoutOptions) => void;
}) {
  const { width, align } = normalizeEmbedLayout(layout);
  const [draft, setDraft] = useState(width);
  const [synced, setSynced] = useState(width);
  if (synced !== width) {
    setSynced(width);
    setDraft(width);
  }

  return (
    <>
      <PopoverSection title="Posição na página">
        <div className="join w-full" role="radiogroup" aria-label="Posição na página">
          {(["left", "center", "right"] as const).map((a) => {
            const Icon = ALIGN_ICONS[a];
            return (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={align === a}
                disabled={width >= MAX_EMBED_WIDTH}
                onClick={() => onChange({ ...layout, align: a })}
                className={`btn join-item btn-sm flex-1 gap-1.5 ${align === a ? "btn-neutral" : "btn-ghost border-base-300"}`}
              >
                <Icon size={14} />
                <span className="text-xs">{ALIGN_LABELS[a]}</span>
              </button>
            );
          })}
        </div>
        {width >= MAX_EMBED_WIDTH && (
          <p className="text-xs text-base-content/50">Diminua a largura para escolher a posição.</p>
        )}
      </PopoverSection>

      <PopoverSection title={`Largura · ${draft}%`}>
        <div className="join w-full" role="radiogroup" aria-label="Largura">
          {WIDTH_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={width === p.value}
              title={p.title}
              onClick={() => onChange({ ...layout, width: p.value })}
              className={`btn join-item btn-sm flex-1 text-xs ${width === p.value ? "btn-neutral" : "btn-ghost border-base-300"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          className="range range-xs range-primary"
          min={MIN_EMBED_WIDTH}
          max={MAX_EMBED_WIDTH}
          step={5}
          value={draft}
          aria-label="Largura em porcentagem"
          onChange={(e) => setDraft(Number(e.target.value))}
          onPointerUp={() => draft !== width && onChange({ ...layout, width: draft })}
          onKeyUp={() => draft !== width && onChange({ ...layout, width: draft })}
        />
        <p className="text-xs text-base-content/50">Dica: arraste as bordas do bloco para ajustar.</p>
      </PopoverSection>
    </>
  );
}

export function HeightControls({
  title,
  value,
  onChange,
}: {
  title: string;
  value: EmbedHeight;
  onChange: (next: EmbedHeight) => void;
}) {
  return (
    <PopoverSection title={title}>
      <div className="join w-full" role="radiogroup" aria-label={title}>
        {(Object.keys(HEIGHT_LABELS) as EmbedHeight[]).map((h) => (
          <button
            key={h}
            type="button"
            role="radio"
            aria-checked={value === h}
            onClick={() => onChange(h)}
            className={`btn join-item btn-sm flex-1 px-1 text-xs ${value === h ? "btn-neutral" : "btn-ghost border-base-300"}`}
          >
            {HEIGHT_LABELS[h]}
          </button>
        ))}
      </div>
    </PopoverSection>
  );
}
