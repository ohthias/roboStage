"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import FerramentasSection from "./FerramentasSection";
import Header from "@/components/UI/Header";

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
      <main className="flex flex-col w-full px-4 md:px-8 space-y-8 pb-16">
        <Breadcrumbs />

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
        <FerramentasSection seasons={seasons} seasonLogos={seasonLogos} />
      </main>
      <Footer />
    </div>
  );
}
