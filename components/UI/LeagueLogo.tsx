"use client";

import Image from "next/image";
import { useState } from "react";
import { getLeagueBrand, leagueMonogram } from "@/utils/competitions/league-branding";

/**
 * Vitrine do logo de uma liga. Sem logo cadastrado (ou se o arquivo falhar),
 * mostra o monograma do código no estilo do RoboStage.
 */
export function LeagueLogo({
  league,
  size = "md",
  className = "",
}: {
  league: { code: string; name: string };
  /** sm: miniatura para listas/resumos; md: vitrine do card. */
  size?: "sm" | "md";
  className?: string;
}) {
  const small = size === "sm";
  const brand = getLeagueBrand(league);
  const [failed, setFailed] = useState(false);
  const logo = failed ? undefined : brand.logo;

  if (!logo) {
    return (
      <div
        className={`relative grid place-items-center overflow-hidden bg-base-200 ${className}`}
        aria-hidden="true"
      >
        <span
          className={`absolute rotate-12 ${small ? "-right-3 -top-3 size-8" : "-right-6 -top-6 size-20"} rounded-tl-2xl rounded-br-2xl opacity-80`}
          style={{ backgroundColor: brand.color }}
        />
        <span className={`relative font-black ${small ? "text-sm" : "text-4xl"} uppercase italic tracking-tight text-base-content`}>
          {leagueMonogram(league.code)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${small ? "p-1.5" : "p-4"} ${
        logo.onDark ? "bg-[#1f1c18]" : "bg-[#f7f4ec]"
      } ${className}`}
    >
      <Image
        src={logo.src}
        alt={`Logo ${league.name}`}
        width={logo.width}
        height={logo.height}
        sizes={small ? "64px" : "240px"}
        onError={() => setFailed(true)}
        className={`h-full w-auto ${small ? "max-h-7" : "max-h-20"} max-w-full object-contain`}
      />
      {logo.seasonLabel && !small && (
        <span className="absolute bottom-1.5 right-2 font-mono text-[9px] font-bold tracking-[0.15em] text-[#494234]/70 uppercase">
          {logo.seasonLabel}
        </span>
      )}
    </div>
  );
}
