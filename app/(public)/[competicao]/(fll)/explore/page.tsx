import { Metadata } from "next";
import {
  TriangleAlert,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  FolderKanban,
  Blocks,
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
  Presentation,
  NotebookPen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciando na FLL Explore | RoboStage",
  description:
    "Guia para equipes estreantes na FIRST LEGO League Explore: o que é o programa, como funciona a temporada, checklist inicial, vídeos recomendados, canais oficiais e FAQ.",
};

const checklist = [
  "Montar a equipe (até 6 alunos de 6 a 10 anos) e o adulto responsável.",
  "Adquirir o conjunto LEGO® da temporada e o kit SPIKE Essential.",
  "Ler o Guia de Encontro de Equipes com o professor/treinador.",
  "Iniciar as 12 sessões do Caderno de Engenharia.",
  "Construir e motorizar o Modelo de Exploração.",
  "Montar o Show Me Poster com o registro da jornada.",
  "Treinar a conversa com os avaliadores para o evento.",
  "Inscrever a equipe em um evento de celebração.",
];

const usefulLinks = [
  {
    label: "FIRST LEGO League Explore no Brasil",
    href: "https://www.firstlegoleague.com.br/first-lego-league-explore",
  },
  {
    label: "Inscrições Explore",
    href: "https://www.firstlegoleague.com.br/inscri%C3%A7%C3%B5es-explore",
  },
  {
    label: "Materiais da temporada",
    href: "https://www.firstlegoleague.com.br/materiais",
  },
  {
    label: "Como começar (FIRST, em inglês)",
    href: "https://www.firstinspires.org/programs/fll/get-started",
  },
];

const recommendedVideos = [
  {
    title: "Vídeo de abertura da temporada",
    description:
      "Apresenta o tema do ano para as crianças e ajuda a turma a entender por onde começar a explorar.",
    href: "https://www.firstinspires.org/programs/fll/game-and-season",
    icon: PlayCircle,
    badge: "Oficial",
  },
  {
    title: "Como montar o Modelo de Exploração",
    description:
      "Boa referência para entender a lógica de construir e motorizar o modelo com o SPIKE Essential.",
    href: "https://education.lego.com/en-us/products/lego-education-spike-essential-set/45345",
    icon: Blocks,
    badge: "Vídeo",
  },
  {
    title: "Como funciona um evento de celebração",
    description:
      "Mostra como é a conversa da equipe com os avaliadores — sem pontuação, sem eliminação, só compartilhar o que aprenderam.",
    href: "https://www.firstinspires.org/programs/fll/get-started",
    icon: BadgeInfo,
    badge: "Dica",
  },
  {
    title: "Canal oficial da FIRST LEGO League",
    description:
      "Reúne vídeos, teasers e materiais publicados diretamente pela FIRST ao longo da temporada.",
    href: "https://www.youtube.com/@FIRSTLEGOLeagueofficial",
    icon: Youtube,
    badge: "Canal",
  },
];

const faq = [
  {
    question: "Quem pode participar da FIRST LEGO League Explore?",
    answer:
      "Crianças de 6 a 10 anos, em equipes de até 6 integrantes, guiadas por um adulto responsável (professor, treinador ou familiar). A equipe pode nascer em uma escola, em atividades extracurriculares ou como um grupo independente de amigos.",
  },
  {
    question: "O Explore é uma competição?",
    answer:
      "Não. O Explore é um programa não competitivo: não há pontuação, ranking ou eliminação. A temporada termina em um evento de celebração, onde avaliadores conversam com cada equipe sobre o modelo e o Show Me Poster — e todas as equipes são reconhecidas.",
  },
  {
    question: "O que a equipe precisa produzir na temporada?",
    answer:
      "Um Modelo de Exploração feito com peças LEGO® e motorizado com o kit SPIKE Essential, além de um Show Me Poster, cartaz onde a equipe registra o processo, as descobertas e o aprendizado ao longo da temporada.",
  },
  {
    question: "Quanto tempo dura a temporada?",
    answer:
      "O programa é organizado em 12 sessões guiadas pelo Caderno de Engenharia e pelo Guia de Encontro de Equipes. A maioria dos grupos se reúne uma vez por semana, mas o ritmo é flexível e definido pela própria equipe.",
  },
  {
    question: "Como funciona a conversa com os avaliadores?",
    answer:
      "É uma conversa, não uma apresentação formal: a equipe mostra o modelo, o Show Me Poster e conta o que pesquisou e aprendeu. O objetivo é celebrar o processo, não julgar quem foi melhor.",
  },
  {
    question: "Qual a diferença entre Explore e Challenge?",
    answer:
      "O Explore (6 a 10 anos) é não competitivo e foca em construir um modelo e documentar o aprendizado. O Challenge (9 a 15/16 anos) é competitivo, com robôs autônomos programados para cumprir missões pontuadas em um tapete.",
  },
];

const aboutFirst = [
  {
    icon: Globe2,
    title: "O que é a FIRST",
    description:
      "A FIRST® é uma organização internacional sem fins lucrativos dedicada a preparar jovens para o futuro por meio de programas de robótica em equipe. A FLL é um dos programas mantidos por ela, ao lado da FIRST Tech Challenge e da FIRST Robotics Competition.",
  },
  {
    icon: School2,
    title: "O que é a FLL Explore",
    description:
      "A FIRST LEGO League Explore é a trilha de entrada da FLL, para crianças de 6 a 10 anos. As equipes constroem um modelo com peças LEGO®, aprendem noções básicas de engenharia e programação e compartilham o que aprenderam em um evento de celebração — sem competição.",
  },
  {
    icon: Megaphone,
    title: "O que são as temporadas",
    description:
      "O Explore segue o mesmo tema anual do Challenge, mas em versão mais simples: a equipe explora uma parte do assunto e constrói um modelo que representa suas descobertas, em vez de missões pontuadas.",
  },
];

const brazilChannels = [
  {
    icon: Globe2,
    title: "Educacional — operador do Explore no Brasil",
    description:
      "A Educacional (Positivo Tecnologia) é responsável pela operação nacional da FIRST LEGO League Explore e Discover, incluindo distribuição de materiais e inscrições.",
    href: "https://www.firstlegoleague.com.br/first-lego-league-explore",
  },
  {
    icon: BookOpen,
    title: "Portal brasileiro da FLL",
    description:
      "Central com informações dos três programas da FLL no Brasil (Discover, Explore e Challenge), materiais e canais de contato.",
    href: "https://www.firstlegoleague.com.br",
  },
  {
    icon: CalendarDays,
    title: "Calendário de eventos",
    description:
      "Página com datas de eventos locais, regionais e nacionais da operação brasileira.",
    href: "https://www.firstlegoleague.com.br/calend%C3%A1rio",
  },
];

export default function ExploreBeginsPage() {
  return (
    <main className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-8 md:p-8">
        <div className="flex items-start gap-5">
          <div className="flex flex-col gap-2 items-start">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-content bg-primary w-max px-2">
              Iniciando na FLL Explore
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-base-content md:text-5xl">
              Guia para {" "}
              <span className="text-black bg-accent px-2">Exploradores</span>
            </h1>

            <p className="max-w-2xl text-base text-base-content/70 md:text-lg">
              A FIRST® LEGO® League Explore é o programa de robótica educacional
              da FIRST® para crianças de 6 a 10 anos, com peças LEGO® e o kit
              LEGO® Education SPIKE Essential. Diferente do Challenge, o Explore
              é não competitivo: a temporada termina em um evento de celebração,
              não em um ranking. No Brasil, é operado pela Educacional. Este
              guia reúne o essencial para começar a temporada com organização e
              confiança.
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
              Esta página é um guia independente, produzido com base em
              materiais públicos da FIRST e da FLL Brasil. Consulte sempre os
              documentos e o Guia de Encontro de Equipes da temporada vigente
              para confirmar detalhes atualizados.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-info/15">
            <Blocks className="h-6 w-6 text-info" />
          </div>
          <h2 className="text-xl font-bold">Modelo de Exploração</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Construir e motorizar um modelo com peças LEGO® e o kit SPIKE
            Essential, inspirado no tema da temporada.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <NotebookPen className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Caderno de Engenharia</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Registrar o processo em 12 sessões guiadas, do primeiro rascunho até
            a versão final do modelo.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15">
            <Presentation className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-xl font-bold">Show Me Poster</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Montar um cartaz que conta a jornada da equipe para compartilhar no
            evento de celebração.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
            <Sparkles className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-xl font-bold">Core Values</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Praticar descoberta, inovação, impacto, inclusão, trabalho em equipe
            e diversão em cada encontro.
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
                <h3 className="font-semibold">Time completo</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Até 6 crianças de 6 a 10 anos, guiadas por um adulto
                  responsável — não precisam ter a mesma idade.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Documentação</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Caderno de Engenharia preenchido a cada sessão, com desenhos,
                  ideias e o passo a passo do modelo.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Materiais da temporada</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Conjunto LEGO® Explore da temporada e o kit LEGO® Education
                  SPIKE Essential para motorizar o modelo.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Guia do adulto responsável</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  O Guia de Encontro de Equipes traz o roteiro de cada uma das
                  12 sessões, sem exigir experiência prévia em robótica.
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
                  Como se preparar para o evento de celebração
                </h2>
                <p className="text-sm text-base-content/60">
                  Não é uma disputa: é uma conversa sobre o que a equipe
                  aprendeu.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">No modelo</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Cada criança deve saber explicar uma parte do modelo — não
                  precisa ser só o adulto falando.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">No Show Me Poster</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Mostre o processo, não só o resultado: rascunhos, tentativas e
                  o que mudou pelo caminho valem muito.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">Na conversa com avaliadores</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Treine respostas curtas e à vontade — o objetivo é
                  compartilhar a experiência, não decorar um discurso.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">Nos Core Values</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Cooperação, respeito e diversão são celebrados durante todo o
                  evento, do início ao fim.
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
              Os materiais em vídeo podem variar por temporada. A página oficial
              "Game & Season" da FIRST concentra os conteúdos mais recentes para
              equipes iniciantes.
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
