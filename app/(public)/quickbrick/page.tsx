"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import FerramentasSection from "./FerramentasSection";

const seasonLogos: Record<string, { name: string; image: string }> = {
  unearthed: {
    name: "Unearthed (2025/26)",
    image: "/images/logos/Unearthed.webp",
  },
  submerged: {
    name: "Submerged (2024/25)",
    image: "/images/logos/Submerged.webp",
  },
};

export default function QuickBrickHome() {
  const [seasons, setSeasons] = useState<string[]>([]);

  useEffect(() => {
    setSeasons(Object.keys(seasonLogos));
  }, []);

  return (
    <div className="flex flex-col items-start w-full">
      <Navbar />
      <main className="flex flex-col w-full px-4 md:px-8">
        <Breadcrumbs />

        {/* Header animado */}
        <section className="w-full flex flex-col items-center text-center px-4 py-8">
          <article className="max-w-3xl">
            <h1 className="text-4xl font-bold text-primary mb-4">
              QuickBrick Studio
            </h1>

            <p className="text-base-content text-lg opacity-90 leading-relaxed">
              Bem-vindo ao{" "}
              <span className="font-semibold text-primary">
                QuickBrick Studio
              </span>
              ! Aqui você encontra ferramentas para{" "}
              <span className="text-secondary font-semibold">
                criar, simular e documentar
              </span>{" "}
              estratégias do seu robô durante o{" "}
              <span className="font-semibold text-secondary">
                FIRST LEGO League Challenge
              </span>
              .
            </p>
          </article>
        </section>
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
        <FerramentasSection seasons={seasons} seasonLogos={seasonLogos} />
      </main>
      <Footer />
    </div>
  );
}
