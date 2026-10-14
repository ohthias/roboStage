"use client";
import { Activity } from "lucide-react";
import "./style.css";

export default function AnatixPage() {
  return (
    <main className="anatix-hero relative isolate flex min-h-[70vh] max-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Fundo animado */}
      <div className="anatix-background" aria-hidden="true">
        <div className="anatix-glow anatix-glow-one" />
        <div className="anatix-glow anatix-glow-two" />

        <svg
          className="anatix-network"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <linearGradient id="anatix-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity=".4" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g stroke="url(#anatix-line)" strokeWidth="1">
            <path d="M80 150 L260 240 L430 120 L620 230 L820 100 L1080 220" />
            <path d="M120 470 L310 360 L490 510 L700 370 L900 490 L1120 350" />
            <path d="M260 240 L310 360 M430 120 L490 510 M620 230 L700 370 M820 100 L900 490" />
            <path d="M80 150 L120 470 M1080 220 L1120 350" />
          </g>

          <g fill="currentColor">
            {[
              [80, 150], [260, 240], [430, 120], [620, 230],
              [820, 100], [1080, 220], [120, 470], [310, 360],
              [490, 510], [700, 370], [900, 490], [1120, 350],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2.5" className="anatix-node" />
            ))}
          </g>

          <circle r="4" fill="currentColor" className="anatix-particle">
            <animateMotion
              dur="12s"
              repeatCount="indefinite"
              path="M80 150 L260 240 L430 120 L620 230 L820 100 L1080 220"
            />
          </circle>

          <circle r="3" fill="currentColor" className="anatix-particle">
            <animateMotion
              dur="15s"
              repeatCount="indefinite"
              path="M120 470 L310 360 L490 510 L700 370 L900 490 L1120 350"
            />
          </circle>
        </svg>

        <div className="anatix-grid" />
      </div>

      {/* Conteúdo */}
      <section className="relative z-10 flex max-w-3xl flex-col items-center">
        <h1 className="text-5xl font-bold tracking-tight text-base-content sm:text-7xl">
          Anatix<span className="text-primary">.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-base-content/65 sm:text-lg">
          Transforme os dados do seu robô em decisões melhores.
          <span className="mt-2 block">
            Explore o desempenho, identifique padrões e entenda o
            comportamento do seu robô nas competições da OBR e da FLL.
          </span>
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative size-2 rounded-full bg-primary" />
            </span>
            Em desenvolvimento
          </div>

          <div className="h-1 w-36 overflow-hidden rounded-full bg-base-300">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
          </div>
        </div>

        <p className="mt-5 text-xs text-base-content/40">
          Um novo jeito de entender seu robô.
        </p>
      </section>
    </main>
  );
}