import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, Check, Download, FileArchive, Image as ImageIcon, Printer, Monitor, Type, X } from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import PageHero, { heroBtn } from "@/components/UI/PageHero";
import { SectionTitle } from "@/components/home/shared";
import { CtaBlock } from "@/components/competicoes/shared/CompetitionSections";
import ColorCard, { CopyPaletteButton, type BrandColor } from "./ColorCard";

export const metadata: Metadata = {
  title: "Assets",
  description: "Logos, ícones, cores e tipografia oficiais do RoboStage para baixar e usar.",
};

const colors: BrandColor[] = [
  { name: "Brasa", token: "primary", value: "#CF2A2A", description: "A energia que transforma ideias em movimento robótico.", dark: false },
  { name: "Oceano", token: "secondary", value: "#1E459F", description: "A profundidade do conhecimento que guia cada projeto.", dark: false },
  { name: "Sol", token: "accent", value: "#FABD32", description: "A criatividade que ilumina novas soluções tecnológicas.", dark: true },
  { name: "Fundação", token: "neutral", value: "#DED6C4", description: "A base sólida para construir, testar e inovar.", dark: true },
];

const downloads = [
  {
    name: "Pacote completo",
    text: "Logos e ícones em todas as versões, para tela e para impressão.",
    href: "/assets/downloads/robostage-assets.zip",
    size: "3,8 MB",
    files: "73 arquivos",
    featured: true,
  },
  {
    name: "Kit de logos",
    text: "Logo principal, versão clara, outline e símbolo com e sem fundo.",
    href: "/assets/downloads/robostage-logos.zip",
    size: "3,3 MB",
    files: "45 arquivos",
  },
  {
    name: "Kit de ícones",
    text: "Símbolo do RoboStage nas versões padrão, inversa e outline.",
    href: "/assets/downloads/robostage-icones.zip",
    size: "556 KB",
    files: "27 arquivos",
  },
];

const jump = [
  { href: "#logos", label: "01 Logos" },
  { href: "#icone", label: "02 Ícone" },
  { href: "#cores", label: "03 Cores" },
  { href: "#tipografia", label: "04 Tipografia" },
  { href: "#downloads", label: "05 Downloads" },
  { href: "#uso", label: "06 Uso" },
];

function DownloadButton({ href, label = "Baixar" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      download
      className="btn btn-sm rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none border-base-300 bg-base-100 hover:border-primary hover:bg-primary hover:text-primary-content"
    >
      <Download size={15} />
      {label}
    </a>
  );
}

function Checker({ dark = false, className = "", children }: { dark?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-tl-2xl rounded-br-2xl border p-8 ${dark ? "border-neutral bg-[#1f1c18]" : "border-base-300 bg-[#f7f4ec]"} ${className}`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 opacity-[0.08] [background-image:radial-gradient(currentColor_0.8px,transparent_0.8px)] [background-size:16px_16px] ${dark ? "text-white" : "text-black"}`}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip bg-base-100 text-base-content">
        <PageHero
          kicker="/ IDENTIDADE VISUAL"
          title="Assets"
          highlight="a marca, pronta para usar."
          description="Recursos oficiais da identidade visual do RoboStage para projetos, apresentações, documentos, eventos e materiais digitais."
          actions={
            <>
              <a href="/assets/downloads/robostage-assets.zip" download className={heroBtn}>
                <FileArchive size={20} />
                Baixar pacote completo
              </a>
              <a href="#logos" className="btn btn-ghost btn-lg">
                Explorar assets
                <ArrowDown size={18} />
              </a>
            </>
          }
          aside={
            <>
              <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                <span className="font-mono text-xs text-base-content/60">robostage-assets.zip</span>
                <span className="font-mono text-[10px] tracking-widest text-base-content/35">3,8 MB</span>
              </div>
              <div className="grid place-items-center bg-[#f7f4ec] p-8">
                <Image src="/images/logos/logo_padrao.png" alt="Símbolo do RoboStage" width={180} height={180} className="h-auto w-36 sm:w-44" priority />
              </div>
              <div className="flex h-3">
                {colors.map((c) => (
                  <span key={c.name} className="flex-1" style={{ backgroundColor: c.value }} />
                ))}
              </div>
              <div className="bg-[#1f1c18] px-5 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                <p>
                  <span className="text-[#fabd32]">RGB</span> <span className="opacity-60">para telas ·</span>{" "}
                  <span className="text-[#9be15d]">CMYK</span> <span className="opacity-60">para impressão</span>
                </p>
                <p className="opacity-60">formatos: SVG · PNG · PDF</p>
              </div>
            </>
          }
        />

        <nav aria-label="Seções" className="sticky top-0 z-20 border-y border-base-300 bg-base-100/85 px-6 py-3 backdrop-blur">
          <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
            {jump.map(({ href, label }) => (
              <li key={href} className="shrink-0">
                <a href={href} className="inline-block rounded-tl-md rounded-br-md border border-base-300 bg-base-100 px-3 py-1 font-mono text-xs text-base-content/70 transition-colors hover:border-base-content hover:bg-base-content hover:text-base-100">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ============================================================ LOGOS */}
        <section id="logos" className="scroll-mt-32 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ 01 · IDENTIDADE"
                title="Logos para"
                highlight="cada contexto."
                description="A identidade do RoboStage tem configurações diferentes para se adaptar a cada aplicação."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              <RevealOnScroll className="h-full lg:col-span-2">
                <article className="flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-primary)]">
                  <div className="flex items-start justify-between gap-3 p-6">
                    <div>
                      <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary">PRINCIPAL</p>
                      <h3 className="mt-1 text-2xl font-bold">Logo principal</h3>
                      <p className="mt-1 text-sm text-base-content/60">Símbolo acompanhado do nome RoboStage. Use sempre que possível.</p>
                    </div>
                    <DownloadButton href="/assets/logo/full_logo_primary.png" label="PNG" />
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-6">
                    <Checker className="min-h-64 flex-1">
                      <Image src="/images/logos/full_logo_primary.png" alt="Logo principal do RoboStage" width={520} height={132} className="h-auto w-full max-w-md" />
                    </Checker>
                  </div>
                </article>
              </RevealOnScroll>
              <div className="grid gap-5">
                {[
                  { title: "Versão clara", text: "Para fundos escuros.", href: "/assets/logo/full_logo_secondary.png", img: "/images/logos/full_logo_secondary.png", dark: true },
                  { title: "Versão outline", text: "Alternativa com contorno colorido.", href: "/assets/logo/logo_outline_colorido.png", img: "/images/logos/logo_outline_colorido.png", dark: false },
                ].map((l, i) => (
                  <RevealOnScroll key={l.title} delay={0.08 * (i + 1)} className="h-full">
                    <article className="flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{l.title}</h3>
                          <p className="text-sm text-base-content/60">{l.text}</p>
                        </div>
                        <ImageIcon size={18} className="text-base-content/40" />
                      </div>
                      <div className="mt-4 flex-1">
                        <Checker dark={l.dark}>
                          <Image src={l.img} alt={`${l.title} do logo`} width={260} height={66} className="h-auto w-full max-w-[220px]" />
                        </Checker>
                      </div>
                      <div className="mt-4">
                        <DownloadButton href={l.href} label="Baixar PNG" />
                      </div>
                    </article>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ ÍCONE */}
        <section id="icone" className="scroll-mt-32 border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 [&>*]:min-w-0">
            <RevealOnScroll>
              <div className="relative grid aspect-square w-full max-w-md place-items-center justify-self-center rounded-tl-3xl rounded-br-3xl border border-base-300 bg-[#f7f4ec] p-12">
                <div aria-hidden="true" className="absolute inset-8 rounded-tl-2xl rounded-br-2xl border-2 border-dashed border-primary/40" />
                <span aria-hidden="true" className="absolute left-8 top-3 font-mono text-[10px] tracking-widest text-primary/70">ÁREA DE PROTEÇÃO</span>
                <Image src="/images/logos/logo_padrao.png" alt="Ícone do RoboStage" width={260} height={260} className="relative h-auto w-3/5" />
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <SectionTitle
                kicker="/ 02 · SÍMBOLO"
                title="Dê espaço para"
                highlight="a marca respirar."
                highlightClass="bg-secondary text-secondary-content"
                description="O símbolo pode ser usado sozinho quando o contexto já deixa clara a relação com o RoboStage. Mantenha uma área livre ao redor dele, sem textos, gráficos ou outros logos."
              />
              <dl className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { l: "FORMATOS", v: "SVG · PNG · PDF" },
                  { l: "USO MÍNIMO", v: "24 × 24 px" },
                  { l: "PROPORÇÃO", v: "1 : 1" },
                  { l: "COR PRINCIPAL", v: "#CF2A2A" },
                ].map(({ l, v }) => (
                  <div key={l} className="rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 p-4">
                    <dt className="font-mono text-[10px] tracking-[0.15em] text-base-content/45">{l}</dt>
                    <dd className="mt-1 font-mono font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6">
                <DownloadButton href="/assets/downloads/robostage-icones.zip" label="Baixar kit de ícones" />
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ============================================================ CORES */}
        <section id="cores" className="scroll-mt-32 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ 03 · SISTEMA VISUAL"
                  title="Paleta"
                  highlight="de cores."
                  highlightClass="bg-accent text-accent-content"
                  description="Vermelho e azul como cores principais, amarelo para destaques e um neutro quente como base. Clique numa cor para copiar."
                />
                <CopyPaletteButton colors={colors} />
              </div>
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {colors.map((c, i) => (
                <RevealOnScroll key={c.name} delay={i * 0.06} className="h-full">
                  <ColorCard color={c} index={i} />
                </RevealOnScroll>
              ))}
            </div>
            <RevealOnScroll>
              <div className="mt-8 flex flex-col gap-5 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-200/50 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/55">USO RECOMENDADO</p>
                  <p className="mt-1 text-sm text-base-content/70">
                    Equilibre vermelho e azul e use o amarelo só como destaque.
                  </p>
                </div>
                <div className="flex h-12 w-full max-w-sm overflow-hidden rounded-tl-lg rounded-br-lg font-mono text-[10px]">
                  <span className="flex-[4] bg-[#CF2A2A]" />
                  <span className="flex-[3] bg-[#1E459F]" />
                  <span className="flex-[2] bg-[#DED6C4]" />
                  <span className="flex-[1] bg-[#FABD32]" />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ======================================================= TIPOGRAFIA */}
        <section id="tipografia" className="scroll-mt-32 border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ 04 · TIPOGRAFIA"
                title="Roboto,"
                highlight="do título à legenda."
                description="A família Roboto foi escolhida pela legibilidade, neutralidade e versatilidade. Ela é gratuita no Google Fonts."
              />
            </RevealOnScroll>
            <RevealOnScroll>
              <div className="mt-14 overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
                <div className="grid gap-8 border-b border-base-300 p-8 md:grid-cols-[auto_1fr] md:items-end md:p-12">
                  <p className="text-8xl font-black leading-none tracking-tight sm:text-9xl">Aa</p>
                  <div>
                    <p className="inline-flex items-center gap-2 font-mono text-xs text-base-content/55">
                      <Type size={14} /> Roboto · Sans Serif
                    </p>
                    <p className="mt-3 text-2xl font-light md:text-3xl">Regular · Medium · Bold · Black</p>
                    <p className="mt-3 break-all font-mono text-sm text-base-content/50">
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                    </p>
                  </div>
                </div>
                <div className="grid divide-y divide-base-300 md:grid-cols-4 md:divide-x md:divide-y-0">
                  {[
                    { l: "DISPLAY", c: "text-4xl font-black xl:text-5xl", s: "Black · 48px" },
                    { l: "TÍTULO", c: "text-3xl font-bold", s: "Bold · 30px" },
                    { l: "TEXTO", c: "text-xl font-medium", s: "Medium · 20px" },
                    { l: "LEGENDA", c: "text-sm", s: "Regular · 14px" },
                  ].map(({ l, c, s }) => (
                    <div key={l} className="p-6 md:p-8">
                      <p className="font-mono text-[10px] tracking-[0.15em] text-base-content/45">{l}</p>
                      <p className={`mt-4 ${c}`}>RoboStage</p>
                      <p className="mt-3 font-mono text-[11px] text-base-content/45">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
            <a
              href="https://fonts.google.com/specimen/Roboto"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"
            >
              <Download size={15} /> Baixar a Roboto no Google Fonts
            </a>
          </div>
        </section>

        {/* ======================================================== DOWNLOADS */}
        <section id="downloads" className="scroll-mt-32 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ 05 · DOWNLOADS"
                title="Baixe o que"
                highlight="precisa."
                description="Todos os pacotes trazem os arquivos em RGB, para telas, e em CMYK, para impressão."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {downloads.map(({ name, text, href, size, files, featured }, i) => (
                <RevealOnScroll key={href} delay={i * 0.08} className="h-full">
                  <article
                    className={`flex h-full flex-col rounded-tl-3xl rounded-br-3xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                      featured
                        ? "border-primary bg-primary text-primary-content shadow-[8px_8px_0_0_var(--color-base-content)]"
                        : "border-base-300 bg-base-100 hover:shadow-[6px_6px_0_0_var(--color-base-content)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`grid size-12 place-items-center rounded-tl-xl rounded-br-xl ${featured ? "bg-primary-content/15" : "bg-primary/10 text-primary"}`}>
                        <FileArchive size={22} />
                      </span>
                      <span className={`font-mono text-xs ${featured ? "text-primary-content/75" : "text-base-content/45"}`}>ZIP · {size}</span>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold">{name}</h3>
                    <p className={`mt-2 flex-1 text-sm leading-6 ${featured ? "text-primary-content/80" : "text-base-content/60"}`}>{text}</p>
                    <ul className={`mt-5 flex flex-wrap gap-1.5 font-mono text-[11px] ${featured ? "text-primary-content/85" : "text-base-content/65"}`}>
                      {[files, "RGB + CMYK", "SVG · PNG · PDF"].map((t) => (
                        <li key={t} className={`rounded-md px-2 py-0.5 ${featured ? "bg-primary-content/15" : "bg-base-200"}`}>{t}</li>
                      ))}
                    </ul>
                    <a
                      href={href}
                      download
                      className={`btn mt-6 rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none ${featured ? "border-none bg-base-100 text-base-content hover:bg-base-200" : "btn-primary"}`}
                    >
                      <Download size={16} />
                      Baixar
                    </a>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs text-base-content/55">
              <span className="inline-flex items-center gap-1.5"><Monitor size={14} /> RGB · site, slides, redes sociais</span>
              <span className="inline-flex items-center gap-1.5"><Printer size={14} /> CMYK · banners, camisetas, impressos</span>
            </div>
          </div>
        </section>

        {/* ============================================================== USO */}
        <section id="uso" className="scroll-mt-32 border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ 06 · APLICAÇÃO"
                title="Use a marca"
                highlight="corretamente."
                highlightClass="bg-secondary text-secondary-content"
                description="Os assets são públicos, mas preservar a identidade visual é essencial para manter a consistência."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {[
                { type: "do", title: "Faça", items: ["Mantenha as proporções originais.", "Use a versão adequada para cada fundo.", "Respeite a área de proteção.", "Prefira os arquivos SVG quando possível."] },
                { type: "dont", title: "Evite", items: ["Distorcer ou esticar o logotipo.", "Alterar as cores oficiais.", "Adicionar sombras ou efeitos não previstos.", "Usar o logo sobre fundos que prejudiquem a leitura."] },
              ].map(({ type, title, items }, i) => (
                <RevealOnScroll key={title} delay={i * 0.08} className="h-full">
                  <article className={`h-full rounded-tl-2xl rounded-br-2xl border-2 bg-base-100 p-7 ${type === "do" ? "border-success/50" : "border-error/50"}`}>
                    <div className="flex items-center gap-3">
                      <span className={`grid size-10 place-items-center rounded-tl-lg rounded-br-lg ${type === "do" ? "bg-success text-success-content" : "bg-error text-error-content"}`}>
                        {type === "do" ? <Check size={20} /> : <X size={20} />}
                      </span>
                      <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {items.map((it) => (
                        <li key={it} className="flex gap-3 text-sm leading-6 text-base-content/75">
                          <span className={`mt-2 size-1.5 shrink-0 rounded-sm ${type === "do" ? "bg-success" : "bg-error"}`} />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <CtaBlock
          kicker="LEVE O ROBOSTAGE COM VOCÊ"
          icon={Download}
          title="Construindo experiências para a robótica."
          text="Use os assets oficiais no seu projeto, evento ou apresentação, de forma responsável e preservando a identidade visual."
          actions={[
            { label: "Ir para os downloads", href: "#downloads", variant: "accent" },
            { label: "Apoie o projeto", href: "/sponsors", variant: "ghost" },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
