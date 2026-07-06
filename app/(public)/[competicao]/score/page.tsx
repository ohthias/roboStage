import { Footer } from "@/components/UI/Footer";
import Header from "@/components/UI/Header";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "FLL Score",
  description:
    "Pontuador da FIRST LEGO League (FLL) para calcular a pontuação da sua equipe.",
};

const seasons = [
  {
    slug: "unearthed",
    title: "UNEARTHED",
    description:
      "Descubra o passado para construir o futuro através da arqueologia e tecnologia.",
    image: "/images/logos/fll/seasons/Unearthed.webp",
    badge: "2025–2026",
    accent: "primary",
  },
  {
    slug: "submerged",
    title: "SUBMERGED",
    description:
      "Explore os oceanos e desenvolva soluções para proteger nossos ecossistemas aquáticos.",
    image: "/images/logos/fll/seasons/Submerged.webp",
    badge: "2024–2025",
    accent: "secondary",
  },
  {
    slug: "masterpiece",
    title: "MASTERPIECE",
    description:
      "Celebre a criatividade, arte e inovação através da tecnologia.",
    image: "/images/logos/fll/seasons/Masterpiece.png",
    badge: "2023–2024",
    accent: "accent",
  },
];

export default function ScorePage() {
  return (
    <div className="bg-base-200">
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-12">
        <Header type="Pontuador" name="Pontuadores da" highlight="FLL" description="Escolha uma temporada. E comece a calcular a pontuação da sua equipe." /> 

        <section className="mx-auto max-w-5xl px-4 py-12 pb-24">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {seasons.map((season) => (
              <Link
                key={season.slug}
                href={`/fll/score/${season.slug}`}
                className="group"
              >
                <div className="card bg-base-100 rounded-none rounded-tl-[30px] rounded-br-[30px] shadow-md flex flex-col overflow-hidden relative hover:scale-105 transition-all duration-300 hover:shadow-[10px_10px_0_theme(colors.primary)] cursor-default select-none h-full">
                  {/* Image */}
                  <figure className="relative h-56 overflow-hidden">
                    <img
                      src={season.image}
                      alt={season.title}
                      className="object-contain max-h-36 transition-transform duration-500 group-hover:scale-105"
                    />
                  </figure>

                  <div className="card-body gap-3 p-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="card-title text-xl font-black tracking-wide leading-tight">
                        {season.title}
                      </h2>
                      <div className="badge badge-outline badge-sm shrink-0 mt-0.5 font-mono">
                        {season.badge}
                      </div>
                    </div>

                    <p className="text-base-content/60 text-sm leading-relaxed">
                      {season.description}
                    </p>

                    {/* CTA */}
                    <div className="card-actions mt-4 group/cta">
                      <button className={`btn btn-${season.accent} btn-sm w-full gap-2 group-hover/cta:shadow-md transition-shadow`}>
                        Abrir pontuador
                        <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}