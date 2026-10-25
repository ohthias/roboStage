"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

type LayoutPrefs = { locked: boolean; sidebarExpanded: boolean };

const LayoutPrefsContext = createContext<LayoutPrefs>({ locked: false, sidebarExpanded: false });

/**
 * Preferência "travar painéis e menus". Qualquer painel arrastável,
 * recolhível ou redimensionável deve ler `useLayoutPrefs().locked` e desligar
 * o movimento quando for true (o menu lateral do dashboard já faz isso).
 */
export function LayoutPrefsProvider({ value, children }: { value: LayoutPrefs; children: ReactNode }) {
  return <LayoutPrefsContext.Provider value={value}>{children}</LayoutPrefsContext.Provider>;
}

export const useLayoutPrefs = () => useContext(LayoutPrefsContext);

/**
 * Aplica a posição preferida do menu lateral no desktop. O estado do menu é o
 * checkbox do `drawer` do daisyUI, que no celular significa "overlay aberto" —
 * por isso só mexemos nele em telas `lg+` (senão o menu abriria sozinho no
 * celular). Travado, volta à posição escolhida se a janela for redimensionada
 * (ex.: abriu o menu no celular e depois ampliou a janela).
 */
export function SidebarPosition({
  expanded,
  locked,
  inputId = "lt-drawer",
}: {
  expanded: boolean;
  locked: boolean;
  inputId?: string;
}) {
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      if (input && query.matches) input.checked = expanded;
    };
    apply();
    if (!locked) return;
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [expanded, locked, inputId]);

  return null;
}
