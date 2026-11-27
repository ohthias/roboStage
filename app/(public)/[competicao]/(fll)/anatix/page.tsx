import { PUBLIC_DIRS } from "@/lib/assets";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bluetooth,
  Cable,
  Download,
  FileCode2,
  Flag,
  Gauge,
  Timer,
  ToyBrick,
  Workflow,
} from "lucide-react";

import {
  Accordion,
  Bolt,
  ButtonLink,
  Callout,
  Code,
  Gear,
  Kicker,
  Marquee,
  Reveal,
  Section,
  SectionTitle,
  Starburst,
  StickerTag,
  buttonClasses,
  cn,
  toneSoft,
  toneText,
  type Tone,
} from "@/components/stage";
import { CodeBlock } from "@/features/labtest/anatix/components/anatix-interactive";

export const metadata: Metadata = {
  title: "Anatix para FLL | RoboStage",
  description:
    "Telemetria em tempo real para robôs LEGO com Pybricks: veja giro, sensores, estados das missões e tempos de execução por Bluetooth ou cabo USB, direto no LabTest.",
};

const BASE = PUBLIC_DIRS.anatixPybricks;
const LAB_HREF = "/dashboard/labtest/anatix?novo=pybricks";

const downloads = [
  { file: "anatix.py", title: "Biblioteca", text: "O arquivo que vai no projeto do Pybricks Code." },
  { file: "missoes_fll.py", title: "Missões FLL", text: "Missões com await e telemetria em paralelo (multitask)." },
  { file: "basico.py", title: "Básico", text: "Giroscópio, botões, estado, tempo de um bloco e log." },
  { file: "seguidor_de_linha.py", title: "Seguidor de linha", text: "PID com dois sensores de cor e desvio por ultrassom." },
];

const steps = [
  {
    number: "01",
    icon: FileCode2,
    title: "Adicione o anatix.py",
    description: "No Pybricks Code, crie um arquivo chamado anatix e cole a biblioteca. Ele fica no mesmo projeto do robô.",
  },
  {
    number: "02",
    icon: Workflow,
    title: "Marque as missões",
    description: "Importe o anx e registre valores, estados e tempos nos trechos que você quer observar.",
  },
  {
    number: "03",
    icon: Bluetooth,
    title: "Conecte e rode",
    description: "Feche o Pybricks Code, abra um laboratório LEGO no LabTest, conecte por Bluetooth ou cabo e inicie o programa.",
  },
];

const features: { icon: typeof Activity; tag: string; title: string; text: string; tone: Tone }[] = [
  { icon: Gauge, tag: "VALORES", title: "Giro e sensores ao vivo", text: "Heading, distância percorrida, reflexão do sensor de cor: qualquer número vira gráfico.", tone: "primary" },
  { icon: Workflow, tag: "ESTADOS", title: "Em que missão o robô está", text: "Acompanhe a sequência de missões e veja em qual delas ele travou.", tone: "secondary" },
  { icon: Timer, tag: "TEMPOS", title: "Quanto cada missão leva", text: "Cronometre retas, giros e garras e descubra onde estão os segundos da rodada de 2:30.", tone: "accent" },
  { icon: Flag, tag: "EVENTOS", title: "Momentos que importam", text: "Marque quando o robô terminou uma missão, encostou na parede ou perdeu a linha.", tone: "primary" },
];

const exemploMissoes = [
  "from pybricks.hubs import PrimeHub",
  "from pybricks.tools import multitask, run_task",
  "from anatix import anx",
  "# ... motores e DriveBase do seu robô ...",
  "",
  'anx.begin("Robo-FLL", hub)',
  "",
  "async def missoes():",
  '    anx.state("missao", "m01")',
  '    with anx.scope("m01_ida"):',
  "        await robo.straight(500)",
  "        await robo.turn(90)",
  '    anx.value("heading", hub.imu.heading())',
  '    anx.event("missao_concluida", 1)',
  "",
  "async def principal():",
  "    # a telemetria roda em paralelo às missões",
  "    await multitask(missoes(), anx.keep_alive(), race=True)",
  "",
  "run_task(principal())",
];

const exemploLoop = [
  "from pybricks.hubs import PrimeHub",
  "from anatix import anx",
  "",
  "hub = PrimeHub()",
  'anx.begin("MeuRobo", hub)  # a bateria vai sozinha',
  "",
  "while True:",
  "    anx.update()  # 1x por volta do loop",
  '    anx.value("heading", hub.imu.heading())',
  '    anx.value("reflexao", sensor.reflection(), every=100)',
  '    with anx.scope("pid"):',
  "        corrigir_rota()",
];

const api = [
  ["anx.begin(nome, hub)", "Inicia o Anatix; com o hub, envia a bateria"],
  ["anx.update()", "Uma vez por volta do loop"],
  ["await anx.keep_alive()", "Para programas sem loop, com multitask()"],
  ["anx.value(nome, v, every=ms)", "Envia um número (every limita a frequência)"],
  ["anx.event(nome, n)", "Marca um evento na linha do tempo"],
  ["anx.state(máquina, estado)", "Estado atual; só envia quando muda"],
  ["with anx.scope(nome):", "Cronometra o bloco"],
  ["anx.log(texto)", "Mensagem de texto livre"],
  ['anx.begin(..., enabled=False)', "Desliga tudo para o torneio"],
];

const connections = [
  {
    icon: Bluetooth,
    title: "Bluetooth",
    tone: "primary" as Tone,
    hubs: "SPIKE Prime, SPIKE Essential, Robot Inventor, Technic, City e Move Hub",
    text: "Sem fio: o robô roda na mesa e os dados chegam no computador. Funciona com Pybricks 3.3 ou mais novo.",
  },
  {
    icon: Cable,
    title: "Cabo USB",
    tone: "secondary" as Tone,
    hubs: "SPIKE Prime, SPIKE Essential e Robot Inventor",
    text: "Mais banda para muitos dados. Precisa de um firmware Pybricks com USB habilitado (versões beta do 4.x).",
  },
];

const faq = [
  {
    q: "Preciso tirar o Anatix para o torneio?",
    a: "Não. Sem o RoboStage conectado, nada é transmitido. Se quiser zerar qualquer custo, use anx.begin(..., enabled=False) e todas as chamadas viram funções vazias.",
  },
  {
    q: "O robô fica mais lento?",
    a: "O Anatix tem um limite de banda: se o link estiver cheio, o dado é descartado e contado, em vez de travar o loop. O contador de descartes aparece no LabTest.",
  },
  {
    q: "Por que não conecta pelo Bluetooth?",
    a: "O hub aceita um aplicativo por vez. Envie o programa pelo Pybricks Code, desconecte o hub lá e só então conecte pelo LabTest (Chrome ou Edge no computador).",
  },
  {
    q: "Consigo ver os dados sem o RoboStage?",
    a: "Sim. No terminal do Pybricks Code, digite ANX PING e as mensagens começam a chegar. Elas param 2 segundos depois do último PING.",
  },
  {
    q: "É o mesmo Anatix da OBR?",
    a: "É o mesmo protocolo e o mesmo laboratório no LabTest. Muda só a biblioteca: em C para Arduino e em Python para o Pybricks.",
  },
];

const card =
  "stage-paper group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 transition-[transform,box-shadow,border-color] duration-200 motion-reduce:hover:translate-y-0";

const hoverShadow: Record<string, string> = {
  primary: "hover:border-primary hover:shadow-[6px_6px_0_0_var(--color-primary)]",
  secondary: "hover:border-secondary hover:shadow-[6px_6px_0_0_var(--color-secondary)]",
  accent: "hover:border-accent hover:shadow-[6px_6px_0_0_var(--color-accent)]",
};

export default async function FllAnatixPage({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;
  // Versão Pybricks do Anatix, voltada à FLL.
  if (competicao !== "fll") notFound();

  return (
    <main className="overflow-x-clip bg-base-100 text-base-content">
      {/* ================================================================ HERO */}
      <Section tone="glow" innerClassName="pb-20 pt-16 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
          <Reveal>
            <StickerTag tone="paper" rotate={-2} className="inline-flex items-center gap-2">
              <ToyBrick size={14} className="text-primary" /> FLL · PYBRICKS
            </StickerTag>
            <h1 className="stage-display mt-6 text-4xl sm:text-6xl">
              Seu robô LEGO{" "}
              <span className="mt-2 inline-block -rotate-1 bg-primary px-3 py-1 italic text-primary-content">em tempo real.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-base-content/65 sm:text-lg">
              O Anatix agora roda no Pybricks. Coloque algumas linhas no programa das missões, conecte por <b>Bluetooth</b> ou{" "}
              <b>cabo USB</b> e veja giro, sensores, estados e tempos de cada missão no LabTest, enquanto o robô corre na mesa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={LAB_HREF} tone="primary" size="lg" iconRight={<ArrowRight size={18} />}>
                Criar laboratório
              </ButtonLink>
              <a href={`${BASE}/anatix.py`} download className={buttonClasses({ tone: "outline", size: "lg" })}>
                <Download size={18} /> Baixar anatix.py
              </a>
            </div>
          </Reveal>
          <Reveal delay={100} effect="pop" className="relative">
            <Starburst size={70} tone="accent" motion="spin" className="absolute -right-4 -top-8 z-10 hidden sm:inline-grid" />
            <Bolt size={44} tone="secondary" motion="wiggle" className="absolute -bottom-6 -left-4 z-10 hidden sm:inline-grid" />
            <div className="rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0_0_var(--color-secondary)]">
              <CodeBlock lines={exemploLoop} />
            </div>
          </Reveal>
        </div>
      </Section>

      <Marquee items={["GIRO", "SENSORES", "ESTADOS", "TEMPOS", "EVENTOS", "BLUETOOTH", "USB", "PYBRICKS"]} />

      {/* ============================================================ RECURSOS */}
      <Section tone="muted">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionTitle
              kicker="/ O QUE VOCÊ VÊ"
              title="Pare de adivinhar"
              highlight="na mesa."
              description="Quando uma missão falha, o Anatix mostra o que o robô estava medindo e decidindo naquele instante."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            {features.map(({ icon: Icon, tag, title, text, tone }, i) => (
              <Reveal key={title} delay={i * 60} className="h-full">
                <article className={cn(card, "p-6 hover:-translate-y-1", hoverShadow[tone])}>
                  <span className={cn("grid size-11 place-items-center rounded-tl-xl rounded-br-xl transition-colors duration-300", toneSoft[tone])}>
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <p className={cn("stage-kicker mt-5 text-[11px] font-bold", toneText[tone])}>{tag}</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================== ETAPAS */}
      <Section>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionTitle kicker="/ COMO USAR" title="Três passos," highlight="uma vez só." highlightTone="secondary" />
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
            {steps.map(({ number, icon: Icon, title, description }, i) => (
              <Reveal key={number} delay={i * 80} className="h-full">
                <li className="h-full border-t-2 border-base-content pt-5">
                  <div className="flex items-center justify-between">
                    <span className="stage-display text-5xl text-primary">{number}</span>
                    <span className="grid size-10 place-items-center rounded-tl-lg rounded-br-lg bg-base-content text-base-100">
                      <Icon size={18} />
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-black tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">{description}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <div className="mt-16 grid gap-8 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
            <Reveal>
              <Kicker className="mb-3">MISSÕES SEM LOOP</Kicker>
              <CodeBlock lines={exemploMissoes} />
              <Callout type="tip" title="Por que keep_alive?" className="mt-4">
                Programas de FLL costumam ser uma sequência de movimentos, sem um loop para chamar <Code>anx.update()</Code>. O{" "}
                <Code>anx.keep_alive()</Code> roda em paralelo com <Code>multitask()</Code> e mantém a conexão viva.
              </Callout>
            </Reveal>
            <Reveal delay={80}>
              <Kicker className="mb-3">REFERÊNCIA</Kicker>
              <div className="stage-paper overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
                <dl className="divide-y divide-base-300">
                  {api.map(([call, what]) => (
                    <div key={call} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                      <dt className="break-all font-mono text-xs font-semibold text-primary">{call}</dt>
                      <dd className="text-xs text-base-content/65">{what}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ============================================================ CONEXÃO */}
      <Section tone="secondary" edgeTop="circuit" edgeBottom="circuit" innerClassName="stage-grid-on-color">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="max-w-3xl">
              <p className="stage-kicker text-secondary-content/70">/ CONEXÃO</p>
              <h2 className="stage-display mt-3 text-3xl sm:text-5xl">
                Com fio ou{" "}
                <span className="mt-2 inline-block -rotate-1 bg-accent px-3 py-1 italic text-accent-content">sem fio.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-secondary-content/80 sm:text-lg">
                O LabTest conecta direto no hub pelo navegador (Chrome ou Edge no computador). Não precisa instalar nada.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 [&>*]:min-w-0">
            {connections.map(({ icon: Icon, title, tone, hubs, text }, i) => (
              <Reveal key={title} delay={i * 80} className="h-full">
                <article className="stage-paper group h-full rounded-tl-2xl rounded-br-2xl bg-base-100 p-6 text-base-content shadow-[6px_6px_0_0_var(--stage-shadow)]">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-11 place-items-center rounded-tl-xl rounded-br-xl", toneSoft[tone])}>
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <h3 className="text-lg font-black tracking-tight">{title}</h3>
                  </div>
                  <p className={cn("mt-4 text-xs font-semibold", toneText[tone])}>{hubs}</p>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ========================================================= DOWNLOADS */}
      <Section id="baixar" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionTitle kicker="/ ONDE PEGAR" title="Biblioteca e" highlight="exemplos." />
              <a
                href="https://github.com/ohthias/Anatix_C/blob/master/docs/PROTOCOLO.md"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ tone: "outline", className: "font-mono font-medium" })}
              >
                Protocolo Anatix v1 <ArrowUpRight size={15} />
              </a>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            {downloads.map(({ file, title, text }, i) => (
              <Reveal key={file} delay={i * 60} className="h-full">
                <a href={`${BASE}/${file}`} download className={cn(card, "p-5 hover:-translate-y-1", hoverShadow.primary)}>
                  <span className="inline-flex w-fit rounded-tl-md rounded-br-md bg-base-content px-2 py-0.5 font-mono text-[11px] text-base-100">
                    {file}
                  </span>
                  <span className="mt-3 font-black tracking-tight">{title}</span>
                  <span className="mt-1 flex-1 text-sm text-base-content/60">{text}</span>
                  <span className="mt-4 inline-flex items-center gap-2 border-t border-dashed border-base-300 pt-3 text-sm font-bold group-hover:text-primary">
                    <Download size={15} /> Baixar
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================ FAQ */}
      <Section tone="muted">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <Reveal>
            <SectionTitle kicker="/ DÚVIDAS" title="Perguntas" highlight="frequentes." highlightTone="secondary" />
          </Reveal>
          <Reveal delay={80}>
            <Accordion
              defaultOpen={0}
              items={faq.map(({ q, a }) => ({ title: q, content: <p className="text-sm leading-6 text-base-content/65">{a}</p> }))}
            />
          </Reveal>
        </div>
      </Section>

      {/* ========================================================= CTA FINAL */}
      <Section tone="primary" edgeTop="gear" innerClassName="stage-grid-on-color relative overflow-hidden">
        <Gear size={200} tone="accent" motion="spin" className="absolute -right-12 -top-10 hidden sm:inline-block" />
        <Reveal>
          <div className="relative mx-auto max-w-6xl">
            <Kicker className="text-primary-content/70">PRÓXIMA RODADA</Kicker>
            <h2 className="stage-display mt-4 max-w-3xl text-3xl sm:text-5xl">Pronto para a próxima rodada?</h2>
            <p className="mt-5 max-w-xl text-primary-content/85">
              Crie um laboratório LEGO no LabTest. Cada execução do programa vira uma sessão gravada para comparar depois.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={LAB_HREF} tone="accent" size="lg" iconRight={<ArrowRight size={18} />}>
                Criar laboratório
              </ButtonLink>
              <ButtonLink href="/anatix" tone="ghost" size="lg" shape="rounded" className="text-primary-content hover:bg-primary-content/10">
                Anatix para Arduino
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
