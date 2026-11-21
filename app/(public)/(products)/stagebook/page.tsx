import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bell,
  BrainCircuit,
  CalendarDays,
  FileText,
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
import { Navbar } from "@/components/UI/Navbar";
import { ProductHero } from "@/components/product/ProductHero";
import { CoverCard, CycleSteps, ProductCta } from "@/components/product/ProductBlocks";
import {
  ActionCard,
  ActivityCard,
  AvatarStack,
  ButtonLink,
  Card,
  ChecklistCard,
  DocBanner,
  IconList,
  Kicker,
  Marquee,
  Mascot,
  PullQuote,
  Reveal,
  Section,
  SectionTitle,
  Sparkle,
  StickerTag,
  TaskCard,
  Timeline,
  cn,
  toneSoft,
  type CoverPattern,
  type Tone,
} from "@/components/stage";

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

const workspacePattern: Record<string, CoverPattern> = {
  "/dashboard/documents": "topo",
  "/dashboard/calendar": "grid",
  "/dashboard/kanban": "halftone",
};

const team = ["Ana Lima", "Bruno Sato", "Carla Dias", "Davi Rocha", "Eva Martins", "Felipe Nunes"];

/* --------------------------------------------------------------- partes */

/** Prévia do hero: banner de documento + tarefa + atividade, sobrepostos. */
function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-md">
      <Card padded={false} featured className="-rotate-2 overflow-hidden border border-base-300">
        <DocBanner
          title="Garra da missão 05"
          icon="🦾"
          breadcrumb={["Temporada", "Robô"]}
          height="h-24"
          meta={
            <>
              <span>Editado há 2 h</span>
              <AvatarStack names={team.slice(0, 3)} size={24} />
            </>
          }
        />
      </Card>
      <TaskCard
        title="Testar garra com elástico"
        priority="alta"
        assignees={["Ana Lima", "Davi Rocha"]}
        due="sáb, 14h"
        tags={["robô", "missão-05"]}
        subtasks={[2, 4]}
        className="relative -mt-6 ml-16 rotate-2 stage-shadow-lg"
      />
      <Sparkle size={36} tone="accent" motion="float" className="absolute -left-6 top-10" />
    </div>
  );
}

function DocumentPreview() {
  return (
    <div className="relative">
      <Mascot size={78} motion="wiggle" rotate={-10} className="absolute -right-5 -top-12 z-10 hidden sm:block" />
      <Card featured padded={false} className="overflow-hidden border border-base-300 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <DocBanner
          title="Reunião: nova garra para a missão 05"
          icon="📝"
          breadcrumb={["Temporada", "Robô", "Garra"]}
          meta={
            <span className="flex flex-wrap gap-1.5">
              {["#robô", "#missão-05", "#teste"].map((t) => (
                <span key={t} className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-[11px] text-base-content/70">{t}</span>
              ))}
            </span>
          }
        />
        <div className="px-5 pb-5 sm:px-8 sm:pb-6">
          <ul className="space-y-2 text-sm text-base-content/70">
            <li className="flex gap-2"><span className="text-primary">•</span> A garra atual solta a peça em 3 de 10 tentativas.</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Testar versão com elástico no próximo treino.</li>
          </ul>
          <p className="mt-6 inline-flex items-center gap-1.5 stage-kicker text-base-content/45">
            <Link2 size={12} /> VINCULADO A
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <TaskCard title="Testar garra com elástico" priority="alta" assignees={["Ana Lima"]} due="sáb" />
            <div className="stage-paper rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-4">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-secondary">
                <CalendarDays size={12} /> CALENDÁRIO
              </p>
              <p className="mt-1 font-semibold">Treino de mesa</p>
              <p className="mt-1 font-mono text-[11px] text-base-content/50">sábado · 14h</p>
            </div>
          </div>
        </div>
        <figcaption className="stage-night px-5 py-3 font-mono text-[11px] leading-6 sm:text-xs">
          <Bell size={12} className="mr-1 inline text-[#fabd32]" /> Você foi marcado como responsável em{" "}
          <span className="text-[#9be15d]">Testar garra com elástico</span>
        </figcaption>
      </Card>
    </div>
  );
}

function NodeCard({ node, side }: { node: Node; side: "left" | "right" }) {
  const Icon = node.icon;
  return (
    <Link
      href={node.href}
      className="stage-paper group relative flex h-full gap-4 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--stage-shadow)]"
    >
      <span
        aria-hidden
        className={cn("absolute top-1/2 hidden w-10 border-t-2 border-dashed border-base-300 lg:block", side === "left" ? "-right-10" : "-left-10")}
      />
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300", toneSoft[node.tone])}>
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

      <ProductHero
        kicker="STAGEBOOK · ESPAÇO DA EQUIPE"
        title="A ideia começa"
        highlight="antes da solução."
        highlightTone="secondary"
        description="O Stagebook é o espaço da sua equipe para registrar pensamentos, organizar projetos, acompanhar tarefas e transformar cada etapa da temporada em conhecimento."
        image="/images/index/banner_stagebook.png"
        primary={{ label: "Abrir meu Stagebook", href: "/dashboard" }}
        secondary={{ label: "Explorar recursos", href: "#recursos" }}
        badges={[
          { label: "Documentos", href: "#recursos" },
          { label: "Calendário", href: "#recursos" },
          { label: "Kanban", href: "#recursos" },
          { label: "Integração", href: "#integracao" },
        ]}
        aside={<HeroPreview />}
        scrollTarget="#processo"
      />

      <main className="overflow-x-clip bg-base-100 text-base-content">
        <div className="relative z-10 -my-2 overflow-hidden py-2">
          <Marquee items={useCases.map((u) => u.title)} tone="ink" tilt={1} speed={45} reverse />
        </div>

        {/* ========================================================= INTRO */}
        <Section id="processo" tone="glow">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
            <Reveal>
              <SectionTitle
                kicker="/ O PROCESSO IMPORTA"
                title="Nem toda solução"
                highlight="nasce pronta."
                highlightTone="accent"
                description="Uma boa solução passa por perguntas, ideias, tentativas, erros, ajustes e novas descobertas."
              />
              <p className="mt-4 max-w-2xl text-base leading-7 text-base-content/60">
                O Stagebook foi criado para que esse caminho não se perca.
                Registre o que a equipe está pensando, organize o que está sendo
                construído e volte ao processo sempre que precisar.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/dashboard" size="lg" iconLeft={<NotebookPen size={20} />}>
                  Abrir meu Stagebook
                </ButtonLink>
                <ButtonLink href="#integracao" tone="ghost" size="lg" shape="rounded" iconRight={<ArrowDown size={18} />}>
                  Como tudo se conecta
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={100} effect="pop">
              <DocumentPreview />
            </Reveal>
          </div>

          <CycleSteps steps={process} className="mx-auto mt-20 max-w-6xl" />
        </Section>

        {/* ===================================================== RECURSOS */}
        <Section id="recursos" tone="muted" edgeTop="torn">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle
                kicker="/ SEU ESPAÇO DE TRABALHO"
                title="Tudo para manter a temporada"
                highlight="em movimento."
                description="Documente o conhecimento, organize os compromissos e transforme planos em ações."
              />
            </Reveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {workspace.map(({ icon, tag, title, text, details, href, link, tone }, i) => (
                <Reveal key={href} delay={i * 90} className="h-full">
                  <CoverCard
                    index={i + 1}
                    icon={icon}
                    tag={tag}
                    title={title}
                    text={text}
                    features={details}
                    tone={tone as "primary" | "secondary" | "accent"}
                    pattern={workspacePattern[href]}
                    href={href}
                    linkLabel={link}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* ===================================================== INTEGRAÇÃO */}
        <Section id="integracao" tone="glow">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle
                kicker="/ INTEGRAÇÃO"
                title="Um sistema,"
                highlight="tudo conectado."
                highlightTone="secondary"
                description="O Stagebook não fica sozinho. Documentos, Kanban e calendário conversam entre si e com o LabTest e o ThinkLab, tudo dentro do espaço da sua equipe."
              />
            </Reveal>

            <div className="mt-14 grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
              <div className="order-2 grid gap-4 lg:order-1">
                {leftNodes.map((n, i) => (
                  <Reveal key={n.name} delay={i * 70} effect="slide-right" className="h-full">
                    <NodeCard node={n} side="left" />
                  </Reveal>
                ))}
              </div>
              <Reveal effect="pop" className="order-1 lg:order-2">
                <div className="stage-night stage-texture stage-corner relative mx-auto w-full max-w-xs rounded-tl-3xl rounded-br-3xl p-6 shadow-[8px_8px_0_0_var(--color-primary)] lg:w-64">
                  <Sparkle size={30} tone="accent" motion="spin" className="absolute -right-3 -top-3" />
                  <span className="grid size-14 place-items-center rounded-tl-xl rounded-br-xl bg-primary text-primary-content">
                    <Users size={26} strokeWidth={1.8} />
                  </span>
                  <p className="stage-kicker mt-5 text-white/60">CENTRO</p>
                  <h3 className="stage-display mt-1 text-2xl">Sua equipe</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Membros, espaço compartilhado e tudo o que a equipe cria, em um só lugar.
                  </p>
                  <div className="mt-4">
                    <AvatarStack names={team} max={4} size={30} />
                  </div>
                  <Link href="/equipe" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
                    Conhecer Equipes <ArrowRight size={14} />
                  </Link>
                </div>
              </Reveal>
              <div className="order-3 grid gap-4">
                {rightNodes.map((n, i) => (
                  <Reveal key={n.name} delay={i * 70} effect="slide-left" className="h-full">
                    <NodeCard node={n} side="right" />
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={100}>
              <IconList
                columns={3}
                items={connections.map(({ icon: Icon, title, text }, i) => ({
                  icon: <Icon />,
                  title,
                  text,
                  tone: (["primary", "secondary", "accent"] as Tone[])[i % 3],
                }))}
                className="stage-paper mt-16 rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 p-8"
              />
            </Reveal>
          </div>
        </Section>

        {/* ==================================================== DA IDEIA À AÇÃO */}
        <Section tone="muted" edgeTop="torn" edgeBottom="torn">
          <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
            <div>
              <Reveal>
                <SectionTitle
                  kicker="/ DA IDEIA À EXECUÇÃO"
                  title="Uma anotação pode virar"
                  highlight="o próximo teste."
                  highlightTone="accent"
                  description="O processo não precisa ficar dividido entre arquivos, mensagens e anotações espalhadas. Veja uma ideia passar por todo o sistema."
                />
              </Reveal>
              <Reveal delay={100}>
                <Timeline
                  className="mt-10"
                  items={flow.map(({ tool, title, text, tone }, i) => ({
                    time: String(i + 1).padStart(2, "0"),
                    title: `${title} · ${tool}`,
                    text,
                    tone,
                    current: i === 2,
                  }))}
                />
              </Reveal>
            </div>
            <Reveal delay={150} effect="slide-left" className="lg:sticky lg:top-28">
              <ActivityCard
                title="Atividade da equipe"
                items={[
                  { who: "Ana", action: "criou a página", target: "Ideia: garra com elástico", time: "seg", icon: <NotebookPen size={14} />, tone: "primary" },
                  { who: "Bruno", action: "montou um 5W2H em", target: "ThinkLab", time: "ter", icon: <BrainCircuit size={14} />, tone: "secondary" },
                  { who: "Carla", action: "moveu para Em andamento", target: "Testar garra", time: "qua", icon: <KanbanSquare size={14} />, tone: "accent" },
                  { who: "Davi", action: "agendou", target: "Treino de mesa · sáb", time: "qui", icon: <CalendarDays size={14} />, tone: "primary" },
                  { who: "Eva", action: "registrou 10 runs no", target: "LabTest", time: "sáb", icon: <FlaskConical size={14} />, tone: "secondary" },
                ]}
              />
              <ButtonLink href="/labtest" tone="outline" className="mt-5 font-mono font-medium" iconLeft={<FlaskConical size={16} />} iconRight={<ArrowRight size={15} />}>
                /labtest
              </ButtonLink>
            </Reveal>
          </div>
        </Section>

        {/* ===================================================== FEITO PARA */}
        <Section>
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle
                kicker="/ FEITO PARA O PROCESSO"
                title="Não é só onde você"
                highlight="guarda informações."
                description="É onde a equipe registra, conecta e revisita tudo aquilo que ajuda uma ideia a se transformar em resultado."
              />
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text, tone }, i) => (
                <Reveal key={title} delay={(i % 3) * 70} className="h-full">
                  <Card
                    corner
                    className="group flex h-full flex-col border border-base-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--stage-shadow)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("grid size-12 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300", toneSoft[tone])}>
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="stage-display mt-7 text-xl">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                  </Card>
                </Reveal>
              ))}
              <Reveal delay={140} className="h-full">
                <ActionCard
                  kicker="COMECE AGORA"
                  title="Comece a construir"
                  description="Abra seu Stagebook e registre o próximo passo da sua equipe."
                  action={{ label: "Abrir Stagebook", href: "/dashboard" }}
                  tone="primary"
                  className="h-full"
                />
              </Reveal>
            </div>
          </div>
        </Section>

        {/* =================================================== O QUE REGISTRAR */}
        <Section tone="muted">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <SectionTitle
                  kicker="/ NA PRÁTICA"
                  title="O que sua equipe"
                  highlight="pode registrar?"
                  highlightTone="secondary"
                  description="Há pesquisas, reuniões, testes, estratégias, tarefas e decisões acontecendo ao mesmo tempo. O Stagebook acompanha os grandes momentos e as pequenas decisões, sem tirar da equipe a liberdade de trabalhar do seu jeito."
                />
                <p className="mt-6 inline-flex items-center gap-2 text-sm text-base-content/55">
                  <StickerTag tone="accent" size="sm" shadow={false}>Experimente</StickerTag>
                  marque o que a sua equipe já registra.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <ChecklistCard
                title="Registros da temporada"
                items={useCases.map((u, i) => ({ id: u.title, label: u.title, hint: u.text, done: i < 2 }))}
              />
            </Reveal>
          </div>
        </Section>

        {/* ==================================================== CONHECIMENTO */}
        <Section tone="secondary" edgeTop="wave" edgeBottom="wave">
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="stage-kicker opacity-60">/ CONHECIMENTO QUE PERMANECE</p>
              <h2 className="stage-display mt-3 text-3xl sm:text-5xl">
                A temporada termina.{" "}
                <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">O aprendizado fica.</span>
              </h2>
              <div className="mt-6 space-y-4 text-base leading-7 opacity-80 sm:text-lg sm:leading-8">
                <p>
                  Ao longo de uma temporada, a equipe toma centenas de decisões.
                  Algumas funcionam. Outras precisam ser revistas.
                </p>
                <p>
                  Registrar esse processo permite que o conhecimento não dependa
                  apenas da memória de quem estava presente, e que o próximo
                  projeto comece com o histórico do anterior.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100} effect="pop">
              <Card tone="paper" featured tilt={1.5} className="p-8">
                <PullQuote className="py-0 pl-12 sm:pl-14">
                  O próximo projeto começa com mais conhecimento do que o anterior.
                </PullQuote>
                <Kicker className="mt-4 pl-12 text-secondary sm:pl-14">O PROCESSO CONTINUA</Kicker>
              </Card>
            </Reveal>
          </div>
        </Section>

        <ProductCta
          kicker="STAGEBOOK"
          icon={NotebookPen}
          title="O que sua equipe está construindo?"
          text="Comece pelo próximo pensamento. Registre o processo e deixe o Stagebook acompanhar o caminho até a solução."
          primary={{ label: "Começar agora", href: "/dashboard" }}
          links={[
            { label: "Conhecer o LabTest", href: "/labtest" },
            { label: "Criar conta grátis", href: "/sign-up" },
          ]}
          tone="primary"
        />
      </main>

      <Footer />
    </>
  );
}
