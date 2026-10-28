import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  Clock,
  Code,
  Code2,
  Cuboid,
  FlaskConical,
  Github,
  HeartHandshake,
  LifeBuoy,
  Lightbulb,
  Linkedin,
  MessageSquare,
  NotebookPen,
  Quote,
  Radio,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import PageHero, { heroBtn } from "@/components/UI/PageHero";
import { ACCENT_TEXT, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { CtaBlock, ToolGrid, cornerBtn, type ToolItem } from "@/components/competicoes/shared/CompetitionSections";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O RoboStage é um ecossistema gratuito e aberto para equipes de robótica: planejamento, testes, documentação, avaliação e eventos em um só lugar.",
};

const REPO = "https://github.com/ohthias/roboStage";
const VERSION = "v2026.5";

/* ================================================================ DADOS */

const facts: { label: string; value: string }[] = [
  { label: "versão", value: VERSION },
  { label: "competições", value: "FLL · OBR" },
  { label: "licença", value: "MIT" },
  { label: "preço", value: "gratuito" },
];

const journey = ["planejar", "estratégia", "documentar", "testar", "analisar", "competir"];

const timeline: { icon: LucideIcon; tag: string; title: string; text: string; tone: Tone }[] = [
  {
    icon: Radio,
    tag: "O COMEÇO",
    title: "ShowLive",
    text: "A primeira solução: um hub para organizar e transmitir microeventos da FIRST LEGO League.",
    tone: "primary",
  },
  {
    icon: Boxes,
    tag: "VIRADA",
    title: "Um ecossistema",
    text: "O foco deixou de ser só o dia do evento e passou a acompanhar planejamento, testes e inovação.",
    tone: "secondary",
  },
  {
    icon: BrainCircuit,
    tag: "ESPECIALIZAÇÃO",
    title: "Ferramentas dedicadas",
    text: "Surgiram módulos para estratégia, avaliação, documentação e análise de desempenho.",
    tone: "accent",
  },
  {
    icon: Rocket,
    tag: VERSION.toUpperCase(),
    title: "FLL e OBR",
    text: "OBR completa, Anatix no LabTest, caderno do robô e permissões por cargo para qualquer equipe.",
    tone: "primary",
  },
];

const tools: ToolItem[] = [
  {
    icon: Trophy,
    tag: "PONTUAÇÃO",
    title: "Pontuador",
    description: "Simule missões ou rodadas completas com cronômetro, temporada por temporada.",
    href: "/fll/score",
    tone: "primary",
  },
  {
    icon: Cuboid,
    tag: "ESTRATÉGIA",
    title: "QuickBrick Studio",
    description: "Trajetórias no tapete, matrizes SWOT e de risco e o caderno do robô.",
    href: "/fll/quickbrick",
    tone: "secondary",
  },
  {
    icon: FlaskConical,
    tag: "TESTES",
    title: "LabTest",
    description: "Registre execuções e compare versões do robô com dados, não com achismo.",
    href: "/labtest",
    tone: "accent",
  },
  {
    icon: NotebookPen,
    tag: "PROCESSO",
    title: "Stagebook",
    description: "Ideias, projetos e tarefas da equipe virando conhecimento que fica.",
    href: "/stagebook",
    tone: "primary",
  },
  {
    icon: MessageSquare,
    tag: "AVALIAÇÃO",
    title: "Recall",
    description: "Treine a sala de avaliação com perguntas cronometradas.",
    href: "/fll/recall",
    tone: "secondary",
  },
  {
    icon: Clock,
    tag: "TEMPO",
    title: "Timers",
    description: "Round do Robô, Sala de Avaliação e timer livre com alertas.",
    href: "/fll/timers",
    tone: "accent",
  },
  {
    icon: Code,
    tag: "TELEMETRIA",
    title: "Anatix",
    description: "Sensores, estados e tempos do robô da OBR enquanto ele roda.",
    href: "/anatix",
    tone: "primary",
    status: "Novo",
  },
  {
    icon: Radio,
    tag: "EVENTOS",
    title: "ShowLive",
    description: "Ranking no telão em tempo real para torneios e microeventos.",
    href: "/showlive",
    tone: "secondary",
    status: "Em manutenção",
  },
];

const principles: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Target, title: "Problema primeiro", text: "Nenhuma ferramenta nasce antes da necessidade real de uma equipe." },
  { icon: Users, title: "Feito com a comunidade", text: "Sugestões, testes e conversas guiam cada nova versão." },
  { icon: Sparkles, title: "Menos burocracia", text: "Processos manuais viram fluxos simples. Sobra tempo para criar." },
];

const builder: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { icon: Code2, title: "Desenvolvimento", text: "Software aberto, pensado para a comunidade.", tone: "primary" },
  { icon: Wrench, title: "Mentoria", text: "Experiência de dentro das equipes e competições.", tone: "secondary" },
  { icon: Lightbulb, title: "Propósito", text: "Infraestrutura aberta para a robótica educacional.", tone: "accent" },
];

const community: { icon: LucideIcon; title: string; text: string; href: string; tone: Tone }[] = [
  { icon: Github, title: "Código aberto", text: "Veja o código, abra issues e envie Pull Requests.", href: REPO, tone: "primary" },
  { icon: HeartHandshake, title: "Apoie o projeto", text: "Contribua com código, divulgação e mais.", href: "/sponsors", tone: "secondary" },
  { icon: Users, title: "Roboticar", text: "Iniciativas de equipes e números da robótica brasileira.", href: "/roboticar", tone: "accent" },
  { icon: BookOpen, title: "Changelog", text: "Tudo o que mudou, versão por versão.", href: "/changelog", tone: "primary" },
];

const faq = [
  {
    q: "O RoboStage é gratuito?",
    a: "Sim. Criar a conta é grátis, e várias ferramentas, como o pontuador, os timers e o Recall, abrem direto pelo site.",
  },
  {
    q: "O RoboStage é oficial da FIRST ou da OBR?",
    a: "Não. É uma plataforma independente, criada por quem participa das competições. As regras oficiais sempre valem acima de qualquer ferramenta.",
  },
  {
    q: "Quais competições são atendidas?",
    a: "Hoje, FIRST LEGO League (incluindo a Future Edition) e OBR. A FTC e outras modalidades estão nos planos.",
  },
  {
    q: "Posso contribuir com o projeto?",
    a: "Pode. O código é aberto sob licença MIT. Abra uma issue, sugira ideias ou envie um Pull Request seguindo o guia de contribuição.",
  },
];

/* ================================================================ PÁGINA */

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip bg-base-100 text-base-content">
        <PageHero
          kicker="/ SOBRE O ROBOSTAGE"
          title="Sobre"
          highlight="construído por quem vive a robótica."
          description="O RoboStage nasceu dentro de uma equipe de robótica e virou um ecossistema aberto que acompanha toda a temporada, do primeiro planejamento ao dia da competição."
          actions={
            <>
              <a href="#historia" className={heroBtn}>
                Conhecer a história
                <ArrowDown size={20} />
              </a>
              <Link href="/fll" className="btn btn-ghost btn-lg">
                Explorar ferramentas
                <ArrowRight size={18} />
              </Link>
            </>
          }
          aside={
            <>
              <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                  <Sparkles size={13} className="text-primary" /> robostage.json
                </span>
                <span className="font-mono text-[10px] tracking-widest text-base-content/35">{VERSION}</span>
              </div>
              <dl className="grid grid-cols-2 gap-px border-b border-base-300 bg-base-300">
                {facts.map(({ label, value }) => (
                  <div key={label} className="bg-base-100 px-5 py-4">
                    <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/45">{label}</dt>
                    <dd className="mt-1 text-lg font-bold tracking-tight">{value}</dd>
                  </div>
                ))}
              </dl>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 px-5 py-4 font-mono text-xs text-base-content/60">
                {journey.map((step, i) => (
                  <li key={step} className="inline-flex items-center gap-2">
                    <span className={i === journey.length - 1 ? "font-bold text-primary" : ""}>{step}</span>
                    {i < journey.length - 1 && <ArrowRight size={11} className="text-base-content/30" />}
                  </li>
                ))}
              </ol>
              <div className="bg-[#1f1c18] px-5 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                <span className="opacity-60">feito</span> para equipes <span className="text-[#fabd32]">·</span>{" "}
                <span className="opacity-60">construído</span> com a comunidade
              </div>
            </>
          }
        />

        {/* ========================================================= ORIGEM */}
        <section id="historia" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.3fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <div className="lg:sticky lg:top-28">
                <SectionTitle
                  kicker="/ DE ONDE VEIO"
                  title="Antes da plataforma,"
                  highlight="um problema."
                  highlightClass="bg-secondary text-secondary-content"
                />
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <div className="space-y-6 text-base leading-8 text-base-content/70 sm:text-lg">
                <p>
                  O <strong className="text-base-content">RoboStage</strong> não nasceu como ideia de mercado. Nasceu
                  dentro de uma equipe, como resposta a problemas reais de uma temporada.
                </p>
                <p>
                  Informações espalhadas. Estratégias difíceis de acompanhar. Resultados de teste que se perdiam entre
                  cadernos e planilhas. A tecnologia entrou como uma forma simples de colocar ordem nisso.
                </p>
                <p>
                  Com o tempo, ficou claro: equipes não precisavam só de uma ferramenta para o dia da competição.
                  Precisavam de um lugar que acompanhasse{" "}
                  <span className="inline-block -rotate-1 bg-accent px-2 font-bold text-accent-content">a jornada toda.</span>
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ======================================================= EVOLUÇÃO */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ NOSSA EVOLUÇÃO"
                title="Uma ideia que"
                highlight="continuou crescendo."
                description="Cada nova ferramenta surgiu de uma necessidade diferente da comunidade."
              />
            </RevealOnScroll>
            <div className="relative mt-14">
              <div
                aria-hidden="true"
                className="absolute left-[12.5%] right-[12.5%] top-[2.9rem] hidden border-t-2 border-dashed border-base-300 lg:block"
              />
              <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {timeline.map(({ icon: Icon, tag, title, text, tone }, i) => {
                  const c = toneClasses[tone];
                  const last = i === timeline.length - 1;
                  return (
                    <li key={title}>
                      <RevealOnScroll delay={i * 0.06} className="h-full">
                        <article
                          className={`flex h-full flex-col rounded-tl-2xl rounded-br-2xl border bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${
                            last ? "border-primary/40 shadow-[6px_6px_0_0_var(--color-primary)]" : `border-base-300 ${c.hover}`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`relative z-10 grid size-12 place-items-center rounded-tl-xl rounded-br-xl ${c.icon}`}>
                              <Icon size={22} strokeWidth={1.8} />
                            </span>
                            <span className="font-mono text-xs tracking-widest text-base-content/40">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <p className={`mt-6 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{tag}</p>
                          <h3 className="mt-1 text-lg font-bold">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                        </article>
                      </RevealOnScroll>
                    </li>
                  );
                })}
              </ol>
              <RevealOnScroll delay={0.2}>
                <Link
                  href="/changelog"
                  className="mt-6 flex items-center justify-between gap-4 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-content/25 px-6 py-4 transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="font-semibold">O próximo capítulo está sendo escrito agora.</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs">
                    changelog <ArrowRight size={14} />
                  </span>
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ===================================================== ECOSSISTEMA */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ O ECOSSISTEMA"
                  title="Uma temporada."
                  highlight="Várias necessidades."
                  highlightClass="bg-accent text-accent-content"
                  description="Ferramentas para cada momento da temporada, conectando estratégia, testes, documentação, avaliação e competição."
                />
                <Link
                  href="/fll"
                  className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  ver todas
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </RevealOnScroll>
            <ToolGrid tools={tools} />
          </div>
        </section>

        {/* ===================================================== FILOSOFIA */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="relative grid gap-10 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-primary p-8 text-primary-content shadow-[10px_10px_0_0_var(--color-base-content)] sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full border-[28px] border-primary-content/10" />
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px] opacity-[0.06]" />
                <div className="relative">
                  <p className="font-mono text-xs tracking-[0.2em] text-primary-content/70">/ POR QUE EXISTE</p>
                  <Quote size={36} className="mt-6 text-accent" />
                  <blockquote className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                    Cada funcionalidade existe porque, em algum momento, ela fez falta.
                  </blockquote>
                  <p className="mt-5 max-w-xl text-primary-content/80">
                    Primeiro vem o problema. Depois, a tecnologia. É assim que o RoboStage decide o que construir.
                  </p>
                </div>
                <ul className="relative grid gap-3">
                  {principles.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-4 rounded-tl-2xl rounded-br-2xl bg-primary-content/10 p-5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-primary-content text-primary">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block font-bold">{title}</span>
                        <span className="mt-1 block text-sm leading-6 text-primary-content/75">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* =================================================== QUEM CONSTRÓI */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ QUEM CONSTRÓI"
                title="Feito por alguém que"
                highlight="também está na arena."
                highlightClass="bg-secondary text-secondary-content"
              >
                <div className="mt-6 max-w-2xl space-y-4 text-base leading-7 text-base-content/65 sm:text-lg">
                  <p>
                    O RoboStage é desenvolvido por <strong className="text-base-content">Matheus Gabriel</strong>, mentor
                    de robótica e desenvolvedor de software.
                  </p>
                  <p>
                    A vivência em equipes e competições pesa em cada decisão: a ferramenta precisa fazer sentido para
                    quem a usa no meio da temporada, não só no papel.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="https://github.com/ohthias"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn btn-neutral ${cornerBtn}`}
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/mathgab/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn btn-outline ${cornerBtn}`}
                  >
                    <Linkedin size={18} />
                    LinkedIn
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </SectionTitle>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="relative">
                <div aria-hidden="true" className="absolute -right-4 -top-4 size-20 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
                <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-16 rounded-full border-2 border-dashed border-secondary/50" />
                <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
                  <div className="flex items-center gap-4 border-b border-base-300 px-5 py-5">
                    <span className="grid size-14 shrink-0 place-items-center rounded-tl-xl rounded-br-xl bg-base-content font-mono text-lg font-bold text-base-100">
                      MG
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold">Matheus Gabriel</span>
                      <span className="block truncate font-mono text-xs text-base-content/50">@ohthias · criador</span>
                    </span>
                  </div>
                  <ul className="divide-y divide-base-300">
                    {builder.map(({ icon: Icon, title, text, tone }) => (
                      <li key={title} className="flex items-center gap-4 px-5 py-4">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg ${toneClasses[tone].icon}`}>
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{title}</span>
                          <span className="block text-sm text-base-content/55">{text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ===================================================== COMUNIDADE */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ CONSTRUÍDO COM A COMUNIDADE"
                title="O próximo capítulo pode ser"
                highlight="a sua ideia."
                description="Muitas funcionalidades nasceram de sugestões, conversas e experiências de equipes. Escolha por onde entrar."
              />
            </RevealOnScroll>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {community.map(({ icon: Icon, title, text, href, tone }, i) => {
                const c = toneClasses[tone];
                const external = href.startsWith("http");
                const cls = `group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`;
                const inner = (
                  <>
                    <span className={`grid size-10 place-items-center rounded-tl-lg rounded-br-lg ${c.icon}`}>
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-4 font-bold">{title}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-base-content/70 group-hover:text-primary">
                      Acessar
                      {external ? <ArrowUpRight size={14} /> : <ArrowRight size={14} />}
                    </span>
                  </>
                );
                return (
                  <li key={title}>
                    <RevealOnScroll delay={i * 0.06} className="h-full">
                      {external ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                          {inner}
                        </a>
                      ) : (
                        <Link href={href} className={cls}>
                          {inner}
                        </Link>
                      )}
                    </RevealOnScroll>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ============================================================ FAQ */}
        <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <div className="lg:sticky lg:top-28">
                <SectionTitle kicker="/ DÚVIDAS" title="Sobre o" highlight="projeto." />
                <Link
                  href="/help"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/70 transition-colors hover:text-primary"
                >
                  <LifeBuoy size={18} className="text-success" />
                  Mais respostas na central de ajuda
                  <ArrowRight size={15} />
                </Link>
                <p className={`mt-3 font-mono text-xs ${ACCENT_TEXT}`}>
                  Plataforma independente, sem vínculo oficial com FIRST ou OBR.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="space-y-3">
                {faq.map(({ q, a }, i) => (
                  <div
                    key={q}
                    className="collapse collapse-plus rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100"
                  >
                    <input type="radio" name="about_faq" defaultChecked={i === 0} aria-label={q} />
                    <div className="collapse-title pr-12 font-semibold">{q}</div>
                    <div className="collapse-content text-sm leading-6 text-base-content/65">
                      <p>{a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <CtaBlock
          kicker="COMECE AGORA"
          icon={Rocket}
          title="Sua jornada na robótica começa aqui."
          text="Explore as ferramentas, acompanhe a evolução do projeto e ajude a construir um ecossistema feito para quem vive a robótica."
          actions={[
            { label: "Explorar RoboStage", href: "/fll", variant: "accent" },
            { label: "Ver no GitHub", href: REPO, variant: "ghost" },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
