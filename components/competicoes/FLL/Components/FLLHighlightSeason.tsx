import Link from "next/link";
import { ArrowRight, BookOpen, Leaf, Sparkles } from "lucide-react";
import RevealOnScroll from "@/components/UI/RevealOnScroll";

export default function FLLHighlightSeason() {
  return (
    <section className="group/season relative isolate w-full overflow-hidden bg-[#07110A]">
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-1000 group-hover/season:scale-[1.02]"
        style={{
          backgroundImage:
            "url('/images/showLive/backgrounds/background_bioglow.webp')",
        }}
      />

      {/* Contrast overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/70 to-black/45"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 via-transparent to-black/20"
      />

      {/* Decorative elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 -z-10 size-80 rounded-full border border-[#6FA61C]/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 -z-10 size-56 rounded-full border border-[#6FA61C]/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-20 -z-10 size-80 rounded-full border-[32px] border-[#6FA61C]/5"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <RevealOnScroll>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 xl:gap-16">
            {/* Season information */}
            <div className="min-w-0">
              <h2 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                BIO
                <span className="text-[#8CC63F]">GLOW</span>
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                A biodiversidade mantém nosso planeta saudável. Das menores
                espécies às árvores imponentes, a vida depende de um equilíbrio
                essencial para sobreviver. Nesta temporada, identifique um
                problema que coloque a biodiversidade em risco e desenvolva
                uma solução inovadora para ajudar a preservá-la.
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/fll/quickbrick"
                  className="group/button inline-flex min-h-12 items-center justify-center gap-3 rounded-tl-xl rounded-br-xl bg-primary px-6 py-3 text-sm font-bold text-primary-content shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-base"
                >
                  <Sparkles size={18} />
                  Explorar QuickBrick
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover/button:translate-x-1"
                  />
                </Link>

                <Link
                  href="/fll/docs"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-tl-xl rounded-br-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-base"
                >
                  <BookOpen size={18} />
                  Documentações
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3 text-xs text-white/50">
                <span className="h-px w-8 bg-[#8CC63F]/70" />
                Explore. Descubra. Preserve.
              </div>
            </div>

            {/* Season logo */}
            <div className="relative flex min-w-0 items-center justify-center py-6 sm:py-10 lg:py-0">
              <div
                aria-hidden="true"
                className="absolute size-56 rounded-full bg-[#6FA61C]/20 blur-3xl transition-all duration-700 group-hover/season:bg-[#6FA61C]/30 sm:size-80 lg:size-96"
              />

              <div
                aria-hidden="true"
                className="absolute size-64 rounded-full border border-[#8CC63F]/15 sm:size-80 lg:size-[26rem]"
              />

              <div className="relative w-full max-w-[460px] transition-transform duration-500 hover:scale-[1.03]">
                <img
                  src="/images/logos/fll/seasons/bioglow_logo.png"
                  alt="Logo da temporada BIOGLOW da FIRST LEGO League"
                  className="h-auto w-full object-contain drop-shadow-[0_0_35px_rgba(140,198,63,0.18)]"
                />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/* Image credit */}
      <div className="absolute bottom-2 right-4 text-[10px] text-white/40 sm:right-6 lg:right-8">
        Imagem de fundo: Freepik
      </div>
    </section>
  );
}