import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bug,
  Check,
  Code2,
  FileText,
  GitPullRequest,
  Heart,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  Search,
  Share2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import PageHero, { heroBtn } from "@/components/UI/PageHero";
import { SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { CtaBlock, cornerBtn } from "@/components/competicoes/shared/CompetitionSections";
import { communities } from "@/utils/institutional/community";
import ShareButton, { CopyLinkButton } from "./ShareButton";

export const metadata: Metadata = {
  title: "Apoie o RoboStage",
  description: "Contribua com código, divulgação e, em breve, apoio financeiro para manter o RoboStage em movimento.",
};

const REPO = "https://github.com/ohthias/roboStage";
const CONTRIBUTING = `${REPO}/blob/main/.github/CONTRIBUTING.md`;

const ways: {
  icon: LucideIcon;
  tag: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  status: "aberto" | "em breve";
  tone: Tone;
}[] = [
  {
    icon: Code2,
    tag: "CÓDIGO",
    title: "Contribua no GitHub",
    text: "Corrija bugs, crie funcionalidades, melhore a documentação e a acessibilidade, revise Pull Requests e teste novas versões.",
    href: REPO,
    cta: "Abrir repositório",
    status: "aberto",
    tone: "primary",
  },
  {
    icon: Share2,
    tag: "DIVULGAÇÃO",
    title: "Apresente para alguém",
    text: "Uma das formas mais simples de ajudar: mostre o RoboStage para equipes, técnicos, mentores, professores e organizadores.",
    href: "#compartilhe",
    cta: "Compartilhar",
    status: "aberto",
    tone: "secondary",
  },
  {
    icon: Heart,
    tag: "FINANCEIRO",
    title: "Ajude a manter no ar",
    text: "Uma forma simples e transparente de apoiar a infraestrutura e o desenvolvimento está sendo preparada.",
    href: "#financeiro",
    cta: "Saiba mais",
    status: "em breve",
    tone: "accent",
  },
];

const noCode: { icon: LucideIcon; title: string; text: string; href: string; label: string }[] = [
  { icon: Bug, title: "Reporte um bug", text: "Algo não funcionou como deveria? Conte o que aconteceu e como reproduzir.", href: `${REPO}/issues/new?template=bug_report.md`, label: "Abrir relato" },
  { icon: Lightbulb, title: "Sugira uma ideia", text: "Uma ferramenta que faria falta no treino? As sugestões guiam as próximas versões.", href: `${REPO}/issues/new?template=feature_request.md`, label: "Sugerir" },
  { icon: FileText, title: "Melhore a documentação", text: "Guias, textos da plataforma, exemplos e mensagens de erro mais claras.", href: `${REPO}/tree/main/docs`, label: "Ver documentação" },
  { icon: MessageSquare, title: "Tire uma dúvida", text: "Perguntas também ajudam: elas mostram onde a plataforma precisa ficar mais clara.", href: `${REPO}/issues/new?template=question.md`, label: "Perguntar" },
  { icon: Users, title: "Ajude a comunidade", text: "Responda dúvidas, compartilhe experiências e traga necessidades reais das equipes.", href: "/roboticar", label: "Conhecer o Roboticar" },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Search, title: "Procure antes", text: "Veja se já existe uma issue ou discussão sobre o mesmo assunto." },
  { icon: MessageSquare, title: "Abra uma issue", text: "Descreva o problema ou a ideia e combine o caminho antes de programar." },
  { icon: GitPullRequest, title: "Envie um Pull Request", text: "Crie uma branch, faça a mudança e explique o que foi alterado e como testou." },
  { icon: Check, title: "Revisão", text: "A mudança é revisada e, depois de aprovada, entra na próxima versão." },
];

const shareRules = {
  do: ["Use informações atualizadas.", "Use os materiais oficiais da marca.", "Deixe claro quando fala em nome próprio."],
  dont: ["Prometer funcionalidades que não existem.", "Apresentar o RoboStage como ferramenta oficial da FIRST."],
};

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip bg-base-100 text-base-content">
        <PageHero
          kicker="/ APOIE O ROBOSTAGE"
          title="Apoie"
          highlight="mantenha a robótica em movimento."
          description="O RoboStage é um projeto independente, construído para a comunidade de robótica. Seu apoio ajuda a continuar criando ferramentas, experiências e novas possibilidades."
          actions={
            <>
              <a href="#como-apoiar" className={heroBtn}>
                <HeartHandshake size={20} />
                Quero apoiar
              </a>
              <a href={CONTRIBUTING} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                Guia de contribuição
                <ArrowUpRight size={18} />
              </a>
            </>
          }
          aside={
            <>
              <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
                  <Heart size={13} className="text-primary" /> formas de apoiar
                </span>
                <span className="font-mono text-[10px] tracking-widest text-base-content/35">STATUS</span>
              </div>
              <ul className="divide-y divide-base-300">
                {ways.map(({ icon: Icon, tag, title, status, tone }) => (
                  <li key={tag} className="flex items-center gap-4 px-5 py-4">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-tl-lg rounded-br-lg ${toneClasses[tone].icon}`}>
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[10px] font-bold tracking-[0.15em] ${toneClasses[tone].tag}`}>{tag}</span>
                      <span className="block truncate font-semibold">{title}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-tl-md rounded-br-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
                        status === "aberto" ? "bg-success/15 text-success" : "border border-dashed border-base-content/30 text-base-content/55"
                      }`}
                    >
                      {status.toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="bg-[#1f1c18] px-5 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
                <span className="opacity-60">feito</span> pela comunidade <span className="text-[#fabd32]">·</span>{" "}
                <span className="opacity-60">para</span> a comunidade
              </div>
            </>
          }
        />

        {/* ===================================================== COMO APOIAR */}
        <section id="como-apoiar" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ COMO APOIAR"
                title="Três jeitos de"
                highlight="fazer diferença."
                highlightClass="bg-secondary text-secondary-content"
                description="Pequenos apoios geram grandes possibilidades. Mais do que manter um site no ar, queremos um espaço onde equipes, mentores e competidores aprendam, testem e compartilhem."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {ways.map(({ icon: Icon, tag, title, text, href, cta, status, tone }, i) => {
                const c = toneClasses[tone];
                const external = href.startsWith("http");
                const soon = status === "em breve";
                const cls = `group relative flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border bg-base-100 p-7 transition-all duration-300 hover:-translate-y-1 ${
                  soon ? "border-dashed border-base-content/25" : `border-base-300 ${tone === "primary" ? "hover:shadow-[8px_8px_0_0_var(--color-primary)]" : "hover:shadow-[8px_8px_0_0_var(--color-secondary)]"}`
                }`;
                const inner = (
                  <>
                    <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                    <div className="relative flex items-center justify-between">
                      <div className={`flex size-14 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                        <Icon size={24} strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className={`relative mt-8 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>
                      {tag} {soon && <span className="ml-1 text-base-content/45">· EM BREVE</span>}
                    </p>
                    <h3 className="relative mt-2 text-2xl font-bold tracking-tight">{title}</h3>
                    <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                    <span className="relative mt-6 flex items-center justify-between border-t border-base-300 pt-4 text-sm font-bold">
                      {cta}
                      {external ? <ArrowUpRight size={16} /> : <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                    </span>
                  </>
                );
                return (
                  <RevealOnScroll key={tag} delay={i * 0.08} className="h-full">
                    {external ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                    ) : (
                      <a href={href} className={cls}>{inner}</a>
                    )}
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================== SEM CÓDIGO */}
        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.5fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <div className="lg:sticky lg:top-28">
                <SectionTitle
                  kicker="/ SEM PROGRAMAR"
                  title="Você não precisa"
                  highlight="ser desenvolvedor."
                  highlightClass="bg-accent text-accent-content"
                  description="Usar o RoboStage e contar o que encontrou já ajuda muito: comportamentos inesperados, dificuldades de navegação e necessidades reais das equipes."
                />
              </div>
            </RevealOnScroll>
            <ul className="grid gap-4 sm:grid-cols-2">
              {noCode.map(({ icon: Icon, title, text, href, label }, i) => {
                const c = toneClasses[(["primary", "secondary", "accent"] as Tone[])[i % 3]];
                const external = href.startsWith("http");
                return (
                  <li key={title} className={i === noCode.length - 1 ? "sm:col-span-2" : ""}>
                    <RevealOnScroll delay={(i % 2) * 0.06} className="h-full">
                      <a
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`}
                      >
                        <span className={`grid size-10 place-items-center rounded-tl-lg rounded-br-lg ${c.icon}`}>
                          <Icon size={18} strokeWidth={1.8} />
                        </span>
                        <h3 className="mt-4 font-bold">{title}</h3>
                        <p className="mt-1.5 flex-1 text-sm leading-6 text-base-content/60">{text}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-base-content/70 group-hover:text-primary">
                          {label}
                          {external ? <ArrowUpRight size={14} /> : <ArrowRight size={14} />}
                        </span>
                      </a>
                    </RevealOnScroll>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ======================================================= COM CÓDIGO */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ CONTRIBUINDO COM CÓDIGO"
                  title="Do primeiro passo"
                  highlight="ao Pull Request."
                  description="O projeto é aberto no GitHub. O guia de contribuição explica o ambiente, as branches, os commits e os testes."
                />
                <a
                  href={CONTRIBUTING}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <FileText size={16} />
                  CONTRIBUTING.md
                  <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </RevealOnScroll>
            <div className="relative mt-14">
              <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[2.9rem] hidden border-t-2 border-dashed border-base-300 lg:block" />
              <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map(({ icon: Icon, title, text }, i) => {
                  const c = toneClasses[(["primary", "secondary", "accent", "primary"] as Tone[])[i]];
                  return (
                    <li key={title}>
                      <RevealOnScroll delay={i * 0.06} className="h-full">
                        <article className={`flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                          <div className="flex items-center justify-between">
                            <span className={`relative z-10 grid size-12 place-items-center rounded-tl-xl rounded-br-xl ${c.icon}`}>
                              <Icon size={22} strokeWidth={1.8} />
                            </span>
                            <span className="font-mono text-xs tracking-widest text-base-content/40">ETAPA {String(i + 1).padStart(2, "0")}</span>
                          </div>
                          <h3 className="mt-6 text-lg font-bold">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                        </article>
                      </RevealOnScroll>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* ====================================================== COMPARTILHE */}
        <section id="compartilhe" className="scroll-mt-20 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="relative grid gap-10 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-primary p-8 text-primary-content shadow-[10px_10px_0_0_var(--color-base-content)] sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full border-[28px] border-primary-content/10" />
                <div className="relative">
                  <p className="font-mono text-xs tracking-[0.2em] text-primary-content/70">/ DIVULGAÇÃO</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Conhece alguém que deveria conhecer o RoboStage?
                  </h2>
                  <p className="mt-4 max-w-xl text-primary-content/80">
                    Compartilhe com sua equipe, mentor, professor ou comunidade.
                    No celular abre o compartilhamento do aparelho; no computador,
                    o link é copiado.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <ShareButton className={`btn btn-lg border-none bg-base-100 text-base-content hover:bg-base-200 ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)]`} />
                    <CopyLinkButton className="btn btn-ghost btn-lg text-primary-content hover:bg-primary-content/10" />
                    <Link href="/assets" className="btn btn-ghost btn-lg text-primary-content hover:bg-primary-content/10">
                      Logos e cores
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
                <div className="relative grid gap-3">
                  <div className="rounded-tl-2xl rounded-br-2xl bg-primary-content/10 p-5">
                    <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary-content/70">DIVULGUE ASSIM</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {shareRules.do.map((r) => (
                        <li key={r} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" /> {r}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-tl-2xl rounded-br-2xl bg-black/15 p-5">
                    <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary-content/70">EVITE</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {shareRules.dont.map((r) => (
                        <li key={r} className="flex gap-2"><X size={16} className="mt-0.5 shrink-0" /> {r}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-primary-content/70">O RoboStage é uma plataforma independente.</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ======================================================= FINANCEIRO */}
        <section id="financeiro" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ APOIO FINANCEIRO"
                title="Quer contribuir"
                highlight="diretamente?"
                highlightClass="bg-accent text-accent-content"
                description="Estamos preparando uma forma simples e transparente de apoiar financeiramente a manutenção da infraestrutura e o desenvolvimento do RoboStage."
              />
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <div className="rounded-tl-3xl rounded-br-3xl border-2 border-dashed border-base-content/25 bg-base-100 p-7 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-tl-xl rounded-br-xl bg-accent/20 text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]">
                  <Heart size={24} />
                </span>
                <p className="mt-5 font-mono text-[10px] font-bold tracking-[0.18em] text-base-content/50">EM PREPARAÇÃO</p>
                <p className="mt-2 text-lg font-bold">Ainda não há como doar</p>
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Quando estiver disponível, valores e formas de apoio vão aparecer aqui e nas notícias.
                </p>
                <button type="button" disabled className={`btn mt-6 w-full ${cornerBtn}`}>
                  Em breve
                </button>
                <Link href="/news" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:text-primary">
                  Acompanhar notícias <ArrowRight size={14} />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ======================================================= COMUNIDADE */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ COMUNIDADE CONTRIBUINTE"
                title="Quem já ajuda"
                highlight="a construir."
                highlightClass="bg-secondary text-secondary-content"
                description="Equipes que testam a plataforma, compartilham experiências e ajudam a definir os próximos passos."
              />
            </RevealOnScroll>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((c, i) => (
                <li key={c.name}>
                  <RevealOnScroll delay={i * 0.06}>
                    <a
                      href={c.urlSocial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl bg-base-content font-mono text-sm font-bold text-base-100">
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{c.name}</span>
                        <span className="block truncate font-mono text-xs text-base-content/50">{new URL(c.urlSocial).hostname.replace(/^www\./, "")}</span>
                      </span>
                      <ArrowUpRight size={17} className="shrink-0 text-base-content/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </RevealOnScroll>
                </li>
              ))}
              <li>
                <RevealOnScroll delay={0.12}>
                  <a
                    href={REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-tl-2xl rounded-br-2xl border border-dashed border-base-content/25 p-5 transition-colors hover:border-primary hover:text-primary"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-tl-xl rounded-br-xl border border-dashed border-base-content/30 text-2xl font-light">+</span>
                    <span className="font-semibold">Sua equipe aqui</span>
                  </a>
                </RevealOnScroll>
              </li>
            </ul>
          </div>
        </section>

        <CtaBlock
          kicker="OBRIGADO"
          icon={Heart}
          title="Feito pela comunidade. Para a comunidade."
          text="Obrigado por fazer parte do próximo estágio do RoboStage."
          actions={[
            { label: "Contribuir no GitHub", href: REPO, variant: "accent" },
            { label: "Sobre o projeto", href: "/about", variant: "ghost" },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
