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
  const heroItem = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.65, ease },
    },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-hidden bg-base-100 text-base-content">
        <header className="relative isolate">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8">
            <motion.div
              className="grid items-center gap-16 lg:grid-cols-[1fr_0.9fr]"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}>
                <motion.h1 variants={heroItem} className="max-w-4xl text-3xl font-black sm:text-5xl lg:text-6xl">
                  Seu robô.
                  <br />
                  Seus testes.
                  <br />
                  <motion.span
                    className="inline-block bg-primary text-primary-content"
                    initial={{ scaleX: 0, transformOrigin: "left" }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: reduceMotion ? 0 : 0.65, duration: 0.5, ease }}
                  >
                    Seus dados.
                  </motion.span>
                </motion.h1>

                <motion.p variants={heroItem} className="mt-7 max-w-2xl text-lg leading-8 text-base-content/65 sm:text-xl">
                  O <strong className="text-base-content">LabTest</strong> é o
                  laboratório de análise do RoboStage. Teste seu robô, suas
                  estratégias e seus componentes — e transforme cada execução em
                  dados para tomar decisões melhores.
                </motion.p>

                <motion.div variants={heroItem} className="mt-9 flex flex-wrap gap-4">
                  <motion.div whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
                    <Link href="/sign-up" className="btn btn-primary rounded-2xl px-8 shadow-lg shadow-primary/20">
                      Abrir LabTest
                      <ArrowRight size={18} />
                    </Link>
                  </motion.div>

                  <motion.a
                    href="#como-funciona"
                    className="btn btn-ghost rounded-2xl border border-base-content/10 px-8"
                    whileHover={reduceMotion ? undefined : { y: -3 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  >
                    Conhecer a ferramenta
                  </motion.a>
                </motion.div>
              </motion.div>

              <LabTestHeroPreview />
            </motion.div>
          </div>
          <div className="absolute bottom-0 w-full h-30 bg-gradient-to-t from-base-100 to-transparent" />
        </header>

        <main>
          <section
            id="como-funciona"
            className="border-b border-base-content/10"
          >
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <RevealOnScroll>
                <div className="max-w-3xl">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    O laboratório
                  </span>

                  <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                    Pare de testar{" "}
                    <span className="bg-accent text-accent-content px-2 inline-block">
                      no escuro
                    </span>
                    .
                  </h2>

                  <p className="mt-6 text-lg leading-8 text-base-content/60">
                    Uma boa equipe não depende apenas de intuição. Ela testa,
                    mede, compara e aprende. O LabTest transforma o processo de
                    desenvolvimento do robô em um ciclo contínuo de
                    experimentação e melhoria.
                  </p>
                </div>
              </RevealOnScroll>

              <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <RevealOnScroll
                      key={benefit.title}
                      delay={benefits.indexOf(benefit) * 0.08}
                    >
                      <article
                        key={benefit.title}
                        className="card group h-full border border-base-content/10 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                      >
                        <div className="card-body p-6">
                          <div className="flex h-11 w-11 items-center justify-center rounded-box bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
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

          <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <RevealOnScroll>
                  <div>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                      Na prática
                    </span>

                    <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                      Qual motor merece estar no seu robô?
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-base-content/60">
                      Em vez de escolher pela experiência ou pela opinião de
                      alguém, coloque diferentes configurações à prova.
                    </p>

                    <p className="mt-4 text-base leading-7 text-base-content/55">
                      Com o{" "}
                      <strong className="text-base-content">CalibraBot</strong>,
                      sua equipe pode executar uma série de testes, coletar os
                      resultados e comparar o comportamento de diferentes
                      motores, combinações e configurações.
                    </p>

                    <div className="mt-8 space-y-4">
                      {[
                        "Execute o mesmo teste várias vezes",
                        "Compare diferentes configurações",
                        "Identifique a opção mais consistente",
                        "Apresente os dados durante a avaliação",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm font-medium"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                            <Check size={14} />
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>

                {/* Comparison visualization */}
                <RevealOnScroll delay={0.12}>
                  <div className="card rounded-tl-[30px] rounded-br-[30px] border border-base-content/10 bg-base-100 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
                    <div className="card-body p-5 sm:p-7">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-base-content/40">
                            Comparação
                          </p>
                          <h3 className="mt-1 text-xl font-bold">
                            Configuração dos motores
                          </h3>
                        </div>

                        <BarChart3 className="text-primary" />
                      </div>

                      <div className="mt-8 space-y-6">
                        {[
                          { name: "Motor A + B", value: 92 },
                          { name: "Motor A + C", value: 86 },
                          { name: "Motor B + C", value: 74 },
                        ].map((motor, index) => (
                          <div key={motor.name}>
                            <div className="mb-2 flex justify-between text-sm">
                              <span className="font-medium">{motor.name}</span>
                              <span className="font-bold">{motor.value}%</span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-base-content/10">
                              <motion.div
                                className="h-full rounded-full bg-primary transition-all"
                                initial={{ width: "0%" }}
                                whileInView={{ width: `${motor.value}%` }}
                                viewport={{ once: true, amount: 0.5 }}
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

                      <div className="mt-8 rounded-2xl border border-success/20 bg-success/5 p-4">
                        <div className="flex items-start gap-3">
                          <Target className="mt-0.5 text-success" size={19} />

                          <div>
                            <p className="text-sm font-bold">
                              Melhor configuração identificada
                            </p>
                            <p className="mt-1 text-xs leading-5 text-base-content/55">
                              Motor A + B apresentou maior consistência nos
                              testes realizados.
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

          <section className="bg-base-200/40">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <RevealOnScroll>
                <div className="mx-auto max-w-2xl text-center">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    Escolha seu laboratório
                  </span>

                  <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                    Um LabTest.
                    <br />
                    Diferentes possibilidades.
                  </h2>

                  <p className="mt-6 text-base leading-7 text-base-content/55">
                    Cada equipe possui uma necessidade diferente. Por isso, o
                    LabTest possui diferentes formas de experimentar e analisar.
                  </p>
                </div>
              </RevealOnScroll>

              <div className="mt-16 grid gap-5 lg:grid-cols-3">
                {modes.map((mode, index) => {
                  const Icon = mode.icon;
                  const isFeatured = index === 1;

                  return (
                    <RevealOnScroll key={mode.title} delay={index * 0.1}>
                      <article
                        key={mode.title}
                        className={`group relative overflow-hidden rounded-tl-[30px] rounded-br-[30px] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                          isFeatured
                            ? "bg-primary text-primary-content shadow-lg"
                            : "border border-base-content/10 bg-base-100"
                        }`}
                      >
                        <div
                          className={`absolute right-6 top-5 text-6xl font-black transition-transform duration-300 group-hover:scale-110 ${
                            isFeatured
                              ? "text-primary-content/10"
                              : "text-base-content/[0.035]"
                          }`}
                        >
                          {mode.number}
                        </div>

                        <div className="relative">
                          <div
                            className={`badge mb-6 ${
                              isFeatured ? "badge-neutral" : "badge-ghost"
                            }`}
                          >
                            {mode.badge}
                          </div>

                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-box ${
                              isFeatured
                                ? "bg-primary-content/15 text-primary-content"
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
                                ? "text-primary-content/80"
                                : "text-base-content/55"
                            }`}
                          >
                            {mode.description}
                          </p>

                          <div
                            className={`my-7 h-px ${
                              isFeatured
                                ? "bg-primary-content/20"
                                : "bg-base-content/10"
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
                                  className={`shrink-0 ${
                                    isFeatured
                                      ? "text-primary-content"
                                      : "text-primary"
                                  }`}
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

          <section>
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
              <RevealOnScroll>
                <div className="card rounded-tl-[30px] rounded-br-[30px] border border-base-content/10 bg-base-200/50 transition-shadow duration-300 hover:shadow-xl">
                  <div className="card-body p-8 sm:p-12 lg:p-16">
                    <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
                      <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Download size={22} />
                        </div>

                        <h2 className="mt-7 text-3xl font-black sm:text-4xl">
                          Seus dados não ficam presos no laboratório.
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-base-content/55">
                          O LabTest foi pensado para acompanhar sua equipe. Leve
                          seus resultados para reuniões, cadernos de engenharia,
                          apresentações e avaliações.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                          <div className="badge badge-lg gap-2 border-base-content/10 bg-base-100">
                            <BarChart3 size={14} />
                            Gráficos
                          </div>

                          <div className="badge badge-lg gap-2 border-base-content/10 bg-base-100">
                            <LineChart size={14} />
                            Métricas
                          </div>

                          <div className="badge badge-lg gap-2 border-base-content/10 bg-base-100">
                            <Download size={14} />
                            Exportação
                          </div>
                        </div>
                      </div>

                      <div className="hidden lg:block">
                        <div className="flex h-36 w-36 rotate-3 items-center justify-center rounded-tl-[30px] rounded-br-[30px] border border-primary/20 bg-primary/5 transition-transform duration-300 hover:rotate-0">
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
                </div>
              </RevealOnScroll>
            </div>
          </section>

          <section className="border-y border-base-content/10">
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
                      Um número isolado não diz muita coisa. Quando você compara
                      execuções, identifica padrões e acompanha métricas, começa
                      a entender o comportamento real do seu robô.
                    </p>

                    <p className="mt-4 text-base leading-7 text-base-content/55">
                      O LabTest organiza os resultados para que sua equipe
                      consiga enxergar tendências, inconsistências e
                      oportunidades de melhoria.
                    </p>
                  </div>
                </RevealOnScroll>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Consistência",
                      value: "94.2%",
                      description: "das execuções dentro do esperado",
                    },
                    {
                      label: "Precisão",
                      value: "91.8%",
                      description: "média dos testes realizados",
                    },
                    {
                      label: "Autonomia",
                      value: "87%",
                      description: "aproveitamento estimado",
                    },
                    {
                      label: "Melhoria",
                      value: "+18%",
                      description: "comparação com teste anterior",
                    },
                  ].map((metric, index) => (
                    <RevealOnScroll key={metric.label} delay={index * 0.08}>
                      <motion.div
                        key={metric.label}
                        className="stat rounded-box border border-base-content/10 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                        whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-sm font-medium text-base-content/45">
                          {metric.label}
                        </p>

                        <p className="mt-3 text-3xl font-black text-primary sm:text-4xl">
                          {metric.value}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-base-content/45">
                          {metric.description}
                        </p>
                      </motion.div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-base-content/10">
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
                    Ainda ficou alguma dúvida sobre o laboratório?
                  </p>
                </div>
              </RevealOnScroll>

              <div className="mt-12 space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="collapse collapse-arrow rounded-box border border-base-content/10 bg-base-100 transition-colors duration-200 hover:border-primary/30"
                  >
                    <input type="checkbox" />

                    <div className="collapse-title pr-12 text-base font-bold">
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

          <div className="w-full h-10 bg-gradient-to-t from-neutral to-transparent" />
          <section className="w-full bg-neutral text-neutral-content py-24 px-4 relative">
            <RevealOnScroll>
              <div className="max-w-5xl mx-auto text-center">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-content/60">
                  Pronto para testar?
                </span>

                <h2 className="mt-4 text-4xl md:text-5xl font-black leading-tight">
                  Leve sua equipe do "acho que funciona"
                  <br className="hidden sm:block" /> para "os dados mostram".
                </h2>

                <p className="mt-6 text-lg md:text-xl text-neutral-content/70 max-w-3xl mx-auto">
                  Experimente o LabTest e comece a transformar seus testes em
                  decisões.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                  <Link
                    href="/labtest"
                    className="btn btn-primary rounded-2xl px-8"
                  >
                    Experimentar o LabTest
                    <ArrowRight size={18} />
                  </Link>
                  <a
                    href="#como-funciona"
                    className="btn btn-ghost text-neutral-content rounded-2xl px-8"
                  >
                    Conhecer a ferramenta
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
