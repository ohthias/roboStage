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
          <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="space-y-6">
            <div className="flex justify-start">
              <span className="badge badge-primary badge-outline badge-sm font-semibold tracking-widest uppercase hidden sm:inline-block">
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
                className="btn btn-primary btn-md flex items-center gap-2"
                onClick={() => {
                  window.location.href = "/auth/signup";
                }}
              >
                Começar agora
              </button>
              <button
                className="btn btn-default btn-soft btn-md flex items-center gap-2"
                onClick={() => {
                  window.location.href = "/about";
                }}
              >
                Saiba mais <ArrowRight className="ml-2" />
              </button>
            </div>
          </div>
          <img src="https://i.ytimg.com/vi/7FF8l9PAOQs/sddefault.jpg" alt="" className="rounded-3xl shadow-xl w-full max-w-lg max-h-68 object-cover" />
          </div>
        </div>
      </RevealOnScroll>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20 z-10">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}
