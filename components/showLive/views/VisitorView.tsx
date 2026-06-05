"use client";

import Link from "next/link";

import { LogOut } from "lucide-react";

import TabelaEquipes from "../TabelaEquipes";

interface Props {
  event: any;
}

export default function PublicView({ event }: Props) {
  const colors = Array.isArray(event?.colors) ? event.colors : [];
  const primaryColor = colors[0] || "#111827";
  const secondaryColor = colors[1] || "#9333ea";
  const textColor = colors[2] || "#ffffff";

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{
        backgroundColor: primaryColor,
        backgroundImage: event.background_url
          ? `url(${event.background_url})`
          : undefined,

        backgroundSize: "cover",

        backgroundPosition: "center",
      }}
    >
      <div className={`
        absolute inset-0
        bg-gradient-to-b
        from-black/50
        via-black/70
        to-black/90
        w-full h-full
        ${event.background_blur ? "backdrop-blur-md" : ""}
      `} />
      {/* EXIT */}
      <div className="absolute top-4 right-4 z-50">
        <Link
          href="/universe"
          className="
            btn btn-outline
            border-white/10
            bg-black/20
            text-white
            backdrop-blur-xl
            hover:bg-white/10
            hover:border-white/20
            gap-2
          "
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Link>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mt-8">
          <TabelaEquipes
            idEvent={String(event.id_evento)}
            nameEvent={event.name_event}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            textColor={textColor}
            backgroundUrl={event.background_url}
            backgroundBlur={event.background_blur ?? true}
          />
        </div>
      </div>
    </div>
  );
}
