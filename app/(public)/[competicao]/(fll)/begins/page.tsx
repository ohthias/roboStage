import { Metadata } from "next";
import {
  TriangleAlert,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  FolderKanban,
  Gamepad2,
  Trophy,
  Link2,
  CalendarDays,
  ChevronRight,
  Sparkles,
  ClipboardList,
  PlayCircle,
  Youtube,
  Video,
  BadgeInfo,
  Globe2,
  School2,
  Megaphone,
  MessageSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciando na FLL | RoboStage",
  description:
    "Guia visual para equipes iniciantes na FIRST LEGO League Challenge, com cards de destaque, cronograma por semanas, vídeos recomendados e FAQ.",
};

const checklist = [
  "Leitura inicial dos guias da temporada.",
  "Primeiros testes em campo e no robô.",
  "Registro contínuo no Engineering Notebook.",
  "Definição do problema do projeto de inovação.",
  "Treino de apresentação com toda a equipe.",
  "Revisão final de regras e rubricas.",
];

const usefulLinks = [
  {
    label: "Site oficial da FIRST LEGO League",
    href: "https://www.firstlegoleague.com.br/",
  },
  {
    label: "Como começar uma equipe",
    href: "https://www.firstinspires.org/programs/fll/get-started",
  },
  {
    label: "Materiais da temporada",
    href: "https://www.firstinspires.org/resources/library/fll/season-materials",
  },
  {
    label: "Recursos técnicos da Challenge",
    href: "https://www.firstinspires.org/resources/library/fll/technical-resources",
  },
];

const recommendedVideos = [
  {
    title: "Season Welcome Video",
    description:
      "Ótimo para introduzir a temporada e alinhar a equipe com a proposta do desafio.",
    href: "https://www.firstinspires.org/resources/library/fll/season-materials",
    icon: PlayCircle,
    badge: "Oficial",
  },
  {
    title: "Robot Game Missions Video",
    description:
      "Ajuda a entender o campo, as missões e a forma de pensar o jogo de robô.",
    href: "https://www.youtube.com/watch?v=ErDj8myI_Tg",
    icon: Gamepad2,
    badge: "Vídeo",
  },
  {
    title: "Preparing for your Event Video",
    description:
      "Recomendado para equipes que querem se preparar melhor para a dinâmica do evento.",
    href: "https://www.firstinspires.org/resources/library/fll/season-materials",
    icon: BadgeInfo,
    badge: "Dica",
  },
  {
    title: "Canal oficial da FIRST LEGO League",
    description:
      "Bom para acompanhar vídeos novos, teasers e materiais publicados pela organização.",
    href: "https://www.youtube.com/@FIRSTLEGOLeagueofficial",
    icon: Youtube,
    badge: "Canal",
  },
];

const faq = [
  {
    question: "Qual é o primeiro passo para uma equipe iniciante?",
    answer:
      "Comece entendendo a temporada, organizando a equipe e separando um espaço de trabalho. Depois disso, avance para a leitura dos materiais oficiais e os primeiros testes do robô.",
  },
  {
    question: "A equipe precisa dominar tudo antes de competir?",
    answer:
      "Não. O objetivo é evoluir ao longo da temporada. Equipes novas crescem mais rápido quando começam simples, registram aprendizados e melhoram por ciclos.",
  },
  {
    question: "O que deve ser priorizado no começo?",
    answer:
      "No início, priorize organização da equipe, entendimento do tema, base do robô e documentação. Complexidade vem depois da consistência.",
  },
  {
    question: "Como escolher o projeto de inovação?",
    answer:
      "Escolha um problema real, específico e relevante para pessoas ou comunidades. Pesquise antes de propor solução e documente todas as etapas.",
  },
  {
    question: "Como preparar a equipe para avaliação?",
    answer:
      "Treine explicações curtas, mostre o processo de aprendizagem e revise as rubricas. Os avaliadores valorizam clareza, colaboração e evolução.",
  },
];

const aboutFirst = [
  {
    icon: Globe2,
    title: "O que é a FIRST",
    description:
      "A FIRST é a organização internacional por trás dos programas de robótica educacional. Ela promove aprendizagem prática em STEM por meio de desafios em equipe e é a estrutura maior que reúne vários programas, incluindo a FLL.",
  },
  {
    icon: School2,
    title: "O que é a FLL",
    description:
      "A FIRST LEGO League é a trilha educacional da FIRST para crianças e adolescentes. Ela combina robótica, pesquisa, criatividade, colaboração e apresentação de soluções para desafios temáticos.",
  },
  {
    icon: Megaphone,
    title: "O que são as temporadas",
    description:
      "Cada temporada traz um tema novo, regras atualizadas, materiais oficiais e missões próprias. As equipes desenvolvem robôs, projetos e apresentações com base nesse desafio anual.",
  },
];

const brazilChannels = [
  {
    icon: Globe2,
    title: "Portal brasileiro da FLL",
    description:
      "Central oficial para informações do programa no Brasil, com páginas de inscrição, materiais, calendário e showcase.",
    href: "https://www.firstlegoleague.com.br/",
  },
  {
    icon: BookOpen,
    title: "Materiais da temporada",
    description:
      "Página oficial com os arquivos e referências de cada temporada e categoria.",
    href: "https://www.firstlegoleague.com.br/materiais",
  },
  {
    icon: CalendarDays,
    title: "Calendário",
    description:
      "Página com datas e informações da operação brasileira da FLL.",
    href: "https://www.firstlegoleague.com.br/calend%C3%A1rio",
  },
];

export default function BeginsPage() {
  return (
    <main className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-8 md:p-8">
        <div className="flex items-start gap-5">
          <div className="flex flex-col gap-2 items-start">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-content bg-primary w-max px-2">
              Iniciando na FLL
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-base-content md:text-5xl">
              FLL para equipes{" "}
              <span className="text-black bg-accent px-2">Iniciantes</span>
            </h1>

            <p className="max-w-2xl text-base text-base-content/70 md:text-lg">
              A FIRST LEGO League é uma competição de robótica e inovação que
              desafia equipes de estudantes a resolver problemas do mundo real
              utilizando LEGO® Education. Se você é novo na FLL, este guia irá
              ajudá-lo a começar sua jornada.
            </p>
          </div>
        </div>
      </header>

      <section className="mt-10">
        <div className="alert alert-warning alert-soft">
          <TriangleAlert className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Conteúdo não oficial</h3>
            <p>
              Esta página reúne orientações práticas com base em materiais
              públicos da FIRST. Consulte sempre as regras e documentos da
              temporada vigente para confirmar detalhes atuais.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-info/15">
            <Gamepad2 className="h-6 w-6 text-info" />
          </div>
          <h2 className="text-xl font-bold">Desafio do Robô & Design do Robô</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Construir, programar e testar o robô para resolver missões no campo.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15">
            <Lightbulb className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-xl font-bold">Projeto de Inovação</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Pesquisar um problema real, validar ideias e propor uma solução bem
            documentada.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
            <Sparkles className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-xl font-bold">Core Values</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Trabalhar com cooperação, respeito, inclusão e espírito de equipe.
          </p>
        </article>
      </section>

      <section className="mt-12 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
        <div className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-[28px] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 xl:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  O que a equipe precisa ter
                </h2>
                <p className="text-sm text-base-content/60">
                  Estrutura mínima para começar com segurança.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Organização</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Papéis definidos, rotina de encontros e divisão clara de
                  tarefas.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Documentação</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Notebook da equipe atualizado com testes, falhas, ideias e
                  decisões.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Aprendizado contínuo</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Cada treino deve gerar uma melhoria concreta no robô ou no
                  projeto.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Comunicação</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  A equipe precisa saber explicar decisões com clareza e
                  confiança.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-secondary/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 xl:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  O que é a FIRST, a FLL e as temporadas
                </h2>
                <p className="text-sm text-base-content/60">
                  Conceitos essenciais para quem está entrando agora.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {aboutFirst.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-base-300 bg-base-200/50 p-5"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/70">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[28px] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-info/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 xl:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20">
                <Trophy className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Como pensar para a competição
                </h2>
                <p className="text-sm text-base-content/60">
                  O foco inicial deve ser consistência e evolução.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">Na mesa do robô</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  A equipe deve treinar repetição, correção e priorização das
                  missões mais viáveis.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">Na entrevista</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Fale com objetividade, mostre o processo e destaque o
                  aprendizado da equipe.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">No projeto</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Explique o problema, a pesquisa, os testes e por que a solução
                  faz sentido.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">Na rotina</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Pequenos avanços constantes valem mais do que tentar fazer
                  tudo de uma vez.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 xl:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Vídeos recomendados</h2>
                <p className="text-sm text-base-content/60">
                  Uma seleção prática para começar pela parte mais importante.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {recommendedVideos.map((video) => {
                const Icon = video.icon;
                return (
                  <a
                    key={video.title}
                    href={video.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-2xl border border-base-300 bg-base-200/50 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="rounded-full bg-base-100 px-3 py-1 text-xs font-semibold text-base-content/60">
                        {video.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold group-hover:text-primary">
                      {video.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/70">
                      {video.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Assistir agora
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </a>
                );
              })}
            </div>

            <p className="mt-5 text-xs leading-6 text-base-content/50">
              Os materiais em vídeo podem variar por temporada. A página de
              materiais oficiais da FIRST LEGO League concentra os conteúdos
              mais recentes e úteis para equipes iniciantes.
            </p>
          </article>

          <article className="rounded-[28px] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-success/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 xl:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/15">
                <School2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Canais oficiais brasileiros
                </h2>
                <p className="text-sm text-base-content/60">
                  Onde acompanhar informações, materiais e operação no Brasil.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {brazilChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <a
                    key={channel.title}
                    href={channel.href}
                    target={
                      channel.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      channel.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="rounded-2xl border border-base-300 bg-base-200/50 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{channel.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/70">
                      {channel.description}
                    </p>
                  </a>
                );
              })}
            </div>
          </article>
        </div>

        <aside className="grid gap-6 xl:sticky xl:top-2">
          <article className="rounded-[28px] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-info/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/15">
                <FolderKanban className="h-5 w-5 text-info" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Checklist inicial</h2>
                <p className="text-sm text-base-content/60">
                  Um resumo rápido para a primeira fase.
                </p>
              </div>
            </div>

            <ul className="space-y-1">
              {checklist.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition hover:bg-base-200/60">
                    <input type="checkbox" className="peer sr-only" />
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-base-300 peer-checked:text-success" />
                    <span className="text-sm leading-6 text-base-content/75 peer-checked:text-base-content/60 peer-checked:line-through">
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[28px] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-base-200/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recursos oficiais</h2>
                <p className="text-sm text-base-content/60">
                  Materiais úteis para consulta.
                </p>
              </div>
            </div>

            <ul className="space-y-3">
              {usefulLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </section>

      <section id="faq" className="mt-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">FAQ para equipes novas</h2>
            <p className="text-sm text-base-content/60">
              Respostas diretas para as dúvidas mais comuns.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                <span>{item.question}</span>
                <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-sm leading-7 text-base-content/70">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
