"use client";

import { forwardRef, useState, type ComponentProps } from "react";
import Link from "next/link";

/**
 * Link que faz o prefetch completo da página (dados do servidor incluídos)
 * quando a pessoa demonstra intenção — passa o mouse, foca ou toca. Até lá
 * fica no prefetch padrão (só o esqueleto do loading.tsx). Assim abrir uma
 * página da árvore costuma ser instantâneo, sem baixar todas de antemão.
 *
 * O conteúdo pré-carregado pode ficar alguns minutos em cache no navegador;
 * o editor compara com o último autosave desta aba (doc-content-cache.ts) e
 * nunca mostra uma versão mais antiga do que a que foi salva.
 */
export const IntentLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(
  function IntentLink({ onMouseEnter, onFocus, onTouchStart, prefetch, ...props }, ref) {
    const [intent, setIntent] = useState(false);
    return (
      <Link
        ref={ref}
        {...props}
        prefetch={intent ? true : prefetch}
        onMouseEnter={(event) => {
          setIntent(true);
          onMouseEnter?.(event);
        }}
        onFocus={(event) => {
          setIntent(true);
          onFocus?.(event);
        }}
        onTouchStart={(event) => {
          setIntent(true);
          onTouchStart?.(event);
        }}
      />
    );
  },
);
