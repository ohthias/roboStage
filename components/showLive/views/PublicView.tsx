"use client";

import Link from "next/link";

import { LogOut, Radio, Trophy, Users } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: primaryColor,

          backgroundImage: event.background_url
            ? `url(${event.background_url})`
            : undefined,

          backgroundSize: "cover",

          backgroundPosition: "center",
        }}
      />

      {/* OVERLAY */}
      <div
        className={`
          absolute inset-0
          bg-gradient-to-b
          from-black/50
          via-black/70
          to-black/90
          ${event.background_blur ? "backdrop-blur-md" : ""}
        `}
      />

      {/* EXIT */}
      <div className="absolute top-6 right-6 z-50">
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
      <div className="relative z-10">
        {/* HERO */}
        <div className="container mx-auto px-4 pt-8">
          <div
            className="
            hero
            rounded-[2rem]
            border border-white/10
            bg-black/30
            backdrop-blur-2xl
            shadow-2xl
            overflow-hidden
          "
          >
            <div
              className="
              hero-content
              flex-col
              lg:flex-row
              justify-between
              items-start
              lg:items-center
              w-full
              p-8
              gap-8
            "
            >
              {/* LEFT */}
              <div>
                <div className="flex flex-wrap gap-3 mb-5">
                  <div
                    className="
                      badge
                      badge-lg
                      border-none
                      shadow-lg
                      gap-2
                    "
                    style={{
                      backgroundColor: secondaryColor,

                      color: textColor,
                    }}
                  >
                    <Radio className="w-4 h-4" />
                    Público
                  </div>

                  <div
                    className="
                    badge
                    badge-outline
                    badge-lg
                    text-white
                    border-white/20
                    gap-2
                  "
                  >
                    <Users className="w-4 h-4" />
                    Ao vivo
                  </div>
                </div>

                <h1
                  className="
                    text-5xl
                    md:text-7xl
                    font-black
                    leading-none
                  "
                  style={{
                    color: textColor,
                  }}
                >
                  {event.name_event}
                </h1>

                <p
                  className="
                    mt-5
                    text-lg
                    max-w-2xl
                    leading-relaxed
                  "
                  style={{
                    color: `${textColor}CC`,
                  }}
                >
                  Acompanhe o ranking, pontuações e playoffs do evento em tempo
                  real através do RoboStage ShowLive.
                </p>
              </div>

              {/* RIGHT STATS */}
              <div
                className="
                stats
                stats-vertical
                lg:stats-horizontal
                shadow-2xl
                border border-white/10
                bg-black/40
                backdrop-blur-xl
              "
              >
                <div className="stat">
                  <div className="stat-figure text-warning">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <div className="stat-title text-white/60">Status</div>

                  <div
                    className="stat-value text-3xl"
                    style={{
                      color: secondaryColor,
                    }}
                  >
                    LIVE
                  </div>

                  <div className="stat-desc text-white/40">Evento ativo</div>
                </div>

                <div className="stat">
                  <div className="stat-title text-white/60">Acesso</div>

                  <div
                    className="stat-value text-3xl"
                    style={{
                      color: textColor,
                    }}
                  >
                    Público
                  </div>

                  <div className="stat-desc text-white/40">
                    Visualização aberta
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-8">
          <TabelaEquipes
            idEvent={String(event.id_evento)}
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
