import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bell,
  BrainCircuit,
  CalendarDays,
  FileText,
  Flag,
  FlaskConical,
  FolderTree,
  KanbanSquare,
  Lightbulb,
  Link2,
  NotebookPen,
  RefreshCw,
  Sparkles,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import HeroSection from "@/components/UI/HeroSection";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { AnimatedBackground, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { CtaBlock, cornerBtn } from "@/components/competicoes/shared/CompetitionSections";
import "@/components/home/home.css";

export const metadata = {
  title: "Stagebook",
  description:
    "Registre ideias, organize projetos, acompanhe tarefas e transforme o processo da sua equipe em conhecimento.",
};

/* -------------------------------------------------------------- dados */

const process: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { icon: Lightbulb, title: "Imagine", text: "Registre ideias, perguntas e possibilidades antes de transformá-las em planos.", tone: "accent" },
  { icon: NotebookPen, title: "Registre", text: "Documente decisões, pesquisas, testes, reuniões e descobertas.", tone: "primary" },
  { icon: KanbanSquare, title: "Execute", text: "Transforme planos em tarefas, prazos e responsabilidades.", tone: "secondary" },
  { icon: Sparkles, title: "Aprenda", text: "Retorne ao histórico e entenda o que funcionou, mudou ou precisa evoluir.", tone: "accent" },
];

const workspace: {
  icon: LucideIcon;
  tag: string;
  title: string;
  text: string;
  details: string[];
  href: string;
  link: string;
  tone: Tone;
}[] = [
  {
    icon: NotebookPen,
    tag: "DOCUMENTOS",
    title: "Construa o conhecimento da equipe",
    text: "Crie páginas, subpáginas e pastas para documentar ideias, pesquisas, reuniões, decisões e testes.",
    details: ["Páginas e subpáginas", "Pastas", "Tags"],
    href: "/dashboard/documents",
    link: "Explorar documentos",
    tone: "primary",
  },
  {
    icon: CalendarDays,
    tag: "CALENDÁRIO",
    title: "Veja o que vem pela frente",
    text: "Organize treinos, reuniões, competições, eventos e prazos em uma visão clara da temporada.",
    details: ["Eventos da equipe", "Páginas anexadas", "Visão da temporada"],
    href: "/dashboard/calendar",
    link: "Abrir calendário",
    tone: "secondary",
  },
  {
    icon: KanbanSquare,
    tag: "KANBAN",
    title: "Transforme planos em ação",
    text: "Distribua tarefas, acompanhe prioridades, defina responsáveis e visualize o andamento dos projetos.",
    details: ["Responsáveis e prioridades", "Marcos", "Regras por coluna"],
    href: "/dashboard/kanban",
    link: "Abrir boards",
    tone: "accent",
  },
];

type Node = { icon: LucideIcon; name: string; text: string; links: string[]; href: string; tone: Tone };

const leftNodes: Node[] = [
  { icon: NotebookPen, name: "Documentos", text: "Páginas, subpáginas e pastas com o registro da equipe.", links: ["Kanban", "Calendário", "Tags"], href: "/dashboard/documents", tone: "primary" },
  { icon: KanbanSquare, name: "Kanban", text: "Cartões com responsáveis, prioridades, prazos e marcos.", links: ["Documentos", "Calendário", "Tags"], href: "/dashboard/kanban", tone: "accent" },
  { icon: CalendarDays, name: "Calendário", text: "Treinos, reuniões e competições da temporada.", links: ["Documentos", "Kanban"], href: "/dashboard/calendar", tone: "secondary" },
];

const rightNodes: Node[] = [
  { icon: FlaskConical, name: "LabTest", text: "Testes e execuções do robô, com exportação dos resultados.", links: ["Pastas", "Equipe"], href: "/dashboard/labtest", tone: "secondary" },
  { icon: BrainCircuit, name: "ThinkLab", text: "Quadros visuais com modelos como Ishikawa, 5W2H e Mapa de Empatia.", links: ["Pastas", "Equipe"], href: "/dashboard/thinklab", tone: "primary" },
  { icon: Bell, name: "Notificações", text: "Avisos que levam de volta ao documento, cartão ou evento de origem.", links: ["Tudo"], href: "/dashboard", tone: "accent" },
];

const connections: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Link2, title: "Cartão ↔ documento ↔ evento", text: "Um cartão do Kanban pode ter páginas e eventos vinculados, e cada evento do calendário pode ter suas páginas anexadas." },
  { icon: Tags, title: "Tags em comum", text: "As mesmas tags marcam documentos e cartões, então um assunto se encontra em qualquer ferramenta." },
  { icon: FolderTree, title: "Pastas que guardam tudo", text: "Uma pasta reúne documentos, quadros do ThinkLab e testes do LabTest do mesmo projeto." },
  { icon: UserRound, title: "Pessoal ou da equipe", text: "Troque de espaço com um clique: o que é da equipe fica com a equipe, o que é seu fica com você." },
  { icon: Bell, title: "Avisos com caminho de volta", text: "Cada notificação é individual e traz o link para o item que a gerou." },
  { icon: RefreshCw, title: "Sempre atualizado", text: "Membros entrando e cartões se movendo aparecem sozinhos, sem precisar recarregar a página." },
];

const flow: { icon: LucideIcon; tool: string; title: string; text: string; tone: Tone }[] = [
  { icon: NotebookPen, tool: "Documentos", title: "Uma ideia aparece", text: "A equipe registra a possibilidade em uma página, com tags do assunto.", tone: "primary" },
  { icon: BrainCircuit, tool: "ThinkLab", title: "A ideia ganha forma", text: "Um Ishikawa ou um 5W2H ajuda a entender causas e planejar a ação.", tone: "secondary" },
  { icon: KanbanSquare, tool: "Kanban", title: "A ideia vira tarefa", text: "O próximo passo ganha cartão, responsável, prazo e a página vinculada.", tone: "accent" },
  { icon: CalendarDays, tool: "Calendário", title: "A tarefa ganha data", text: "O treino em que ela será testada entra no calendário, com a página anexada.", tone: "primary" },
  { icon: FlaskConical, tool: "LabTest", title: "O teste gera dados", text: "As execuções são registradas e comparadas, e os resultados podem ser exportados.", tone: "secondary" },
  { icon: Sparkles, tool: "Documentos", title: "O resultado volta para o registro", text: "O que aconteceu passa a fazer parte do conhecimento da equipe.", tone: "accent" },
];

const features: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
  { icon: NotebookPen, title: "Documente", text: "Registre ideias, reuniões, pesquisas, estratégias, testes e decisões enquanto elas acontecem.", tone: "primary" },
  { icon: FileText, title: "Organize", text: "Estruture o conhecimento da equipe para encontrar rapidamente o que precisa.", tone: "secondary" },
  { icon: Lightbulb, title: "Desenvolva", text: "Use registros anteriores como ponto de partida para novas ideias e soluções.", tone: "accent" },
  { icon: Users, title: "Colabore", text: "Mantenha o conhecimento acessível para que diferentes pessoas possam contribuir.", tone: "primary" },
  { icon: Sparkles, title: "Aprenda", text: "Revise decisões, testes e resultados para entender como o projeto evoluiu.", tone: "secondary" },
];

const useCases = [
  { title: "Ideias de robô", text: "Mecanismos, estratégias, melhorias e possibilidades para testar." },
  { title: "Pesquisa", text: "Informações, referências, observações e descobertas da equipe." },
  { title: "Testes", text: "O que foi testado, o que aconteceu e o que precisa mudar." },
  { title: "Decisões", text: "Registros que ajudam a entender por que determinado caminho foi escolhido." },
  { title: "Reuniões", text: "Pautas, discussões, decisões e próximos passos." },
  { title: "Estratégias", text: "Planos para projetos, treinos, missões e competições." },
  { title: "Aprendizados", text: "Erros, acertos e descobertas que podem ser úteis no futuro." },
  { title: "Próximos passos", text: "Tudo aquilo que precisa acontecer para o projeto continuar avançando." },
];

/* --------------------------------------------------------------- partes */

function DocumentPreview() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
      <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
      <figure className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <span className="inline-flex items-center gap-2 truncate font-mono text-xs text-base-content/60">
            <FolderTree size={13} />
            Temporada / Robô / Garra
          </span>
          <span className="font-mono text-[10px] tracking-widest text-base-content/35">EXEMPLO</span>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.15em] text-primary">DOCUMENTO</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight">Reunião: nova garra para a missão 05</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["#robô", "#missão-05", "#teste"].map((t) => (
              <span key={t} className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-[11px] text-base-content/70">{t}</span>
            ))}
          </div>
          <ul className="mt-5 space-y-2 text-sm text-base-content/70">
            <li className="flex gap-2"><span className="text-primary">•</span> A garra atual solta a peça em 3 de 10 tentativas.</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Testar versão com elástico no próximo treino.</li>
          </ul>

          <p className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.15em] text-base-content/45">
            <Link2 size={12} /> VINCULADO A
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/50 p-3">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]">
                <KanbanSquare size={12} /> KANBAN
              </p>
              <p className="mt-1 text-sm font-semibold">Testar garra com elástico</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-[10px] text-base-content/50">
                <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-secondary">Em andamento</span>
                <span className="inline-flex items-center gap-1"><Flag size={10} /> alta</span>
              </p>
            </div>
            <div className="rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/50 p-3">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-secondary">
                <CalendarDays size={12} /> CALENDÁRIO
              </p>
              <p className="mt-1 text-sm font-semibold">Treino de mesa</p>
              <p className="mt-1 font-mono text-[10px] text-base-content/50">sábado · 14h</p>
            </div>
          </div>
        </div>

        <figcaption className="bg-[#1f1c18] px-5 py-3 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
          <span className="text-[#fabd32]">🔔</span> Você foi marcado como responsável em{" "}
          <span className="text-[#9be15d]">Testar garra com elástico</span>
        </figcaption>
      </figure>
    </div>
  );
}

function NodeCard({ node, side }: { node: Node; side: "left" | "right" }) {
  const c = toneClasses[node.tone];
  const Icon = node.icon;
  return (
    <Link
      href={node.href}
      className={`group relative flex h-full gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`}
    >
      {/* conector até o centro (só no desktop) */}
      <span
        aria-hidden="true"
        className={`absolute top-1/2 hidden w-10 border-t-2 border-dashed border-base-300 lg:block ${side === "left" ? "-right-10" : "-left-10"}`}
      />
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block font-bold">{node.name}</span>
        <span className="mt-1 block text-sm leading-6 text-base-content/60">{node.text}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] text-base-content/40">liga com</span>
          {node.links.map((l) => (
            <span key={l} className="rounded bg-base-200 px-1.5 py-0.5 font-mono text-[10px] text-base-content/65">{l}</span>
          ))}
        </span>
      </span>
    </Link>
  );
}

/* --------------------------------------------------------------- página */

export default function StagebookPage() {
  return (
    <>
      <Navbar />

      <HeroSection
        kicker="STAGEBOOK · ESPAÇO DA EQUIPE"
        title="A ideia começa"
        highlight="antes da solução."
        description="O Stagebook é o espaço da sua equipe para registrar pensamentos, organizar projetos, acompanhar tarefas e transformar cada etapa da temporada em conhecimento."
        images={["/images/index/banner_stagebook.png"]}
        primaryAction={{ label: "Abrir meu Stagebook", href: "/dashboard" }}
        secondaryAction={{ label: "Explorar recursos", href: "#recursos" }}
        badges={[
          { label: "Documentos", href: "#recursos" },
          { label: "Calendário", href: "#recursos" },
          { label: "Kanban", href: "#recursos" },
          { label: "Integração", href: "#integracao" },
        ]}
        scrollTarget="#processo"
        ariaLabel="Apresentação do Stagebook"
      />

      <main className="overflow-x-clip bg-base-100 text-base-content">
        {/* ========================================================= INTRO */}
        <section id="processo" className="relative isolate scroll-mt-20 overflow-hidden px-6 py-24">
          <AnimatedBackground />
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ O PROCESSO IMPORTA"
                title="Nem toda solução"
                highlight="nasce pronta."
                highlightClass="bg-accent text-accent-content"
                description="Uma boa solução passa por perguntas, ideias, tentativas, erros, ajustes e novas descobertas."
              />
              <p className="mt-4 max-w-2xl text-base leading-7 text-base-content/60">
                O Stagebook foi criado para que esse caminho não se perca.
                Registre o que a equipe está pensando, organize o que está sendo
                construído e volte ao processo sempre que precisar.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
                >
                  <NotebookPen size={20} />
                  Abrir meu Stagebook
                </Link>
                <a href="#integracao" className="btn btn-ghost btn-lg">
                  Como tudo se conecta
                  <ArrowDown size={18} />
                </a>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <DocumentPreview />
            </RevealOnScroll>
          </div>

          {/* ciclo */}
          <div className="relative mx-auto mt-20 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[2.9rem] hidden border-t-2 border-dashed border-base-300 lg:block" />
            {process.map(({ icon: Icon, title, text, tone }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.06} className="h-full">
                  <article className={`group relative flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                    <div className="flex items-center justify-between">
                      <div className={`relative z-10 flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-xs tracking-widest text-base-content/40">ETAPA {String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold tracking-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* ===================================================== RECURSOS */}
        <section id="recursos" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ SEU ESPAÇO DE TRABALHO"
                title="Tudo para manter a temporada"
                highlight="em movimento."
                description="Documente o conhecimento, organize os compromissos e transforme planos em ações."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {workspace.map(({ icon: Icon, tag, title, text, details, href, link, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <RevealOnScroll key={href} delay={i * 0.08} className="h-full">
                    <Link
                      href={href}
                      className={`group relative flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-7 transition-all duration-300 hover:-translate-y-1 ${
                        tone === "primary"
                          ? "hover:shadow-[8px_8px_0_0_var(--color-primary)]"
                          : tone === "secondary"
                            ? "hover:shadow-[8px_8px_0_0_var(--color-secondary)]"
                            : "hover:shadow-[8px_8px_0_0_var(--color-accent)]"
                      }`}
                    >
                      <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                      <div className="relative flex items-center justify-between">
                        <div className={`flex size-14 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                          <Icon size={24} strokeWidth={1.8} />
                        </div>
                        <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <p className={`relative mt-8 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{tag}</p>
                      <h3 className="relative mt-2 text-2xl font-bold tracking-tight">{title}</h3>
                      <p className="relative mt-3 text-sm leading-6 text-base-content/60">{text}</p>
                      <ul className="relative mt-5 flex flex-1 flex-wrap content-start gap-1.5">
                        {details.map((d) => (
                          <li key={d} className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-[11px] text-base-content/70">{d}</li>
                        ))}
                      </ul>
                      <span className="relative mt-6 flex items-center justify-between border-t border-base-300 pt-4 text-sm font-bold">
                        {link}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================== INTEGRAÇÃO */}
        <section id="integracao" className="relative isolate scroll-mt-20 overflow-hidden px-6 py-24">
          <AnimatedBackground />
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ INTEGRAÇÃO"
                title="Um sistema,"
                highlight="tudo conectado."
                highlightClass="bg-secondary text-secondary-content"
                description="O Stagebook não fica sozinho. Documentos, Kanban e calendário conversam entre si e com o LabTest e o ThinkLab, tudo dentro do espaço da sua equipe."
              />
            </RevealOnScroll>

            {/* mapa do sistema */}
            <div className="mt-14 grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
              <div className="order-2 grid gap-4 lg:order-1">
                {leftNodes.map((n, i) => (
                  <RevealOnScroll key={n.name} delay={i * 0.06} direction="left" className="h-full">
                    <NodeCard node={n} side="left" />
                  </RevealOnScroll>
                ))}
              </div>

              <RevealOnScroll className="order-1 lg:order-2">
                <div className="relative mx-auto w-full max-w-xs rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-content p-6 text-base-100 shadow-[8px_8px_0_0_var(--color-primary)] lg:w-64">
                  <span className="grid size-14 place-items-center rounded-tl-xl rounded-br-xl bg-primary text-primary-content">
                    <Users size={26} strokeWidth={1.8} />
                  </span>
                  <p className="mt-5 font-mono text-[10px] tracking-[0.18em] text-base-100/60">CENTRO</p>
                  <h3 className="mt-1 text-2xl font-bold">Sua equipe</h3>
                  <p className="mt-2 text-sm leading-6 text-base-100/70">
                    Membros, espaço compartilhado e tudo o que a equipe cria, em um só lugar.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Espaço pessoal", "Espaço da equipe"].map((s) => (
                      <span key={s} className="rounded border border-base-100/25 px-1.5 py-0.5 font-mono text-[10px] text-base-100/75">{s}</span>
                    ))}
                  </div>
                  <Link href="/dashboard/team" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
                    Ver equipes <ArrowRight size={14} />
                  </Link>
                </div>
              </RevealOnScroll>

              <div className="order-3 grid gap-4">
                {rightNodes.map((n, i) => (
                  <RevealOnScroll key={n.name} delay={i * 0.06} direction="right" className="h-full">
                    <NodeCard node={n} side="right" />
                  </RevealOnScroll>
                ))}
              </div>
            </div>

            {/* conexões */}
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {connections.map(({ icon: Icon, title, text }, i) => {
                const c = toneClasses[(["primary", "secondary", "accent"] as Tone[])[i % 3]];
                return (
                  <RevealOnScroll key={title} delay={(i % 3) * 0.06} className="h-full">
                    <article className={`flex h-full gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 ${c.hover}`}>
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-tl-lg rounded-br-lg ${c.icon}`}>
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="font-bold">{title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-base-content/60">{text}</p>
                      </div>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================== DA IDEIA À AÇÃO */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ DA IDEIA À EXECUÇÃO"
                  title="Uma anotação pode virar"
                  highlight="o próximo teste."
                  highlightClass="bg-accent text-accent-content"
                  description="O processo não precisa ficar dividido entre arquivos, mensagens e anotações espalhadas. Veja uma ideia passar por todo o sistema."
                />
                <Link
                  href="/labtest"
                  className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-secondary hover:text-secondary"
                >
                  <FlaskConical size={16} />
                  /labtest
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </RevealOnScroll>

            <ol className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {flow.map(({ icon: Icon, tool, title, text, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <li key={title}>
                    <RevealOnScroll delay={(i % 3) * 0.08} className="h-full">
                      <article className={`group relative flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-3xl font-bold ${c.tag}`}>{String(i + 1).padStart(2, "0")}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-tl-md rounded-br-md border border-base-300 px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-base-content/60">
                            <Icon size={12} />
                            {tool.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                        {i < flow.length - 1 && (
                          <ArrowRight aria-hidden="true" size={16} className="mt-4 self-end text-base-content/30" />
                        )}
                      </article>
                    </RevealOnScroll>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ===================================================== FEITO PARA */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ FEITO PARA O PROCESSO"
                title="Não é só onde você"
                highlight="guarda informações."
                description="É onde a equipe registra, conecta e revisita tudo aquilo que ajuda uma ideia a se transformar em resultado."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <RevealOnScroll key={title} delay={(i % 3) * 0.06} className="h-full">
                    <article className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                      <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                      <div className="relative flex items-center justify-between">
                        <div className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                          <Icon size={22} strokeWidth={1.8} />
                        </div>
                        <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="relative mt-7 text-xl font-bold tracking-tight">{title}</h3>
                      <p className="relative mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                    </article>
                  </RevealOnScroll>
                );
              })}
              <RevealOnScroll delay={0.12} className="h-full">
                <Link
                  href="/dashboard"
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-tl-2xl rounded-br-2xl border border-primary bg-primary p-6 text-primary-content shadow-[6px_6px_0_0_var(--color-base-content)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full border-[28px] border-primary-content/10" />
                  <div className="relative">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-primary-content/70">COMECE AGORA</p>
                    <h3 className="mt-2 text-2xl font-bold">Comece a construir</h3>
                    <p className="mt-2 text-sm leading-6 text-primary-content/80">
                      Abra seu Stagebook e registre o próximo passo da sua equipe.
                    </p>
                  </div>
                  <span className="relative mt-6 inline-flex items-center gap-2 font-bold">
                    Abrir Stagebook
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* =================================================== O QUE REGISTRAR */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.6fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <div className="lg:sticky lg:top-28">
                <SectionTitle
                  kicker="/ NA PRÁTICA"
                  title="O que sua equipe"
                  highlight="pode registrar?"
                  highlightClass="bg-secondary text-secondary-content"
                  description="Há pesquisas, reuniões, testes, estratégias, tarefas e decisões acontecendo ao mesmo tempo. O Stagebook acompanha os grandes momentos e as pequenas decisões, sem tirar da equipe a liberdade de trabalhar do seu jeito."
                />
              </div>
            </RevealOnScroll>
            <ul className="grid gap-4 sm:grid-cols-2">
              {useCases.map(({ title, text }, i) => (
                <li key={title}>
                  <RevealOnScroll delay={(i % 2) * 0.06} className="h-full">
                    <article className="flex h-full gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-base-content/30">
                      <span className="font-mono text-xs text-base-content/40">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-bold">{title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-base-content/60">{text}</p>
                      </div>
                    </article>
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ==================================================== CONHECIMENTO */}
        <section className="relative isolate overflow-hidden bg-secondary px-6 py-24 text-secondary-content">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px] opacity-[0.08]" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 hidden size-72 rounded-full border-[32px] border-accent/90 sm:block" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <RevealOnScroll>
              <p className="font-mono text-xs tracking-[0.2em] text-secondary-content/60">/ CONHECIMENTO QUE PERMANECE</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
                A temporada termina.{" "}
                <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">O aprendizado fica.</span>
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <div className="space-y-5 text-base leading-7 text-secondary-content/80 sm:text-lg sm:leading-8">
                <p>
                  Ao longo de uma temporada, a equipe toma centenas de decisões.
                  Algumas funcionam. Outras precisam ser revistas.
                </p>
                <p>
                  Registrar esse processo permite que o conhecimento não dependa
                  apenas da memória de quem estava presente, e que o próximo
                  projeto comece com o histórico do anterior.
                </p>
                <div className="rounded-tl-2xl rounded-br-2xl border border-secondary-content/20 bg-secondary-content/10 p-5">
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-accent">O PROCESSO CONTINUA</p>
                  <p className="mt-2 font-semibold text-secondary-content">
                    O próximo projeto começa com mais conhecimento do que o anterior.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <CtaBlock
          kicker="STAGEBOOK"
          icon={NotebookPen}
          title="O que sua equipe está construindo?"
          text="Comece pelo próximo pensamento. Registre o processo e deixe o Stagebook acompanhar o caminho até a solução."
          actions={[
            { label: "Começar agora", href: "/dashboard", variant: "accent" },
            { label: "Conhecer o LabTest", href: "/labtest", variant: "ghost" },
            { label: "Criar conta grátis", href: "/sign-up", variant: "ghost" },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}