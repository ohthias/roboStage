import Link from "next/link";
import { ArrowRight, Sparkles, Calendar, Trophy } from "lucide-react";

export default function FLLHighlightSeason() {
  return (
    <section className="relative overflow-hidden bg-[#024959] text-primary-content">
      <div className="absolute inset-0 bg-gradient-to-br from-[#024959] via-[#03586b] to-[#013541]" />
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#6FA61C]/20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#CF2A2A]/20 blur-3xl" />
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full border border-[#6FA61C40]" />
      <div className="absolute right-[-120px] bottom-[-120px] h-80 w-80 rounded-full border border-[#CF2A2A40]" />

      <div className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              BIO
              <span className="text-[#6FA61C]">GLOW</span>
            </h2>

            <p className="mt-8 text-lg leading-8 text-white/80 max-w-xl">
                A temporada 2026/2027 da FIRST® LEGO® League Challenge, BIOGLOW, convida equipes a explorar o mundo microscópico e descobrir como os organismos vivos interagem com seu ambiente.
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
          </div>

          {/* Logo */}

          <div className="relative flex justify-center">
            <div className="absolute h-96 w-96 rounded-full bg-[#6FA61C]/20 blur-3xl" />
            <div className="relative">
              <img
                src="/images/logos/fll/seasons/bioglow_logo.png"
                alt="BIOGLOW"
                className="h-72 w-auto object-contain transition duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}