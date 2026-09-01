import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  Image as ImageIcon,
  Maximize2,
  Type,
} from "lucide-react";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import ColorCard from "./ColorCard";

export const metadata = {
  title: "Assets",
  description: "Assets públicos do RoboStage.",
};

const colors = [
  {
    name: "Robo Red",
    value: "#CF2A2A",
    description: "Cor primária da marca.",
    className: "bg-[#CF2A2A]",
    textClass: "text-white",
  },
  {
    name: "Robo Blue",
    value: "#1E459F",
    description: "Cor secundária da marca.",
    className: "bg-[#1E459F]",
    textClass: "text-white",
  },
  {
    name: "Robo Yellow",
    value: "#FABD32",
    description: "Cor de destaque.",
    className: "bg-[#FABD32]",
    textClass: "text-black",
  },
  {
    name: "Robo Neutral",
    value: "#E1DCCA",
    description: "Base neutra complementar.",
    className: "bg-[#E1DCCA]",
    textClass: "text-black",
  },
];

const assets = [
  {
    name: "Logo principal",
    description: "Símbolo + wordmark do RoboStage.",
    format: "SVG",
    href: "/assets/logo/robostage.svg",
  },
  {
    name: "Logo monocromática",
    description: "Versão para aplicações de uma única cor.",
    format: "SVG",
    href: "/assets/logo/robostage-mono.svg",
  },
  {
    name: "Ícone",
    description: "Símbolo do RoboStage sem o wordmark.",
    format: "SVG",
    href: "/assets/logo/robostage-icon.svg",
  },
  {
    name: "Kit de logos",
    description: "Todas as principais variações da identidade.",
    format: "ZIP",
    href: "/assets/downloads/robostage-logos.zip",
  },
];

export default function BrandPage() {
  return (
    <>
      <Navbar />

      {/* =========================================================
          HERO
      ========================================================= */}
      <header className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative flex min-h-screen flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 md:px-12 py-32 gap-16">
          <div className="flex flex-col justify-center max-w-2xl z-10 gap-6">
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black leading-[0.95] tracking-tight">
              Assets do{" "}
              <span className="text-primary-content bg-primary px-3 inline-block -rotate-1">
                RoboStage
              </span>
            </h1>

            <p className="max-w-xl text-lg md:text-xl font-semibold italic text-base-content/70 leading-relaxed">
              Recursos oficiais da identidade visual do RoboStage para uso em
              projetos, apresentações, documentos, eventos e materiais digitais.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <a href="#logos" className="btn btn-primary">
                Explorar assets
                <ExternalLink size={18} />
              </a>

              <a href="#download" className="btn btn-outline">
                Baixar kit completo
                <Download size={18} />
              </a>
            </div>
          </div>

          {/* Hero logo */}
          <div className="relative flex-1 w-full max-w-xl">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />

            <img
              src="/images/logos/logo_padrao.png"
              alt="Logo do RoboStage"
              className="relative z-10 w-full h-full object-contain"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 md:px-12">
        {/* =========================================================
            LOGOS
        ========================================================= */}
        <section id="logos" className="py-28 scroll-mt-20">
          <SectionHeader
            eyebrow="01 — Identidade"
            title="Logos"
            description="A identidade do RoboStage possui diferentes configurações para se adaptar a diferentes contextos de aplicação."
          />

          <div className="grid lg:grid-cols-3 gap-6 mt-12">
            {/* Logo principal */}
            <div className="lg:col-span-2 card bg-base-200 border border-base-content/10 overflow-hidden">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="card-title text-2xl">Logo principal</h3>
                    <p className="text-base-content/60 mt-1">
                      Símbolo acompanhado do nome RoboStage.
                    </p>
                  </div>

                  <span className="badge badge-primary">Principal</span>
                </div>

                <div className="relative min-h-[320px] mt-8 rounded-2xl bg-base-100 border border-base-content/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:20px_20px]" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center text-primary-content text-4xl font-black rotate-3">
                      R
                    </div>

                    <span className="text-5xl font-black tracking-tight">
                      RoboStage
                    </span>
                  </div>
                </div>

                <div className="card-actions justify-between items-center mt-5">
                  <span className="text-sm font-mono text-base-content/50">
                    robostage.svg
                  </span>

                  <a
                    href="/assets/logo/robostage.svg"
                    download
                    className="btn btn-sm btn-primary"
                  >
                    <Download size={16} />
                    SVG
                  </a>
                </div>
              </div>
            </div>

            {/* Variações */}
            <div className="space-y-6">
              <LogoVariation
                title="Versão clara"
                description="Para fundos escuros."
                dark
                href="/assets/logo/robostage-light.svg"
              />

              <LogoVariation
                title="Versão escura"
                description="Para fundos claros."
                href="/assets/logo/robostage-dark.svg"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            ÍCONE
        ========================================================= */}
        <section
          id="icon"
          className="py-28 border-t border-base-content/10 scroll-mt-20"
        >
          <SectionHeader
            eyebrow="02 — Símbolo"
            title="Ícone"
            description="O símbolo pode ser utilizado de forma independente quando o contexto já estabelece a relação com o RoboStage."
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="rounded-3xl bg-base-200 border border-base-content/10 p-8 md:p-12 flex items-center justify-center min-h-[420px]">
              <div className="relative">
                <img
                  src="/images/logos/logo_padrao.png"
                  alt="Ícone do RoboStage"
                  className="relative z-10 object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="badge badge-outline mb-5 w-fit">
                Área de proteção
              </span>

              <h3 className="text-3xl font-black">
                Dê espaço para a marca respirar.
              </h3>

              <p className="mt-4 text-base-content/60 leading-relaxed">
                Mantenha uma área livre ao redor do ícone para garantir
                legibilidade e reconhecimento. Evite posicionar elementos
                gráficos, textos ou outros logotipos dentro dessa área.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <InfoBox label="Formato" value="SVG / PNG" />
                <InfoBox label="Uso mínimo" value="24 × 24 px" />
                <InfoBox label="Proporção" value="1 : 1" />
                <InfoBox label="Cor principal" value="#CF2A2A" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CORES
        ========================================================= */}
        <section
          id="colors"
          className="py-28 border-t border-base-content/10 scroll-mt-20"
        >
          <SectionHeader
            eyebrow="03 — Sistema visual"
            title="Paleta de cores"
            description="As cores do RoboStage combinam vermelho e azul como elementos principais, com amarelo e neutros para suporte e destaque."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {colors.map((color) => (
              <ColorCard key={color.name} {...color} />
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-base-content/10 bg-base-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <h3 className="font-bold text-lg">Uso recomendado</h3>
                <p className="text-sm text-base-content/60 mt-1">
                  Priorize as cores da marca em proporções equilibradas e use o
                  amarelo como elemento de destaque.
                </p>
              </div>

              <div className="flex h-12 overflow-hidden rounded-xl">
                <div className="w-28 bg-[#CF2A2A]" />
                <div className="w-20 bg-[#1E459F]" />
                <div className="w-14 bg-[#FABD32]" />
                <div className="w-12 bg-[#E1DCCA]" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TIPOGRAFIA
        ========================================================= */}
        <section
          id="typography"
          className="py-28 border-t border-base-content/10 scroll-mt-20"
        >
          <SectionHeader
            eyebrow="04 — Tipografia"
            title="Roboto"
            description="A tipografia principal do RoboStage é a família Roboto, escolhida por sua legibilidade, neutralidade e versatilidade."
          />

          <div className="mt-12 rounded-3xl border border-base-content/10 bg-base-200 overflow-hidden">
            <div className="p-8 md:p-12 border-b border-base-content/10">
              <div className="flex items-center gap-3 mb-8">
                <Type size={22} />
                <span className="font-bold">Roboto</span>
                <span className="badge badge-ghost">Sans Serif</span>
              </div>

              <div className="text-7xl md:text-9xl font-black tracking-tight">
                Aa
              </div>

              <p className="mt-8 text-2xl md:text-4xl font-light">
                Roboto Regular · Medium · Bold · Black
              </p>
            </div>

            <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-base-content/10">
              <TypeSample size="text-5xl" weight="font-black" label="Display" />
              <TypeSample size="text-3xl" weight="font-bold" label="Heading" />
              <TypeSample size="text-xl" weight="font-medium" label="Body" />
              <TypeSample size="text-sm" weight="font-normal" label="Caption" />
            </div>
          </div>
        </section>

        {/* =========================================================
            DOWNLOADS
        ========================================================= */}
        <section
          id="download"
          className="py-28 border-t border-base-content/10 scroll-mt-20"
        >
          <SectionHeader
            eyebrow="05 — Downloads"
            title="Baixar assets"
            description="Encontre os arquivos necessários para utilizar a identidade do RoboStage."
          />

          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {assets.map((asset) => (
              <AssetCard key={asset.name} {...asset} />
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-primary text-primary-content p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black">
                Precisa de tudo de uma vez?
              </h3>

              <p className="mt-2 opacity-80 max-w-xl">
                Baixe o pacote completo com logos, ícones e arquivos necessários
                para aplicações digitais e impressas.
              </p>
            </div>

            <a
              href="/assets/downloads/robostage-assets.zip"
              download
              className="btn bg-white text-black border-none hover:bg-white/90"
            >
              <FileArchive size={18} />
              Baixar pacote
            </a>
          </div>
        </section>

        {/* =========================================================
            USO
        ========================================================= */}
        <section className="py-28 border-t border-base-content/10">
          <SectionHeader
            eyebrow="06 — Aplicação"
            title="Use a marca corretamente"
            description="Os assets são públicos, mas preservar a identidade visual é essencial para manter consistência."
          />

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <RuleCard
              type="do"
              title="Faça"
              items={[
                "Mantenha as proporções originais.",
                "Use as versões adequadas para cada fundo.",
                "Respeite a área de proteção.",
                "Prefira os arquivos vetoriais quando possível.",
              ]}
            />

            <RuleCard
              type="dont"
              title="Evite"
              items={[
                "Distorcer ou esticar o logotipo.",
                "Alterar as cores oficiais.",
                "Adicionar sombras ou efeitos não previstos.",
                "Usar o logo sobre fundos que prejudiquem sua leitura.",
              ]}
            />
          </div>
        </section>

        {/* =========================================================
            FOOTER CTA
        ========================================================= */}
        <section className="pb-32">
          <div className="relative overflow-hidden rounded-[2rem] bg-base-200 border border-base-content/10 p-10 md:p-16">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative max-w-3xl">
              <span className="badge badge-primary badge-outline">
                RoboStage
              </span>

              <h2 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">
                Construindo experiências
                <span className="text-primary"> para a robótica.</span>
              </h2>

              <p className="mt-5 text-lg text-base-content/60 max-w-2xl">
                Este espaço reúne os recursos públicos da marca para que a
                comunidade possa criar, apresentar e compartilhar projetos
                mantendo a identidade do RoboStage.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* ===============================================================
   COMPONENTES
=============================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="text-sm font-black uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </div>

      <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">
        {title}
      </h2>

      <p className="mt-5 text-lg text-base-content/60 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function LogoVariation({
  title,
  description,
  dark = false,
  href,
}: {
  title: string;
  description: string;
  dark?: boolean;
  href: string;
}) {
  return (
    <div
      className={`rounded-3xl p-6 border ${
        dark
          ? "bg-neutral text-neutral-content border-neutral"
          : "bg-base-200 border-base-content/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm opacity-60">{description}</p>
        </div>

        <ImageIcon size={18} className="opacity-50" />
      </div>

      <div className="h-28 flex items-center justify-center">
        <div className="flex items-center gap-2 font-black text-2xl">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-content">
            R
          </div>
          RoboStage
        </div>
      </div>

      <a href={href} download className="btn btn-sm btn-outline w-full">
        <Download size={15} />
        Baixar
      </a>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-base-200 border border-base-content/10 p-5">
      <div className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
        {label}
      </div>

      <div className="mt-2 font-mono font-bold">{value}</div>
    </div>
  );
}

function TypeSample({
  label,
  size,
  weight,
}: {
  label: string;
  size: string;
  weight: string;
}) {
  return (
    <div className="p-8">
      <div className="text-xs uppercase tracking-widest text-base-content/40 font-bold">
        {label}
      </div>

      <div className={`mt-5 ${size} ${weight}`}>RoboStage</div>
    </div>
  );
}

function AssetCard({
  name,
  description,
  format,
  href,
}: {
  name: string;
  description: string;
  format: string;
  href: string;
}) {
  return (
    <div className="group rounded-3xl border border-base-content/10 bg-base-200 p-6 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-5">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-xl bg-base-100 border border-base-content/10 flex items-center justify-center">
            {format === "ZIP" ? (
              <FileArchive size={20} />
            ) : (
              <ImageIcon size={20} />
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm text-base-content/50 mt-1">{description}</p>
          </div>
        </div>

        <span className="badge badge-outline">{format}</span>
      </div>

      <div className="flex justify-end mt-6">
        <a href={href} download className="btn btn-sm btn-primary">
          <Download size={16} />
          Baixar
        </a>
      </div>
    </div>
  );
}

function RuleCard({
  type,
  title,
  items,
}: {
  type: "do" | "dont";
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-base-content/10 bg-base-200 p-8">
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            type === "do"
              ? "bg-success/15 text-success"
              : "bg-error/15 text-error"
          }`}
        >
          {type === "do" ? (
            <Check size={20} />
          ) : (
            <Maximize2 size={20} className="rotate-45" />
          )}
        </div>

        <h3 className="text-xl font-black">{title}</h3>
      </div>

      <ul className="mt-7 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-base-content/70">
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                type === "do" ? "bg-success" : "bg-error"
              }`}
            />

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
