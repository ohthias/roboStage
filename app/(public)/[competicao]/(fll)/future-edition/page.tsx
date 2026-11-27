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
  Trophy,
  Users,
  Wifi,
} from "lucide-react";

import {
  ButtonLink,
  Callout,
  Chip,
  FeatureCard,
  Kicker,
  Reveal,
  Section,
  SectionTitle,
  Sparkle,
  StickerTag,
  VideoEmbed,
  cn,
  toneSoft,
  toneText,
  type Tone,
} from "@/components/stage";

const LIME = "#C8F77A";
const LIME_INK = "#20320C";

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

const tools: { icon: typeof Cpu; tag: string; title: string; description: string; href: string; tone: "primary" | "secondary" | "accent" }[] = [
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
    href: "/fll/docs#bioglow-future-edition",
    tone: "accent",
  },
];

const alsoFll = [
  { icon: Trophy, title: "Pontuador da Challenge", text: "BIOGLOW na versão Challenge, com cronômetro de 2:30.", href: "/fll/score/bioglow" },
  { icon: Cuboid, title: "QuickBrick Studio", text: "Estratégias, matrizes e simulações para a mesa.", href: "/fll/quickbrick" },
  { icon: Globe2, title: "Roboticar", text: "Iniciativas de equipes e dados da robótica no Brasil.", href: "/roboticar" },
];

const card =
  "stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 transition-[transform,box-shadow,border-color] duration-200 motion-reduce:hover:translate-y-0";

const hoverShadow: Record<string, string> = {
  primary: "hover:border-primary hover:shadow-[6px_6px_0_0_var(--color-primary)]",
  secondary: "hover:border-secondary hover:shadow-[6px_6px_0_0_var(--color-secondary)]",
  accent: "hover:border-accent hover:shadow-[6px_6px_0_0_var(--color-accent)]",
};

export default async function FutureEditionPage({ params }: Params) {
  const { competicao } = await params;
  // Página exclusiva da FLL.
  if (competicao !== "fll") notFound();

  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      {/* ============================================================== HERO */}
      <Section tone="night" edgeBottom="circuit" innerClassName="pb-24 pt-14 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
          <Reveal>
            <nav aria-label="Trilha" className="stage-kicker text-white/55">
              <Link href="/fll" className="hover:text-white">
                /FLL
              </Link>
              <span> / FUTURE EDITION</span>
            </nav>
            <h1 className="stage-display mt-5 text-5xl text-white sm:text-7xl">
              Future{" "}
              <span className="inline-block -rotate-1 px-3 py-1 italic" style={{ background: LIME, color: LIME_INK }}>
                Edition
              </span>
            </h1>
            <p className="mt-5 text-lg font-semibold sm:text-xl" style={{ color: LIME }}>
              Baseada nos kits LEGO® Education Computer Science &amp; AI
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Na BIOGLOW™ Future Edition, as equipes da FIRST LEGO League participam de uma experiência sobre biodiversidade,
              com hardware sem fio e partidas em um novo formato cooperativo baseado em alianças.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {heroBadges.map(({ label, icon: Icon }) => (
                <Chip key={label} icon={<Icon size={13} />} className="border-white/20 bg-white/5 text-white/80">
                  {label}
                </Chip>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink
                href="/fll/future-edition/score"
                size="lg"
                flat
                iconLeft={<Trophy size={20} />}
                className="border-0 shadow-[4px_4px_0_0_#ffffff] hover:-translate-y-0.5"
                style={{ background: LIME, color: LIME_INK }}
              >
                Pontuar uma partida
              </ButtonLink>
              <ButtonLink href="#ferramentas" tone="ghost" size="lg" shape="rounded" iconRight={<ArrowDown size={18} />} className="text-white hover:bg-white/10">
                Ver ferramentas
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={120} effect="pop" className="relative">
            <Sparkle size={40} color={LIME} motion="float" className="absolute -right-3 -top-6 z-10" />
            <StickerTag tone="ink" rotate={-5} className="absolute -bottom-4 left-6 z-10 border-white/30">
              Apresentação oficial
            </StickerTag>
            <div className="rounded-tl-3xl rounded-br-3xl" style={{ boxShadow: `8px 8px 0 0 ${LIME}` }}>
              <VideoEmbed
                provider="youtube"
                id="vHT9L_x9P_E"
                title="Apresentação da BIOGLOW Future Edition"
                frame="plain"
                tone="accent"
                className="rounded-tl-3xl rounded-br-3xl"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============================================================ AVISO */}
      <div className="px-6 pt-20">
        <Callout type="warning" title="Conteúdo não oficial" className="mx-auto max-w-6xl">
          A Future Edition é operada pela{" "}
          <a href="https://www.educacional.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            Educacional
          </a>
          . As ferramentas do RoboStage têm caráter educacional e experimental, feitas para ajudar equipes, técnicos e estudantes
          interessados em conhecer o formato da competição.
        </Callout>
      </div>

      {/* ======================================================= O QUE MUDA */}
      <Section>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionTitle
              kicker="/ O QUE MUDA"
              title="Uma nova geração"
              highlight="para a FLL."
              highlightTone="secondary"
              description="Quatro ideias resumem a Future Edition. Além das missões do robô, o Projeto de Inovação também faz parte da temporada."
            />
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, tag, title, text, tone }, i) => (
              <Reveal key={title} delay={i * 60} className="h-full">
                <article className={cn(card, "p-6 hover:-translate-y-1", hoverShadow[tone])}>
                  <div className="flex items-center justify-between">
                    <span className={cn("grid size-12 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300", toneSoft[tone])}>
                      <Icon size={22} strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className={cn("stage-kicker mt-7 text-[10px] font-bold", toneText[tone])}>{tag}</p>
                  <h3 className="mt-2 text-xl font-black tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-base-content/60">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ====================================================== FERRAMENTAS */}
      <Section id="ferramentas" tone="muted" edgeTop="studs" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionTitle
              kicker="/ FERRAMENTAS"
              title="Prepare a equipe"
              highlight="para o novo formato."
              description="Recursos desenvolvidos para apoiar equipes durante a temporada."
            />
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map(({ icon: Icon, tag, title, description, href, tone }, i) => (
              <Reveal key={href} delay={i * 60} className="h-full">
                <FeatureCard title={title} description={description} category={tag} icon={<Icon />} href={href} index={i + 1} tone={tone} />
              </Reveal>
            ))}
            <Reveal delay={180} className="h-full">
              <div className="stage-paper flex h-full flex-col justify-between rounded-tl-[30px] rounded-br-[30px] border border-dashed border-base-content/25 bg-base-100/60 p-6">
                <span className="grid size-12 place-items-center rounded-tl-xl rounded-br-xl border border-dashed border-base-content/25 text-base-content/40">
                  <Plus size={22} />
                </span>
                <div className="mt-7">
                  <Kicker>EM BREVE</Kicker>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">
                    Mais ferramentas chegam ao longo da temporada. Acompanhe pelas notícias.
                  </p>
                  <Link href="/news" className="mt-4 inline-flex items-center gap-1 text-sm font-bold hover:text-primary">
                    Ver notícias
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ===================================================== TAMBÉM NA FLL */}
      <Section>
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <Reveal>
            <SectionTitle
              kicker="/ TAMBÉM NA FLL"
              title="Compete na"
              highlight="Challenge?"
              highlightTone="accent"
              description="A BIOGLOW também tem a versão Challenge. Veja as ferramentas do RoboStage para ela."
            />
          </Reveal>
          <div className="grid content-center gap-4">
            {alsoFll.map(({ icon: Icon, title, text, href }, i) => (
              <Reveal key={href} delay={i * 80}>
                <Link href={href} className={cn(card, "flex-row items-center gap-4 p-5 hover:-translate-y-0.5", hoverShadow.secondary)}>
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl transition-colors", toneSoft.secondary)}>
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black tracking-tight">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-base-content/60">{text}</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-base-content/35 transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ CTA */}
      <Section tone="night" edgeTop="circuit" innerClassName="relative overflow-hidden">
        <Sparkle size={44} color={LIME} motion="float" className="absolute right-16 top-16 hidden sm:inline-grid" />
        <Reveal>
          <div className="relative mx-auto max-w-6xl">
            <Kicker className="text-white/55">VAMOS COMEÇAR?</Kicker>
            <h2 className="stage-display mt-4 max-w-3xl text-3xl text-white sm:text-5xl">
              Explore as ferramentas e{" "}
              <span className="mt-2 inline-block -rotate-1 px-3 py-1 italic" style={{ background: LIME, color: LIME_INK }}>
                prepare sua equipe.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-white/75">
              Pontue partidas, avalie a equipe com as rubricas e conheça de perto o formato da Future Edition.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink
                href="/fll/future-edition/score"
                size="lg"
                flat
                iconRight={<ArrowRight size={18} />}
                className="border-0 shadow-[4px_4px_0_0_#ffffff] hover:-translate-y-0.5"
                style={{ background: LIME, color: LIME_INK }}
              >
                Pontuar uma partida
              </ButtonLink>
              <ButtonLink href="/fll/future-edition/rubric" tone="ghost" size="lg" shape="rounded" className="text-white hover:bg-white/10">
                Rubricas
              </ButtonLink>
              <ButtonLink href="/fll" tone="ghost" size="lg" shape="rounded" className="text-white hover:bg-white/10">
                Voltar para a FLL
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
