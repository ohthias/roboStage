"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowRight,
  ArrowUpRight, Braces, Cable, Check, Copy, Cpu, Download, Flag, FolderGit2, Gauge, Package, ShieldCheck, Terminal, Timer, Trophy, Workflow, Zap } from "lucide-react";

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import "./style.css";
import { Navbar } from "@/components/UI/Navbar";
import { Footer } from "@/components/UI/Footer";

// Dados
const REPO_URL = "https://github.com/ohthias/Anatix_C";
const REPO_GIT = `${REPO_URL}.git`;
const REPO_ZIP = `${REPO_URL}/archive/refs/heads/main.zip`;

const features = [
  {
    icon: Activity,
    tag: "MÉTRICAS",
    title: "Valores ao vivo",
    description:
      "Distância, leitura dos sensores, erro do PID, velocidade dos motores. Qualquer número do seu código vira um gráfico.",
    macro: "ANX_VALUE",
    tone: "primary",
  },
  {
    icon: Flag,
    tag: "EVENTOS",
    title: "Momentos que importam",
    description:
      "Marque na linha do tempo quando o robô perdeu a linha, achou um obstáculo ou entrou na área de resgate.",
    macro: "ANX_EVENT",
    tone: "secondary",
  },
  {
    icon: Workflow,
    tag: "ESTADOS",
    title: "O que o robô está pensando",
    description:
      "Acompanhe a máquina de estados: seguindo linha, desviando, resgatando. Só é enviado quando muda.",
    macro: "ANX_STATE",
    tone: "accent",
  },
  {
    icon: Timer,
    tag: "TEMPOS",
    title: "Onde o tempo vai embora",
    description:
      "Cronometre trechos do código e descubra qual leitura ou cálculo está deixando o robô lento.",
    macro: "ANX_SCOPE",
    tone: "secondary",
  },
  {
    icon: Gauge,
    tag: "SAÚDE",
    title: "Diagnóstico automático",
    description:
      "Loops por segundo, pior tempo de loop e RAM livre, sem escrever nenhuma linha a mais.",
    macro: "automático",
    tone: "accent",
  },
  {
    icon: Zap,
    tag: "LEVEZA",
    title: "Sem cabo, sem custo",
    description:
      "Nada é enviado até o computador pedir. Se o cabo sair, a telemetria desliga sozinha e o robô segue normal.",
    macro: "ANX_UPDATE",
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
      "Baixe o repositório e adicione na Arduino IDE ou no PlatformIO.",
    detail: "Uma vez só",
  },
  {
    number: "02",
    icon: Braces,
    title: "Marque o seu código",
    description:
      "Inclua o Anatix e coloque as macros ANX_ nos pontos que você quer observar.",
    detail: "Poucas linhas",
  },
  {
    number: "03",
    icon: Cable,
    title: "Conecte o cabo",
    description:
      "Com o robô no USB, o Anatix recebe os dados e mostra o desempenho em tempo real.",
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

const macros = [
  ["ANX_BEGIN(porta, nome)", "Inicia o Anatix na porta serial"],
  ["ANX_UPDATE()", "Obrigatório, uma vez por loop"],
  ["ANX_VALUE(nome, valor)", "Envia um número (int, long, float)"],
  ["ANX_VALUE_EVERY(nome, valor, ms)", "Idem, com limite de frequência"],
  ["ANX_EVENT(nome)", "Marca um evento na linha do tempo"],
  ["ANX_EVENT_DATA(nome, n)", "Evento com um número junto"],
  ["ANX_STATE(máquina, estado)", "Estado atual; só envia quando muda"],
  ["ANX_SCOPE(nome)", "Cronometra o bloco { } onde está"],
  ["ANX_SECTION_BEGIN / END(nome)", "Cronometra um trecho manualmente"],
  ["ANX_LOG(texto)", "Mensagem de texto livre"],
];

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
] as const;

const faq = [
  {
    q: "O robô fica mais lento com o Anatix?",
    a: "Sem o cabo conectado, cada macro vira só uma verificação rápida. Conectado, o Anatix nunca espera a serial: se o buffer estiver cheio, o dado é descartado e contado, em vez de travar o loop.",
  },
  {
    q: "Posso deixar o Anatix no robô na competição?",
    a: "Pode, porque sem cabo nada é transmitido. Se preferir zerar qualquer custo, coloque #define ANATIX_DISABLE antes do #include e todas as macros somem da compilação.",
  },
  {
    q: "Quais placas funcionam?",
    a: "Uno, Nano, Mega, Leonardo, ESP32, ESP8266, RP2040, SAMD e outras placas com Serial. No Uno e no Nano, use ANX_VALUE_EVERY nas métricas que não precisam de todas as amostras.",
  },
  {
    q: "Consigo ver os dados sem o RoboStage?",
    a: "Sim. Abra o Monitor Serial a 115200 baud, envie ANX PING e as mensagens começam a chegar. Elas param 2 segundos depois do último PING.",
  },
  {
    q: "Meu código já usa Serial.print. Vai dar conflito?",
    a: "Não. As mensagens do Anatix têm um formato próprio e o resto aparece como console. Se você também lê comandos pela Serial, use Anatix.setLineHandler para receber as linhas que não são do Anatix.",
  },
];

function checksum(body: string) {
  let ck = 0;
  for (let i = 0; i < body.length; i++) ck ^= body.charCodeAt(i);
  return ck.toString(16).toUpperCase().padStart(2, "0");
}

function frame(t: number, tipo: string, campos: (string | number)[]) {
  const body = `ANX,${tipo},${t},${campos.join(",")}`;
  return `$${body}*${checksum(body)}`;
}

function useLiveDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const id = setInterval(() => setTick((n) => n + 1), 700);
    return () => clearInterval(id);
  }, []);

  const t = 15200 + tick * 250;
  const dist = 24 + 9 * Math.sin(tick / 3);
  const hz = 528 + Math.round(6 * Math.sin(tick / 2));
  const modo = dist < 17 ? "desviando" : "seguindo_linha";
  const bars = Array.from({ length: 24 }, (_, i) => {
    const k = tick - 23 + i;
    return 24 + 9 * Math.sin(k / 3);
  });

  const lines = Array.from({ length: 6 }, (_, i) => {
    const k = tick - 5 + i;
    const tt = 15200 + k * 250;
    const d = (24 + 9 * Math.sin(k / 3)).toFixed(3);
    if (k % 4 === 0)
      return frame(tt, "L", [
        528 + Math.round(6 * Math.sin(k / 2)),
        1884,
        2310,
        812,
        0,
      ]);
    if (k % 4 === 2) return frame(tt, "T", ["pid", 132, 389, 431]);
    return frame(tt, "V", ["distancia_cm", d]);
  });

  return { t, dist, hz, modo, bars, lines };
}

function LiveMonitor() {
  const { dist, hz, modo, bars, lines } = useLiveDemo();

  return (
    <div className="relative">
      {/* formas de fundo */}
      <div
        aria-hidden="true"
        className="absolute -right-4 -top-4 size-24 rotate-12 rounded-tl-2xl rounded-br-2xl bg-accent"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-5 size-20 rounded-full border-2 border-dashed border-secondary/50"
      />

      <div className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 shadow-[8px_8px_0_0_var(--color-secondary)]">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            <span className="font-mono text-xs text-base-content/60">
              MeuRobo · ao vivo
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-base-content/35">
            115200 BAUD
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-base-300 border-b border-base-300">
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-primary">
              DISTÂNCIA
            </p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums">
              {dist.toFixed(1)}
              <span className="ml-1 text-xs font-normal text-base-content/50">
                cm
              </span>
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.15em] text-secondary">
              LOOP
            </p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums">
              {hz}
              <span className="ml-1 text-xs font-normal text-base-content/50">
                /s
              </span>
            </p>
          </div>
          <div className="px-4 py-3">
            <p
              className={`text-[10px] font-bold tracking-[0.15em] ${ACCENT_TEXT}`}
            >
              MODO
            </p>
            <p className="mt-1 truncate font-mono text-sm font-bold">{modo}</p>
          </div>
        </div>

        <div className="flex h-24 items-end gap-1 px-5 pt-4" aria-hidden="true">
          {bars.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-500 ${
                v < 17
                  ? "bg-primary"
                  : i === bars.length - 1
                    ? "bg-secondary"
                    : "bg-secondary/25"
              }`}
              style={{ height: `${((v - 12) / 24) * 100}%` }}
            />
          ))}
        </div>

        <div className="mt-4 bg-neutral px-5 py-4 font-mono text-[11px] leading-6 text-neutral-content sm:text-xs">
          {lines.map((l, i) => (
            <div
              key={l}
              className={`truncate ${i === lines.length - 1 ? "opacity-100" : "opacity-60"}`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* sem permissão de área de transferência */
        }
      }}
      className="btn btn-ghost btn-xs btn-square"
      aria-label={copied ? "Copiado" : "Copiar comando"}
      title={copied ? "Copiado" : "Copiar"}
    >
      {copied ? (
        <Check size={14} className="text-success" />
      ) : (
        <Copy size={14} />
      )}
    </button>
  );
}

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="mockup-code w-full overflow-x-auto rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none text-sm">
      {lines.map((line, i) => {
        const anx = line.includes("ANX_") || line.includes("ANATIX_");
        return (
          <pre
            key={i}
            data-prefix={i + 1}
            className={anx ? "bg-primary/25 text-neutral-content" : undefined}
          >
            <code>{line || " "}</code>
          </pre>
        );
      })}
    </div>
  );
}

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
                Coloque algumas linhas no código do robô, conecte o cabo USB e
                veja sensores, decisões e tempos de execução enquanto ele roda.
                Menos achismo, mais evidência para os ajustes da OBR e da FLL.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-base-content)]"
                >
                  <FolderGit2 size={20} />
                  Pegar no GitHub
                  <ArrowUpRight size={18} />
                </a>
                <a href="#como-usar" className="btn btn-ghost btn-lg">
                  Ver como usar
                  <ArrowRight size={18} />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 text-xs">
                {["Uno", "Nano", "Mega", "ESP32", "RP2040"].map((b) => (
                  <span
                    key={b}
                    className="badge badge-outline badge-sm font-mono"
                  >
                    {b}
                  </span>
                ))}
                <span className="badge badge-ghost badge-sm">
                  e outras placas com Serial
                </span>
              </div>
            </div>

            <LiveMonitor />
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
                description="Cada macro responde a uma pergunta diferente sobre o desempenho. Use só as que fizerem sentido para a sua estratégia."
              />
            </RevealOnScroll>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(
                ({ icon: Icon, tag, title, description, macro, tone }, i) => {
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
                        <code className="relative mt-6 self-start rounded-md bg-base-200 px-2 py-1 font-mono text-xs text-base-content/70">
                          {macro}
                        </code>
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
                description="As linhas destacadas são as do Anatix. O resto é o código que o seu robô já tem."
              />
            </RevealOnScroll>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr] [&>*]:min-w-0">
              <RevealOnScroll>
                <div className="tabs tabs-box min-w-0 rounded-tl-2xl rounded-br-2xl bg-base-100 p-2">
                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="Básico"
                    defaultChecked
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploBasico} />
                  </div>

                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="PID"
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploPid} />
                  </div>

                  <input
                    type="radio"
                    name="anatix_exemplos"
                    className="tab"
                    aria-label="Competição"
                  />
                  <div className="tab-content pt-3">
                    <CodeBlock lines={exemploCompeticao} />
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
                      <tbody>
                        {macros.map(([macro, desc]) => (
                          <tr key={macro} className="hover:bg-base-200/60">
                            <td className="whitespace-nowrap font-mono text-xs text-primary">
                              {macro}
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
                    Eles ficam na memória Flash e não gastam RAM.
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            {/* Anatomia de uma mensagem */}
            <RevealOnScroll>
              <div className="mt-10 rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 sm:p-8">
                <p className="font-mono text-xs tracking-[0.2em] text-base-content/45">
                  / POR DENTRO DO CABO
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
                  Dá para ler até no Monitor Serial: envie{" "}
                  <kbd className="kbd kbd-sm">ANX PING</kbd> a 115200 baud e as
                  mensagens começam a chegar. O checksum garante que nenhum dado
                  corrompido entre na análise.
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
                  highlight="no GitHub."
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

            <div className="mt-12 grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
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
                          target="_blank"
                          rel="noopener noreferrer"
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
                  Código aberto, com exemplos prontos para abrir na Arduino IDE.
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
                  Baixe a biblioteca, marque o código e leve evidências para
                  cada ajuste. Combine com o LabTest para registrar e comparar
                  as execuções.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent btn-lg rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none shadow-[4px_4px_0_0_var(--color-base-content)] transition-all hover:-translate-y-0.5"
                  >
                    <FolderGit2 size={20} />
                    Ver no GitHub
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
