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
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciando na FIRST LEGO League Challenge | RoboStage",
  description:
    "Guia para equipes estreantes na FIRST LEGO League Challenge (FLLC): o que é o programa, como funciona a temporada, checklist inicial, vídeos recomendados, canais oficiais e FAQ.",
};

const checklist = [
  "Montar a equipe (2 a 10 competidores, com pelo menos 2 técnicos adultos).",
  "Adquirir o tapete e os materiais oficiais da temporada.",
  "Ler os documentos e regras da temporada vigente.",
  "Primeiros testes no tapete e nas missões do robô.",
  "Registro contínuo do processo no Engineering Notebook.",
  "Definir o problema real do Projeto de Inovação.",
  "Treinar a apresentação de 5 minutos para os juízes.",
  "Inscrever a equipe em um torneio regional.",
];

const usefulLinks = [
  {
    label: "FIRST LEGO League Challenge no Brasil (SESI)",
    href: "https://www.sesi.portaldaindustria.com.br/para-voce/robotica/first-lego-league-challenge",
  },
  {
    label: "Portal brasileiro da FLL",
    href: "https://www.firstlegoleague.com.br/first-lego-league-challenge",
  },
  {
    label: "Programa oficial FIRST LEGO League (EUA)",
    href: "https://www.firstinspires.org/programs/fll/",
  },
  {
    label: "Como começar uma equipe",
    href: "https://www.firstinspires.org/programs/fll/get-started",
  },
  {
    label: "Jogo e temporada oficiais",
    href: "https://www.firstinspires.org/programs/fll/game-and-season",
  },
];

const recommendedVideos = [
  {
    title: "Vídeo de abertura da temporada",
    description:
      "Apresenta o tema do ano e ajuda a equipe a entender a proposta do desafio antes de começar a construir.",
    href: "https://youtu.be/MPKxFy3qV2M?si=juq26un0qs3NUJiq",
    icon: PlayCircle,
    badge: "Oficial",
  },
  {
    title: "Vídeo de missões do Desafio do Robô",
    description:
      "Explica o tapete, as missões e a lógica de pontuação usada nos 3 rounds de 2 minutos e meio.",
    href: "https://youtu.be/uhZZ8O1StiQ?si=rcSIQigmdcpuArnp",
    icon: Gamepad2,
    badge: "Vídeo",
  },
  {
    title: "Preparação para o torneio",
    description:
      "Indicado para equipes que querem entender a rotina do dia de competição e as sessões com os juízes.",
    href: "https://youtu.be/9TMFtLKYT6o?si=ItD8kVLK4X-Pjrhs",
    icon: Youtube,
    badge: "Vídeo",
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
    question: "Quem pode participar da FIRST LEGO League Challenge?",
    answer:
      "Equipes com estudantes de 9 a 15/16 anos (a faixa pode variar por país), formadas por 2 a 10 competidores — o recomendado é ter ao menos 4 — e lideradas por 2 técnicos adultos. Cada competidor só pode integrar uma equipe da FLLC por temporada.",
  },
  {
    question: "Quais são as categorias avaliadas no torneio?",
    answer:
      "São quatro: Desafio do Robô (missões autônomas no tapete), Design do Robô (processo de engenharia por trás da construção e programação), Projeto de Inovação (solução para um problema real ligado ao tema) e Core Values (colaboração, inclusão e espírito esportivo em todos os momentos).",
  },
  {
    question: "Qual é o primeiro passo para uma equipe iniciante?",
    answer:
      "Montar a equipe, adquirir o tapete e os materiais da temporada e ler com atenção os documentos oficiais. Depois disso, partir para os primeiros testes do robô e para a escolha do tema do Projeto de Inovação.",
  },
  {
    question: "A equipe precisa dominar tudo antes de competir?",
    answer:
      "Não. O programa foi pensado para equipes evoluírem ao longo da temporada. Times novos costumam crescer mais rápido quando começam simples, registram os aprendizados no notebook e melhoram por ciclos de teste.",
  },
  {
    question: "Como funciona a apresentação para os juízes?",
    answer:
      "O Design do Robô e o Projeto de Inovação são apresentados em sessões de 5 minutos cada. Já o Desafio do Robô acontece em 3 rounds de 2 minutos e meio no tapete, valendo a melhor pontuação entre as tentativas.",
  },
  {
    question: "Como avançar para o nacional e o mundial?",
    answer:
      "A equipe se inscreve em um torneio regional. As melhores colocadas de cada regional avançam para a etapa nacional e, a partir dela, as melhores podem representar o país em competições internacionais.",
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
    title: "O que é a FLL Challenge",
    description:
      "A FIRST LEGO League Challenge é a trilha voltada a estudantes de 9 a 15/16 anos dentro do programa FIRST LEGO League. As equipes constroem e programam robôs LEGO®, pesquisam um problema real e apresentam tudo a juízes seguindo os Core Values do programa.",
  },
  {
    icon: Megaphone,
    title: "O que são as temporadas",
    description:
      "Cada temporada traz um tema novo, missões inéditas no tapete e um novo desafio de pesquisa para o Projeto de Inovação. No Brasil, os torneios regionais da temporada costumam acontecer entre outubro e fevereiro.",
  },
];

const brazilChannels = [
  {
    icon: Globe2,
    title: "SESI — operador da FLL Challenge no Brasil",
    description:
      "O SESI é responsável pela operação nacional da FIRST LEGO League Challenge, incluindo inscrições, torneios regionais e o Festival SESI de Robótica.",
    href: "https://www.sesi.portaldaindustria.com.br/para-voce/robotica/first-lego-league-challenge",
  },
  {
    icon: BookOpen,
    title: "Portal brasileiro da FLL",
    description:
      "Central com informações dos três programas da FLL no Brasil (Discover, Explore e Challenge), materiais e canais de contato.",
    href: "https://www.firstlegoleague.com.br/first-lego-league-challenge",
  },
  {
    icon: CalendarDays,
    title: "Calendário de eventos",
    description:
      "Página com datas dos torneios regionais, nacionais e demais eventos da operação brasileira.",
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
              Iniciando na FLL Challenge
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-base-content md:text-5xl">
              Guia para equipes{" "}
              <span className="text-black bg-accent px-2">Estreantes</span>
            </h1>

            <p className="max-w-2xl text-base text-base-content/70 md:text-lg">
              A FIRST® LEGO® League Challenge é o torneio de robótica
              educacional da FIRST® para estudantes de 9 a 15/16 anos, com
              robôs LEGO® e tecnologia LEGO® Education. No Brasil, o programa
              é operado pelo SESI. Se a sua equipe está entrando agora na
              competição, este guia reúne o essencial para começar a
              temporada com organização e confiança.
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
              materiais públicos da FIRST, da FLL Brasil e do SESI. Consulte
              sempre os documentos e regras da temporada vigente para
              confirmar detalhes atualizados.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-info/15">
            <Gamepad2 className="h-6 w-6 text-info" />
          </div>
          <h2 className="text-xl font-bold">Desafio do Robô</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Executar missões autônomas em um tapete, em 3 rounds de 2 minutos
            e meio, valendo a melhor pontuação.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Design do Robô</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Apresentar aos juízes, em 5 minutos, o processo de engenharia por
            trás da construção e da programação do robô.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15">
            <Lightbulb className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-xl font-bold">Projeto de Inovação</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Pesquisar um problema real ligado ao tema da temporada e propor
            uma solução bem documentada.
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
            <Sparkles className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-xl font-bold">Core Values</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Demonstrar descoberta, inovação, impacto, inclusão, trabalho em
            equipe e diversão durante todo o torneio.
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
                  De 2 a 10 competidores (o ideal é ter ao menos 4), liderados
                  por 2 técnicos adultos.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Documentação</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Engineering Notebook atualizado com testes, falhas, ideias e
                  decisões da equipe.
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Materiais da temporada</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Tapete oficial, kit de missões e o robô programável (SPIKE
                  Prime, na temporada atual).
                </p>
              </div>
              <div className="rounded-2xl bg-base-200/60 p-5">
                <h3 className="font-semibold">Comunicação</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  A equipe precisa saber explicar decisões com clareza nas
                  sessões de 5 minutos com os juízes.
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
                <h3 className="font-semibold">No tapete (Desafio do Robô)</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Treine repetição e priorização das missões mais viáveis: só
                  a melhor pontuação entre os 3 rounds conta.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">Na entrevista</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Fale com objetividade, mostre o processo de engenharia e
                  destaque o aprendizado da equipe em 5 minutos.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">No Projeto de Inovação</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Explique o problema real escolhido, a pesquisa feita e por
                  que a solução proposta faz sentido.
                </p>
              </div>
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-5">
                <h3 className="font-semibold">Nos Core Values</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Cooperação, inclusão e competição amigável são avaliadas em
                  todos os momentos do torneio, não só na apresentação.
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
              Os materiais em vídeo podem variar por temporada. A página
              oficial "Game & Season" da FIRST concentra os conteúdos mais
              recentes para equipes iniciantes.
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