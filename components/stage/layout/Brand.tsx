import Link from "next/link";
import { cn } from "../lib";

/* ------------------------------------------------------------------ */
/*  Logo — idêntico ao components/UI/Logo.tsx (black, itálico, caixa- */
/*  alta, "Stage" em vermelho). Mesma API: logoSize + redirectIndex.  */
/* ------------------------------------------------------------------ */

const sizes = {
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
};

export function Logo({
  logoSize = "xl",
  redirectIndex,
  className,
}: {
  logoSize?: keyof typeof sizes;
  redirectIndex?: boolean;
  className?: string;
}) {
  const mark = (
    <span className={cn("font-black uppercase italic tracking-tight text-base-content", sizes[logoSize], className)}>
      Robo<span className="text-primary">Stage</span>
    </span>
  );
  if (!redirectIndex) return mark;
  return (
    <Link href="/" aria-label="Página inicial RoboStage" className="opacity-80 transition-opacity duration-300 hover:opacity-100">
      {mark}
    </Link>
  );
}
