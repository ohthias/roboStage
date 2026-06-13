"use client";
import { Footer } from "@/components/UI/Footer";
import Link from "next/link";

const seasons = [
  {
    slug: "unearthed",
    title: "UNEARTHED",
    description:
      "Descubra o passado para construir o futuro através da arqueologia e tecnologia.",
    image: "/images/logos/Unearthed.webp",
    badge: "2025–2026",
    accent: "primary",
  },
  {
    slug: "submerged",
    title: "SUBMERGED",
    description:
      "Explore os oceanos e desenvolva soluções para proteger nossos ecossistemas aquáticos.",
    image: "/images/logos/Submerged.webp",
    badge: "2024–2025",
    accent: "secondary",
  },
  {
    slug: "masterpiece",
    title: "MASTERPIECE",
    description:
      "Celebre a criatividade, arte e inovação através da tecnologia.",
    image: "/images/logos/Masterpiece.png",
    badge: "2023–2024",
    accent: "accent",
  },
];

export default function ScorePage() {
  return (
    <>
      <main className="min-h-screen bg-base-200">
        {/* Hero */}
        <section className="relative overflow-hidden py-8 px-4">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(var(--fallback-bc,oklch(var(--bc))) 1px, transparent 1px), linear-gradient(90deg, var(--fallback-bc,oklch(var(--bc))) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <h1 className="text-6xl font-black tracking-tight leading-none mb-4">
              Escolha uma{" "}
              <span className="text-primary">temporada</span>
            </h1>

            <p className="text-base-content/60 text-lg max-w-md mx-auto leading-relaxed">
              Selecione a temporada da{" "}
              <span className="font-semibold text-base-content/80">
                FIRST LEGO League
              </span>{" "}
              para calcular a pontuação da sua equipe.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 pb-24">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {seasons.map((season) => (
              <Link
                key={season.slug}
                href={`/fll/score/${season.slug}`}
                className="group"
              >
                <div className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-[0_0_40px_-8px] hover:shadow-primary/30 transition-all duration-300 h-full overflow-hidden">
                  {/* Image */}
                  <figure className="relative bg-base-300 h-56 overflow-hidden">
                    <img
                      src={season.image}
                      alt={season.title}
                      className="object-contain max-h-40 transition-transform duration-500 group-hover:scale-110"
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
                    <div className="card-actions mt-4">
                      <button className={`btn btn-${season.accent} btn-sm w-full gap-2 group-hover:shadow-md transition-shadow`}>
                        Abrir pontuador
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                          />
                        </svg>
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
    </>
  );
}