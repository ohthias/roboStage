"use client";

import {
  ArrowRight,
  BarChart3,
  Check,
  Download,
  Gauge,
  LineChart,
  Microscope,
  Play,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import LabTestHeroPreview from "@/components/labtest/LabTestHeroPreview";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import { motion, useReducedMotion } from "framer-motion";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import HeroSection from "@/components/UI/HeroSection";

const modes = [
  {
    icon: Play,
    number: "01",
    badge: "Análise de runs",
    title: "Runs",
    description:
      "Analise suas execuções de competição, compare estratégias e descubra onde seu robô pode evoluir.",
    features: [
      "Análise por competição",
      "Comparação de runs",
      "Padrões de falha",
      "Métricas de consistência",
    ],
  },
  {
    icon: Gauge,
    number: "02",
    badge: "Para o robô",
    title: "CalibraBot",
    description:
      "Teste componentes e comportamentos do robô para encontrar a configuração que entrega o melhor desempenho.",
    features: [
      "Testes de motores",
      "Sensores e atuadores",
      "PID e giroscópio",
      "Análise de precisão",
    ],
  },
  {
    icon: SlidersHorizontal,
    number: "03",
    badge: "Sob medida",
    title: "Personalizado",
    description:
      "Crie testes específicos para aquilo que sua equipe precisa investigar.",
    features: [
      "Parâmetros personalizados",
      "Métricas próprias",
      "Testes experimentais",
      "Resultados comparáveis",
    ],
  },
];

const benefits = [
  {
    icon: Microscope,
    title: "Teste antes da competição",
    description:
      "Valide suas ideias no laboratório antes de colocá-las à prova na arena.",
  },
  {
    icon: BarChart3,
    title: "Transforme testes em dados",
    description:
      "Cada execução gera informações que ajudam sua equipe a entender o que realmente está acontecendo.",
  },
  {
    icon: Target,
    title: "Tome decisões melhores",
    description:
      "Escolha componentes, estratégias e configurações com base em evidências.",
  },
  {
    icon: Trophy,
    title: "Evolua continuamente",
    description:
      "Compare resultados ao longo do tempo e acompanhe a evolução do seu robô.",
  },
];

const faqs = [
  {
    question: "O que posso testar no LabTest?",
    answer:
      "Você pode testar desde componentes individuais do robô, como motores e sensores, até execuções completas de estratégias de competição. O modo de teste depende daquilo que sua equipe deseja analisar.",
  },
  {
    question: "O LabTest funciona para diferentes competições?",
    answer:
      "Sim. O modo Runs foi pensado para ser adaptável às diferentes competições e ligas de robótica. A análise pode considerar as particularidades de cada competição.",
  },
  {
    question: "Preciso ter conhecimento de análise de dados?",
    answer:
      "Não. O LabTest organiza os dados coletados em gráficos, tabelas e indicadores para que a equipe consiga interpretar os resultados sem precisar construir suas próprias análises.",
  },
  {
    question: "Posso exportar meus resultados?",
    answer:
      "Sim. Os resultados podem ser utilizados fora do LabTest, permitindo que sua equipe documente testes, compare experimentos e apresente dados durante avaliações e competições.",
  },
  {
    question: "O LabTest substitui os testes práticos?",
    answer:
      "Não. Ele potencializa os testes práticos. O robô continua sendo testado fisicamente, enquanto o LabTest registra e transforma essas execuções em informações úteis para a equipe.",
  },
];

export default function LabTestPage() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <>
      <Navbar />

      <HeroSection
        title="Seu robô,"
        highlight="seus dados."
        description="Teste diferentes configurações, registre execuções e transforme o comportamento do seu robô em informações que ajudam sua equipe a tomar decisões melhores."
        images={["/images/index/banner_labtest.png"]}
        primaryAction={{
          label: "Abrir meu LabTest",
          href: "/dashboard",
        }}
        secondaryAction={{
          label: "Como funciona",
          href: "/labtest#como-funciona",
        }}
        ariaLabel="Apresentação do LabTest"
      />

      <div className="min-h-screen overflow-hidden bg-base-100 text-base-content">
        <main>
          {/* =========================================================
            INTRO
        ========================================================= */}

          <section
            id="como-funciona"
            className="border-b border-base-300 bg-neutral text-neutral-content"
          >
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <RevealOnScroll>
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                      O laboratório
                    </span>

                    <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                      Pare de testar{" "}
                      <span className="inline-block bg-accent px-2 text-accent-content">
                        no escuro
                      </span>
                      .
                    </h2>
                  </div>

                  <div className="max-w-2xl">
                    <p className="text-lg leading-8 text-neutral-content/65">
                      Desenvolver um robô envolve dezenas de decisões. Qual
                      configuração usar? Qual mecanismo é mais consistente? O
                      que realmente melhorou depois daquele ajuste?
                    </p>

                    <p className="mt-5 text-lg leading-8 text-neutral-content/65">
                      O LabTest transforma essas perguntas em experimentos,
                      resultados e evidências que sua equipe pode analisar.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Core cycle */}
              <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-neutral-content/10 bg-neutral-content/10 md:grid-cols-4">
                {[
                  {
                    number: "01",
                    title: "Teste",
                    description: "Execute seu robô em condições controladas.",
                  },
                  {
                    number: "02",
                    title: "Meça",
                    description: "Registre os resultados de cada execução.",
                  },
                  {
                    number: "03",
                    title: "Compare",
                    description:
                      "Coloque configurações diferentes lado a lado.",
                  },
                  {
                    number: "04",
                    title: "Decida",
                    description:
                      "Use os dados para escolher o próximo caminho.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="bg-neutral p-7 transition-colors hover:bg-neutral-content/5"
                  >
                    <span className="text-sm font-black tracking-widest text-primary">
                      {step.number}
                    </span>

                    <h3 className="mt-8 text-2xl font-black">{step.title}</h3>

                    <p className="mt-3 text-sm leading-6 text-neutral-content/55">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =========================================================
            BENEFITS
        ========================================================= */}

          <section className="border-b border-base-300 bg-base-100">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <RevealOnScroll>
                <div className="max-w-3xl">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    Por que testar?
                  </span>

                  <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                    Transforme tentativa em aprendizado.
                  </h2>

                  <p className="mt-5 text-lg leading-8 text-base-content/60">
                    Cada execução pode responder uma pergunta. O LabTest ajuda
                    sua equipe a transformar essas respostas em informações que
                    podem ser comparadas, registradas e utilizadas novamente.
                  </p>
                </div>
              </RevealOnScroll>

              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;

                  return (
                    <RevealOnScroll key={benefit.title} delay={index * 0.08}>
                      <article className="card group h-full border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                        <div className="card-body p-6">
                          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-content">
                            <Icon size={21} />
                          </div>

                          <h3 className="mt-6 font-bold">{benefit.title}</h3>

                          <p className="mt-2 text-sm leading-6 text-base-content/55">
                            {benefit.description}
                          </p>
                        </div>
                      </article>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </div>
          </section>

          {/* =========================================================
            CALIBRABOT
        ========================================================= */}

          <section className="border-b border-base-300 bg-base-200/50">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <RevealOnScroll>
                  <div>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                      Na prática
                    </span>

                    <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                      Qual configuração realmente funciona?
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-base-content/60">
                      Em vez de escolher com base apenas em percepção, coloque
                      diferentes configurações à prova.
                    </p>

                    <p className="mt-4 text-base leading-7 text-base-content/55">
                      Com o{" "}
                      <strong className="text-base-content">CalibraBot</strong>,
                      sua equipe pode repetir experimentos, comparar resultados
                      e identificar padrões de comportamento.
                    </p>

                    <div className="mt-8 space-y-4">
                      {[
                        "Repita o mesmo experimento",
                        "Compare diferentes configurações",
                        "Observe a consistência dos resultados",
                        "Use os dados para justificar decisões",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm font-medium"
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                            <Check size={14} />
                          </div>

                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>

                {/* Data visualization */}
                <RevealOnScroll delay={0.12}>
                  <div className="card overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl">
                    <div className="card-body p-5 sm:p-7">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40">
                            Experimento
                          </p>

                          <h3 className="mt-1 text-xl font-bold">
                            Consistência das configurações
                          </h3>
                        </div>

                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <BarChart3 size={20} />
                        </div>
                      </div>

                      <div className="mt-8 space-y-7">
                        {[
                          {
                            name: "Motor A + Motor C",
                            value: 92,
                          },
                          {
                            name: "Motor C + Motor B",
                            value: 86,
                          },
                          {
                            name: "Motor A + Motor B",
                            value: 74,
                          },
                        ].map((item, index) => (
                          <div key={item.name}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="font-medium">{item.name}</span>

                              <span className="font-black">{item.value}%</span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-base-300">
                              <motion.div
                                className="h-full rounded-full bg-primary"
                                initial={{ width: "0%" }}
                                whileInView={{
                                  width: `${item.value}%`,
                                }}
                                viewport={{
                                  once: true,
                                  amount: 0.5,
                                }}
                                transition={{
                                  delay: reduceMotion ? 0 : index * 0.12,
                                  duration: reduceMotion ? 0 : 0.8,
                                  ease,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-start gap-3">
                          <Target className="mt-0.5 text-primary" size={19} />

                          <div>
                            <p className="text-sm font-bold">
                              Resultado do experimento
                            </p>

                            <p className="mt-1 text-xs leading-5 text-base-content/55">
                              A configuração "Motor A + Motor C" apresentou maior consistência nas
                              execuções realizadas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </section>

          <section className="border-b border-base-300 bg-base-100">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <RevealOnScroll>
                <div className="max-w-3xl">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    Escolha seu laboratório
                  </span>

                  <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                    Um laboratório para diferentes perguntas.
                  </h2>

                  <p className="mt-5 text-lg leading-8 text-base-content/60">
                    Nem todo teste precisa responder à mesma pergunta. Escolha o
                    formato que melhor representa o experimento que sua equipe
                    quer realizar.
                  </p>
                </div>
              </RevealOnScroll>

              <div className="mt-14 grid gap-5 lg:grid-cols-3">
                {modes.map((mode, index) => {
                  const Icon = mode.icon;
                  const isFeatured = index === 1;

                  return (
                    <RevealOnScroll key={mode.title} delay={index * 0.1}>
                      <article
                        className={`group relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                          isFeatured
                            ? "bg-primary text-primary-content shadow-lg"
                            : "border border-base-300 bg-base-100"
                        }`}
                      >
                        <div
                          className={`absolute right-6 top-4 text-7xl font-black ${
                            isFeatured
                              ? "text-primary-content/10"
                              : "text-base-content/[0.035]"
                          }`}
                        >
                          {mode.number}
                        </div>

                        <div className="relative">
                          <div
                            className={`badge mb-7 ${
                              isFeatured ? "badge-neutral" : "badge-ghost"
                            }`}
                          >
                            {mode.badge}
                          </div>

                          <div
                            className={`flex size-12 items-center justify-center rounded-xl ${
                              isFeatured
                                ? "bg-primary-content/15"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Icon size={23} />
                          </div>

                          <h3 className="mt-7 text-2xl font-black">
                            {mode.title}
                          </h3>

                          <p
                            className={`mt-3 min-h-[80px] text-sm leading-6 ${
                              isFeatured
                                ? "text-primary-content/75"
                                : "text-base-content/55"
                            }`}
                          >
                            {mode.description}
                          </p>

                          <div
                            className={`my-7 h-px ${
                              isFeatured
                                ? "bg-primary-content/20"
                                : "bg-base-300"
                            }`}
                          />

                          <ul className="space-y-3">
                            {mode.features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-center gap-3 text-sm"
                              >
                                <Check
                                  size={16}
                                  className={
                                    isFeatured
                                      ? "text-primary-content"
                                      : "text-primary"
                                  }
                                />

                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="border-b border-base-300 bg-base-200">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <RevealOnScroll>
                  <div>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                      Resultados
                    </span>

                    <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                      Dados que contam uma história.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-base-content/60">
                      Uma execução isolada pode mostrar um resultado. Uma série
                      de testes mostra comportamento.
                    </p>

                    <p className="mt-4 text-base leading-7 text-base-content/55">
                      O LabTest ajuda sua equipe a visualizar resultados,
                      identificar padrões e acompanhar mudanças ao longo dos
                      experimentos.
                    </p>
                  </div>
                </RevealOnScroll>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Execuções",
                      value: "128",
                      description: "testes registrados",
                    },
                    {
                      label: "Consistência",
                      value: "94.2%",
                      description: "resultado observado",
                    },
                    {
                      label: "Configurações",
                      value: "12",
                      description: "possibilidades comparadas",
                    },
                    {
                      label: "Evolução",
                      value: "+18%",
                      description: "comparação entre versões",
                    },
                  ].map((metric, index) => (
                    <RevealOnScroll key={metric.label} delay={index * 0.08}>
                      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                        <p className="text-sm font-medium text-base-content/45">
                          {metric.label}
                        </p>

                        <p className="mt-3 text-3xl font-black text-primary sm:text-4xl">
                          {metric.value}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-base-content/45">
                          {metric.description}
                        </p>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-base-100">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <RevealOnScroll>
                <div className="overflow-hidden rounded-[2rem] border border-base-300 bg-base-200">
                  <div className="grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:p-16">
                    <div>
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Download size={22} />
                      </div>

                      <h2 className="mt-7 text-3xl font-black sm:text-4xl">
                        O resultado do teste continua depois do laboratório.
                      </h2>

                      <p className="mt-5 max-w-2xl text-base leading-7 text-base-content/55">
                        Use os resultados em reuniões, apresentações, cadernos
                        de engenharia e avaliações. O dado pode continuar
                        fazendo parte da história do projeto.
                      </p>

                      <div className="mt-7 flex flex-wrap gap-3">
                        <div className="badge badge-lg gap-2 border-base-300 bg-base-100">
                          <BarChart3 size={14} />
                          Gráficos
                        </div>

                        <div className="badge badge-lg gap-2 border-base-300 bg-base-100">
                          <LineChart size={14} />
                          Métricas
                        </div>

                        <div className="badge badge-lg gap-2 border-base-300 bg-base-100">
                          <Download size={14} />
                          Exportação
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex">
                      <div className="flex size-40 rotate-3 items-center justify-center rounded-[2rem] border border-primary/20 bg-primary/5 transition-transform duration-300 hover:rotate-0">
                        <div className="-rotate-3 text-center">
                          <Download
                            size={30}
                            className="mx-auto text-primary"
                          />

                          <p className="mt-3 text-sm font-bold">Exportar</p>

                          <p className="text-xs text-base-content/40">
                            seus resultados
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </section>

          <section className="border-t border-base-300 bg-base-200/50">
            <div className="mx-auto max-w-4xl px-6 py-24 lg:py-32">
              <RevealOnScroll>
                <div className="text-center">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    FAQ
                  </span>

                  <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                    Perguntas frequentes
                  </h2>

                  <p className="mt-5 text-base text-base-content/55">
                    Tudo o que você precisa saber antes de começar a testar.
                  </p>
                </div>
              </RevealOnScroll>

              <div className="mt-12 space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="collapse collapse-arrow rounded-2xl border border-base-300 bg-base-100 transition-colors duration-200 hover:border-primary/30"
                  >
                    <input type="checkbox" />

                    <div className="collapse-title pr-12 font-bold">
                      {faq.question}
                    </div>

                    <div className="collapse-content">
                      <p className="max-w-3xl pb-2 text-sm leading-7 text-base-content/60">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="relative overflow-hidden bg-neutral text-neutral-content">
            <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full border-[70px] border-primary/10" />
            <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full border-[60px] border-secondary/10" />
            <div className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-8 lg:py-36">
              <RevealOnScroll>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  Seu próximo teste
                </span>

                <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Troque o{" "}
                  <span className="text-neutral-content/50">
                    “acho que funciona”
                  </span>{" "}
                  por dados.
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-content/65">
                  Teste, compare, aprenda e tome decisões com mais informação
                  sobre o comportamento do seu robô.
                </p>

                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/dashboard"
                    className="btn btn-primary rounded-2xl px-8"
                  >
                    Experimentar o LabTest
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="#como-funciona"
                    className="btn btn-ghost rounded-2xl px-8 text-neutral-content"
                  >
                    Conhecer o laboratório
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
