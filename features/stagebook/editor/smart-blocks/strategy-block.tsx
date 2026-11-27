"use client";

import type { NodeKey } from "lexical";
import { ArrowDown, ArrowUp, Code2, Plus, Route, X } from "lucide-react";
import type { SmartBlockData } from "../nodes/smart-block-node";
import { ChipsInput, Field, InlineText, Segmented, SmartShell, newId, str, strList, useSmartBlock } from "./shared";

type Step = { id: string; text: string };
type Param = { id: string; key: string; value: string };

export type StrategyData = {
  mission?: string;
  goal?: string;
  status?: "ideia" | "testando" | "aprovada" | "descartada";
  platform?: "pybricks" | "spike" | "ev3" | "outra";
  approaches?: string[];
  sensors?: string[];
  steps?: Step[];
  params?: Param[];
  code?: string;
  attempts?: number;
  successes?: number;
  notes?: string;
};

const STATUS = [
  { value: "ideia", label: "Ideia", tone: "tone-neutral" },
  { value: "testando", label: "Testando", tone: "tone-info" },
  { value: "aprovada", label: "Aprovada", tone: "tone-success" },
  { value: "descartada", label: "Descartada", tone: "tone-error" },
] as const;

const PLATFORMS = [
  { value: "pybricks", label: "Pybricks" },
  { value: "spike", label: "SPIKE App" },
  { value: "ev3", label: "EV3" },
  { value: "outra", label: "Outra" },
] as const;

export const APPROACH_SUGGESTIONS = [
  "Odometria",
  "Giroscópio",
  "Seguidor de linha",
  "PID",
  "Alinhar na parede",
  "Sensor de cor",
  "Sensor de distância",
  "Garra/anexo",
];
export const SENSOR_SUGGESTIONS = ["Giroscópio (hub)", "Cor", "Distância", "Força", "Encoders"];

/**
 * Estratégia de programação de uma missão: abordagem, sensores, passos,
 * parâmetros calibrados, código e taxa de sucesso medida nos treinos.
 */
export function StrategyBlock({ nodeKey, data }: { nodeKey: NodeKey; data: SmartBlockData }) {
  const { editable, patch, remove } = useSmartBlock<StrategyData>(nodeKey);
  const d = data as StrategyData;
  const steps = Array.isArray(d.steps) ? d.steps : [];
  const params = Array.isArray(d.params) ? d.params : [];
  const attempts = Number(d.attempts) || 0;
  const successes = Math.min(Number(d.successes) || 0, attempts);
  const rate = attempts ? Math.round((successes / attempts) * 100) : null;

  const moveStep = (i: number, dir: -1 | 1) => {
    const next = [...steps];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    patch({ steps: next });
  };

  return (
    <SmartShell
      icon={<Route size={15} />}
      label="Estratégia de programação"
      tone="info"
      editable={editable}
      onRemove={remove}
      actions={
        rate !== null ? (
          <span className={`smart-pill is-on ${rate >= 80 ? "tone-success" : rate >= 50 ? "tone-warning" : "tone-error"}`} title={`${successes} de ${attempts} tentativas`}>
            {rate}% de acerto
          </span>
        ) : null
      }
    >
      <InlineText
        value={str(d.mission)}
        onCommit={(mission) => patch({ mission })}
        placeholder="Missão (ex.: M03 — Coral)"
        editable={editable}
        className="text-lg font-semibold"
      />
      <div className="mt-2 space-y-2">
        <Field label="Objetivo">
          <InlineText value={str(d.goal)} onCommit={(goal) => patch({ goal })} placeholder="O que o robô precisa fazer e quantos pontos vale" multiline editable={editable} />
        </Field>
        <Field label="Status">
          <Segmented value={(str(d.status) as StrategyData["status"]) ?? ""} options={[...STATUS]} onChange={(status) => patch({ status })} editable={editable} />
        </Field>
        <Field label="Plataforma">
          <Segmented value={(str(d.platform) as StrategyData["platform"]) ?? ""} options={[...PLATFORMS]} onChange={(platform) => patch({ platform })} editable={editable} />
        </Field>
        <Field label="Abordagem">
          <ChipsInput values={strList(d.approaches)} onChange={(approaches) => patch({ approaches })} placeholder="Técnica e Enter" editable={editable} suggestions={APPROACH_SUGGESTIONS} />
        </Field>
        <Field label="Sensores">
          <ChipsInput values={strList(d.sensors)} onChange={(sensors) => patch({ sensors })} placeholder="Sensor e Enter" editable={editable} suggestions={SENSOR_SUGGESTIONS} />
        </Field>
        <Field label="Passos">
          <ol className="space-y-1">
            {steps.map((s, i) => (
              <li key={s.id} className="group/step flex items-start gap-2">
                <span className="smart-step-num">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <InlineText
                    value={s.text}
                    onCommit={(text) => patch({ steps: steps.map((x) => (x.id === s.id ? { ...x, text } : x)) })}
                    placeholder="Ex.: andar 40 cm reto a 300 mm/s"
                    editable={editable}
                  />
                </div>
                {editable && (
                  <span className="flex shrink-0 opacity-100 md:opacity-0 md:group-hover/step:opacity-100">
                    <button type="button" className="smart-icon-btn" aria-label="Subir passo" onClick={() => moveStep(i, -1)}>
                      <ArrowUp size={12} />
                    </button>
                    <button type="button" className="smart-icon-btn" aria-label="Descer passo" onClick={() => moveStep(i, 1)}>
                      <ArrowDown size={12} />
                    </button>
                    <button type="button" className="smart-icon-btn" aria-label="Remover passo" onClick={() => patch({ steps: steps.filter((x) => x.id !== s.id) })}>
                      <X size={12} />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ol>
          {editable && (
            <button type="button" className="smart-add-btn mt-1" onClick={() => patch({ steps: [...steps, { id: newId(), text: "" }] })}>
              <Plus size={12} /> Passo
            </button>
          )}
        </Field>
        <Field label="Parâmetros">
          <div className="space-y-1">
            {params.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-36 shrink-0">
                  <InlineText value={p.key} onCommit={(key) => patch({ params: params.map((x) => (x.id === p.id ? { ...x, key } : x)) })} placeholder="Nome" editable={editable} className="font-mono text-xs" />
                </div>
                <span className="text-base-content/30">=</span>
                <div className="min-w-0 flex-1">
                  <InlineText value={p.value} onCommit={(value) => patch({ params: params.map((x) => (x.id === p.id ? { ...x, value } : x)) })} placeholder="Valor" editable={editable} className="font-mono text-xs" />
                </div>
                {editable && (
                  <button type="button" className="smart-icon-btn" aria-label="Remover parâmetro" onClick={() => patch({ params: params.filter((x) => x.id !== p.id) })}>
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            {editable && (
              <button type="button" className="smart-add-btn" onClick={() => patch({ params: [...params, { id: newId(), key: "", value: "" }] })}>
                <Plus size={12} /> Parâmetro (velocidade, kP, distância…)
              </button>
            )}
          </div>
        </Field>
        <Field label="Código">
          {editable ? (
            <InlineText value={str(d.code)} onCommit={(code) => patch({ code })} placeholder="Trecho principal do programa" multiline editable className="smart-code" />
          ) : d.code ? (
            <pre className="smart-code whitespace-pre-wrap">{d.code}</pre>
          ) : (
            <p className="text-base-content/35">—</p>
          )}
        </Field>
        <Field label="Testes">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Code2 size={14} className="text-base-content/40" />
            {editable ? (
              <>
                <input
                  type="number"
                  min={0}
                  value={successes}
                  onChange={(e) => patch({ successes: Math.max(0, Number(e.target.value) || 0) })}
                  className="smart-number"
                  aria-label="Acertos"
                />
                acertos em
                <input
                  type="number"
                  min={0}
                  value={attempts}
                  onChange={(e) => patch({ attempts: Math.max(0, Number(e.target.value) || 0) })}
                  className="smart-number"
                  aria-label="Tentativas"
                />
                tentativas
                <button type="button" className="smart-pill no-print" onClick={() => patch({ attempts: attempts + 1, successes: successes + 1 })}>
                  +1 acerto
                </button>
                <button type="button" className="smart-pill no-print" onClick={() => patch({ attempts: attempts + 1 })}>
                  +1 falha
                </button>
              </>
            ) : (
              <span>
                {successes} acertos em {attempts} tentativas
              </span>
            )}
          </div>
        </Field>
        <Field label="Observações">
          <InlineText value={str(d.notes)} onCommit={(notes) => patch({ notes })} placeholder="Ajustes, problemas, ideias" multiline editable={editable} />
        </Field>
      </div>
    </SmartShell>
  );
}
