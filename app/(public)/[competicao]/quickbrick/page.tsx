"use client";
import FerramentasSection from "../../../../components/QuickBrick/FerramentasSection";
import Header from "@/components/UI/Header";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { ArrowRight, Cuboid } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const seasonLogos: Record<string, { name: string; image: string }> = {
  bioglow: {
    name: "Bioglow (2026/27)",
    image: "/images/logos/fll/seasons/bioglow_logo_founders_edition.webp",
  },
  unearthed: {
    name: "Unearthed (2025/26)",
    image: "/images/logos/fll/seasons/Unearthed.webp",
  },
  submerged: {
    name: "Submerged (2024/25)",
    image: "/images/logos/fll/seasons/Submerged.webp",
  },
};

export default function QuickBrickHome() {
  const params = useParams<{ competicao: string }>();
  const competition = params.competicao;
  const seasons = Object.keys(seasonLogos);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 space-y-8 pt-8 pb-16 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <Header
        type="QuickBrick"
        name="QuickBrick"
        highlight="Studio"
        description="Ferramentas para criar, simular e documentar as estratégias do seu robô durante a temporada."
      />
      <div className="w-full md:hidden px-4">
        <div
          role="status"
          aria-live="polite"
          className="alert alert-warning shadow-lg my-4"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M21 16.5V12a9 9 0 10-18 0v4.5A2.5 2.5 0 005.5 21h13A2.5 2.5 0 0021 16.5z"
              />
            </svg>
            <span>
              Algumas funcionalidades funcionam somente em telas maiores —
              acesse em um notebook ou desktop para a melhor experiência.
            </span>
          </div>
        </div>
      </div>
      {/* Seção de Ferramentas */}
      <FerramentasSection
        competition={competition}
        seasons={seasons}
        seasonLogos={seasonLogos}
      />
      <section className="px-6 py-16">
        <RevealOnScroll>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-secondary px-8 py-14 text-secondary-content sm:px-14">
            {/* formas */}
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 size-64 rounded-full border-[28px] border-accent/90"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-10 right-40 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-primary"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-8 right-12 size-10 rounded-full border-2 border-dashed border-secondary-content/40"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px]"
            />

            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-secondary-content/70">
                <Cuboid size={14} />
                Suas estratégias, salvas no seu perfil
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                Projete, teste e registre sua evolução.
              </h2>
              <p className="mt-5 max-w-xl text-secondary-content/80">
                Ao acessar o QuickBrick Studio pela sua conta RoboStage, você
                pode criar e simular estratégias, explorar modelos 3D e gerar
                relatórios detalhados do seu robô. Registre testes, documente
                alterações e acompanhe a evolução dos seus projetos ao longo de
                toda a temporada.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/quickbrick"
                  className="btn btn-primary btn-lg"
                >
                  Acessar o QuickBrick Studio
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-ghost btn-lg text-secondary-content hover:bg-secondary-content/10"
                >
                  Crie sua primeira estratégia
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}
