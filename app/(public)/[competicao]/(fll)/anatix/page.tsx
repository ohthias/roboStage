import type { Metadata } from "next";
import Link from "next/link";
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

import RevealOnScroll from "@/components/UI/RevealOnScroll";
import { SectionTitle, toneClasses, type Tone } from "@/components/home/shared";
import { CodeBlock } from "@/app/(public)/anatix/anatix-interactive";

export const metadata: Metadata = {
  title: "Anatix para FLL | RoboStage",
  description:
    "Telemetria em tempo real para robôs LEGO com Pybricks: veja giro, sensores, estados das missões e tempos de execução por Bluetooth ou cabo USB, direto no LabTest.",
};

const BASE = "/anatix/pybricks";
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

export default async function FllAnatixPage({
  params,
}: {
  params: Promise<{ competicao: string }>;
}) {
  const { competicao } = await params;
  // Versão Pybricks do Anatix, voltada à FLL.
  if (competicao !== "fll") notFound();

  return (
    <main className="overflow-x-clip">
      {/* ================================================================ HERO */}
      <section className="relative isolate px-6 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <p className="inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-3 py-1 font-mono text-xs tracking-[0.15em] text-base-content/60">
              <ToyBrick size={14} className="text-primary" /> FLL · PYBRICKS
            </p>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
              Seu robô LEGO{" "}
              <span className="mt-2 inline-block -rotate-1 bg-primary px-3 py-1 italic text-primary-content">
                em tempo real.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-base-content/65 sm:text-lg">
              O Anatix agora roda no Pybricks. Coloque algumas linhas no programa das missões, conecte por{" "}
              <b>Bluetooth</b> ou <b>cabo USB</b> e veja giro, sensores, estados e tempos de cada missão no LabTest,
              enquanto o robô corre na mesa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={LAB_HREF} className="btn btn-primary rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none">
                Criar laboratório <ArrowRight size={16} />
              </Link>
              <a
                href={`${BASE}/anatix.py`}
                download
                className="btn btn-ghost border-base-300 bg-base-100 rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none"
              >
                <Download size={16} /> Baixar anatix.py
              </a>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <CodeBlock lines={exemploLoop} />
          </RevealOnScroll>
        </div>
      </section>

      {/* ============================================================ RECURSOS */}
      <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ O QUE VOCÊ VÊ"
              title="Pare de adivinhar"
              highlight="na mesa."
              description="Quando uma missão falha, o Anatix mostra o que o robô estava medindo e decidindo naquele instante."
            />
          </RevealOnScroll>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            {features.map(({ icon: Icon, tag, title, text, tone }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.06}>
                  <article className={`group h-full rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 transition-all duration-300 hover:-translate-y-1 ${c.hover}`}>
                    <div className={`flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl transition-colors duration-300 ${c.icon}`}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <p className={`mt-5 font-mono text-[11px] font-bold tracking-[0.2em] ${c.tag}`}>{tag}</p>
                    <h3 className="mt-1 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== ETAPAS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle kicker="/ COMO USAR" title="Três passos," highlight="uma vez só." highlightClass="bg-secondary text-secondary-content" />
          </RevealOnScroll>
          <ol className="mt-12 grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
            {steps.map(({ number, icon: Icon, title, description }, i) => (
              <RevealOnScroll key={number} delay={i * 0.08}>
                <li className="h-full rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-black text-base-content/15">{number}</span>
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-base-content/60">{description}</p>
                </li>
              </RevealOnScroll>
            ))}
          </ol>

          <div className="mt-16 grid gap-8 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
            <RevealOnScroll>
              <h3 className="mb-3 font-mono text-xs tracking-[0.2em] text-base-content/50">MISSÕES SEM LOOP</h3>
              <CodeBlock lines={exemploMissoes} />
              <p className="mt-3 text-sm text-base-content/60">
                Programas de FLL costumam ser uma sequência de movimentos, sem um loop para chamar{" "}
                <code>anx.update()</code>. O <code>anx.keep_alive()</code> roda em paralelo com{" "}
                <code>multitask()</code> e mantém a conexão viva.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.08}>
              <h3 className="mb-3 font-mono text-xs tracking-[0.2em] text-base-content/50">REFERÊNCIA</h3>
              <div className="overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100">
                <table className="table table-sm">
                  <tbody>
                    {api.map(([call, what]) => (
                      <tr key={call}>
                        <td className="whitespace-nowrap font-mono text-xs text-primary">{call}</td>
                        <td className="text-xs text-base-content/65">{what}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ============================================================ CONEXÃO */}
      <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <SectionTitle
              kicker="/ CONEXÃO"
              title="Com fio ou"
              highlight="sem fio."
              highlightClass="bg-accent text-accent-content"
              description="O LabTest conecta direto no hub pelo navegador (Chrome ou Edge no computador). Não precisa instalar nada."
            />
          </RevealOnScroll>
          <div className="mt-12 grid gap-5 md:grid-cols-2 [&>*]:min-w-0">
            {connections.map(({ icon: Icon, title, tone, hubs, text }, i) => {
              const c = toneClasses[tone];
              return (
                <RevealOnScroll key={title} delay={i * 0.08}>
                  <article className={`group h-full rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-6 ${c.hover}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex size-11 items-center justify-center rounded-tl-xl rounded-br-xl ${c.icon}`}>
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      <h3 className="text-lg font-bold">{title}</h3>
                    </div>
                    <p className={`mt-4 text-xs font-semibold ${c.tag}`}>{hubs}</p>
                    <p className="mt-2 text-sm leading-6 text-base-content/60">{text}</p>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= DOWNLOADS */}
      <section id="baixar" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionTitle kicker="/ ONDE PEGAR" title="Biblioteca e" highlight="exemplos." />
              <a
                href="https://github.com/ohthias/Anatix_C/blob/master/docs/PROTOCOLO.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-tl-lg rounded-br-lg border border-base-300 bg-base-100 px-4 py-2 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
              >
                Protocolo Anatix v1 <ArrowUpRight size={15} />
              </a>
            </div>
          </RevealOnScroll>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            {downloads.map(({ file, title, text }, i) => (
              <RevealOnScroll key={file} delay={i * 0.06}>
                <a
                  href={`${BASE}/${file}`}
                  download
                  className="group flex h-full flex-col rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 p-5 transition-all hover:-translate-y-1 hover:border-primary/40"
                >
                  <span className="font-mono text-xs text-base-content/50">{file}</span>
                  <span className="mt-2 font-bold">{title}</span>
                  <span className="mt-1 flex-1 text-sm text-base-content/60">{text}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold group-hover:text-primary">
                    <Download size={15} /> Baixar
                  </span>
                </a>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ FAQ */}
      <section className="border-t border-base-300 bg-base-200/40 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <RevealOnScroll>
            <SectionTitle kicker="/ DÚVIDAS" title="Perguntas" highlight="frequentes." highlightClass="bg-secondary text-secondary-content" />
          </RevealOnScroll>
          <div className="flex flex-col gap-3">
            {faq.map(({ q, a }) => (
              <details key={q} className="group rounded-tl-xl rounded-br-xl border border-base-300 bg-base-100 p-5">
                <summary className="cursor-pointer list-none font-semibold">{q}</summary>
                <p className="mt-3 text-sm leading-6 text-base-content/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= CTA FINAL */}
      <section className="px-6 py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Pronto para a próxima rodada?</h2>
          <p className="max-w-2xl text-base-content/65">
            Crie um laboratório LEGO no LabTest. Cada execução do programa vira uma sessão gravada para comparar depois.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={LAB_HREF} className="btn btn-primary">
              Criar laboratório <ArrowRight size={16} />
            </Link>
            <Link href="/anatix" className="btn btn-ghost border-base-300 bg-base-100">
              Anatix para Arduino
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
