"use client";

import { useEffect, type RefObject } from "react";

/**
 * Exportação em PDF pelo mecanismo de impressão do navegador ("Salvar como PDF").
 *
 * Em vez de clonar o conteúdo (o que perderia o realce de sintaxe, que usa a
 * CSS Custom Highlight API), isolamos o próprio documento: durante a impressão
 * escondemos tudo que não pertence a ele (menu lateral, barras, popovers) e
 * liberamos os containers de rolagem que cortariam o conteúdo. As regras ficam
 * em editor.css, sob `body.doc-printing`.
 *
 * Funciona tanto pelo botão "Exportar PDF" (window.print()) quanto por Ctrl/Cmd+P.
 */
export function usePrintDocument(rootRef: RefObject<HTMLElement | null>, title: string) {
  useEffect(() => {
    const touched: { el: Element; cls: string }[] = [];
    let previousTitle = "";
    let previousTheme: string | null = null;
    let active = false;

    const mark = (el: Element, cls: string) => {
      if (!el.classList.contains(cls)) {
        el.classList.add(cls);
        touched.push({ el, cls });
      }
    };

    const prepare = () => {
      const root = rootRef.current;
      if (!root || active) return;
      active = true;

      // Sobe até o <body>: marca os ancestrais e esconde os irmãos de cada nível.
      let node: HTMLElement = root;
      while (node !== document.body && node.parentElement) {
        const parent: HTMLElement = node.parentElement;
        mark(parent, "print-ancestor");
        Array.from(parent.children).forEach((sib) => {
          if (sib !== node) mark(sib, "print-hide");
        });
        node = parent;
      }

      // O PDF sai sempre no tema claro, mesmo se a tela estiver no escuro.
      const html = document.documentElement;
      previousTheme = html.getAttribute("data-theme");
      html.setAttribute("data-theme", "light");
      html.style.colorScheme = "light";

      previousTitle = document.title;
      document.title = (title || "Documento").trim();
      document.body.classList.add("doc-printing");
    };

    const cleanup = () => {
      if (!active) return;
      active = false;
      touched.splice(0).forEach(({ el, cls }) => el.classList.remove(cls));
      const html = document.documentElement;
      if (previousTheme === null) html.removeAttribute("data-theme");
      else html.setAttribute("data-theme", previousTheme);
      html.style.colorScheme = "";
      document.title = previousTitle;
      document.body.classList.remove("doc-printing");
    };

    window.addEventListener("beforeprint", prepare);
    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("beforeprint", prepare);
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, [rootRef, title]);
}
