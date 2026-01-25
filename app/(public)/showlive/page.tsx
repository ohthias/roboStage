"use client";
import { Navbar } from "@/components/UI/Navbar";
import { ArrowRightFromLine, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import Features from "./Features";
import DashboardPreview from "./Dashboard";
import { Footer } from "@/components/UI/Footer";

export default function ShowLivePage() {
  const router = useRouter();
  return (
    <>
      <Navbar />
      <header className="hero h-96 bg-gradient-to-b from-base-200 to-base-300 relative overflow-hidden">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-base-content">
              Show<span className="text-primary">Live</span>
            </h1>
            <p className="py-6 text-base-content/70">
              Transmita suas competições de robótica ao vivo com o ShowLive, a
              plataforma para eventos de robótica da FLL.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  router.push("auth/signup");
                }}
              >
                Começar Transmissão
                <ArrowRightFromLine className="w-5 h-5 ml-1 opacity-70" />
              </button>
              <button
                className="btn btn-primary btn-dash"
                onClick={() => {
                  router.push("universe");
                }}
              >
                Assistir Transmissão
              </button>
            </div>
          </div>
        </div>
        <Radio className="absolute right-4 -bottom-20 text-base-content/10 h-64 w-64 -rotate-45" />
      </header>
      <DashboardPreview />
      <Features />
      {/* Screenshots */}
      <section className="py-24 bg-base-100 px-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Interface Intuitiva e Fácil de Usar
            </h2>
            <p className="text-xl text-base-content/60 max-w-2xl mx-auto">
              O ShowLive oferece uma interface amigável que facilita a gestão
              das transmissões ao vivo, permitindo que você se concentre no que
              realmente importa: o evento.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src="/showlive/screenshots/interface.png"
              alt="ShowLive Interface Screenshot"
              className="rounded-lg shadow-lg border border-base-300 max-w-full h-auto"
            />
          </div>
        </div>
      </section>
      {/* CTA */}
      <div className="bg-base-300 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-base-content">
          Pronto para começar?
        </h2>
        <p className="mb-8 text-base-content/70">
          Junte-se a nós e leve suas transmissões de robótica ao próximo nível
          com o ShowLive.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            router.push("auth/signup");
          }}
        >
          Iniciar Transmissão Agora
        </button>
      </div>
      <Footer />
    </>
  );
}
