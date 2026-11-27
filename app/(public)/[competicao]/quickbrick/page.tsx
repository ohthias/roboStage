"use client";
import { asset } from "@/lib/assets";
import FerramentasSection from "@/features/quickbrick/shared/components/FerramentasSection";
import Header from "@/components/layout/Header";
import { ArrowRight, Cuboid, FileText, Monitor, PencilRuler, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { ButtonLink, Callout, Chip, Gear, Reveal, Section, Starburst } from "@/components/stage";

const seasonLogos: Record<string, { name: string; image: string }> = {
  bioglow: {
    name: "Bioglow (2026/27)",
    image: asset("/images/seasons/fll/bioglow_logo_founders_edition.webp"),
  },
  unearthed: {
    name: "Unearthed (2025/26)",
    image: asset("/images/seasons/fll/Unearthed.webp"),
  },
  submerged: {
    name: "Submerged (2024/25)",
    image: asset("/images/seasons/fll/Submerged.webp"),
  },
};

export default function QuickBrickHome() {
  const params = useParams<{ competicao: string }>();
  const competition = params.competicao;
  const seasons = Object.keys(seasonLogos);

  return (
    <main className="overflow-x-clip">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-24 pt-8">
        <Header
          type="QuickBrick"
          name="QuickBrick"
          highlight="Studio"
          description="Ferramentas para criar, simular e documentar as estratégias do seu robô durante a temporada."
        >
          <Chip icon={<PencilRuler size={14} />}>Criar</Chip>
          <Chip icon={<Cuboid size={14} />}>Simular</Chip>
          <Chip icon={<FileText size={14} />}>Documentar</Chip>
        </Header>

        <Callout type="info" title="Melhor no computador" className="md:hidden">
          <span className="inline-flex items-start gap-2">
            <Monitor size={16} className="mt-1 shrink-0" />
            Algumas ferramentas funcionam só em telas maiores. As marcadas com “Mobile” rodam bem no celular.
          </span>
        </Callout>

        <FerramentasSection competition={competition} seasons={seasons} seasonLogos={seasonLogos} />
      </div>

      <Section tone="secondary" edgeTop="studs" innerClassName="stage-grid-on-color relative overflow-hidden">
        <Gear size={200} tone="accent" motion="spin" className="absolute -right-12 -top-10 hidden sm:inline-block" />
        <Starburst size={56} tone="paper" rotate={12} className="absolute bottom-12 right-28 hidden md:inline-grid" />
        <Reveal>
          <div className="relative mx-auto max-w-6xl">
            <p className="stage-kicker inline-flex items-center gap-2 text-secondary-content/70">
              <Cuboid size={14} /> / SUAS ESTRATÉGIAS, SALVAS NO SEU PERFIL
            </p>
            <h2 className="stage-display mt-4 max-w-3xl text-3xl sm:text-5xl">
              Projete, teste e{" "}
              <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">
                registre sua evolução.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-secondary-content/85">
              Pela sua conta RoboStage, o QuickBrick Studio guarda as estratégias, os modelos 3D e os relatórios do robô.
              Registre testes, documente alterações e acompanhe a evolução dos projetos durante toda a temporada.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard/quickbrick" tone="accent" size="lg" iconRight={<ArrowRight size={18} />}>
                Acessar o QuickBrick Studio
              </ButtonLink>
              <ButtonLink
                href="/sign-up"
                tone="ghost"
                size="lg"
                shape="rounded"
                iconLeft={<UserPlus size={18} />}
                className="text-secondary-content hover:bg-secondary-content/10"
              >
                Criar conta grátis
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
