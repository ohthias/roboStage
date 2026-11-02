import Link from "next/link";
import { Activity, Cable, Database, Radio } from "lucide-react";
import { StatCard } from "@/components/labtest/shared";
import { LabTestTabs } from "@/components/labtest/LabTestTabs";
import { AnatixLabSlots } from "@/components/labtest/anatix/AnatixLabSlots";
import { ANATIX_MAX_LABS } from "@/db/schema/anatix";
import type { AnatixTransport } from "@/types/anatix.types";
import { listAnatixLabs } from "./actions";

export const metadata = { title: "Anatix · LabTest" };

const SNIPPET_ARDUINO = `#include <Anatix.h>

void setup() {
  Serial.begin(115200);
  ANX_BEGIN(Serial, "MeuRobo");
}

void loop() {
  ANX_UPDATE();
  ANX_VALUE("distancia_cm", dist);
  ANX_STATE("modo", "seguindo");
}`;

const SNIPPET_PYBRICKS = `from pybricks.hubs import PrimeHub
from anatix import anx

hub = PrimeHub()
anx.begin("MeuRobo", hub)

while True:
    anx.update()
    anx.value("heading", hub.imu.heading())
    anx.state("missao", "m01")`;

export default async function AnatixPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  const { novo } = await searchParams;
  const labs = await listAnatixLabs();
  // `?novo=pybricks` (vindo da página do Anatix na FLL) abre o formulário já em LEGO/Pybricks.
  const createTransport: AnatixTransport | undefined =
    novo === "pybricks" || novo === "serial" ? novo : undefined;
  const sessions = labs.reduce((sum, lab) => sum + lab.sessionCount, 0);
  const lastLab = labs
    .filter((l) => l.lastConnectedAt)
    .sort((a, b) => (b.lastConnectedAt ?? "").localeCompare(a.lastConnectedAt ?? ""))[0];

  return (
    <div className="min-h-full bg-base-200/40 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Lab<span className="text-primary">Test</span>{" "}
            <span className="text-base-content/40">·</span> Anatix
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
            Conecte o robô e acompanhe a telemetria ao vivo: métricas, eventos,
            estados e tempos de execução. Arduino e placas com Serial pelo cabo
            USB; robôs LEGO com Pybricks (FLL) por Bluetooth ou cabo USB.
          </p>
        </div>
        <LabTestTabs active="anatix" />
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo Anatix">
        <StatCard label="Laboratórios" value={`${labs.length}/${ANATIX_MAX_LABS}`} sub="espaços disponíveis" icon={Radio} accent="primary" />
        <StatCard label="Sessões gravadas" value={sessions} sub="conexões salvas no banco" icon={Database} accent="secondary" />
        <StatCard label="Último robô" value={lastLab?.robotName ?? "—"} sub={lastLab?.board ?? "nenhuma conexão ainda"} icon={Cable} accent="info" />
        <StatCard label="Protocolo" value="v1" sub="USB · Bluetooth" icon={Activity} accent="accent" />
      </section>

      <section className="mt-8">
        <AnatixLabSlots labs={labs} max={ANATIX_MAX_LABS} createTransport={createTransport} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <ConnectGuide
          title="Arduino, ESP32 e outras placas"
          steps={[
            <>Instale a biblioteca <b>Anatix</b> na Arduino IDE e grave o sketch no robô.</>,
            <>Ligue o robô pelo cabo USB e feche o Monitor Serial da IDE.</>,
            <>Abra um laboratório e clique em <b>Conectar robô</b> (Chrome ou Edge no computador).</>,
          ]}
          code={SNIPPET_ARDUINO}
          link={{ href: "https://github.com/ohthias/Anatix_C", label: "Biblioteca no GitHub", external: true }}
        />
        <ConnectGuide
          title="LEGO com Pybricks (FLL)"
          steps={[
            <>No Pybricks Code, crie o arquivo <b>anatix</b> com o conteúdo do <code>anatix.py</code>.</>,
            <>Feche o Pybricks Code depois de enviar o programa (o hub aceita um aplicativo por vez).</>,
            <>Abra um laboratório LEGO e clique em <b>Bluetooth</b> ou <b>Cabo USB</b>, depois em <b>Iniciar</b>.</>,
          ]}
          code={SNIPPET_PYBRICKS}
          link={{ href: "/fll/anatix", label: "Biblioteca e exemplos" }}
        />
      </section>
    </div>
  );
}

function ConnectGuide({
  title,
  steps,
  code,
  link,
}: {
  title: string;
  steps: React.ReactNode[];
  code: string;
  link: { href: string; label: string; external?: boolean };
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-base-300 bg-base-100 p-5">
      <h2 className="text-sm font-bold">{title}</h2>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-base-content/70">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
        <li>O RoboStage verifica a conexão, recebe os dados e grava a sessão no banco.</li>
      </ol>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral p-4 text-xs leading-relaxed text-neutral-content">
        <code>{code}</code>
      </pre>
      {link.external ? (
        <a href={link.href} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm mt-4 self-start border-base-300">
          {link.label}
        </a>
      ) : (
        <Link href={link.href} className="btn btn-ghost btn-sm mt-4 self-start border-base-300">
          {link.label}
        </Link>
      )}
    </div>
  );
}
