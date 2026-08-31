import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RevealOnScroll from "@/components/UI/RevealOnScroll";

export default function FLLHighlightSeason() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/images/showLive/backgrounds/background_bioglow.webp')",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute right-[-120px] bottom-[-120px] h-80 w-80 rounded-full border border-[#CF2A2A40]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24">
        <RevealOnScroll>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-5xl font-black leading-tight md:text-6xl text-white">
                BIO
                <span className="text-[#6FA61C]">GLOW</span>
              </h2>

              <p className="mt-8 max-w-xl text-lg leading-8 text-white/80">
                A biodiversidade mantém nosso planeta saudável. Na floresta
                tropical, desde os menores insetos até as árvores imponentes,
                existem inúmeras espécies de plantas e animais que dependem umas
                das outras para sobreviver. Nesta temporada, identifique um
                problema que coloque a biodiversidade em risco e crie uma
                solução inovadora que possa ajudar.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/fll/quickbrick" className="btn btn-primary btn-lg">
                  Explorar QuickBrick
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/fll/docs"
                  className="btn btn-outline btn-lg border-white/30 text-white hover:bg-white hover:text-[#024959]"
                >
                  Documentações
                </Link>
              </div>
              <a
                href="https://www.magnific.com/free-vector/biodiversity-lush-jungle-scene_414486609.htm#fromView=keyword&page=1&position=4&uuid=b252f0c5-4134-41eb-854b-0731336dcd8e&track=ais_hybrid&query=River+biodiversity"
                className="text-xs opacity-80"
              >
                Imagem de freepik
              </a>
            </div>

            {/* Logo */}
            <div className="relative flex justify-center">
              <div className="absolute h-96 w-96 rounded-full bg-[#6FA61C]/20 blur-3xl" />

              <div className="relative">
                <img
                  src="/images/logos/fll/seasons/bioglow_logo.png"
                  alt="BIOGLOW"
                  className="h-54 w-auto object-contain transition duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
