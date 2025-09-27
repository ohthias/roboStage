"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

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
  const router = useRouter();
  const [seasons, setSeasons] = useState<string[]>([]);

  useEffect(() => {
    setSeasons(Object.keys(seasonLogos));
  }, []);

  return (
    <div className="flex flex-col items-start w-full">
      <Navbar />
      <Breadcrumbs />
      <div className="flex flex-col items-center w-full py-6">
        <h1 className="text-3xl font-bold text-primary mb-4">QuickBrick Studio</h1>
        <p className="text-center text-base-content max-w-3xl px-4 mb-6">
          Bem-vindo ao QuickBrick Studio! Aqui você pode acessar ferramentas para planejar estratégias
          para seu robô durante o FIRST LEGO League Challenge.
        </p>

        {/* Ferramentas disponíveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 max-w-6xl">
          {/* Estratégias */}
          <div
            className="card bg-base-100 shadow-md border border-base-300 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => router.push("/quickbrick/estrategia")}
          >
            <div className="card-body items-center text-center">
              <img src="/images/quickbrick_unearthed.png" alt="Imagem do tapete Unearthed" className="mb-2 aspect-[16/9] object-cover h-36 rounded-box" />
              <h2 className="card-title">Estratégias</h2>
              <p className="text-sm">Desenhe diretamente sobre a imagem do tapete e planeje cada movimento do seu robô.</p>
            </div>
          </div>

          {/* Matriz SWOT */}
          <div className="card bg-base-100 shadow-md border border-base-300 cursor-pointer hover:shadow-lg transition-all">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Matriz SWOT</h2>
              <p className="text-sm mb-2">Escolha uma temporada para organizar as missões em Forças, Fraquezas, Oportunidades e Ameaças.</p>

              {/* Temporadas disponíveis */}
              <div className="flex flex-wrap gap-3 justify-center">
                {seasons.map((s) => {
                  const season = seasonLogos[s];
                  return (
                    <div
                      key={s}
                      className="card w-28 aspect-square shadow-md border border-base-300 cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => router.push(`/quickbrick/matriz-swot/${s}`)}
                    >
                      <figure className="p-2">
                        <img
                          src={season?.image || "/images/icons/default-season.png"}
                          alt={season?.name || s}
                          className="rounded-md object-contain"
                        />
                      </figure>
                      <div className="card-body p-2 text-center">
                        <p className="text-xs font-semibold">{season?.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
