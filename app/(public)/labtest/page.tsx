import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Download,
  FileText,
  Gauge,
  LineChart,
  Microscope,
  Play,
  Ruler,
  Scale,
  SlidersHorizontal,
  Target,
  TestTube,
  Trophy,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import RevealOnScroll from "@/components/UI/RevealOnScroll";
import HeroSection from "@/components/UI/HeroSection";
import { AnimatedBackground, SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { CtaBlock, cornerBtn } from "@/components/competicoes/shared/CompetitionSections";
import "@/components/home/home.css";
import { CalibraTabs, GrowBar } from "./labtest-interactive";

/* -------------------------------------------------------------- dados */

const cycle: { icon: typeof Play; title: string; text: string; tone: Tone }[] = [
  { icon: TestTube, title: "Teste", text: "Execute seu robô em condições controladas.", tone: "primary" },
  { icon: Ruler, title: "Meça", text: "Registre os resultados de cada execução.", tone: "secondary" },
  { icon: Scale, title: "Compare", text: "Coloque configurações diferentes lado a lado.", tone: "accent" },
  { icon: Target, title: "Decida", text: "Use os dados para escolher o próximo caminho.", tone: "primary" },
];

const benefits: { icon: typeof Play; title: string; text: string; tone: Tone }[] = [
  { icon: Microscope, title: "Teste antes da competição", text: "Valide suas ideias no laboratório antes de colocá-las à prova na arena.", tone: "primary" },
  { icon: BarChart3, title: "Transforme testes em dados", text: "Cada execução gera informações que ajudam a equipe a entender o que realmente está acontecendo.", tone: "secondary" },
  { icon: Target, title: "Tome decisões melhores", text: "Escolha componentes, estratégias e configurações com base em evidências.", tone: "accent" },
  { icon: Trophy, title: "Evolua continuamente", text: "Compare resultados ao longo do tempo e acompanhe a evolução do seu robô.", tone: "primary" },
];

const configs = [
  { name: "Motor A + Motor C", value: 92 },
  { name: "Motor C + Motor B", value: 86 },
  { name: "Motor A + Motor B", value: 74 },
];

const modes: { icon: typeof Play; tag: string; title: string; text: string; features: string[]; tone: Tone }[] = [
  {
    icon: Play,
    tag: "ANÁLISE DE RUNS",
    title: "Runs",
    text: "Analise suas execuções de competição, compare estratégias e descubra onde seu robô pode evoluir.",
    features: ["Análise por competição", "Comparação de runs", "Padrões de falha", "Métricas de consistência"],
    tone: "secondary",
  },
  {
    icon: Gauge,
    tag: "PARA O ROBÔ",
    title: "CalibraBot",
    text: "Teste componentes e comportamentos do robô para encontrar a configuração que entrega o melhor desempenho.",
    features: ["Testes de motores", "Sensores e atuadores", "PID e giroscópio", "Análise de precisão"],
    tone: "primary",
  },
  {
    icon: SlidersHorizontal,
    tag: "SOB MEDIDA",
    title: "Personalizado",
    text: "Crie testes específicos para aquilo que sua equipe precisa investigar.",
    features: ["Parâmetros personalizados", "Métricas próprias", "Testes experimentais", "Resultados comparáveis"],
    tone: "accent",
  },
];

const metrics = [
  { label: "Execuções", value: "128", text: "testes registrados", tone: "primary" as Tone },
  { label: "Consistência", value: "94,2%", text: "resultado observado", tone: "secondary" as Tone },
  { label: "Configurações", value: "12", text: "possibilidades comparadas", tone: "accent" as Tone },
  { label: "Evolução", value: "+18%", text: "comparação entre versões", tone: "primary" as Tone },
];

const faqs = [
  { q: "O que posso testar no LabTest?", a: "Você pode testar desde componentes individuais do robô, como motores e sensores, até execuções completas de estratégias de competição. O modo de teste depende daquilo que sua equipe deseja analisar." },
  { q: "O LabTest funciona para diferentes competições?", a: "Sim. O modo Runs foi pensado para ser adaptável às diferentes competições e ligas de robótica. A análise pode considerar as particularidades de cada competição." },
  { q: "Preciso ter conhecimento de análise de dados?", a: "Não. O LabTest organiza os dados coletados em gráficos, tabelas e indicadores para que a equipe consiga interpretar os resultados sem precisar construir suas próprias análises." },
  { q: "Posso exportar meus resultados?", a: "Sim. Os resultados podem ser utilizados fora do LabTest, permitindo que sua equipe documente testes, compare experimentos e apresente dados durante avaliações e competições." },
  { q: "O LabTest substitui os testes práticos?", a: "Não. Ele potencializa os testes práticos. O robô continua sendo testado fisicamente, enquanto o LabTest registra e transforma essas execuções em informações úteis para a equipe." },
];

/* --------------------------------------------------------------- partes */

function ExperimentCard() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent" />
      <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50" />
      <figure className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            CalibraBot · experimento
          </span>
          <span className="font-mono text-[10px] tracking-widest text-base-content/35">EXEMPLO</span>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.15em] text-primary">CONSISTÊNCIA DAS CONFIGURAÇÕES</p>
          <div className="mt-6 space-y-6">
            {configs.map((c, i) => (
              <div key={c.name}>
                <div className="mb-2 flex items-center justify-between font-mono text-xs">
                  <span className={i === 0 ? "font-bold text-base-content" : "text-base-content/70"}>{c.name}</span>
                  <span className="font-bold tabular-nums">{c.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-sm bg-base-200">
                  <GrowBar
                    value={c.value}
                    delayMs={i * 120}
                    className={i === 0 ? "bg-primary" : "bg-secondary/60"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <figcaption className="bg-[#1f1c18] px-5 py-4 font-mono text-[11px] leading-6 text-[#f3ecdc] sm:text-xs">
          <p className="opacity-60">$ labtest comparar --runs 30</p>
          <p>
            melhor: <span className="text-[#fabd32]">Motor A + Motor C</span>{" "}
            <span className="text-[#9be15d]">✓ 92% de consistência</span>
          </p>
        </figcaption>
      </figure>
    </div>
  );
}

/* --------------------------------------------------------------- página */

export default function LabTestPage() {
  return (
    <>
      <Navbar />

      <HeroSection
        kicker="LABTEST · LABORATÓRIO DE TESTES"
        title="Seu robô,"
        highlight="seus dados."
        description="Teste diferentes configurações, registre execuções e transforme o comportamento do seu robô em informações que ajudam sua equipe a tomar decisões melhores."
        images={["/images/index/banner_labtest.png"]}
        primaryAction={{ label: "Abrir meu LabTest", href: "/dashboard" }}
        secondaryAction={{ label: "Como funciona", href: "/labtest#como-funciona" }}
        badges={[
          { label: "Runs", href: "#modos" },
          { label: "CalibraBot", href: "#calibrabot" },
          { label: "Personalizado", href: "#modos" },
        ]}
        scrollTarget="#como-funciona"
        ariaLabel="Apresentação do LabTest"
      />

      <main className="overflow-x-clip bg-base-100 text-base-content">
        {/* ========================================================= INTRO */}
        <section id="como-funciona" className="relative isolate scroll-mt-20 overflow-hidden px-6 py-24">
          <AnimatedBackground />
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ O LABORATÓRIO"
                title="Pare de testar"
                highlight="no escuro."
                highlightClass="bg-accent text-accent-content"
                description="Desenvolver um robô envolve dezenas de decisões. Qual configuração usar? Qual mecanismo é mais consistente? O que realmente melhorou depois daquele ajuste?"
              />
              <p className="mt-4 max-w-2xl text-base leading-7 text-base-content/60">
                O LabTest transforma essas perguntas em experimentos,
                resultados e evidências que sua equipe pode analisar.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className={`btn btn-primary btn-lg ${cornerBtn} shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]`}
                >
                  <TestTube size={20} />
                  Criar um experimento
                </Link>
                <a href="#modos" className="btn btn-ghost btn-lg">
                  Ver os modos
                  <ArrowRight size={18} />
                </a>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <ExperimentCard />
            </RevealOnScroll>
          </div>

          {/* ciclo */}
          <div className="relative mx-auto mt-20 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[2.9rem] hidden border-t-2 border-dashed border-base-300 lg:block" />
            {cycle.map(({ icon: Icon, title, text, tone }, i) => {
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

        {/* ===================================================== BENEFÍCIOS */}
        <section className="border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ POR QUE TESTAR?"
                title="Transforme tentativa"
                highlight="em aprendizado."
                highlightClass="bg-secondary text-secondary-content"
                description="Cada execução pode responder uma pergunta. O LabTest ajuda sua equipe a transformar essas respostas em informações que podem ser comparadas, registradas e usadas de novo."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, text, tone }, i) => {
                const c = toneClasses[tone];
                return (
                  <RevealOnScroll key={title} delay={i * 0.06} className="h-full">
                    <article className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                      <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`} />
                      <div className="relative flex items-center justify-between">
                        <div className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                          <Icon size={22} strokeWidth={1.8} />
                        </div>
                        <span className="font-mono text-xs text-base-content/35">/{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="relative mt-7 text-lg font-bold tracking-tight">{title}</h3>
                      <p className="relative mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================== CALIBRABOT */}
        <section id="calibrabot" className="scroll-mt-20 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ NA PRÁTICA · CALIBRABOT"
                title="Qual configuração"
                highlight="realmente funciona?"
                description="Em vez de escolher com base apenas em percepção, coloque diferentes configurações à prova. Com o CalibraBot, a equipe repete experimentos, compara resultados e identifica padrões."
              />
              <ul className="mt-8 space-y-3">
                {[
                  "Repita o mesmo experimento",
                  "Compare diferentes configurações",
                  "Observe a consistência dos resultados",
                  "Use os dados para justificar decisões",
                ].map((item, i) => (
                  <li key={item} className="flex items-center gap-3 text-sm sm:text-base">
                    <span className="grid size-7 shrink-0 place-items-center rounded-tl-md rounded-br-md bg-success/15 text-success">
                      <Check size={15} />
                    </span>
                    <span className="mr-1 font-mono text-xs text-base-content/40">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-base-content/75">{item}</span>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <CalibraTabs />
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================== MODOS */}
        <section id="modos" className="scroll-mt-20 border-y border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ ESCOLHA SEU LABORATÓRIO"
                title="Um laboratório para"
                highlight="diferentes perguntas."
                highlightClass="bg-accent text-accent-content"
                description="Nem todo teste precisa responder à mesma pergunta. Escolha o formato que melhor representa o experimento que sua equipe quer realizar."
              />
            </RevealOnScroll>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {modes.map(({ icon: Icon, tag, title, text, features, tone }, i) => {
                const c = toneClasses[tone];
                const featured = i === 1;
                return (
                  <RevealOnScroll key={title} delay={i * 0.08} className="h-full">
                    <article
                      className={`group relative flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                        featured
                          ? "border-primary bg-primary text-primary-content shadow-[8px_8px_0_0_var(--color-base-content)]"
                          : `border-base-300 bg-base-100 ${c.hover}`
                      }`}
                    >
                      <span aria-hidden="true" className={`absolute right-6 top-4 font-mono text-6xl font-bold ${featured ? "text-primary-content/15" : "text-base-content/[0.06]"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className={`relative flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl ${featured ? "bg-primary-content/15" : c.icon}`}>
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <p className={`relative mt-7 text-[10px] font-bold tracking-[0.18em] ${featured ? "text-primary-content/75" : c.tag}`}>{tag}</p>
                      <h3 className="relative mt-2 text-2xl font-bold tracking-tight">{title}</h3>
                      <p className={`relative mt-3 text-sm leading-6 ${featured ? "text-primary-content/80" : "text-base-content/60"}`}>{text}</p>
                      <ul className={`relative mt-6 space-y-2.5 border-t pt-6 text-sm ${featured ? "border-primary-content/20" : "border-base-300"}`}>
                        {features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5">
                            <Check size={15} className={featured ? "text-primary-content" : c.tag} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================== RESULTADOS */}
        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ RESULTADOS"
                title="Dados que contam"
                highlight="uma história."
                highlightClass="bg-secondary text-secondary-content"
                description="Uma execução isolada mostra um resultado. Uma série de testes mostra comportamento. O LabTest ajuda a visualizar resultados, identificar padrões e acompanhar mudanças ao longo dos experimentos."
              />
            </RevealOnScroll>
            <div>
              <div className="grid grid-cols-2 gap-4">
                {metrics.map(({ label, value, text, tone }, i) => {
                  const c = toneClasses[tone];
                  return (
                    <RevealOnScroll key={label} delay={i * 0.06} className="h-full">
                      <div className={`group h-full rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6 ${c.hover}`}>
                        <p className={`text-[10px] font-bold tracking-[0.15em] ${c.tag}`}>{label.toUpperCase()}</p>
                        <p className="mt-3 font-mono text-3xl font-bold tabular-nums sm:text-4xl">{value}</p>
                        <p className="mt-2 text-xs leading-5 text-base-content/50">{text}</p>
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
              <p className="mt-3 text-right font-mono text-[10px] tracking-wide text-base-content/40">valores ilustrativos</p>
            </div>
          </div>
        </section>

        {/* ===================================================== EXPORTAR */}
        <section className="px-6 pb-24">
          <RevealOnScroll>
            <div className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] border border-base-300 bg-base-200/60 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] [&>*]:min-w-0">
              <div aria-hidden="true" className="absolute -right-16 -top-16 size-48 rounded-full border border-secondary/20" />
              <div className="relative">
                <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">/ DEPOIS DO LABORATÓRIO</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
                  O resultado do teste{" "}
                  <span className="inline-block -rotate-1 bg-primary px-2 italic text-primary-content">continua.</span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-base-content/65">
                  Use os resultados em reuniões, apresentações, cadernos de
                  engenharia e avaliações. O dado continua fazendo parte da
                  história do projeto.
                </p>
              </div>
              <ul className="relative grid gap-3">
                {[
                  { icon: BarChart3, label: "Gráficos", text: "para ver o comportamento" },
                  { icon: LineChart, label: "Métricas", text: "para comparar versões" },
                  { icon: Download, label: "Exportação", text: "para levar os dados adiante" },
                  { icon: FileText, label: "Caderno de engenharia", text: "para mostrar aos juízes" },
                ].map(({ icon: Icon, label, text }, i) => (
                  <li key={label} className="flex items-center gap-4 rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 px-4 py-3">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-tl-lg rounded-br-lg ${toneClasses[(["primary", "secondary", "accent"] as Tone[])[i % 3]].icon}`}>
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="block text-xs text-base-content/55">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        </section>

        {/* ============================================================ FAQ */}
        <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <div className="lg:sticky lg:top-28">
                <SectionTitle kicker="/ FAQ" title="Antes de" highlight="começar a testar." />
                <p className="mt-6 text-sm leading-6 text-base-content/60">
                  Tudo o que você precisa saber antes do primeiro experimento.
                </p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <div className="space-y-3">
                {faqs.map(({ q, a }, i) => (
                  <div key={q} className="collapse collapse-plus rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
                    <input type="radio" name="labtest_faq" defaultChecked={i === 0} aria-label={q} />
                    <div className="collapse-title pr-12 font-semibold">{q}</div>
                    <div className="collapse-content text-sm leading-7 text-base-content/70">
                      <p>{a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <CtaBlock
          kicker="SEU PRÓXIMO TESTE"
          icon={TestTube}
          title="Troque o “acho que funciona” por dados."
          text="Teste, compare, aprenda e tome decisões com mais informação sobre o comportamento do seu robô."
          actions={[
            { label: "Experimentar o LabTest", href: "/dashboard", variant: "accent" },
            { label: "Anatix para a OBR", href: "/obr/anatix", variant: "ghost" },
            { label: "Conhecer o laboratório", href: "#como-funciona", variant: "ghost" },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}