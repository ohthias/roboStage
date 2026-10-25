import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  Cpu,
  Cuboid,
  File,
  Globe2,
  Handshake,
  Leaf,
  NotepadText,
  Plus,
  TriangleAlert,
  Trophy,
  Users,
  Wifi,
} from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { AnimatedBackground, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import {
  CtaBlock,
  ToolCard,
  cornerBtn,
  type ToolItem,
} from "@/components/competicoes/shared/CompetitionSections";
import "@/components/home/home.css";

type Params = { params: Promise<{ competicao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { competicao } = await params;
  if (competicao !== "fll") return {};
  return {
    title: "Future Edition | FLL",
    description:
      "BIOGLOW™ Future Edition: kits LEGO® Education Computer Science & AI, hardware sem fio e partidas em alianças. Pontuador e rubricas do RoboStage.",
  };
}

const heroBadges = [
  { label: "Kits Computer Science & AI", icon: Cpu },
  { label: "Biodiversidade", icon: Leaf },
  { label: "Alianças cooperativas", icon: Users },
];

const pillars: { icon: typeof Cpu; tag: string; title: string; text: string; tone: Tone }[] = [
  {
    icon: Cpu,
    tag: "KIT",
    title: "Computer Science & AI",
    text: "As equipes usam os novos kits LEGO® Education Computer Science & AI para construir e programar.",
    tone: "secondary",
  },
  {
    icon: Wifi,
    tag: "HARDWARE",
    title: "Sem fio",
    text: "Durante as partidas, o hardware sem fio é construído e programado para resolver os desafios.",
    tone: "primary",
  },
  {
    icon: Handshake,
    tag: "PARTIDAS",
    title: "Alianças cooperativas",
    text: "Um novo formato de jogo cooperativo, em que as equipes jogam em alianças.",
    tone: "accent",
  },
  {
    icon: Leaf,
    tag: "PROJETO",
    title: "Biodiversidade",
    text: "O Projeto de Inovação investiga como a relação entre natureza e sociedade contribui para um planeta saudável.",
    tone: "secondary",
  },
];

const tools: ToolItem[] = [
  {
    icon: Trophy,
    tag: "PONTUAÇÃO",
    title: "Pontuador",
    description: "Simule partidas da Future Edition e calcule a pontuação automaticamente.",
    href: "/fll/future-edition/score",
    tone: "secondary",
  },
  {
    icon: NotepadText,
    tag: "AVALIAÇÃO",
    title: "Rubrica de Avaliação",
    description: "Avalie a equipe com as rubricas da Future Edition de forma interativa.",
    href: "/fll/future-edition/rubric",
    tone: "primary",
  },
  {
    icon: File,
    tag: "REGRAS",
    title: "Documentação",
    description: "Acesse a documentação oficial da Future Edition reunida no RoboStage.",
    href: "/fll/docs",
    tone: "accent",
  },
];

const alsoFll = [
  { icon: Trophy, title: "Pontuador da Challenge", text: "BIOGLOW na versão Challenge, com cronômetro de 2:30.", href: "/fll/score/bioglow" },
  { icon: Cuboid, title: "QuickBrick Studio", text: "Estratégias, matrizes e simulações para a mesa.", href: "/fll/quickbrick" },
  { icon: Globe2, title: "Roboticar", text: "Iniciativas de equipes e dados da robótica no Brasil.", href: "/roboticar" },
];

export default async function FutureEditionPage({ params }: Params) {
  const { competicao } = await params;
  // Página exclusiva da FLL.
  if (competicao !== "fll") notFound();

  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-14 sm:pt-20">
        <AnimatedBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
          <div>
            <nav aria-label="Trilha" className="font-mono text-xs tracking-[0.15em] text-base-content/45">
              <Link href="/fll" className="hover:text-primary">/FLL</Link>
              <span> / FUTURE EDITION</span>
            </nav>
            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
              Future{" "}
              <span className="inline-block -rotate-1 bg-secondary px-3 py-1 italic text-secondary-content">
                Edition
              </span>
            </h1>
            <p className="mt-5 text-lg font-semibold text-secondary sm:text-xl">
              Baseada nos kits LEGO® Education Computer Science &amp; AI
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">
              Na BIOGLOW™ Future Edition, as equipes da FIRST LEGO League
              participam de uma experiência sobre biodiversidade, com hardware
              sem fio e partidas em um novo formato cooperativo baseado em
              alianças.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {heroBadges.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-tl-md rounded-br-md border border-base-300 bg-base-100 px-2.5 py-1 font-mono text-xs text-base-content/70"
                >
                  <Icon size={13} />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/fll/future-edition/score"
                className={`btn btn-secondary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
              >
                <Trophy size={20} />
                Pontuar uma partida
              </Link>
              <a href="#ferramentas" className="btn btn-ghost btn-lg">
                Ver ferramentas
                <ArrowDown size={18} />
              </a>
            </div>
          </div>

          {/* vídeo */}
          <div className="relative">
            <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
            <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
            <figure className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
              <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                  <span className="size-2 rounded-full bg-primary" />
                  Apresentação · BIOGLOW Future Edition
                </span>
                <span className="font-mono text-[10px] tracking-widest text-base-content/35">VÍDEO</span>
              </div>
              <iframe
                src="https://www.youtube.com/embed/vHT9L_x9P_E?si=YCe6R02B70qVlMEZ"
                title="Apresentação da BIOGLOW Future Edition"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
                className="block aspect-video w-full border-0 bg-base-200"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* ============================================================ AVISO */}
      <section className="px-6 pt-8">
        <div
          role="note"
          className="mx-auto flex max-w-6xl items-start gap-4 rounded-tl-2xl rounded-br-2xl border border-warning/50 bg-warning/10 p-5 sm:p-6"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-warning text-warning-content">
            <TriangleAlert size={20} />
          </span>
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/60">CONTEÚDO NÃO OFICIAL</p>
            <p className="mt-1.5 text-sm leading-6 text-base-content/75">
              A Future Edition é operada pela <a href="https://www.educacional.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Educacional</a>. As ferramentas do RoboStage têm caráter
              educacional e experimental, feitas para ajudar equipes, técnicos e
              estudantes interessados em conhecer o formato da competição.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================= O QUE MUDA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ O QUE MUDA"
              title="Uma nova geração"
              highlight="para a FLL."
              highlightClass="bg-secondary text-secondary-content"
              description="Quatro ideias resumem a Future Edition. Além das missões do robô, o Projeto de Inovação também faz parte da temporada."
            />
          </RevealOnScroll>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, tag, title, text, tone }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.06} className="h-full">
                  <article className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                    <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                    <div className="relative flex items-center justify-between">
                      <div className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className={`relative mt-7 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{tag}</p>
                    <h3 className="relative mt-2 text-xl font-bold tracking-tight">{title}</h3>
                    <p className="relative mt-3 text-sm leading-6 text-base-content/60">{text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================== FERRAMENTAS */}
      <section id="ferramentas" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ FERRAMENTAS"
              title="Prepare a equipe"
              highlight="para o novo formato."
              description="Recursos desenvolvidos para apoiar equipes durante a temporada."
            />
          </RevealOnScroll>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, i) => (
              <RevealOnScroll key={tool.href} delay={i * 0.06} className="h-full">
                <ToolCard tool={tool} index={i} />
              </RevealOnScroll>
            ))}
            <RevealOnScroll delay={0.18} className="h-full">
              <div className="flex h-full flex-col justify-between rounded-tl-2xl rounded-br-2xl border border-dashed border-base-300 bg-base-100/50 p-6">
                <span className="grid size-12 place-items-center rounded-tl-xl rounded-br-xl border border-dashed border-base-300 text-base-content/40">
                  <Plus size={22} />
                </span>
                <div className="mt-7">
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/45">EM BREVE</p>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">
                    Mais ferramentas chegam ao longo da temporada. Acompanhe pelas
                    notícias.
                  </p>
                  <Link href="/news" className="mt-4 inline-flex items-center gap-1 text-sm font-bold hover:text-primary">
                    Ver notícias
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ===================================================== TAMBÉM NA FLL */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ TAMBÉM NA FLL"
              title="Compete na"
              highlight="Challenge?"
              highlightClass="bg-accent text-accent-content"
              description="A BIOGLOW também tem a versão Challenge. Veja as ferramentas do RoboStage para ela."
            />
          </RevealOnScroll>
          <div className="grid content-center gap-4">
            {alsoFll.map(({ icon: Icon, title, text, href }, i) => (
              <RevealOnScroll key={href} delay={i * 0.08}>
                <Link
                  href={href}
                  className="group flex items-center gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-[6px_6px_0_0_var(--color-secondary)]"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-content">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-base-content/60">{text}</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-base-content/35 transition-transform group-hover:translate-x-1" />
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <CtaBlock
        kicker="VAMOS COMEÇAR?"
        icon={Trophy}
        title="Explore as ferramentas e prepare sua equipe."
        text="Pontue partidas, avalie a equipe com as rubricas e conheça de perto o formato da Future Edition."
        actions={[
          { label: "Pontuar uma partida", href: "/fll/future-edition/score", variant: "accent" },
          { label: "Rubricas", href: "/fll/future-edition/rubric", variant: "ghost" },
          { label: "Voltar para a FLL", href: "/fll", variant: "ghost" },
        ]}
      />
    </main>
  );
}