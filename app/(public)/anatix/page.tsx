import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight,
  ArrowUpRight, Braces, Cable, Cpu, Download, Flag, FolderGit2, Gauge, Layers, Package, ShieldCheck, Terminal, Timer, ToyBrick, Trophy, Workflow, Zap } from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import "./style.css";
import { CodeBlock, CopyButton, LiveMonitor } from "./anatix-interactive";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";

export const metadata: Metadata = {
  title: "Anatix",
  description:
    "Seu robô em tempo real, em duas versões: Anatix em C para Arduino e placas com Serial (cabo USB) e Anatix em Python para robôs LEGO com Pybricks (Bluetooth ou cabo USB). Veja sensores, decisões e tempos de execução enquanto o robô roda.",
};

// Dados
const REPO_URL = "https://github.com/ohthias/Anatix_C";
const REPO_GIT = `${REPO_URL}.git`;
const REPO_ZIP = `${REPO_URL}/archive/refs/heads/main.zip`;
const PYBRICKS_BASE = "/anatix/pybricks";

const features = [
  {
    icon: Activity,
    tag: "MÉTRICAS",
    title: "Valores ao vivo",
    description:
      "Distância, leitura dos sensores, erro do PID, velocidade dos motores. Qualquer número do seu código vira um gráfico.",
    macro: "ANX_VALUE",
    py: "anx.value()",
    tone: "primary",
  },
  {
    icon: Flag,
    tag: "EVENTOS",
    title: "Momentos que importam",
    description:
      "Marque na linha do tempo quando o robô perdeu a linha, achou um obstáculo ou entrou na área de resgate.",
    macro: "ANX_EVENT",
    py: "anx.event()",
    tone: "secondary",
  },
  {
    icon: Workflow,
    tag: "ESTADOS",
    title: "O que o robô está pensando",
    description:
      "Acompanhe a máquina de estados: seguindo linha, desviando, resgatando. Só é enviado quando muda.",
    macro: "ANX_STATE",
    py: "anx.state()",
    tone: "accent",
  },
  {
    icon: Timer,
    tag: "TEMPOS",
    title: "Onde o tempo vai embora",
    description:
      "Cronometre trechos do código e descubra qual leitura ou cálculo está deixando o robô lento.",
    macro: "ANX_SCOPE",
    py: "with anx.scope()",
    tone: "secondary",
  },
  {
    icon: Gauge,
    tag: "SAÚDE",
    title: "Diagnóstico automático",
    description:
      "Loops por segundo, pior tempo de loop e RAM livre, sem escrever nenhuma linha a mais.",
    macro: "automático",
    py: "automático",
    tone: "accent",
  },
  {
    icon: Zap,
    tag: "LEVEZA",
    title: "Sem cabo, sem custo",
    description:
      "Nada é enviado até o computador pedir. Se a conexão cair, a telemetria desliga sozinha e o robô segue normal.",
    macro: "ANX_UPDATE",
    py: "anx.update()",
    tone: "primary",
  },
] as const;

// Amarelo misturado com a cor do texto: ocre no tema claro, amarelo claro no
// escuro. Legível nos dois, ao contrário de accent-content.
const ACCENT_TEXT =
  "text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]";

const toneClasses = {
  primary: {
    icon: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content",
    tag: "text-primary",
    ring: "group-hover:border-primary/30",
    hover: "hover:border-primary/40",
  },
  secondary: {
    icon: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-content",
    tag: "text-secondary",
    ring: "group-hover:border-secondary/30",
    hover: "hover:border-secondary/40",
  },
  accent: {
    icon: `bg-accent/20 ${ACCENT_TEXT} group-hover:bg-accent group-hover:text-accent-content`,
    tag: ACCENT_TEXT,
    ring: "group-hover:border-accent/50",
    hover: "hover:border-accent/60",
  },
} as const;

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Instale a biblioteca",
    description:
      "Na Arduino IDE ou no PlatformIO (versão em C) ou como um arquivo no Pybricks Code (versão em Python).",
    detail: "Uma vez só",
  },
  {
    number: "02",
    icon: Braces,
    title: "Marque o seu código",
    description:
      "Marque os pontos que você quer observar: macros ANX_ no Arduino, chamadas anx. no Pybricks.",
    detail: "Poucas linhas",
  },
  {
    number: "03",
    icon: Cable,
    title: "Conecte o robô",
    description:
      "Pelo cabo USB ou, nos robôs LEGO, por Bluetooth. O LabTest recebe os dados e mostra o desempenho em tempo real.",
    detail: "Analise ao vivo",
  },
];

const exemploBasico = [
  "#include <Anatix.h>",
  "",
  "void setup() {",
  "  Serial.begin(115200);",
  '  ANX_BEGIN(Serial, "MeuRobo");',
  "}",
  "",
  "void loop() {",
  "  ANX_UPDATE();  // sempre no início",
  "",
  "  float dist = lerUltrassom();",
  '  ANX_VALUE("distancia_cm", dist);',
  "",
  "  if (dist < 10) {",
  '    ANX_STATE("modo", "desviando");',
  '    ANX_EVENT("obstaculo");',
  "  } else {",
  '    ANX_STATE("modo", "seguindo_linha");',
  "  }",
  "}",
];

const exemploPid = [
  "void loop() {",
  "  ANX_UPDATE();",
  "",
  "  {",
  '    ANX_SCOPE("pid");  // mede o tempo deste bloco',
  "    float erro = lerErroLinha();",
  "    float correcao = kp * erro + kd * (erro - erroAnterior);",
  "    erroAnterior = erro;",
  "    moverMotores(BASE + correcao, BASE - correcao);",
  "",
  '    ANX_VALUE("pid_erro", erro);',
  '    ANX_VALUE("pid_correcao", correcao);',
  "  }",
  "",
  '  ANX_VALUE_EVERY("bateria_v", lerBateria(), 1000);',
  "}",
];

const exemploCompeticao = [
  "// Na versão de competição, uma linha desliga tudo:",
  "#define ANATIX_DISABLE",
  "#include <Anatix.h>",
  "",
  "// As macros ANX_ continuam no código,",
  "// mas não geram nenhuma instrução na placa.",
];

const exemploPython = [
  "from pybricks.hubs import PrimeHub",
  "from anatix import anx",
  "",
  "hub = PrimeHub()",
  'anx.begin("MeuRobo", hub)  # a bateria vai sozinha',
  "",
  "while True:",
  "    anx.update()  # 1x por volta do loop",
  "",
  "    dist = ultrassom.distance()",
  '    anx.value("distancia_mm", dist)',
  "",
  "    if dist < 100:",
  '        anx.state("modo", "desviando")',
  '        anx.event("obstaculo", dist)',
  "    else:",
  '        anx.state("modo", "seguindo_linha")',
];

const exemploMissoes = [
  "from pybricks.tools import multitask, run_task",
  "from anatix import anx",
  "",
  'anx.begin("Robo-FLL", hub)',
  "",
  "async def missoes():",
  '    anx.state("missao", "m01")',
  '    with anx.scope("m01"):  # tempo da missão',
  "        await robo.straight(500)",
  "        await robo.turn(90)",
  '    anx.event("missao_concluida", 1)',
  "",
  "async def principal():",
  "    # telemetria em paralelo às missões",
  "    await multitask(missoes(), anx.keep_alive(), race=True)",
  "",
  "run_task(principal())",
];

/** [Arduino, Pybricks, o que faz] */
const macros = [
  ["ANX_BEGIN(porta, nome)", "anx.begin(nome, hub)", "Inicia o Anatix"],
  ["ANX_UPDATE()", "anx.update()", "Obrigatório, uma vez por loop"],
  ["—", "await anx.keep_alive()", "Programas sem loop (multitask)"],
  ["ANX_VALUE(nome, valor)", "anx.value(nome, v)", "Envia um número"],
  ["ANX_VALUE_EVERY(nome, valor, ms)", "anx.value(nome, v, every=ms)", "Idem, com limite de frequência"],
  ["ANX_EVENT(nome)", "anx.event(nome)", "Marca um evento na linha do tempo"],
  ["ANX_EVENT_DATA(nome, n)", "anx.event(nome, n)", "Evento com um número junto"],
  ["ANX_STATE(máquina, estado)", "anx.state(máquina, estado)", "Estado atual; só envia quando muda"],
  ["ANX_SCOPE(nome)", "with anx.scope(nome):", "Cronometra um bloco"],
  ["ANX_SECTION_BEGIN / END(nome)", "anx.section_begin / end(nome)", "Cronometra um trecho manualmente"],
  ["ANX_LOG(texto)", "anx.log(texto)", "Mensagem de texto livre"],
  ["#define ANATIX_DISABLE", "anx.begin(..., enabled=False)", "Desliga tudo para a competição"],
];

/** As duas versões do Anatix: mesma ideia, mesmo protocolo, mesmo LabTest. */
const versions = [
  {
    key: "c",
    icon: Cpu,
    tone: "primary",
    badge: "C · ARDUINO",
    title: "Anatix para Arduino",
    forWho: "OBR e robôs com Arduino, ESP32, RP2040 e outras placas com Serial.",
    specs: [
      ["Dispositivos", "Uno, Nano, Mega, Leonardo, ESP32, ESP8266, RP2040, SAMD"],
      ["Conexão", "Cabo USB (Web Serial)"],
      ["Onde programar", "Arduino IDE ou PlatformIO"],
    ],
    steps: [
      <>Instale a biblioteca: <b>Sketch → Incluir Biblioteca → Adicionar .ZIP</b> (ou <code>lib_deps</code> no PlatformIO).</>,
      <>No sketch, <code>#include &lt;Anatix.h&gt;</code>, <code>ANX_BEGIN</code> no <code>setup()</code> e <code>ANX_UPDATE()</code> no início do <code>loop()</code>.</>,
      <>Grave o robô, deixe o cabo USB ligado e feche o Monitor Serial da IDE.</>,
      <>No LabTest, crie um laboratório <b>Arduino</b> e clique em <b>Conectar robô</b>.</>,
    ],
    code: [
      "#include <Anatix.h>",
      "",
      "void setup() {",
      "  Serial.begin(115200);",
      '  ANX_BEGIN(Serial, "MeuRobo");',
      "}",
      "",
      "void loop() {",
      "  ANX_UPDATE();",
      '  ANX_VALUE("distancia_cm", lerUltrassom());',
      "}",
    ],
    primary: { href: "/dashboard/labtest/anatix?novo=serial", label: "Criar laboratório Arduino" },
    secondary: { href: REPO_URL, label: "Repositório Anatix_C", external: true },
  },
  {
    key: "py",
    icon: ToyBrick,
    tone: "secondary",
    badge: "PYTHON · PYBRICKS",
    title: "Anatix para Pybricks",
    forWho: "FLL e robôs LEGO: SPIKE Prime, SPIKE Essential, Robot Inventor e hubs Powered Up.",
    specs: [
      ["Dispositivos", "SPIKE Prime e Essential, Robot Inventor, Technic, City e Move Hub"],
      ["Conexão", "Bluetooth ou cabo USB (SPIKE e Robot Inventor)"],
      ["Onde programar", "Pybricks Code (firmware Pybricks 3.3 ou mais novo)"],
    ],
    steps: [
      <>Baixe o <code>anatix.py</code> e, no Pybricks Code, crie um arquivo chamado <b>anatix</b> com o conteúdo dele.</>,
      <>No programa, <code>from anatix import anx</code>, <code>anx.begin(...)</code> e <code>anx.update()</code> no loop (ou <code>anx.keep_alive()</code> em missões sem loop).</>,
      <>Envie o programa ao hub e desconecte o Pybricks Code (o hub aceita um aplicativo por vez).</>,
      <>No LabTest, crie um laboratório <b>LEGO com Pybricks</b>, conecte por <b>Bluetooth</b> ou <b>Cabo USB</b> e clique em <b>Iniciar programa</b>.</>,
    ],
    code: [
      "from pybricks.hubs import PrimeHub",
      "from anatix import anx",
      "",
      "hub = PrimeHub()",
      'anx.begin("MeuRobo", hub)',
      "",
      "while True:",
      "    anx.update()",
      '    anx.value("heading", hub.imu.heading())',
    ],
    primary: { href: "/dashboard/labtest/anatix?novo=pybricks", label: "Criar laboratório LEGO" },
    secondary: { href: `${PYBRICKS_BASE}/anatix.py`, label: "Baixar anatix.py", download: true },
    guide: { href: "/fll/anatix", label: "Guia completo para a FLL" },
  },
] as const;

/** [aspecto, Arduino, Pybricks] */
const comparison = [
  ["Linguagem", "C/C++ (macros ANX_)", "Python (objeto anx)"],
  ["Competições", "OBR e projetos próprios", "FLL e robôs LEGO"],
  ["Conexão", "Cabo USB", "Bluetooth ou cabo USB"],
  ["Instalação", "Biblioteca da Arduino IDE / PlatformIO", "Arquivo anatix.py no projeto do Pybricks Code"],
  ["Programas sem loop", "—", "anx.keep_alive() com multitask()"],
  ["Diagnóstico automático", "Loops/s, tempo de loop, RAM livre", "Loops/s, tempo de loop, RAM livre e bateria do hub"],
  ["Para não travar o robô", "Descarta o dado se a serial estiver cheia", "Limite de banda; o excesso é descartado"],
  ["Na competição", "#define ANATIX_DISABLE", "anx.begin(..., enabled=False)"],
  ["Análise", "LabTest · Anatix", "LabTest · Anatix (uma sessão por execução)"],
] as const;

const install = [
  {
    icon: Package,
    title: "Arduino IDE",
    tone: "primary",
    steps: [
      "Baixe o .zip do repositório",
      "Sketch → Incluir Biblioteca → Adicionar biblioteca .ZIP",
      "Abra Arquivo → Exemplos → Anatix",
    ],
    command: null as string | null,
    href: REPO_ZIP,
    action: "Baixar .zip",
  },
  {
    icon: Terminal,
    title: "Git",
    tone: "secondary",
    steps: [
      "Clone dentro da pasta de bibliotecas",
      "Documentos/Arduino/libraries",
    ],
    command: `git clone ${REPO_GIT} Anatix`,
    href: REPO_URL,
    action: "Abrir repositório",
  },
  {
    icon: Cpu,
    title: "PlatformIO",
    tone: "accent",
    steps: ["Adicione em lib_deps no platformio.ini"],
    command: `lib_deps = ${REPO_GIT}`,
    href: REPO_URL,
    action: "Abrir repositório",
  },
  {
    icon: ToyBrick,
    title: "LEGO · Pybricks",
    tone: "primary",
    steps: [
      "Baixe o anatix.py (versão em Python)",
      "No Pybricks Code, crie o arquivo anatix",
      "Conecte por Bluetooth ou cabo USB no LabTest",
    ],
    command: "from anatix import anx",
    href: "/fll/anatix",
    action: "Anatix na FLL",
  },
] as const;

const faq = [
  {
    q: "Qual versão eu uso?",
    a: "Depende da placa do robô. Arduino, ESP32 e outras placas programadas em C usam o Anatix para Arduino. Robôs LEGO (SPIKE, Robot Inventor e hubs Powered Up) com o firmware Pybricks usam o Anatix para Pybricks, em Python.",
  },
  {
    q: "O robô fica mais lento com o Anatix?",
    a: "Sem o cabo conectado, cada macro vira só uma verificação rápida. Conectado, o Anatix nunca espera a serial: se o buffer estiver cheio, o dado é descartado e contado, em vez de travar o loop.",
  },
  {
    q: "Posso deixar o Anatix no robô na competição?",
    a: "Pode, porque sem o RoboStage conectado nada é transmitido. Se preferir zerar qualquer custo: no Arduino, #define ANATIX_DISABLE antes do #include faz as macros sumirem da compilação; no Pybricks, anx.begin(..., enabled=False) troca tudo por funções vazias.",
  },
  {
    q: "Quais placas funcionam?",
    a: "Uno, Nano, Mega, Leonardo, ESP32, ESP8266, RP2040, SAMD e outras placas com Serial. No Uno e no Nano, use ANX_VALUE_EVERY nas métricas que não precisam de todas as amostras. Robôs LEGO (SPIKE, Robot Inventor e hubs Powered Up) usam a versão em Python para o Pybricks, por Bluetooth ou cabo USB: veja Anatix na FLL.",
  },
  {
    q: "Consigo ver os dados sem o RoboStage?",
    a: "Sim. No Arduino, abra o Monitor Serial a 115200 baud; no Pybricks, use o terminal do Pybricks Code. Envie ANX PING e as mensagens começam a chegar. Elas param 2 segundos depois do último PING.",
  },
  {
    q: "Meu código já usa Serial.print. Vai dar conflito?",
    a: "Não. As mensagens do Anatix têm um formato próprio e o resto aparece como console. Se você também lê comandos pela Serial, use Anatix.setLineHandler para receber as linhas que não são do Anatix.",
  },
];

function SectionTitle({
  kicker,
  title,
  highlight,
  highlightClass = "bg-primary text-primary-content",
  description,
}: {
  kicker: string;
  title: string;
  highlight: string;
  highlightClass?: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
        {kicker}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
        {title}{" "}
        <span
          className={`mt-2 inline-block -rotate-1 px-3 py-1 italic ${highlightClass}`}
        >
          {highlight}
        </span>
      </h2>
      {description && (
        <p className="mt-6 max-w-2xl text-base leading-7 text-base-content/60 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export default function AnatixPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        {/* ================================================================ HERO */}
        <section className="anatix-hero relative isolate overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
          <div className="anatix-background text-primary" aria-hidden="true">
            <div className="anatix-glow anatix-glow-one" />
            <div className="anatix-glow anatix-glow-two" />
            <div className="anatix-grid" />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
            <div>
              <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
                Anatix<span className="text-primary">.</span>
              </h1>

              <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Seu robô,{" "}
                <span className="inline-block -rotate-1 bg-accent px-2 text-accent-content">
                  em tempo real.
                </span>
              </p>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-base-content/65 sm:text-lg">
                Coloque algumas linhas no código do robô, conecte e veja sensores,
                decisões e tempos de execução enquanto ele roda. Em C para
                Arduino (OBR) ou em Python para robôs LEGO com Pybricks (FLL).
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#versoes"
                  className="btn btn-primary btn-lg rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]"
                >
                  <Layers size={20} />
                  Escolher a versão
                  <ArrowRight size={18} />
                </a>
                <a href="#como-usar" className="btn btn-ghost btn-lg">
                  Ver como usar
                  <ArrowRight size={18} />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 text-xs">
                {["Uno", "Nano", "Mega", "ESP32", "RP2040", "SPIKE Prime", "Robot Inventor"].map((b) => (
                  <span
                    key={b}
                    className="badge badge-outline badge-sm font-mono"
                  >
                    {b}
                  </span>
                ))}
                <span className="badge badge-ghost badge-sm">
                  e outras placas com Serial ou Pybricks
                </span>
              </div>
            </div>

            <LiveMonitor />
          </div>
        </section>

        {/* ============================================================ VERSÕES */}
        <section id="versoes" className="scroll-mt-24 border-t border-base-300 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ VERSÕES"
                title="Um Anatix para"
                highlight="cada robô."
                description="As duas versões falam o mesmo protocolo e são analisadas no mesmo LabTest. Escolha pela placa do seu robô."
              />
            </RevealOnScroll>

            <div className="mt-14 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
              {versions.map((v, i) => {
                const c = toneClasses[v.tone];
                const Icon = v.icon;
                return (
                  <RevealOnScroll key={v.key} delay={i * 0.08}>
                    <article
                      id={`versao-${v.key}`}
                      className={`group flex h-full scroll-mt-24 flex-col rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-6 sm:p-8 ${c.hover}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                          <Icon size={22} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-mono text-[10px] font-bold tracking-[0.18em] ${c.tag}`}>{v.badge}</p>
                          <h3 className="text-2xl font-bold tracking-tight">{v.title}</h3>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-base-content/65">{v.forWho}</p>

                      <dl className="mt-5 grid gap-2 border-y border-base-200 py-4 text-sm">
                        {v.specs.map(([k, val]) => (
                          <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3">
                            <dt className="text-base-content/50">{k}</dt>
                            <dd className="font-medium">{val}</dd>
                          </div>
                        ))}
                      </dl>

                      <h4 className="mt-6 font-mono text-xs tracking-[0.2em] text-base-content/50">COMO UTILIZAR</h4>
                      <ol className="mt-3 space-y-2.5 text-sm leading-6 text-base-content/70">
                        {v.steps.map((step, n) => (
                          <li key={n} className="flex gap-3">
                            <span className={`mt-0.5 font-mono text-xs font-bold ${c.tag}`}>{n + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>

                      <div className="mt-6">
                        <CodeBlock lines={[...v.code]} />
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-2 pt-1">
                        <Link href={v.primary.href} className="btn btn-primary btn-sm rounded-tl-lg rounded-br-lg rounded-tr-none rounded-bl-none">
                          {v.primary.label}
                          <ArrowRight size={15} />
                        </Link>
                        {"external" in v.secondary ? (
                          <a href={v.secondary.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm border-base-300">
                            <FolderGit2 size={15} />
                            {v.secondary.label}
                            <ArrowUpRight size={14} />
                          </a>
                        ) : (
                          <a href={v.secondary.href} download className="btn btn-ghost btn-sm border-base-300">
                            <Download size={15} />
                            {v.secondary.label}
                          </a>
                        )}
                        {"guide" in v && (
                          <Link href={v.guide.href} className="btn btn-ghost btn-sm">
                            {v.guide.label}
                            <ArrowRight size={15} />
                          </Link>
                        )}
                      </div>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>

            <RevealOnScroll>
              <div className="mt-10 overflow-x-auto rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-48" />
                      <th className="font-mono text-xs tracking-[0.15em] text-primary">ARDUINO · C</th>
                      <th className={`font-mono text-xs tracking-[0.15em] ${toneClasses.secondary.tag}`}>PYBRICKS · PYTHON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map(([k, cVal, pyVal]) => (
                      <tr key={k}>
                        <th className="text-xs font-semibold text-base-content/55">{k}</th>
                        <td className="text-sm">{cVal}</td>
                        <td className="text-sm">{pyVal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ============================================================ RECURSOS */}
        <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ O QUE O ANATIX MOSTRA"
                title="Entenda o que acontece"
                highlight="dentro do robô."
                description="Cada chamada responde a uma pergunta diferente sobre o desempenho, igual nas duas versões. Use só as que fizerem sentido para a sua estratégia."
              />
            </RevealOnScroll>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(
                ({ icon: Icon, tag, title, description, macro, py, tone }, i) => {
                  const c = toneClasses[tone];
                  return (
                    <RevealOnScroll key={tag} delay={(i % 3) * 0.08}>
                      <article
                        className={`group relative flex h-full flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-base-content/[0.04] ${c.hover}`}
                      >
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-base-300 transition-transform duration-500 group-hover:scale-125 ${c.ring}`}
                        />
                        <div className="relative flex items-center justify-between">
                          <div
                            className={`flex size-12 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
                          >
                            <Icon size={22} strokeWidth={1.8} />
                          </div>
                          <span className="font-mono text-xs text-base-content/35">
                            /{String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p
                          className={`relative mt-7 text-[10px] font-bold tracking-[0.18em] ${c.tag}`}
                        >
                          {tag}
                        </p>
                        <h3 className="relative mt-2 text-xl font-bold tracking-tight">
                          {title}
                        </h3>
                        <p className="relative mt-3 flex-1 text-sm leading-6 text-base-content/60">
                          {description}
                        </p>
                        <div className="relative mt-6 flex flex-wrap gap-1.5">
                          <code className="rounded-md bg-base-200 px-2 py-1 font-mono text-xs text-base-content/70">
                            {macro}
                          </code>
                          {py !== macro && (
                            <code className="rounded-md bg-base-200 px-2 py-1 font-mono text-xs text-base-content/70">
                              {py}
                            </code>
                          )}
                        </div>
                      </article>
                    </RevealOnScroll>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* ============================================================== ETAPAS */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ COMO FUNCIONA"
                title="Três passos até"
                highlight="os primeiros dados."
                highlightClass="bg-secondary text-secondary-content"
              />
            </RevealOnScroll>

            <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
              <div
                aria-hidden="true"
                className="absolute left-[16.66%] right-[16.66%] top-6 hidden border-t-2 border-dashed border-base-300 md:block"
              />
              {steps.map(
                ({ number, icon: Icon, title, description, detail }, i) => (
                  <RevealOnScroll key={number} delay={i * 0.1}>
                    <article className="group relative md:px-6 first:md:pl-0 last:md:pr-0">
                      <div className="flex items-center gap-4 md:block">
                        <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 text-secondary transition-all duration-300 group-hover:border-secondary group-hover:bg-secondary group-hover:text-secondary-content">
                          <Icon size={21} strokeWidth={1.8} />
                        </div>
                        <span className="font-mono text-xs tracking-widest text-base-content/40 md:mt-4 md:block">
                          ETAPA {number}
                        </span>
                      </div>
                      <h3 className="mt-5 text-xl font-bold tracking-tight">
                        {title}
                      </h3>
                      <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/60">
                        {description}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-secondary">
                        <span className="size-1.5 rounded-full bg-secondary" />
                        {detail}
                      </div>
                    </article>
                  </RevealOnScroll>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =========================================================== COMO USAR */}
        <section
          id="como-usar"
          className="scroll-mt-24 border-t border-base-300 bg-base-200/40 px-6 py-24"
        >
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <SectionTitle
                kicker="/ COMO USAR"
                title="Poucas linhas,"
                highlight="muita informação."
                description="As linhas destacadas são as do Anatix. O resto é o código que o seu robô já tem, em C ou em Python."
              />
            </RevealOnScroll>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr] [&>*]:min-w-0">
              <RevealOnScroll>
                <div className="tabs tabs-box min-w-0 rounded-tl-2xl rounded-br-2xl bg-base-100 p-2">
                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="Arduino"
                    defaultChecked
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploBasico} />
                  </div>

                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="Arduino · PID"
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploPid} />
                  </div>

                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="Arduino · Competição"
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploCompeticao} />
                  </div>

                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="Pybricks"
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploPython} />
                  </div>

                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="Pybricks · Missões FLL"
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploMissoes} />
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.1}>
                <div className="h-full overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
                  <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
                    <div className="grid size-9 place-items-center rounded-tl-lg rounded-br-lg bg-accent text-accent-content">
                      <Braces size={18} />
                    </div>
                    <h3 className="font-bold">Referência rápida</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th className="text-[10px] tracking-[0.15em]">ARDUINO</th>
                          <th className="text-[10px] tracking-[0.15em]">PYBRICKS</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {macros.map(([macro, py, desc]) => (
                          <tr key={macro + py} className="hover:bg-base-200/60">
                            <td className="whitespace-nowrap font-mono text-xs text-primary">
                              {macro}
                            </td>
                            <td className={`whitespace-nowrap font-mono text-xs ${toneClasses.secondary.tag}`}>
                              {py}
                            </td>
                            <td className="text-xs text-base-content/65">
                              {desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="border-t border-base-300 px-5 py-4 text-xs leading-5 text-base-content/55">
                    Nomes e estados são textos fixos entre aspas e sem vírgulas.
                    No Arduino eles ficam na memória Flash e não gastam RAM.
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            {/* Anatomia de uma mensagem */}
            <RevealOnScroll>
              <div className="mt-10 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 sm:p-8">
                <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
                  / POR DENTRO DA CONEXÃO
                </p>
                <h3 className="mt-2 text-lg font-bold">
                  Cada dado vira uma linha de texto simples.
                </h3>
                <div className="mt-6 flex flex-wrap items-stretch gap-1.5 font-mono text-sm">
                  {[
                    ["$ANX", "início", "bg-base-content text-base-100"],
                    ["V", "tipo", "bg-primary text-primary-content"],
                    [
                      "1520",
                      "tempo (ms)",
                      "bg-secondary text-secondary-content",
                    ],
                    ["distancia_cm", "nome", "bg-accent text-accent-content"],
                    ["23.400", "valor", "bg-neutral text-neutral-content"],
                    ["*23", "checksum", "bg-base-300 text-base-content"],
                  ].map(([part, label, cls]) => (
                    <div
                      key={label}
                      className="flex flex-col items-start gap-1"
                    >
                      <span
                        className={`rounded-tl-md rounded-br-md px-2.5 py-1.5 font-bold ${cls}`}
                      >
                        {part}
                      </span>
                      <span className="px-1 text-[10px] uppercase tracking-wider text-base-content/45">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-base-content/60">
                  É o mesmo formato nas duas versões. Dá para ler até no Monitor
                  Serial (115200 baud) ou no terminal do Pybricks Code: envie{" "}
                  <kbd className="kbd kbd-sm">ANX PING</kbd> e as mensagens
                  começam a chegar. O checksum garante que nenhum dado corrompido
                  entre na análise.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================= INSTALAÇÃO */}
        <section id="instalar" className="scroll-mt-24 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionTitle
                  kicker="/ ONDE PEGAR"
                  title="Código aberto,"
                  highlight="pronto para baixar."
                  highlightClass="bg-accent text-accent-content"
                />
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <FolderGit2 size={16} />
                  ohthias/Anatix_C
                  <ArrowUpRight
                    size={15}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </RevealOnScroll>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
              {install.map(
                (
                  {
                    icon: Icon,
                    title,
                    tone,
                    steps: passos,
                    command,
                    href,
                    action,
                  },
                  i,
                ) => {
                  const c = toneClasses[tone];
                  return (
                    <RevealOnScroll key={title} delay={i * 0.08}>
                      <article
                        className={`group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}
                          >
                            <Icon size={20} strokeWidth={1.8} />
                          </div>
                          <h3 className="text-lg font-bold">{title}</h3>
                        </div>

                        <ol className="mt-5 flex-1 space-y-2 text-sm text-base-content/65">
                          {passos.map((p, n) => (
                            <li key={p} className="flex gap-2">
                              <span
                                className={`font-mono text-xs font-bold ${c.tag}`}
                              >
                                {n + 1}.
                              </span>
                              {p}
                            </li>
                          ))}
                        </ol>

                        {command && (
                          <div className="mt-5 flex items-start gap-1 rounded-tl-lg rounded-br-lg bg-neutral py-1.5 pl-3 pr-1.5 text-neutral-content">
                            <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs leading-5">
                              {command}
                            </code>
                            <CopyButton text={command} />
                          </div>
                        )}

                        <a
                          href={href}
                          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-base-content transition-colors hover:text-primary"
                        >
                          {action}
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </a>
                      </article>
                    </RevealOnScroll>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* ================================================================ FAQ */}
        <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <div className="lg:sticky lg:top-28">
                <SectionTitle
                  kicker="/ DÚVIDAS"
                  title="Antes de"
                  highlight="conectar."
                />
                <div className="mt-8 flex items-center gap-3 text-sm text-base-content/60">
                  <ShieldCheck size={18} className="text-success" />
                  Código aberto, com exemplos prontos para a Arduino IDE e o Pybricks Code.
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="space-y-3">
                {faq.map(({ q, a }, i) => (
                  <div
                    key={q}
                    className="collapse collapse-plus rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100"
                  >
                    <input
                      type="radio"
                      name="anatix_faq"
                      defaultChecked={i === 0}
                      aria-label={q}
                    />
                    <div className="collapse-title pr-12 font-semibold">
                      {q}
                    </div>
                    <div className="collapse-content text-sm leading-6 text-base-content/65">
                      <p>{a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================= CTA FINAL */}
        <section className="px-6 py-24">
          <RevealOnScroll>
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-secondary px-8 py-14 text-secondary-content sm:px-14">
              {/* formas */}
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 size-64 rounded-full border-[28px] border-accent/90"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-10 right-40 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-primary"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-8 right-12 size-10 rounded-full border-2 border-dashed border-secondary-content/40"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:22px_22px]"
              />

              <div className="relative max-w-2xl">
                <div className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-secondary-content/70">
                  <Trophy size={14} />
                  PRONTO PARA O PRÓXIMO TESTE
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                  Pare de adivinhar o que o robô está fazendo.
                </h2>
                <p className="mt-5 max-w-xl text-secondary-content/80">
                  Escolha a versão, marque o código e leve evidências para cada
                  ajuste. Combine com o LabTest para registrar e comparar as
                  execuções.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent btn-lg rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5"
                  >
                    <FolderGit2 size={20} />
                    Arduino no GitHub
                  </a>
                  <a
                    href={`${PYBRICKS_BASE}/anatix.py`}
                    download
                    className="btn btn-ghost btn-lg border-secondary-content/30 text-secondary-content hover:bg-secondary-content/10"
                  >
                    <Download size={20} />
                    anatix.py
                  </a>
                  <Link
                    href="/dashboard/labtest"
                    className="btn btn-ghost btn-lg text-secondary-content hover:bg-secondary-content/10"
                  >
                    Conhecer o LabTest
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>
      <Footer />
    </>
  );
}
