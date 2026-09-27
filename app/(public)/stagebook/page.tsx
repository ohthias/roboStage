import { Footer } from "@/components/UI/Footer";
import HeroSection from "@/components/UI/HeroSection";
import { Navbar } from "@/components/UI/Navbar";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  KanbanSquare,
  Lightbulb,
  NotebookPen,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Stagebook",
  description:
    "Registre ideias, organize projetos, acompanhe tarefas e transforme o processo da sua equipe em conhecimento.",
};

export default function StagebookPage() {
  return (
    <>
      <Navbar />

      <HeroSection
        title="A ideia começa"
        highlight="antes da solução."
        description="O Stagebook é o espaço da sua equipe para registrar pensamentos, organizar projetos, acompanhar tarefas e transformar cada etapa da temporada em conhecimento."
        images={["/images/index/banner_stagebook.png"]}
        primaryAction={{
          label: "Abrir meu Stagebook",
          href: "/dashboard",
        }}
        secondaryAction={{
          label: "Explorar recursos",
          href: "#recursos",
        }}
        ariaLabel="Apresentação do Stagebook"
      />

      <main className="min-h-screen bg-base-100 text-base-content">
        {/* INTRO */}
        <section className="border-b border-base-300 bg-neutral text-neutral-content">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                O processo importa
              </span>

              <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
                Nem toda solução nasce pronta.
              </h2>
            </div>

            <div className="flex items-center">
              <div className="max-w-2xl space-y-5 text-lg leading-8 text-neutral-content/65">
                <p>
                  Uma boa solução passa por perguntas, ideias, tentativas,
                  erros, ajustes e novas descobertas.
                </p>

                <p>
                  O Stagebook foi criado para que esse caminho não se perca.
                  Registre o que sua equipe está pensando, organize o que está
                  sendo construído e volte ao processo sempre que precisar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS VISUAL */}
        <section className="overflow-hidden border-b border-base-300 bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Do pensamento à prática
              </span>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Um espaço para acompanhar como as coisas realmente acontecem.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-base-content/60">
                O Stagebook conecta documentação, planejamento e execução para
                que o conhecimento da equipe acompanhe a evolução do projeto.
              </p>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-base-300 bg-base-300 md:grid-cols-4">
              <ProcessStep
                number="01"
                title="Imagine"
                description="Registre ideias, perguntas e possibilidades antes de transformá-las em planos."
              />

              <ProcessStep
                number="02"
                title="Registre"
                description="Documente decisões, pesquisas, testes, reuniões e descobertas."
              />

              <ProcessStep
                number="03"
                title="Execute"
                description="Transforme planos em tarefas, prazos e responsabilidades."
              />

              <ProcessStep
                number="04"
                title="Aprenda"
                description="Retorne ao histórico e entenda o que funcionou, mudou ou precisa evoluir."
              />
            </div>
          </div>
        </section>

        {/* WORKSPACE */}
        <section
          id="recursos"
          className="border-b border-base-300 bg-base-200/50"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  Seu espaço de trabalho
                </span>

                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  Tudo o que sua equipe precisa para manter a temporada em
                  movimento.
                </h2>
              </div>

              <p className="max-w-md text-base leading-7 text-base-content/60">
                Documente o conhecimento, organize os compromissos e transforme
                planos em ações.
              </p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              <WorkspaceCard
                href="/dashboard/documents"
                icon={<NotebookPen className="size-6" />}
                eyebrow="Documentos"
                title="Construa o conhecimento da equipe"
                description="Crie páginas, subpáginas, pastas e registros para documentar ideias, pesquisas, reuniões, decisões e testes."
                linkLabel="Explorar documentos"
              />

              <WorkspaceCard
                href="/dashboard/calendar"
                icon={<CalendarDays className="size-6" />}
                eyebrow="Calendário"
                title="Veja o que vem pela frente"
                description="Organize treinos, reuniões, competições, eventos e prazos em uma visão clara da temporada."
                linkLabel="Abrir calendário"
              />

              <WorkspaceCard
                href="/dashboard/kanban"
                icon={<KanbanSquare className="size-6" />}
                eyebrow="Kanban"
                title="Transforme planos em ação"
                description="Distribua tarefas, acompanhe prioridades, defina responsáveis e visualize o andamento dos projetos."
                linkLabel="Abrir boards"
              />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="sobre" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Feito para o processo
            </span>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Não é só onde você guarda informações.
            </h2>

            <p className="mt-5 text-lg leading-8 text-base-content/60">
              É onde a equipe registra, conecta e revisita tudo aquilo que ajuda
              uma ideia a se transformar em resultado.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<NotebookPen className="size-6" />}
              title="Documente"
              description="Registre ideias, reuniões, pesquisas, estratégias, testes e decisões enquanto elas acontecem."
            />

            <FeatureCard
              icon={<FileText className="size-6" />}
              title="Organize"
              description="Estruture o conhecimento da equipe para encontrar rapidamente o que precisa."
            />

            <FeatureCard
              icon={<Lightbulb className="size-6" />}
              title="Desenvolva"
              description="Use registros anteriores como ponto de partida para novas ideias e soluções."
            />

            <FeatureCard
              icon={<Users className="size-6" />}
              title="Colabore"
              description="Mantenha o conhecimento acessível para que diferentes pessoas possam contribuir."
            />

            <FeatureCard
              icon={<Sparkles className="size-6" />}
              title="Aprenda"
              description="Revise decisões, testes e resultados para entender como o projeto evoluiu."
            />

            <Link
              href="/dashboard"
              className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-primary p-7 text-primary-content transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary-content/15">
                    <ArrowRight className="size-6" />
                  </div>

                  <h3 className="mt-8 text-2xl font-black">
                    Comece a construir
                  </h3>

                  <p className="mt-3 max-w-sm leading-7 text-primary-content/70">
                    Abra seu Stagebook e comece a registrar o próximo passo da
                    sua equipe.
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 font-semibold">
                  Abrir Stagebook
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border-[40px] border-primary-content/10" />
              <div className="pointer-events-none absolute -bottom-24 -right-10 size-72 rounded-full border-[50px] border-primary-content/10" />
            </Link>
          </div>
        </section>

        {/* KNOWLEDGE */}
        <section className="border-y border-base-300 bg-neutral text-neutral-content">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Conhecimento que permanece
              </span>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                A temporada termina. O aprendizado fica.
              </h2>
            </div>

            <div className="space-y-6 text-lg leading-8 text-neutral-content/65">
              <p>
                Ao longo de uma temporada, sua equipe toma centenas de decisões.
                Algumas funcionam. Outras precisam ser revistas.
              </p>

              <p>
                Registrar esse processo permite que o conhecimento não dependa
                apenas da memória de quem estava presente.
              </p>

              <p className="font-medium text-neutral-content">
                O Stagebook transforma o histórico da equipe em parte do próximo
                projeto.
              </p>
            </div>
          </div>
        </section>

        {/* FOR TEAMS */}
        <section className="border-b border-base-300 bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  Feito para equipes
                </span>

                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  O trabalho da equipe não acontece em um único lugar.
                </h2>

                <p className="mt-6 text-lg leading-8 text-base-content/60">
                  Há pesquisas, reuniões, testes, estratégias, tarefas, decisões
                  e mudanças acontecendo ao mesmo tempo. O Stagebook organiza
                  esse processo sem tirar da equipe a liberdade de trabalhar do
                  seu jeito.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ContextCard
                  icon={<Lightbulb className="size-5" />}
                  title="Ideias"
                  description="Anote possibilidades antes que elas se percam."
                />

                <ContextCard
                  icon={<Users className="size-5" />}
                  title="Reuniões"
                  description="Registre decisões, discussões e próximos passos."
                />

                <ContextCard
                  icon={<NotebookPen className="size-5" />}
                  title="Pesquisa"
                  description="Concentre referências, descobertas e aprendizados."
                />

                <ContextCard
                  icon={<KanbanSquare className="size-5" />}
                  title="Projetos"
                  description="Transforme planos em tarefas que podem ser acompanhadas."
                />
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="border-b border-base-300 bg-base-200/50">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Na prática
              </span>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                O que sua equipe pode registrar?
              </h2>

              <p className="mt-5 text-lg leading-8 text-base-content/60">
                O Stagebook acompanha tanto os grandes momentos quanto aquelas
                pequenas decisões que fazem diferença durante o projeto.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <UseCaseCard
                title="Ideias de robô"
                description="Mecanismos, estratégias, melhorias e possibilidades para testar."
              />

              <UseCaseCard
                title="Pesquisa"
                description="Informações, referências, observações e descobertas da equipe."
              />

              <UseCaseCard
                title="Testes"
                description="O que foi testado, o que aconteceu e o que precisa mudar."
              />

              <UseCaseCard
                title="Decisões"
                description="Registros que ajudam a entender por que determinado caminho foi escolhido."
              />

              <UseCaseCard
                title="Reuniões"
                description="Pautas, discussões, decisões e próximos passos."
              />

              <UseCaseCard
                title="Estratégias"
                description="Planos para projetos, treinos, missões e competições."
              />

              <UseCaseCard
                title="Aprendizados"
                description="Erros, acertos e descobertas que podem ser úteis no futuro."
              />

              <UseCaseCard
                title="Próximos passos"
                description="Tudo aquilo que precisa acontecer para o projeto continuar avançando."
              />
            </div>
          </div>
        </section>

        {/* FROM IDEA TO ACTION */}
        <section className="border-b border-base-300 bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  Da ideia à execução
                </span>

                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  Uma anotação pode virar o próximo teste.
                </h2>

                <p className="mt-6 text-lg leading-8 text-base-content/60">
                  O processo não precisa ficar dividido entre arquivos,
                  mensagens e anotações espalhadas. Uma ideia pode ser
                  registrada, discutida, transformada em tarefa e acompanhada
                  até sua execução.
                </p>

                <Link
                  href="/dashboard"
                  className="btn btn-outline btn-primary mt-8"
                >
                  Explorar o Stagebook
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm">
                  <div className="space-y-3">
                    <FlowItem
                      number="01"
                      title="Uma ideia aparece"
                      description="A equipe registra a possibilidade."
                    />

                    <FlowItem
                      number="02"
                      title="A ideia ganha contexto"
                      description="Pesquisas, referências e decisões são adicionadas."
                    />

                    <FlowItem
                      number="03"
                      title="A ideia vira tarefa"
                      description="O próximo passo passa a fazer parte do trabalho."
                    />

                    <FlowItem
                      number="04"
                      title="O resultado volta para o registro"
                      description="O que aconteceu passa a fazer parte do conhecimento."
                      last
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LONG TERM KNOWLEDGE */}
        <section className="border-b border-base-300 bg-neutral text-neutral-content">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  Mais que uma temporada
                </span>

                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  O conhecimento da equipe não deveria começar do zero.
                </h2>
              </div>

              <div className="space-y-5 text-lg leading-8 text-neutral-content/60">
                <p>
                  Cada projeto deixa perguntas respondidas, decisões tomadas,
                  testes realizados e aprendizados que podem ajudar nos próximos
                  desafios.
                </p>

                <p>
                  Ao registrar esse processo, a equipe cria um histórico que
                  pode ser revisitado quando um novo projeto começar.
                </p>

                <div className="rounded-2xl border border-neutral-content/10 bg-neutral-content/5 p-6">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">
                    O processo continua
                  </p>

                  <p className="mt-2 font-medium text-neutral-content">
                    O próximo projeto começa com mais conhecimento do que o
                    anterior.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-200 p-8 sm:p-12 lg:p-16">
            <div className="relative z-10 max-w-3xl">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                Stagebook
              </span>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                O que sua equipe está construindo?
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-base-content/60">
                Comece pelo próximo pensamento. Registre o processo e deixe o
                Stagebook acompanhar o caminho até a solução.
              </p>

              <Link href="/dashboard" className="btn btn-primary mt-8 gap-2">
                Começar agora
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full border-[60px] border-primary/10" />
            <div className="pointer-events-none absolute -bottom-32 right-24 size-80 rounded-full border-[50px] border-secondary/10" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function WorkspaceCard({
  href,
  icon,
  eyebrow,
  title,
  description,
  linkLabel,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  linkLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[340px] flex-col justify-between rounded-3xl border border-base-300 bg-base-100 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <div>
        <div className="mb-10 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-content">
          {icon}
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </span>

        <h3 className="mt-3 text-2xl font-black tracking-tight">{title}</h3>

        <p className="mt-4 leading-7 text-base-content/60">{description}</p>
      </div>

      <span className="mt-10 flex items-center gap-2 text-sm font-bold text-base-content/70 transition-colors group-hover:text-primary">
        {linkLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-base-300 bg-base-100 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold tracking-tight">{title}</h3>

      <p className="mt-3 leading-7 text-base-content/60">{description}</p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-base-100 p-7 transition-colors hover:bg-base-200">
      <span className="text-sm font-black tracking-widest text-primary">
        {number}
      </span>

      <h3 className="mt-8 text-2xl font-black tracking-tight">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-base-content/60">
        {description}
      </p>
    </div>
  );
}

function ContextCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-base-300 bg-base-200/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-base-200">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-5 font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-base-content/60">
        {description}
      </p>
    </div>
  );
}

function UseCaseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-sm">
      <h3 className="font-bold tracking-tight">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-base-content/60">
        {description}
      </p>
    </div>
  );
}

function FlowItem({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {!last && (
        <div className="absolute left-5 top-11 h-[calc(100%-18px)] w-px bg-base-300" />
      )}

      <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-content">
        {number}
      </div>

      <div className="pb-7">
        <h3 className="font-bold">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-base-content/60">
          {description}
        </p>
      </div>
    </div>
  );
}
