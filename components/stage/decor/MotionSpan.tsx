"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePauseOffscreen } from "../core/Motion";

/**
 * Casca HTML para animações CSS de enfeite (stickers, mascote).
 * Anima um <span> e não o <svg> (vai para a GPU, filtros rasterizados uma
 * vez só) e se pausa sozinha quando sai da tela.
 */
export function MotionSpan({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = usePauseOffscreen<HTMLSpanElement>();
  return (
    <span ref={ref} className={className} style={style}>
      {children}
    </span>
  );
}
