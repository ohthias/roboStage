"use client";

import { useRouter } from "next/navigation";

type LogoSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

const sizeClasses: Record<LogoSize, string> = {
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

export default function Logo({
  logoSize,
  redirectIndex,
}: {
  logoSize: LogoSize;
  redirectIndex?: boolean;
}) {
  const router = useRouter();

  return (
    <span
      onClick={() => redirectIndex && router.push("/")}
      className={`
        ${sizeClasses[logoSize]}
        font-black uppercase italic tracking-tight transition-opacity duration-300
        ${redirectIndex ? "cursor-pointer opacity-80 hover:opacity-100" : ""}
      `}
      aria-label="Página inicial RoboStage"
      role={redirectIndex ? "button" : undefined}
    >
      Robo<span className="text-primary">Stage</span>
    </span>
  );
}
