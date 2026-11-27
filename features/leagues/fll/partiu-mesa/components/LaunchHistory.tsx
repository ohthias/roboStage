"use client";

import { Check, Minus, X } from "lucide-react";
import { DataTable, Panel, ToolBadge, type Column } from "@/components/stage";
import type { MissionAttempt } from "@/features/leagues/fll/partiu-mesa/lib/types";

interface LaunchHistoryProps {
  attempts: MissionAttempt[];
}

type Row = {
  id: string;
  n: number;
  missionId: string;
  result: MissionAttempt["result"];
  seconds: number;
};

function resultBadge(result: MissionAttempt["result"]) {
  if (result === "success")
    return (
      <ToolBadge tone="success">
        <Check className="size-3" /> Sucesso
      </ToolBadge>
    );
  if (result === "failure")
    return (
      <ToolBadge tone="primary" className="bg-error/10 text-error">
        <X className="size-3" /> Falha
      </ToolBadge>
    );
  return (
    <ToolBadge>
      <Minus className="size-3" /> Não executada
    </ToolBadge>
  );
}

const columns: Column<Row>[] = [
  { key: "n", header: "#", width: "3rem", render: (r) => <span className="font-mono text-base-content/50">{r.n}</span> },
  { key: "missionId", header: "Missão", render: (r) => <span className="font-mono font-semibold">{r.missionId}</span> },
  { key: "result", header: "Resultado", render: (r) => resultBadge(r.result) },
  {
    key: "seconds",
    header: "Tempo",
    align: "right",
    render: (r) => <span className="font-mono tabular-nums">{r.seconds >= 0 ? `${r.seconds}s` : "—"}</span>,
  },
];

export default function LaunchHistory({ attempts }: LaunchHistoryProps) {
  const rows: Row[] = attempts.map((a, i) => ({
    id: a.id,
    n: i + 1,
    missionId: a.missionId,
    result: a.result,
    seconds: a.durationMs !== undefined ? Math.round(a.durationMs / 1000) : -1,
  }));

  return (
    <Panel title="Lançamentos" padded={false}>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty="Nenhum lançamento registrado." className="rounded-none border-0" />
    </Panel>
  );
}
