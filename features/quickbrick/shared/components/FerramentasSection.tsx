"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FeatureCard, PillChoice, Reveal } from "@/components/stage";
import { ferramentas, ferramentasPorCompeticao, type SeasonLogo } from "../lib/ferramentas.data";

interface FerramentasSectionProps {
  seasons: string[];
  seasonLogos: Record<string, SeasonLogo>;
  competition: string;
}

// Cor de cada categoria (sombra, aba e ícone do FeatureCard).
const CATEGORY_TONE: Record<string, "primary" | "secondary" | "accent"> = {
  Criar: "primary",
  Simular: "secondary",
  Documentar: "accent",
};

export default function FerramentasSection({ seasons, seasonLogos, competition }: FerramentasSectionProps) {
  const router = useRouter();
  const [categoria, setCategoria] = useState("todas");

  const filtradas = useMemo(() => {
    const allowedTools = ferramentasPorCompeticao[competition] ?? [];
    return ferramentas
      .filter((ferramenta) => allowedTools.includes(ferramenta.id))
      .map((ferramenta) => ({
        ...ferramenta,
        link: ferramenta.link?.replace("/fll/", `/${competition}/`),
      }));
  }, [competition]);

  const categorias = useMemo(() => [...new Set(filtradas.map((f) => f.categoria))], [filtradas]);
  const visiveis = categoria === "todas" ? filtradas : filtradas.filter((f) => f.categoria === categoria);

  return (
    <section aria-label="Ferramentas do QuickBrick" className="space-y-8">
      {categorias.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PillChoice
            label="Filtrar por categoria"
            size="sm"
            value={categoria}
            onChange={setCategoria}
            options={[
              { value: "todas", label: `Todas · ${filtradas.length}` },
              ...categorias.map((c) => ({ value: c, label: `${c} · ${filtradas.filter((f) => f.categoria === c).length}` })),
            ]}
          />
          <p className="stage-kicker text-base-content/45" aria-live="polite">
            / {visiveis.length} {visiveis.length === 1 ? "FERRAMENTA" : "FERRAMENTAS"}
          </p>
        </div>
      )}

      <div className="grid w-full gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
        {visiveis.map((ferramenta, i) => (
          <Reveal key={ferramenta.id} delay={(i % 3) * 60} className="h-full">
            <FeatureCard
              title={ferramenta.titulo}
              description={ferramenta.descricao}
              category={ferramenta.categoria}
              icon={ferramenta.icon}
              href={ferramenta.link}
              image={ferramenta.image}
              index={filtradas.indexOf(ferramenta) + 1}
              badge={ferramenta.badge}
              mobileSafe={ferramenta.mobileSafe}
              credit={ferramenta.feitoPor}
              tone={CATEGORY_TONE[ferramenta.categoria] ?? "primary"}
              extra={ferramenta.customContent?.(seasons, seasonLogos, router) ?? undefined}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
