"use client";

import type { CSSProperties } from "react";
import { bgVar, solidVar } from "./editor-colors";
import { coverImageUrl, parseDocCover, type DocCoverValue } from "@/utils/stagebook/doc-cover";
import "./editor.css";

export function docCoverStyle(v: DocCoverValue): CSSProperties {
  switch (v.kind) {
    case "color":
      return { backgroundColor: v.hex };
    case "palette":
      // Um leve degradê sobre a cor dá profundidade sem perder a identidade da paleta.
      return v.mode === "solid"
        ? { background: solidVar(v.id) }
        : { background: bgVar(v.id) };
    case "gradient":
      return { backgroundImage: `var(--ed-grad-${v.id})` };
    case "image":
      return {
        backgroundImage: `url(${coverImageUrl(v.id)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
  }
}

/** Faixa de capa da página. Aceita o valor cru do banco (inclusive hex antigo). */
export function DocCover({
  value,
  className = "",
}: {
  value: string | DocCoverValue | null | undefined;
  className?: string;
}) {
  const v = typeof value === "string" || value == null ? parseDocCover(value) : value;
  if (!v) return null;
  return <div aria-hidden className={`w-full ${className}`} style={docCoverStyle(v)} />;
}
