import { Cog } from "lucide-react";
import RevealOnScroll from "../UI/RevealOnScroll";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-base-100 pt-12 pb-10 md:pt-20 md:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-base-content mb-6 tracking-tight leading-tight">
              Elevando a Robótica a um <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-800">
                Novo Patamar de Gestão.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-base-content leading-relaxed mb-8 px-2">
              O RoboStage é a plataforma definitiva para transformar o caos de
              planilhas e documentos espalhados em uma estrutura organizada e
              eficiente para treinos e torneios.
            </p>
          </div>
        </RevealOnScroll>
      </div>

      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-[0.03] md:opacity-5 pointer-events-none">
        <Cog className="w-96 h-96 md:w-[500px] md:h-[500px] text-base-300 animate-spin-slow" />
      </div>
    </section>
  );
};
