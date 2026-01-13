import { StrategyBoard } from "@/components/QuickBrick/EstrategiaSaida/StrategyBoard";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";

interface GeradorSaidasPageProps {
  params: {
    season: string;
  };
}

export default function GeradorSaidasPage({ params }: GeradorSaidasPageProps) {
  const season = params.season

  return (
    <div>
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />

        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            Gerador de Saídas
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Crie e organize as saídas do robô com suas missões, ordene-as de
            acordo com a estratégia e a execução desejada, e exporte os dados
            para análise comparativa.
          </p>
        </section>

        <div className="flex justify-center mt-8 mb-16 h-screen">
          <StrategyBoard seasonSelect={season} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
