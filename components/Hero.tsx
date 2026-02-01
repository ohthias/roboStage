import { ArrowRight, ChevronDown } from "lucide-react";
import Logo from "./UI/Logo";
import RevealOnScroll from "./UI/RevealOnScroll";

export default function Hero() {
  return (
    <section className="hero h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-base-100/50 to-base-300"></div>
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <RevealOnScroll>
        <div className="hero-content relative z-10 px-8 pt-16 max-w-7xl">
          <div className="space-y-6">
            <div className="flex justify-start">
              <span className="badge badge-primary badge-outline badge-sm font-semibold tracking-widest uppercase">
                Onde estratégias ganham vida
              </span>
            </div>

            <Logo logoSize="6xl" redirectIndex={false} />

            <p className="text-base md:text-xl text-base-content/60 max-w-xl font-medium leading-relaxed mt-2">
              Estratégia, dados, testes e eventos reunidos em uma única plataforma para
              equipes de robótica.
            </p>

            <div className="flex flex-col sm:flex-row justify-start gap-5 pt-4">
              <button
                className="btn btn-primary btn-md px-14 rounded-2xl font-black uppercase tracking-widest bg-robo-red border-none shadow-xl hover:scale-105 transition-transform"
                onClick={() => {
                  window.location.href = "/auth/signup";
                }}
              >
                Começar agora
              </button>
              <button
                className="btn btn-default btn-soft btn-md px-14 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                onClick={() => {
                  window.location.href = "/about";
                }}
              >
                Saiba mais <ArrowRight className="ml-2" />
              </button>
            </div>
          </div>
          <img src="https://placehold.co/500x300" alt="" className="rounded-3xl shadow-xl" />
        </div>
      </RevealOnScroll>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}
