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
  type LucideIcon,
} from "lucide-react";

import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import { ProductHero } from "@/components/product/ProductHero";
import { CoverCard, CycleSteps, FaqBlock, ProductCta, type CycleStep } from "@/components/product/ProductBlocks";
import {
  ButtonLink,
  Callout,
  Card,
  CountUp,
  Flower,
  IconList,
  Kicker,
  Marquee,
  Mascot,
  Reveal,
  RunCompareCard,
  Section,
  SectionTitle,
  Sparkle,
  StatCard,
  StatusBadge,
  StickerTag,
  Squiggle,
  TestCover,
  type CoverPattern,
  type Tone,
} from "@/components/stage";
import { CalibraTabs, GrowBar } from "./labtest-interactive";

/* -------------------------------------------------------------- dados */

const cycle: CycleStep[] = [
  { icon: TestTube, title: "Teste", text: "Execute seu robô em condições controladas.", tone: "primary" },
  { icon: Ruler, title: "Meça", text: "Registre os resultados de cada execução.", tone: "secondary" },
  { icon: Scale, title: "Compare", text: "Coloque configurações diferentes lado a lado.", tone: "accent" },
  { icon: Target, title: "Decida", text: "Use os dados para escolher o próximo caminho.", tone: "primary" },
];

const benefits: { icon: LucideIcon; title: string; text: string; tone: Tone }[] = [
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

const modes: {
  icon: LucideIcon;
  tag: string;
  title: string;
  text: string;
  features: string[];
  tone: "primary" | "secondary" | "accent";
  pattern: CoverPattern;
}[] = [
  {
    icon: Play,
    tag: "Análise de runs",
    title: "Runs",
    text: "Analise suas execuções de competição, compare estratégias e descubra onde seu robô pode evoluir.",
    features: ["Análise por competição", "Comparação de runs", "Padrões de falha", "Métricas de consistência"],
    tone: "secondary",
    pattern: "waves",
  },
  {
    icon: Gauge,
    tag: "Para o robô",
    title: "CalibraBot",
    text: "Teste componentes e comportamentos do robô para encontrar a configuração que entrega o melhor desempenho.",
    features: ["Testes de motores", "Sensores e atuadores", "PID e giroscópio", "Análise de precisão"],
    tone: "primary",
    pattern: "gears",
  },
  {
    icon: SlidersHorizontal,
    tag: "Sob medida",
    title: "Personalizado",
    text: "Crie testes específicos para aquilo que sua equipe precisa investigar.",
    features: ["Parâmetros personalizados", "Métricas próprias", "Testes experimentais", "Resultados comparáveis"],
    tone: "accent",
    pattern: "circuit",
  },
];

const faqs = [
  { q: "O que posso testar no LabTest?", a: "Você pode testar desde componentes individuais do robô, como motores e sensores, até execuções completas de estratégias de competição. O modo de teste depende daquilo que sua equipe deseja analisar." },
  { q: "O LabTest funciona para diferentes competições?", a: "Sim. O modo Runs foi pensado para ser adaptável às diferentes competições e ligas de robótica. A análise pode considerar as particularidades de cada competição." },
  { q: "Preciso ter conhecimento de análise de dados?", a: "Não. O LabTest organiza os dados coletados em gráficos, tabelas e indicadores para que a equipe consiga interpretar os resultados sem precisar construir suas próprias análises." },
  { q: "Posso exportar meus resultados?", a: "Sim. Os resultados podem ser utilizados fora do LabTest, permitindo que sua equipe documente testes, compare experimentos e apresente dados durante avaliações e competições." },
  { q: "O LabTest substitui os testes práticos?", a: "Não. Ele potencializa os testes práticos. O robô continua sendo testado fisicamente, enquanto o LabTest registra e transforma essas execuções em informações úteis para a equipe." },
];

/* --------------------------------------------------------------- partes */

/** Prévia do hero: capa de teste + comparação antes × depois, sobrepostas. */
function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-md">
      <TestCover
        code="T-014"
        title="Giro de 90° na missão 03"
        robot="Robô v3"
        runs={30}
        best={92}
        className="-rotate-3 stage-shadow-lg"
      />
      <RunCompareCard
        title="Depois do ajuste de PID"
        before={{ label: "v2", score: 285, time: "2:21", success: 74 }}
        after={{ label: "v3", score: 335, time: "2:09", success: 92 }}
        className="relative -mt-10 ml-12 rotate-2 bg-base-100 stage-shadow-lg"
      />
      <Sparkle size={36} tone="accent" motion="float" className="absolute -left-6 top-1/2" />
    </div>
  );
}

function ExperimentCard() {
  return (
    <div className="relative">
      <Flower size={72} tone="accent" motion="spin" className="absolute -right-6 -top-8 z-10" />
      <Card featured padded={false} className="overflow-hidden border border-base-300 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-base-content/60">
            <StatusBadge status="live">Rodando</StatusBadge>
            CalibraBot · experimento
          </span>
          <span className="stage-kicker text-base-content/35">EXEMPLO</span>
        </div>

        <div className="p-5 sm:p-6">
          <Kicker className="text-primary">CONSISTÊNCIA DAS CONFIGURAÇÕES</Kicker>
          <div className="mt-6 space-y-6">
            {configs.map((c, i) => (
              <div key={c.name}>
                <div className="mb-2 flex items-center justify-between font-mono text-xs">
                  <span className={i === 0 ? "font-bold text-base-content" : "text-base-content/70"}>
                    {c.name}
                    {i === 0 && <StickerTag tone="accent" size="sm" shadow={false} className="ml-2">Melhor</StickerTag>}
                  </span>
                  <span className="font-bold tabular-nums">
                    <CountUp value={c.value} suffix="%" />
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-base-200">
                  <GrowBar value={c.value} delayMs={i * 120} className={i === 0 ? "bg-primary" : "bg-secondary/60"} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <figcaption className="stage-night px-5 py-4 font-mono text-[11px] leading-6 sm:text-xs">
          <p className="opacity-60">$ labtest comparar --runs 30</p>
          <p>
            melhor: <span className="text-[#fabd32]">Motor A + Motor C</span>{" "}
            <span className="text-[#9be15d]">✓ 92% de consistência</span>
          </p>
        </figcaption>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------- página */

export default function LabTestPage() {
  return (
    <>
      <Navbar />

      <ProductHero
        kicker="LABTEST · LABORATÓRIO DE TESTES"
        title="Seu robô,"
        highlight="seus dados."
        description="Teste diferentes configurações, registre execuções e transforme o comportamento do seu robô em informações que ajudam sua equipe a tomar decisões melhores."
        image="/images/index/banner_labtest.png"
        primary={{ label: "Abrir meu LabTest", href: "/dashboard" }}
        secondary={{ label: "Como funciona", href: "#como-funciona" }}
        badges={[
          { label: "Runs", href: "#modos" },
          { label: "CalibraBot", href: "#calibrabot" },
          { label: "Personalizado", href: "#modos" },
        ]}
        aside={<HeroPreview />}
        scrollTarget="#como-funciona"
      />

      <main className="overflow-x-clip bg-base-100 text-base-content">
        <div className="relative z-10 -my-2 overflow-hidden py-2">
          <Marquee
            items={["Teste", "Meça", "Compare", "Decida", "Repita", "Evolua"]}
            tone="secondary"
            tilt={-1}
            speed={35}
          />
        </div>

        {/* ========================================================= INTRO */}
        <Section id="como-funciona" tone="glow">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
            <Reveal>
              <SectionTitle
                kicker="/ O LABORATÓRIO"
                title="Pare de testar"
                highlight="no escuro."
                highlightTone="accent"
                description="Desenvolver um robô envolve dezenas de decisões. Qual configuração usar? Qual mecanismo é mais consistente? O que realmente melhorou depois daquele ajuste?"
              />
              <p className="mt-4 max-w-2xl text-base leading-7 text-base-content/60">
                O LabTest transforma essas perguntas em experimentos,
                resultados e evidências que sua equipe pode analisar.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/dashboard" size="lg" iconLeft={<TestTube size={20} />}>
                  Criar um experimento
                </ButtonLink>
                <ButtonLink href="#modos" tone="ghost" size="lg" shape="rounded" iconRight={<ArrowRight size={18} />}>
                  Ver os modos
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={100} effect="pop">
              <ExperimentCard />
            </Reveal>
          </div>

          <CycleSteps steps={cycle} className="mx-auto mt-20 max-w-6xl" />
        </Section>

        {/* ===================================================== BENEFÍCIOS */}
        <Section tone="muted" edgeTop="torn" edgeBottom="torn">
          <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
            <Reveal className="relative">
              <SectionTitle
                kicker="/ POR QUE TESTAR?"
                title="Transforme tentativa"
                highlight="em aprendizado."
                highlightTone="secondary"
                description="Cada execução pode responder uma pergunta. O LabTest ajuda sua equipe a transformar essas respostas em informações que podem ser comparadas, registradas e usadas de novo."
              />
              <Callout type="tip" title="Uma pergunta por experimento" className="mt-8 max-w-md">
                Mude uma coisa de cada vez (motor, constante, mecanismo). Assim
                fica claro o que causou a diferença no resultado.
              </Callout>
            </Reveal>
            <Reveal delay={100}>
              <IconList
                columns={2}
                items={benefits.map(({ icon: Icon, title, text, tone }) => ({ icon: <Icon />, title, text, tone }))}
                className="rounded-tl-[2rem] rounded-br-[2rem] border border-base-300 bg-base-100 p-8"
              />
            </Reveal>
          </div>
        </Section>

        {/* ===================================================== CALIBRABOT */}
        <Section id="calibrabot">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
            <Reveal>
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
            </Reveal>
            <Reveal delay={100} className="relative">
              <Mascot size={80} motion="wiggle" rotate={10} className="absolute -right-4 -top-14 z-10 hidden sm:block" />
              <CalibraTabs />
            </Reveal>
          </div>
        </Section>

        {/* ========================================================== MODOS */}
        <Section id="modos" tone="muted">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionTitle
                kicker="/ ESCOLHA SEU LABORATÓRIO"
                title="Um laboratório para"
                highlight="diferentes perguntas."
                highlightTone="accent"
                description="Nem todo teste precisa responder à mesma pergunta. Escolha o formato que melhor representa o experimento que sua equipe quer realizar."
              />
            </Reveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {modes.map((m, i) => (
                <Reveal key={m.title} delay={i * 90} className="h-full">
                  <CoverCard index={i + 1} {...m} featured={i === 1} ribbon={i === 1 ? "Mais usado" : undefined} />
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* ===================================================== RESULTADOS */}
        <Section tone="night" edgeTop="scallop" edgeBottom="scallop">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
            <Reveal>
              <p className="stage-kicker text-white/50">/ RESULTADOS</p>
              <h2 className="stage-display mt-3 text-3xl text-white sm:text-5xl">
                Dados que contam{" "}
                <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">uma história.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Uma execução isolada mostra um resultado. Uma série de testes
                mostra comportamento. O LabTest ajuda a visualizar resultados,
                identificar padrões e acompanhar mudanças ao longo dos
                experimentos.
              </p>
              <Squiggle size={110} tone="accent" className="mt-8" />
            </Reveal>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <Reveal delay={0}>
                  <StatCard label="Execuções" value={<CountUp value={128} />} unit="testes" trend={[40, 52, 61, 70, 88, 97, 112, 128]} tone="primary" icon={<Play size={16} />} className="text-base-content" />
                </Reveal>
                <Reveal delay={80}>
                  <StatCard label="Consistência" value={<CountUp value={94.2} decimals={1} suffix="%" />} delta={6.1} deltaLabel="vs. v2" trend={[81, 84, 83, 88, 90, 92, 94]} tone="secondary" icon={<Target size={16} />} className="text-base-content" />
                </Reveal>
                <Reveal delay={160}>
                  <StatCard label="Configurações" value={<CountUp value={12} />} unit="comparadas" trend={[2, 3, 5, 6, 8, 10, 12]} tone="accent" icon={<SlidersHorizontal size={16} />} className="text-base-content" />
                </Reveal>
                <Reveal delay={240}>
                  <StatCard label="Evolução" value={<CountUp value={18} prefix="+" suffix="%" />} delta={18} deltaLabel="entre versões" trend={[0, 4, 6, 9, 12, 15, 18]} tone="success" icon={<Trophy size={16} />} className="text-base-content" />
                </Reveal>
              </div>
              <p className="mt-3 text-right font-mono text-[10px] tracking-wide text-white/40">valores ilustrativos</p>
            </div>
          </div>
        </Section>

        {/* ===================================================== EXPORTAR */}
        <Section>
          <Reveal>
            <Card
              corner
              className="mx-auto grid max-w-6xl items-center gap-10 border border-base-300 bg-base-200/60 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0"
            >
              <div>
                <Kicker>DEPOIS DO LABORATÓRIO</Kicker>
                <h2 className="stage-display mt-3 text-2xl sm:text-4xl">
                  O resultado do teste{" "}
                  <span className="inline-block -rotate-1 bg-primary px-2 italic text-primary-content">continua.</span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-base-content/65">
                  Use os resultados em reuniões, apresentações, cadernos de
                  engenharia e avaliações. O dado continua fazendo parte da
                  história do projeto.
                </p>
                <ButtonLink href="/stagebook" tone="outline" className="mt-7" iconRight={<ArrowRight size={16} />}>
                  Levar para o Stagebook
                </ButtonLink>
              </div>
              <IconList
                columns={2}
                items={[
                  { icon: <BarChart3 />, title: "Gráficos", text: "para ver o comportamento", tone: "primary" },
                  { icon: <LineChart />, title: "Métricas", text: "para comparar versões", tone: "secondary" },
                  { icon: <Download />, title: "Exportação", text: "para levar os dados adiante", tone: "accent" },
                  { icon: <FileText />, title: "Caderno de engenharia", text: "para mostrar aos juízes", tone: "primary" },
                ]}
              />
            </Card>
          </Reveal>
        </Section>

        <FaqBlock
          title="Antes de"
          highlight="começar a testar."
          description="Tudo o que você precisa saber antes do primeiro experimento."
          items={faqs}
        />

        <ProductCta
          kicker="SEU PRÓXIMO TESTE"
          icon={TestTube}
          title="Troque o “acho que funciona” por dados."
          text="Teste, compare, aprenda e tome decisões com mais informação sobre o comportamento do seu robô."
          primary={{ label: "Experimentar o LabTest", href: "/dashboard" }}
          links={[
            { label: "Anatix para a OBR", href: "/obr/anatix" },
            { label: "Conhecer o laboratório", href: "#como-funciona" },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
