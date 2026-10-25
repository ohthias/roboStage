import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Brain,
  Clapperboard,
  Code,
  Cpu,
  FileText,
  Map,
  Megaphone,
} from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import LibraryExplorer from "@/components/competicoes/OBR/bastidores/LibraryExplorer";
import { AnimatedBackground, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { CtaBlock, cornerBtn } from "@/components/competicoes/shared/CompetitionSections";
import { materials, path, SUGGEST_MATERIAL_URL } from "@/utils/competitions/bastidores";
import "@/components/home/home.css";

type Params = { params: Promise<{ competicao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { competicao } = await params;
  if (competicao !== "obr") return {};
  return {
    title: "Bastidores | OBR",
    description:
      "Livros, vídeos, cursos e sites para equipes da OBR aprenderem Arduino, programação e lógica de programação.",
  };
}

const pathIcons = [Brain, Braces, Cpu];
const pathTones: Tone[] = ["secondary", "primary", "accent"];

const counts = {
  livros: materials.filter((m) => m.kind === "Livro").length,
  videos: materials.filter((m) => m.kind === "Vídeo" || m.kind === "Curso").length,
  sites: materials.filter((m) => m.kind === "Site" || m.kind === "Ferramenta").length,
  free: materials.filter((m) => m.free).length,
};

export default async function BastidoresPage({ params }: Params) {
  const { competicao } = await params;
  // Página exclusiva da OBR.
  if (competicao !== "obr") notFound();

  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      {/* ============================================================= HERO */}
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-14 sm:pt-20">
        <AnimatedBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
          <div>
            <nav aria-label="Trilha" className="font-mono text-xs tracking-[0.15em] text-base-content/45">
              <Link href="/obr" className="hover:text-primary">/OBR</Link>
              <span> / BASTIDORES</span>
            </nav>
            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
              Bastidores<span className="text-primary">.</span>
            </h1>
            <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              O que vem{" "}
              <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">antes da pista.</span>
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">
              Livros, vídeos, cursos e sites para a equipe entender lógica de
              programação, aprender a programar e dominar o Arduino. Tudo
              escolhido para quem compete na OBR.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#biblioteca"
                className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
              >
                <Clapperboard size={20} />
                Ver materiais
              </a>
              <a href="#trilha" className="btn btn-ghost btn-lg">
                Por onde começar
                <ArrowDown size={18} />
              </a>
            </div>
          </div>

          {/* cartão de contagem */}
          <div className="relative">
            <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
            <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
            <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
              <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                <span className="font-mono text-xs text-base-content/60">acervo · bastidores</span>
                <span className="font-mono text-[10px] tracking-widest text-base-content/35">OBR</span>
              </div>
              <dl className="grid grid-cols-3 divide-x divide-base-300 border-b border-base-300">
                {[
                  { v: counts.livros, l: "LIVROS", c: "text-primary" },
                  { v: counts.videos, l: "VÍDEOS E CURSOS", c: "text-secondary" },
                  { v: counts.sites, l: "SITES", c: toneClasses.accent.tag },
                ].map(({ v, l, c }) => (
                  <div key={l} className="px-4 py-4">
                    <dt className={`text-[10px] font-bold tracking-[0.15em] ${c}`}>{l}</dt>
                    <dd className="mt-1 font-mono text-3xl font-bold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="bg-[#1f1c18] px-5 py-4 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                <p><span className="opacity-60">{"// ordem sugerida"}</span></p>
                <p>
                  logica <span className="text-[#fabd32]">→</span> programacao{" "}
                  <span className="text-[#fabd32]">→</span> arduino
                </p>
                <p className="text-[#9be15d]">✓ {counts.free} materiais gratuitos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ TRILHA */}
      <section id="trilha" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ POR ONDE COMEÇAR"
              title="Três passos até"
              highlight="o robô andar sozinho."
              highlightClass="bg-secondary text-secondary-content"
              description="Não precisa ler tudo. Siga a ordem e use um material por etapa; o resto fica para consulta."
            />
          </RevealOnScroll>

          <div className="relative mt-14 grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
            {path.map(({ step, title, text, pick }, i) => {
              const Icon = pathIcons[i];
              const c = toneClasses[pathTones[i]];
              const item = materials.find((m) => m.title === pick);
              return (
                <RevealOnScroll key={step} delay={i * 0.08} className="h-full min-w-0">
                  <article className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                    <div className="flex items-center justify-between">
                      <div className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-xs text-base-content/35">ETAPA {String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className={`mt-7 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{step.toUpperCase()}</p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight">{title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                    {item && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center justify-between gap-3 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/50 px-4 py-3 transition-colors hover:border-base-content/40"
                      >
                        <span className="min-w-0">
                          <span className="block font-mono text-[10px] tracking-[0.15em] text-base-content/45">COMECE COM · {item.kind.toUpperCase()}</span>
                          <span className="mt-0.5 block truncate text-sm font-semibold">{item.title}</span>
                        </span>
                        <ArrowUpRight size={16} className="shrink-0 text-base-content/45" />
                      </a>
                    )}
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= BIBLIOTECA */}
      <section id="biblioteca" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionTitle
                kicker="/ BIBLIOTECA"
                title="Livros, vídeos"
                highlight="e sites."
                description="Filtre por assunto ou formato. Os links abrem a página original de cada material."
              />
              <a
                href={SUGGEST_MATERIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                <Megaphone size={16} />
                Sugerir material
                <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.08}>
            <div className="mt-12">
              <LibraryExplorer />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===================================================== NO ROBOSTAGE */}
      <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ DEPOIS DE ESTUDAR"
              title="Leve o que aprendeu"
              highlight="para o robô."
              highlightClass="bg-accent text-accent-content"
              description="Ferramentas do RoboStage para colocar a teoria em prática na OBR."
            />
          </RevealOnScroll>
          <div className="grid gap-4">
            {[
              { icon: Code, title: "Anatix", text: "Veja sensores, estados e tempos do seu código Arduino em tempo real.", href: "/obr/anatix", tone: "primary" as Tone },
              { icon: Map, title: "Criador de arenas", text: "Monte o percurso e planeje a rota antes de programar.", href: "/obr/quickbrick/criador-de-arenas", tone: "secondary" as Tone },
              { icon: FileText, title: "Documentação da OBR", text: "Regras e manuais reunidos para consulta durante os treinos.", href: "/obr/docs", tone: "accent" as Tone },
            ].map(({ icon: Icon, title, text, href, tone }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={href} delay={i * 0.08}>
                  <Link href={href} className={`group flex items-center gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`}>
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                      <Icon size={21} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-base-content/60">{text}</p>
                    </div>
                    <ArrowRight size={18} className="shrink-0 text-base-content/35 transition-transform group-hover:translate-x-1" />
                  </Link>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBlock
        kicker="ACERVO DA COMUNIDADE"
        icon={Megaphone}
        title="Conhece um material que ajudou sua equipe?"
        text="Livro, canal, curso ou site: mande a sugestão. O acervo dos Bastidores cresce com quem compete."
        actions={[
          { label: "Sugerir material", href: SUGGEST_MATERIAL_URL, variant: "accent" },
          { label: "Voltar para a OBR", href: "/obr", variant: "ghost" },
          { label: "Iniciativas de outras equipes", href: "/roboticar#iniciativas", variant: "ghost" },
        ]}
      />
    </main>
  );
}
