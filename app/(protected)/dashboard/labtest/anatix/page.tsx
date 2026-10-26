import { Activity, Cable, Database, Radio } from "lucide-react";
import { StatCard } from "@/components/labtest/shared";
import { LabTestTabs } from "@/components/labtest/LabTestTabs";
import { AnatixLabSlots } from "@/components/labtest/anatix/AnatixLabSlots";
import { ANATIX_MAX_LABS } from "@/db/schema/anatix";
import { listAnatixLabs } from "./actions";

export const metadata = { title: "Anatix · LabTest" };

const SNIPPET = `#include <Anatix.h>

void setup() {
  Serial.begin(115200);
  ANX_BEGIN(Serial, "MeuRobo");
}

void loop() {
  ANX_UPDATE();
  ANX_VALUE("distancia_cm", dist);
  ANX_STATE("modo", "seguindo");
}`;

export default async function AnatixPage() {
  const labs = await listAnatixLabs();
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
            Conecte o robô pelo cabo USB e acompanhe a telemetria ao vivo:
            métricas, eventos, estados e tempos de execução enviados pela
            biblioteca Anatix.
          </p>
        </div>
        <LabTestTabs active="anatix" />
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo Anatix">
        <StatCard label="Laboratórios" value={`${labs.length}/${ANATIX_MAX_LABS}`} sub="espaços disponíveis" icon={Radio} accent="primary" />
        <StatCard label="Sessões gravadas" value={sessions} sub="conexões salvas no banco" icon={Database} accent="secondary" />
        <StatCard label="Último robô" value={lastLab?.robotName ?? "—"} sub={lastLab?.board ?? "nenhuma conexão ainda"} icon={Cable} accent="info" />
        <StatCard label="Protocolo" value="v1" sub="Web Serial · USB" icon={Activity} accent="accent" />
      </section>

      <section className="mt-8">
        <AnatixLabSlots labs={labs} max={ANATIX_MAX_LABS} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="text-sm font-bold">Como conectar</h2>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-base-content/70">
            <li>Instale a biblioteca <b>Anatix</b> na Arduino IDE e grave o sketch no robô.</li>
            <li>Ligue o robô pelo cabo USB e feche o Monitor Serial da IDE.</li>
            <li>Abra um laboratório e clique em <b>Conectar robô</b> (Chrome ou Edge no computador).</li>
            <li>O RoboStage verifica a conexão, recebe os dados e grava a sessão no banco.</li>
          </ol>
          <a
            href="https://github.com/ohthias/Anatix_C"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm mt-4 border-base-300"
          >
            Biblioteca no GitHub
          </a>
        </div>
        <pre className="overflow-x-auto rounded-2xl bg-neutral p-5 text-xs leading-relaxed text-neutral-content">
          <code>{SNIPPET}</code>
        </pre>
      </section>
    </div>
  );
}
