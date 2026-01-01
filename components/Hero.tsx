import { ArrowRight, ChevronDown } from "lucide-react";
import Logo from "./ui/Logo";
import RevealOnScroll from "./ui/RevealOnScroll";

export default function Hero() {
  return (
    <section className="hero h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-base-100/50 to-base-300"></div>

      <RevealOnScroll>
        <div className="hero-content relative z-10 text-center px-6 pt-28">
          <div className="max-w-5xl space-y-10">
            <div className="flex justify-center">
              <span className="badge badge-outline badge-sm font-semibold tracking-widest uppercase">
                Onde estratégias ganham vida
              </span>
            </div>

            <Logo logoSize="6xl" redirectIndex={false} />

            <p className="text-base md:text-xl text-base-content/60 max-w-xl mx-auto font-medium leading-relaxed mt-2">
              Estratégia, dados e testes reunidos em uma única plataforma para
              equipes de robótica.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
              <button
                className="btn btn-primary btn-md px-14 rounded-2xl font-black uppercase tracking-widest bg-robo-red border-none shadow-xl hover:scale-105 transition-transform"
                onClick={() => {
                  window.location.href = "/auth/signup";
                }}
              >
                Começar agora
              </button>
              <button
                className="btn btn-default btn-outline btn-md px-14 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                onClick={() => {
                  window.location.href = "/about";
                }}
              >
                Saiba mais <ArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </RevealOnScroll>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}
