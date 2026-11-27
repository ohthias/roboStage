"use client";

import type { NodeKey } from "lexical";
import { Gavel, Plus, X } from "lucide-react";
import type { SmartBlockData } from "../nodes/smart-block-node";
import { localDateISO } from "../local-date";
import { ChipsInput, Field, InlineText, Segmented, SmartShell, newId, str, strList, useSmartBlock } from "./shared";

type Alternative = { id: string; text: string; why: string };

export type DecisionBlockData = {
  title?: string;
  date?: string;
  status?: "proposta" | "decidida" | "implementada" | "revisada";
  decision?: string;
  reason?: string;
  participants?: string[];
  alternatives?: Alternative[];
  result?: string;
  outcome?: "" | "sucesso" | "parcial" | "falhou";
};

export const DECISION_STATUS = [
  { value: "proposta", label: "Proposta", tone: "tone-neutral" },
  { value: "decidida", label: "Decidida", tone: "tone-info" },
  { value: "implementada", label: "Implementada", tone: "tone-success" },
  { value: "revisada", label: "Revista", tone: "tone-warning" },
] as const;

export const DECISION_OUTCOME = [
  { value: "sucesso", label: "Deu certo", tone: "tone-success" },
  { value: "parcial", label: "Em parte", tone: "tone-warning" },
  { value: "falhou", label: "Não deu certo", tone: "tone-error" },
] as const;

const today = () => localDateISO();

/**
 * Registro de decisão (ADR da equipe): o que, por quê, quem, alternativas
 * descartadas e o resultado depois de implementar.
 */
export function DecisionBlock({ nodeKey, data }: { nodeKey: NodeKey; data: SmartBlockData }) {
  const { editable, patch, remove } = useSmartBlock<DecisionBlockData>(nodeKey);
  const d = data as DecisionBlockData;
  const alternatives = Array.isArray(d.alternatives) ? d.alternatives : [];
  const status = (str(d.status) || "decidida") as NonNullable<DecisionBlockData["status"]>;
  const showResult = status === "implementada" || status === "revisada" || !!str(d.result) || !!str(d.outcome);

  const setAlt = (id: string, values: Partial<Alternative>) =>
    patch({ alternatives: alternatives.map((a) => (a.id === id ? { ...a, ...values } : a)) });

  return (
    <SmartShell
      icon={<Gavel size={15} />}
      label="Decisão da equipe"
      tone="secondary"
      editable={editable}
      onRemove={remove}
      actions={
        editable ? (
          <input
            type="date"
            value={str(d.date) || today()}
            onChange={(e) => patch({ date: e.target.value })}
            className="smart-date"
            aria-label="Data da decisão"
          />
        ) : (
          <span className="text-xs text-base-content/50">{str(d.date)}</span>
        )
      }
    >
      <InlineText
        value={str(d.title)}
        onCommit={(title) => patch({ title })}
        placeholder="Título da decisão (ex.: Trocar rodas por esteiras)"
        editable={editable}
        className="text-lg font-semibold"
      />
      <div className="mt-2 space-y-2">
        <Field label="Status">
          <Segmented value={status} options={[...DECISION_STATUS]} onChange={(s) => patch({ status: s })} editable={editable} />
        </Field>
        <Field label="O que foi decidido">
          <InlineText value={str(d.decision)} onCommit={(decision) => patch({ decision })} placeholder="Descreva a decisão" multiline editable={editable} />
        </Field>
        <Field label="Por quê">
          <InlineText
            value={str(d.reason)}
            onCommit={(reason) => patch({ reason })}
            placeholder="Motivos, dados de teste, regras da temporada…"
            multiline
            editable={editable}
          />
        </Field>
        <Field label="Quem participou">
          <ChipsInput
            values={strList(d.participants)}
            onChange={(participants) => patch({ participants })}
            placeholder="Adicionar nome e Enter"
            editable={editable}
          />
        </Field>
        <Field label="Alternativas descartadas">
          <div className="space-y-1.5">
            {alternatives.length === 0 && !editable && <p className="text-base-content/35">—</p>}
            {alternatives.map((a) => (
              <div key={a.id} className="smart-alt">
                <div className="min-w-0 flex-1">
                  <InlineText value={a.text} onCommit={(text) => setAlt(a.id, { text })} placeholder="Alternativa" editable={editable} className="font-medium line-through decoration-base-content/30" />
                  <InlineText value={a.why} onCommit={(why) => setAlt(a.id, { why })} placeholder="Por que foi descartada?" editable={editable} className="text-xs text-base-content/60" />
                </div>
                {editable && (
                  <button type="button" className="smart-icon-btn" aria-label="Remover alternativa" onClick={() => patch({ alternatives: alternatives.filter((x) => x.id !== a.id) })}>
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
            {editable && (
              <button
                type="button"
                className="smart-add-btn"
                onClick={() => patch({ alternatives: [...alternatives, { id: newId(), text: "", why: "" }] })}
              >
                <Plus size={12} /> Alternativa
              </button>
            )}
          </div>
        </Field>
        {showResult ? (
          <>
            <Field label="Resultado">
              <Segmented value={(str(d.outcome) as DecisionBlockData["outcome"]) ?? ""} options={[...DECISION_OUTCOME]} onChange={(outcome) => patch({ outcome })} editable={editable} />
            </Field>
            <Field label="Depois de implementar">
              <InlineText
                value={str(d.result)}
                onCommit={(result) => patch({ result })}
                placeholder="O que aconteceu? Pontos, tempo, confiabilidade, o que aprendemos"
                multiline
                editable={editable}
              />
            </Field>
          </>
        ) : (
          editable && (
            <button type="button" className="smart-add-btn" onClick={() => patch({ status: "implementada" })}>
              <Plus size={12} /> Registrar resultado após implementar
            </button>
          )
        )}
      </div>
    </SmartShell>
  );
}
