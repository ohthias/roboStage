"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Menu,
  Radio,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const sections = [
  { id: "overview", label: "Visão geral" },
  { id: "logo", label: "Logo" },
  { id: "colors", label: "Cores" },
  { id: "type", label: "Tipografia" },
  { id: "system", label: "Sistema visual" },
  { id: "product", label: "Ecossistema" },
  { id: "voice", label: "Tom de voz" },
  { id: "usage", label: "Aplicações" },
  { id: "assets", label: "Assets" },
];

const colors = [
  {
    name: "Robo Red",
    value: "#CF2A2A",
    description: "Ação, competição e energia.",
    className: "bg-[#CF2A2A]",
    light: false,
  },
  {
    name: "Robo Blue",
    value: "#1E459F",
    description: "Tecnologia, confiança e aprendizado.",
    className: "bg-[#1E459F]",
    light: false,
  },
  {
    name: "Stage White",
    value: "#FFFFFF",
    description: "Clareza, espaço e acessibilidade.",
    className: "bg-white",
    light: true,
  },
  {
    name: "System Ink",
    value: "#111827",
    description: "Contraste, profundidade e sistema.",
    className: "bg-[#111827]",
    light: false,
  },
];

const products = [
  {
    index: "01",
    title: "QuickBrick Studio",
    category: "ESTRATÉGIA",
    description:
      "Planeje missões, documente soluções e visualize estratégias para o robô.",
    accent: "bg-primary",
    code: "QB-STUDIO",
  },
  {
    index: "02",
    title: "LabTest",
    category: "PERFORMANCE",
    description:
      "Teste execuções, registre runs e transforme treinamentos em dados.",
    accent: "bg-[#1E459F]",
    code: "LAB-TEST",
  },
  {
    index: "03",
    title: "InnoLab",
    category: "INOVAÇÃO",
    description:
      "Organize ideias, pesquisas e ferramentas para desenvolver projetos.",
    accent: "bg-primary",
    code: "INNO-LAB",
  },
  {
    index: "04",
    title: "ShowLive",
    category: "EVENTOS",
    description:
      "Crie experiências de competição com rodadas, rankings e transmissões.",
    accent: "bg-[#1E459F]",
    code: "SHOW-LIVE",
  },
];

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-14 max-w-4xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-primary" />

        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
      </div>

      <h2 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">
        {title}
      </h2>

      <p className="mt-5 max-w-3xl text-base leading-relaxed text-base-content/60 md:text-lg">
        {description}
      </p>
    </div>
  );
}

export default function BrandPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio,
          )[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.2, 0.5],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMenuOpen(false);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-base-100 text-base-content">
      {/* =========================================================
          NAVBAR
      ========================================================== */}

      <header className="sticky top-0 z-50 border-b border-base-content/10 bg-base-100/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <button
            onClick={() => scrollTo("overview")}
            className="group flex items-center gap-3"
          >
            <BrandMark />

            <div className="hidden leading-none sm:block">
              <div className="text-sm font-black tracking-tight">
                RoboStage
              </div>

              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-base-content/35">
                Brand System
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 xl:flex">
            {sections.slice(0, 6).map((section) => {
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`relative rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "text-base-content"
                      : "text-base-content/45 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  {section.label}

                  {active && (
                    <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo("assets")}
              className="btn btn-primary btn-sm hidden sm:flex"
            >
              Brand assets
              <Download size={14} />
            </button>

            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="btn btn-square btn-ghost xl:hidden"
              aria-label="Abrir menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-base-content/10 bg-base-100 px-4 py-4 xl:hidden">
            <nav className="mx-auto flex max-w-[1440px] flex-col gap-1">
              {sections.map((section) => {
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200"
                    }`}
                  >
                    {section.label}

                    {active && <span className="size-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}

      <section
        id="overview"
        className="relative scroll-mt-20 overflow-hidden border-b border-base-content/10"
      >
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-[-20%] size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1440px] items-center gap-16 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="badge badge-primary badge-outline">
                Brand Guidelines
              </span>

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-base-content/40">
                v1.0 / 2026
              </span>
            </div>

            <h1 className="max-w-6xl text-[clamp(4rem,9vw,9.5rem)] font-black leading-[0.82] tracking-[-0.075em]">
              O palco
              <br />
              da{" "}
              <span className="relative inline-block text-primary">
                robótica.
                <span className="absolute -bottom-2 left-1/2 h-1 w-[55%] -translate-x-1/2 rounded-full bg-primary/30" />
              </span>
            </h1>

            <div className="mt-10 max-w-2xl">
              <p className="text-xl leading-relaxed text-base-content/65 md:text-2xl">
                A identidade do RoboStage nasce no encontro entre tecnologia,
                competição, aprendizado e comunidade.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollTo("logo")}
                className="btn btn-primary"
              >
                Explorar identidade
                <ArrowDown size={16} />
              </button>

              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-base-content/35">
                SYSTEM / ROBOTICS / COMMUNITY
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <HeroSystem />

            <div className="absolute -bottom-8 -left-8 rounded-xl border border-base-content/10 bg-base-100/90 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-40" />
                  <span className="relative inline-flex size-3 rounded-full bg-success" />
                </span>

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-base-content/40">
                    System status
                  </p>

                  <p className="mt-1 text-xs font-bold">
                    COMMUNITY_ONLINE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MANIFESTO
      ========================================================== */}

      <section className="border-b border-base-content/10">
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.35fr_1fr]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-base-content/35">
                01 — Manifesto
              </span>
            </div>

            <div>
              <p className="max-w-5xl text-3xl font-black leading-tight tracking-[-0.035em] md:text-5xl">
                O RoboStage não é apenas uma ferramenta.
                <span className="text-primary">
                  {" "}
                  É o lugar onde ideias viram estratégia, testes viram dados e
                  equipes viram comunidade.
                </span>
              </p>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  {
                    number: "01",
                    title: "Planejar",
                    description:
                      "Transformar ideias em estratégias claras e executáveis.",
                  },
                  {
                    number: "02",
                    title: "Testar",
                    description:
                      "Aprender com cada execução e melhorar continuamente.",
                  },
                  {
                    number: "03",
                    title: "Evoluir",
                    description:
                      "Levar cada temporada um passo além.",
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="border-l border-base-content/10 pl-5"
                  >
                    <span className="font-mono text-[10px] text-primary">
                      {item.number}
                    </span>

                    <h3 className="mt-5 text-lg font-bold">{item.title}</h3>

                    <p className="mt-2 text-sm leading-relaxed text-base-content/55">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LOGO
      ========================================================== */}

      <section
        id="logo"
        className="scroll-mt-20 border-b border-base-content/10 bg-base-200/40"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="02 — Identidade"
            title="O logo é o palco reduzido a um símbolo."
            description="A marca precisa continuar reconhecível em uma interface, em um torneio, em uma transmissão ou ao lado de uma equipe. O símbolo funciona como assinatura e ponto de entrada para todo o ecossistema."
          />

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-base-content/10 bg-base-100">
              <span className="absolute left-6 top-6 badge badge-primary badge-outline">
                Principal
              </span>

              <div className="absolute inset-0 opacity-[0.025]">
                <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-current" />
                <div className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-current" />
              </div>

              <div className="relative flex items-center gap-5">
                <BrandMark size="lg" />

                <span className="text-5xl font-black tracking-[-0.05em] md:text-6xl">
                  RoboStage
                </span>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="flex min-h-[215px] items-center justify-center overflow-hidden rounded-3xl bg-[#111827] text-white">
                <div className="flex items-center gap-4">
                  <BrandMark dark size="md" />

                  <span className="text-3xl font-black tracking-[-0.04em]">
                    RoboStage
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-base-content/10 bg-base-100 p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-base-content/35">
                    Proporção
                  </span>

                  <span className="font-mono text-xs">01 / 04</span>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="flex aspect-square items-center justify-center rounded-xl bg-base-200 font-mono text-xs"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-sm leading-relaxed text-base-content/55">
                  O símbolo deve manter proporções, contraste e área de
                  proteção em qualquer escala.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Área de proteção",
                text: "Use o espaço mínimo equivalente ao módulo interno do símbolo.",
              },
              {
                title: "Não distorcer",
                text: "Nunca comprima, incline, estique ou altere a construção da marca.",
              },
              {
                title: "Contraste",
                text: "Escolha a versão do logo que maximize reconhecimento e legibilidade.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-base-content/10 bg-base-100 p-7"
              >
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-base-content/55">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          COLORS
      ========================================================== */}

      <section id="colors" className="scroll-mt-20">
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="03 — Cores"
            title="Energia + tecnologia."
            description="A paleta do RoboStage combina a intensidade do ambiente competitivo com a confiança necessária para uma plataforma educacional e tecnológica."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((color) => (
              <ColorCard key={color.value} {...color} />
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-content md:p-12">
              <div className="absolute right-[-80px] top-[-80px] size-72 rounded-full border-[40px] border-white/10" />

              <div className="relative">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                  Primary
                </span>

                <h3 className="mt-20 text-5xl font-black tracking-tight">
                  Energia.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-relaxed opacity-75">
                  O vermelho marca ações, competição, chamadas importantes e
                  momentos que precisam chamar atenção.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-[#1E459F] p-8 text-white md:p-12">
              <div className="absolute bottom-[-80px] right-[-40px] size-72 rounded-full border-[40px] border-white/10" />

              <div className="relative">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                  Secondary
                </span>

                <h3 className="mt-20 text-5xl font-black tracking-tight">
                  Tecnologia.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-relaxed opacity-75">
                  O azul cria equilíbrio, reforça confiança e conecta a marca
                  aos aspectos educacionais e tecnológicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TYPOGRAPHY
      ========================================================== */}

      <section
        id="type"
        className="scroll-mt-20 border-y border-base-content/10 bg-base-200/40"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="04 — Tipografia"
            title="Grande para comunicar. Técnica para informar."
            description="A identidade tipográfica trabalha em dois ritmos: títulos expressivos para impacto e uma camada monoespaçada para dados, métricas e informação de sistema."
          />

          <div className="overflow-hidden rounded-3xl border border-base-content/10 bg-base-100">
            <div className="border-b border-base-content/10 p-8 md:p-14">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/35">
                Display
              </span>

              <h3 className="mt-8 max-w-5xl text-6xl font-black leading-[0.85] tracking-[-0.06em] md:text-8xl">
                O palco é seu.
                <br />
                <span className="text-primary">A estratégia também.</span>
              </h3>
            </div>

            <div className="grid md:grid-cols-3">
              <div className="border-b border-base-content/10 p-8 md:border-b-0 md:border-r md:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/35">
                  Heading
                </span>

                <p className="mt-7 text-3xl font-bold tracking-tight">
                  Construímos ferramentas para quem constrói robôs.
                </p>
              </div>

              <div className="border-b border-base-content/10 p-8 md:border-b-0 md:border-r md:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/35">
                  Body
                </span>

                <p className="mt-7 text-base leading-7 text-base-content/65">
                  O produto precisa falar com estudantes, mentores,
                  organizadores e voluntários sem exigir conhecimento técnico
                  desnecessário.
                </p>
              </div>

              <div className="p-8 md:p-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-base-content/35">
                  System
                </span>

                <div className="mt-7 font-mono text-xs leading-7 text-base-content/70">
                  <p>ROBOT_STATUS: ONLINE</p>
                  <p>TEAM_ID: RS-042</p>
                  <p>RUN_SUCCESS: 87.4%</p>
                  <p>MISSION: COMPLETE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VISUAL SYSTEM
      ========================================================== */}

      <section id="system" className="scroll-mt-20">
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="05 — Sistema visual"
            title="O produto também é a identidade."
            description="Grid, módulos, dados, cartões, linhas e indicadores formam um sistema visual que pode aparecer tanto no Brand Center quanto dentro das ferramentas do RoboStage."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <VisualCard
              eyebrow="GRID"
              title="Estrutura"
              className="bg-base-100"
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />

              <div className="relative flex h-full items-end">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                  DATA / SYSTEM / ROBOTICS
                </span>
              </div>
            </VisualCard>

            <VisualCard
              eyebrow="SIGNALS"
              title="Movimento"
              className="bg-[#111827] text-white"
            >
              <div className="relative h-full">
                <div className="absolute left-3 top-14 h-px w-[80%] bg-white/20" />
                <div className="absolute left-3 top-24 h-px w-[55%] bg-primary" />
                <div className="absolute left-3 top-34 h-px w-[90%] bg-white/10" />

                <div className="absolute right-8 top-8 flex size-20 items-center justify-center rounded-full border border-white/15">
                  <div className="size-8 rounded-full bg-primary" />
                </div>
              </div>
            </VisualCard>

            <VisualCard
              eyebrow="MODULES"
              title="Interface"
              className="bg-base-200"
            >
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px]">RUN #042</span>

                  <span className="badge badge-success badge-sm">
                    Complete
                  </span>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-base-300">
                  <div className="h-full w-[82%] bg-primary" />
                </div>
              </div>
            </VisualCard>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRODUCT ECOSYSTEM
      ========================================================== */}

      <section
        id="product"
        className="scroll-mt-20 border-y border-base-content/10 bg-base-200/40"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="06 — Ecossistema"
            title="Uma marca. Vários palcos."
            description="O RoboStage evolui de uma única ferramenta para um ecossistema que acompanha a temporada: estratégia, testes, inovação e eventos. :contentReference[oaicite:1]{index=1}"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.code}
                className="group relative overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 p-7 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl md:p-9"
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${product.accent}`}
                />

                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-base-content/35">
                    {product.index}
                  </span>

                  <span className="badge badge-ghost font-mono text-[9px] tracking-[0.14em]">
                    {product.category}
                  </span>
                </div>

                <h3 className="mt-16 text-3xl font-black tracking-tight">
                  {product.title}
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-relaxed text-base-content/55">
                  {product.description}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-base-content/30">
                    {product.code}
                  </span>

                  <ArrowRight
                    size={18}
                    className="text-base-content/25 transition group-hover:translate-x-1 group-hover:text-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Competition architecture */}
          <div className="mt-6 overflow-hidden rounded-3xl bg-[#111827] text-white">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
                <div className="flex items-center gap-3">
                  <Radio size={17} className="text-primary" />

                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    Competition layer
                  </span>
                </div>

                <h3 className="mt-12 text-4xl font-black tracking-tight">
                  Uma plataforma que cresce junto com a comunidade.
                </h3>

                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/50">
                  A linguagem visual deve funcionar dentro de cada modalidade,
                  mantendo o RoboStage como marca principal.
                </p>
              </div>

              <div className="grid sm:grid-cols-3">
                {[
                  ["FLL", "Disponível", "FIRST LEGO League"],
                  ["FTC", "Em breve", "FIRST Tech Challenge"],
                  ["OBR", "Em breve", "Olimpíada Brasileira de Robótica"],
                ].map(([code, status, title], index) => (
                  <div
                    key={code}
                    className={`p-8 ${
                      index !== 2 ? "border-b border-white/10 sm:border-b-0 sm:border-r" : ""
                    }`}
                  >
                    <span className="font-mono text-[10px] text-white/35">
                      0{index + 1}
                    </span>

                    <p className="mt-10 text-4xl font-black">{code}</p>

                    <span
                      className={`mt-3 inline-flex rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
                        status === "Disponível"
                          ? "bg-success/15 text-success"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {status}
                    </span>

                    <p className="mt-6 text-xs leading-relaxed text-white/40">
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VOICE
      ========================================================== */}

      <section id="voice" className="scroll-mt-20">
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="07 — Comunicação"
            title="Fale como o RoboStage."
            description="A comunicação deve ser direta e humana. O produto pode ser técnico sem transformar cada frase em documentação de engenharia."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <VoiceCard
              title="Somos"
              positive
              items={[
                "Claros",
                "Técnicos",
                "Humanos",
                "Curiosos",
                "Colaborativos",
                "Práticos",
              ]}
            />

            <VoiceCard
              title="Não somos"
              items={[
                "Corporativos",
                "Excessivamente formais",
                "Complicados",
                "Genéricos",
                "Arrogantes",
                "Cheios de jargões",
              ]}
            />
          </div>

          <div className="mt-6 grid overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 lg:grid-cols-2">
            <div className="border-b border-base-content/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-error">
                Evite
              </span>

              <p className="mt-8 text-2xl font-bold leading-snug text-base-content/35">
                “Nossa solução proporciona uma experiência otimizada para o
                gerenciamento de atividades.”
              </p>
            </div>

            <div className="p-8 lg:p-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-success">
                Prefira
              </span>

              <p className="mt-8 text-2xl font-bold leading-snug">
                “Organize seus treinos e acompanhe cada evolução da equipe.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          APPLICATIONS
      ========================================================== */}

      <section
        id="usage"
        className="scroll-mt-20 border-y border-base-content/10 bg-base-200/40"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="08 — Aplicações"
            title="A marca não termina na interface."
            description="O sistema visual deve escalar do produto digital para competições, conteúdos, transmissões e materiais da comunidade."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                number: "01",
                title: "Produto",
                subtitle: "Dashboards · ferramentas · telas",
              },
              {
                number: "02",
                title: "Competição",
                subtitle: "Arena · credenciais · rankings",
              },
              {
                number: "03",
                title: "Conteúdo",
                subtitle: "Notícias · social · campanhas",
              },
              {
                number: "04",
                title: "Comunidade",
                subtitle: "Equipes · mentores · organizadores",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group rounded-3xl border border-base-content/10 bg-base-100 p-8 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] text-base-content/30">
                    {item.number}
                  </span>

                  <ArrowRight
                    size={18}
                    className="text-base-content/25 transition group-hover:translate-x-1 group-hover:text-primary"
                  />
                </div>

                <div className="mt-20">
                  <h3 className="text-3xl font-black tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-base-content/35">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ASSETS
      ========================================================== */}

      <section
        id="assets"
        className="scroll-mt-20 overflow-hidden bg-[#111827] text-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />

                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  09 — Recursos
                </span>
              </div>

              <h2 className="max-w-4xl text-5xl font-black tracking-[-0.05em] md:text-7xl">
                Tudo para levar
                <span className="text-primary"> o palco </span>
                com você.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/50">
                Os arquivos oficiais devem ser usados sempre que a marca
                aparecer em produtos, eventos, apresentações ou materiais da
                comunidade.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Logos",
                  description: "SVG, PNG e versões monocromáticas.",
                },
                {
                  title: "Ícones",
                  description: "Símbolos e elementos do sistema.",
                },
                {
                  title: "Templates",
                  description: "Materiais para eventos e conteúdo.",
                },
                {
                  title: "Guidelines",
                  description: "Versão completa da identidade.",
                },
              ].map((asset) => (
                <a
                  key={asset.title}
                  href="#"
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#111827]">
                      <Download size={16} />
                    </div>

                    <ExternalLink
                      size={15}
                      className="text-white/25 transition group-hover:text-primary"
                    />
                  </div>

                  <h3 className="mt-8 text-base font-bold">
                    {asset.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-white/40">
                    {asset.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-16 border-t border-white/10 pt-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
                  RoboStage Brand System
                </p>

                <p className="mt-2 text-xs text-white/25">
                  v1.0 · 2026 · Feito para a comunidade de robótica
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/30">
                <Sparkles size={14} />
                <span>O palco onde a robótica acontece.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   BRAND MARK
================================================================ */

function BrandMark({
  dark = false,
  size = "sm",
}: {
  dark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-9 rounded-[10px] text-sm",
    md: "size-12 rounded-[14px] text-lg",
    lg: "size-20 rounded-[20px] text-3xl",
  };

  return (
    <div
      className={`relative flex items-center justify-center font-black shadow-sm ${
        sizes[size]
      } ${dark ? "bg-white text-[#111827]" : "bg-primary text-primary-content"}`}
    >
      <span className="relative z-10">R</span>

      <span
        className={`absolute bottom-1.5 left-1/2 h-0.5 w-1/2 -translate-x-1/2 rounded-full ${
          dark ? "bg-primary" : "bg-white/40"
        }`}
      />
    </div>
  );
}

/* ===============================================================
   HERO SYSTEM
================================================================ */

function HeroSystem() {
  return (
    <div className="relative mx-auto aspect-square max-w-[540px]">
      <div className="absolute inset-0 rounded-full border border-base-content/10" />
      <div className="absolute inset-[12%] rounded-full border border-base-content/10" />
      <div className="absolute inset-[25%] rounded-full border border-primary/20" />

      <div
        className="absolute inset-[7%] rounded-full opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="absolute left-1/2 top-1/2 flex size-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] bg-primary shadow-2xl shadow-primary/20">
        <div className="flex size-20 items-center justify-center rounded-[20px] border border-white/20 text-4xl font-black text-primary-content">
          R
        </div>
      </div>

      <div className="absolute left-[8%] top-[26%] rounded-xl border border-base-content/10 bg-base-100/90 px-3 py-2 backdrop-blur">
        <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-base-content/40">
          TEAM
        </p>
        <p className="mt-1 text-xs font-bold">CONNECTED</p>
      </div>

      <div className="absolute bottom-[18%] right-[4%] rounded-xl border border-base-content/10 bg-base-100/90 px-3 py-2 backdrop-blur">
        <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-base-content/40">
          MODE
        </p>
        <p className="mt-1 text-xs font-bold text-success">LIVE</p>
      </div>

      <div className="absolute left-[17%] bottom-[8%]">
        <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-base-content/30">
          <span className="size-1.5 rounded-full bg-primary" />
          Robotics ecosystem
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   VISUAL CARD
================================================================ */

function VisualCard({
  eyebrow,
  title,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative min-h-[340px] overflow-hidden rounded-3xl border border-base-content/10 p-7 ${
        className ?? ""
      }`}
    >
      <div className="relative z-10 flex items-start justify-between">
        <span className="badge badge-ghost font-mono text-[9px] tracking-[0.12em]">
          {eyebrow}
        </span>

        <span className="font-mono text-[9px] text-base-content/30">
          SYSTEM
        </span>
      </div>

      <div className="absolute inset-7 top-20">
        {children}
      </div>

      <div className="absolute bottom-7 left-7">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
    </div>
  );
}

/* ===============================================================
   COLOR CARD
================================================================ */

function ColorCard({
  name,
  value,
  description,
  className,
  light,
}: {
  name: string;
  value: string;
  description: string;
  className: string;
  light: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyColor = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard indisponível no contexto atual.
    }
  };

  return (
    <button
      type="button"
      onClick={copyColor}
      className="group overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`relative h-52 ${className}`}>
        <div
          className={`absolute bottom-5 left-5 flex size-9 items-center justify-center rounded-full ${
            light ? "bg-black/5 text-black/60" : "bg-white/10 text-white"
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold">{name}</h3>

            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-base-content/35">
              {value}
            </p>
          </div>

          {copied && (
            <span className="text-[10px] font-semibold text-success">
              Copiado
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-base-content/55">
          {description}
        </p>
      </div>
    </button>
  );
}

/* ===============================================================
   VOICE CARD
================================================================ */

function VoiceCard({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-base-content/10 bg-base-100 p-8 md:p-10">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 items-center justify-center rounded-full ${
            positive ? "bg-success/10 text-success" : "bg-error/10 text-error"
          }`}
        >
          {positive ? <Check size={16} /> : <X size={16} />}
        </div>

        <h3 className="text-xl font-black">{title}</h3>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`badge badge-lg ${
              positive
                ? "badge-success badge-outline"
                : "badge-error badge-outline"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}