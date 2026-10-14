import {
  Check,
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
import Image from "next/image";
import { useToast } from "@/app/context/ToastContext";

export const metadata = {
  title: "Assets",
  description: "Assets públicos do RoboStage.",
};

const colors = [
  {
    name: "Brasa",
    value: "#CF2A2A",
    description: "A energia que transforma ideias em movimento robótico.",
    className: "bg-[#CF2A2A]",
    textClass: "text-white",
  },
  {
    name: "Oceano",
    value: "#1E459F",
    description: "A profundidade do conhecimento que guia cada projeto.",
    className: "bg-[#1e459f]",
    textClass: "text-white",
  },
  {
    name: "Sol",
    value: "#FABD32",
    description: "A criatividade que ilumina novas soluções tecnológicas.",
    className: "bg-[#FABD32]",
    textClass: "text-black",
  },
  {
    name: "Fundação",
    value: "#DED6C4",
    description: "A base sólida para construir, testar e inovar.",
    className: "bg-[#ded6c4]",
    textClass: "text-black",
  },
];

const assets = [
  {
    name: "Logo principal",
    description: "Símbolo + wordmark do RoboStage.",
    format: "PNG",
    href: "/assets/logo/full_logo_primary.png",
  },
  {
    name: "Logo outline",
    description: "Wordmark do RoboStage em versão outline.",
    format: "PNG",
    href: "/assets/logo/logo_outline_colorido.png",
  },
  {
    name: "Kit de Ícone",
    description: "Símbolo do RoboStage sem o wordmark.",
    format: "ZIP",
    href: "/assets/logo/robostage-icones.zip",
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
      <header className="relative isolate w-full overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)\_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)\_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative mx-auto flex min-h-[min(760px,calc(100svh-5rem))] max-w-7xl flex-col items-center justify-center gap-10 px-5 py-24 sm:px-8 md:flex-row md:justify-between md:gap-12 md:px-12 lg:py-28">
          <div className="z-10 flex w-full max-w-2xl flex-col justify-center gap-5 text-center md:text-left">
            <h1 className="text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Assets do{" "}
              <span className="inline-block bg-primary px-2 py-1 text-primary-content sm:px-3 -rotate-1">
                RoboStage
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-base-content/70 sm:text-lg md:mx-0">
              Recursos oficiais da identidade visual do RoboStage para uso em
              projetos, apresentações, documentos, eventos e materiais digitais.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
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

          <div className="relative mx-auto w-full max-w-md flex-1 md:max-w-xl">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
            <img
              src="/images/logos/logo_padrao.png"
              alt="Logo do RoboStage"
              className="relative z-10 h-auto w-full object-contain"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
        <section id="logos" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
          <SectionHeader
            eyebrow="01 — Identidade"
            title="Logos"
            description="A identidade do RoboStage possui diferentes configurações para se adaptar a diferentes contextos de aplicação."
          />
          <div className="grid lg:grid-cols-3 gap-6 mt-12">
            <div className="group relative lg:col-span-2 card rounded-tl-2xl rounded-br-2xl bg-base-200 border border-base-content/10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-base-content/5">
              <div
                className="absolute left-0 top-0 h-1 w-20 bg-primary"
                aria-hidden="true"
              />

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

                <div className="relative min-h-[260px] sm:min-h-[320px] mt-8 rounded-tl-2xl rounded-br-2xl bg-base-100 border border-base-content/10 flex items-center justify-center overflow-hidden p-6 sm:p-10">
                  <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)\_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)\_1px,transparent_1px)] bg-[size:20px_20px]" />

                  <div className="relative flex items-center gap-4">
                    <Image
                      src="/images/logos/full_logo_primary.png"
                      alt="Logo do RoboStage"
                      className="relative z-10 object-contain"
                      width={500}
                      height={100}
                    />
                  </div>
                </div>

                <div className="card-actions justify-between items-center mt-5">
                  <span className="text-sm font-mono text-base-content/50">
                    robostage.png
                  </span>

                  <a
                    href="/assets/logo/full_logo_primary.png"
                    download
                    className="btn btn-sm btn-primary"
                  >
                    <Download size={16} />
                    PNG
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <LogoVariation
                title="Versão clara"
                description="Para fundos escuros."
                dark
                href="/assets/logo/full_logo_secondary.png"
              />

              <LogoVariation
                title="Versão Alternativa"
                description="Uma versão alternativa do logo."
                href="/assets/logo/logo_outline_colorido.png"
              />
            </div>
          </div>
        </section>
        <section
          id="icon"
          className="scroll-mt-24 border-t border-base-content/10 py-16 sm:py-20 lg:py-24"
        >
          <SectionHeader
            eyebrow="02 — Símbolo"
            title="Ícone"
            description="O símbolo pode ser utilizado de forma independente quando o contexto já estabelece a relação com o RoboStage."
          />
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="group relative rounded-tl-2xl rounded-br-2xl bg-base-200 border border-base-content/10 p-8 md:p-12 flex items-center justify-center min-h-[280px] sm:min-h-[360px] md:min-h-[420px] overflow-hidden">
              <div
                className="absolute left-0 top-0 h-1 w-16 bg-secondary"
                aria-hidden="true"
              />
              <div
                className="absolute inset-6 rounded-tl-xl rounded-br-xl border border-dashed border-base-content/15"
                aria-hidden="true"
              />

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

              <h3 className="text-2xl font-black sm:text-3xl">
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
        <section
          id="colors"
          className="scroll-mt-24 border-t border-base-content/10 py-16 sm:py-20 lg:py-24"
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
          <div className="relative mt-8 overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-200 p-6 md:p-8">
            <div
              className="absolute left-0 top-0 h-full w-1 bg-[#FABD32]"
              aria-hidden="true"
            />
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
        <section
          id="typography"
          className="scroll-mt-24 border-t border-base-content/10 py-16 sm:py-20 lg:py-24"
        >
          <SectionHeader
            eyebrow="04 — Tipografia"
            title="Roboto"
            description="A tipografia principal do RoboStage é a família Roboto, escolhida por sua legibilidade, neutralidade e versatilidade."
          />

          <div className="relative mt-12 rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-200 overflow-hidden">
            <div
              className="absolute right-0 top-0 h-1 w-24 bg-secondary"
              aria-hidden="true"
            />
            <div className="p-8 md:p-12 border-b border-base-content/10">
              <div className="flex items-center gap-3 mb-8">
                <Type size={22} />
                <span className="font-bold">Roboto</span>
                <span className="badge badge-ghost">Sans Serif</span>
              </div>
              <div className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tight">
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

        <section
          id="download"
          className="scroll-mt-24 border-t border-base-content/10 py-16 sm:py-20 lg:py-24"
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
          <div className="mt-8 rounded-tl-2xl rounded-br-2xl bg-primary text-primary-content p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
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
        <section className="pb-20 sm:pb-24 lg:pb-28">
          <div className="relative overflow-hidden rounded-[2rem] bg-base-200 border border-base-content/10 p-10 md:p-16">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative max-w-3xl">
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-6xl font-black tracking-tight">
                Construindo experiências
                <span className="text-primary"> para a robótica.</span>
              </h2>
              <p className="mt-5 text-lg text-base-content/60 max-w-2xl">
                Leve o RoboStage para o seu projeto, evento ou apresentação com os assets oficiais da marca. Use-os de forma responsável e preserve a identidade visual.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

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
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-black sm:text-3xl tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-base-content/60 sm:mt-5 sm:text-lg">
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
      className={`rounded-tl-2xl rounded-br-2xl p-6 border ${
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
        <Image
          src={href.replace("/assets/logo/", "/images/logos/")}
          alt={title}
          className="object-contain"
          width={300}
          height={100}
        />
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
    <div className="group rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-200 p-6 hover:border-primary/40 transition-colors">
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
        <span className="badge badge-outline h-full text-center">{format}</span>
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
    <div className="rounded-tl-2xl rounded-br-2xl border border-base-content/10 bg-base-200 p-8">
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
