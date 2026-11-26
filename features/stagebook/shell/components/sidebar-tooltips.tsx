"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const DRAWER_ID = "lt-drawer";
const DESKTOP_QUERY = "(min-width: 1024px)"; // breakpoint lg

/** No desktop, o checkbox marcado = barra expandida; desmarcado = recolhida. */
function isCollapsed() {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return false;
  const toggle = document.getElementById(DRAWER_ID) as HTMLInputElement | null;
  return !toggle?.checked;
}

type Tip = { text: string; top: number; left: number };

/**
 * Tooltips da barra recolhida. Usa `position: fixed` via portal, então não é
 * cortado pela área rolável (o tooltip do daisyUI, feito com pseudo-elementos,
 * seria cortado). Lê o texto do atributo `data-tip` dos itens dentro de `rootId`.
 */
export function SidebarTooltips({ rootId }: { rootId: string }) {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const hide = () => setTip(null);

    const show = (target: EventTarget | null) => {
      const el = (target as Element | null)?.closest?.<HTMLElement>("[data-tip]");
      if (
        !el ||
        !root.contains(el) ||
        !isCollapsed() ||
        // Não cobre um dropdown aberto (ex.: "Mais").
        el.querySelector(".dropdown:focus-within")
      ) {
        hide();
        return;
      }
      const r = el.getBoundingClientRect();
      setTip({ text: el.dataset.tip ?? "", top: r.top + r.height / 2, left: r.right + 8 });
    };

    const onOver = (e: PointerEvent) => show(e.target);
    const onFocusIn = (e: FocusEvent) => {
      if ((e.target as Element).matches?.(":focus-visible")) show(e.target);
    };

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", hide);
    root.addEventListener("pointerdown", hide);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", hide);
    root.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    const toggle = document.getElementById(DRAWER_ID);
    toggle?.addEventListener("change", hide);

    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", hide);
      root.removeEventListener("pointerdown", hide);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", hide);
      root.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      toggle?.removeEventListener("change", hide);
    };
  }, [rootId]);

  if (!tip) return null;

  return createPortal(
    <div
      role="tooltip"
      data-theme="labtest"
      style={{ top: tip.top, left: tip.left }}
      className="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral px-2 py-1 text-xs text-neutral-content shadow-lg"
    >
      {tip.text}
    </div>,
    document.body,
  );
}
