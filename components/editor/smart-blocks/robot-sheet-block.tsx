"use client";

import { useEffect, useState } from "react";
import type { NodeKey } from "lexical";
import { Bot, Camera, ExternalLink, FileBox, Link2Off, Shapes } from "lucide-react";
import {
  getRobotSheet,
  listRobotNotebooks,
  type RobotNotebookItem,
  type RobotSheetData,
} from "@/app/(protected)/dashboard/documents/blocks-actions";
import { unwrapAction } from "@/utils/stagebook/action-result";
import type { SmartBlockData } from "../nodes/smart-block-node";
import { useStagebookEditor } from "../stagebook-context";
import { ChipsInput, Field, InlineText, SmartShell, str, strList, useSmartBlock } from "./shared";

type Snapshot = { name?: string; robotName?: string | null; season?: string | null; versions?: number };

export type RobotSheetBlockData = {
  notebookId?: string;
  manualName?: string;
  snapshot?: Snapshot;
  specs?: Record<string, string>;
  attachments?: string[];
  strengths?: string;
  weaknesses?: string;
};

export const ROBOT_SPECS: { key: string; label: string; placeholder: string }[] = [
  { key: "motores", label: "Motores", placeholder: "Ex.: 2 grandes (tração) + 2 médios (anexos)" },
  { key: "sensores", label: "Sensores", placeholder: "Ex.: 2 de cor, giroscópio do hub" },
  { key: "rodas", label: "Rodas / tração", placeholder: "Ex.: 56 mm, roda boba atrás" },
  { key: "dimensoes", label: "Dimensões", placeholder: "Ex.: 20 × 18 × 22 cm" },
  { key: "peso", label: "Peso", placeholder: "Ex.: 1,1 kg" },
  { key: "programacao", label: "Programação", placeholder: "Ex.: Pybricks, Python" },
];

/**
 * Ficha do robô: puxa nome, foto mais recente, versões e diagramas do caderno
 * no QuickBrick; especificações e pontos fortes/fracos ficam no bloco.
 */
export function RobotSheetBlock({ nodeKey, data }: { nodeKey: NodeKey; data: SmartBlockData }) {
  const { editable, patch, remove } = useSmartBlock<RobotSheetBlockData>(nodeKey);
  const { navigate } = useStagebookEditor();
  const d = data as RobotSheetBlockData;
  const specs = d.specs && typeof d.specs === "object" ? d.specs : {};
  const [notebooks, setNotebooks] = useState<RobotNotebookItem[] | null>(null);
  const [sheet, setSheet] = useState<RobotSheetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const linked = !!d.notebookId;
  const manual = !linked && d.manualName !== undefined;

  useEffect(() => {
    if (linked || manual) return;
    listRobotNotebooks()
      .then((r) => setNotebooks(unwrapAction(r)))
      .catch(() => setNotebooks([]));
  }, [linked, manual]);

  useEffect(() => {
    if (!d.notebookId) return;
    let alive = true;
    getRobotSheet(d.notebookId)
      .then((r) => {
        if (!alive) return;
        const s = unwrapAction(r);
        setSheet(s);
        setError(null);
        // Guarda um resumo no bloco (exportação e leitura sem acesso ao caderno).
        const snap: Snapshot = { name: s.name, robotName: s.robotName, season: s.season, versions: s.versions };
        if (JSON.stringify(snap) !== JSON.stringify(d.snapshot ?? {})) patch({ snapshot: snap });
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Não foi possível carregar o caderno."));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.notebookId]);

  if (!linked && !manual) {
    return (
      <SmartShell icon={<Bot size={15} />} label="Ficha do robô" tone="accent" editable={editable} onRemove={remove}>
        <p className="mb-2 text-sm text-base-content/60">Escolha o caderno do robô no QuickBrick. A foto e as versões ficam sempre atualizadas.</p>
        {!notebooks ? (
          <p className="text-sm text-base-content/50">Carregando cadernos…</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {notebooks.map((n) => (
              <button key={n.id} type="button" disabled={!editable} className="smart-option-card" onClick={() => patch({ notebookId: n.id, snapshot: { name: n.name, robotName: n.robotName, season: n.season } })}>
                <span className="font-medium">{n.robotName || n.name}</span>
                <span className="text-xs text-base-content/55">
                  {n.name}
                  {n.season ? ` · ${n.season}` : ""}
                </span>
              </button>
            ))}
            {notebooks.length === 0 && <p className="text-sm text-base-content/50">Nenhum caderno no QuickBrick deste espaço ainda.</p>}
            <button type="button" disabled={!editable} className="smart-option-card" onClick={() => patch({ manualName: "" })}>
              <span className="font-medium">Sem caderno</span>
              <span className="text-xs text-base-content/55">Preencher a ficha à mão.</span>
            </button>
          </div>
        )}
      </SmartShell>
    );
  }

  const name = sheet?.robotName || sheet?.name || d.snapshot?.robotName || d.snapshot?.name || str(d.manualName) || "Robô";
  const href = d.notebookId ? `/dashboard/quickbrick/${d.notebookId}` : null;

  return (
    <SmartShell
      icon={<Bot size={15} />}
      label="Ficha do robô"
      tone="accent"
      editable={editable}
      onRemove={remove}
      actions={
        <>
          {href && (
            <button type="button" className="smart-icon-btn no-print" title="Abrir no QuickBrick" aria-label="Abrir no QuickBrick" onClick={() => navigate(href)}>
              <ExternalLink size={13} />
            </button>
          )}
          {editable && linked && (
            <button type="button" className="smart-icon-btn no-print" title="Trocar caderno" aria-label="Trocar caderno" onClick={() => patch({ notebookId: undefined, snapshot: undefined })}>
              <Link2Off size={13} />
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="smart-robot-photo" style={sheet?.coverColor ? { background: sheet.coverColor } : undefined}>
          {sheet?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sheet.photoUrl} alt={`Foto de ${name}`} />
          ) : (
            <Bot size={40} className="opacity-40" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {manual ? (
            <InlineText value={str(d.manualName)} onCommit={(manualName) => patch({ manualName })} placeholder="Nome do robô" editable={editable} className="text-xl font-bold" />
          ) : (
            <h3 className="text-xl font-bold leading-tight">{name}</h3>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
          {sheet && (
            <>
              <p className="text-sm text-base-content/60">
                {[sheet.name !== name ? sheet.name : null, sheet.league, sheet.season].filter(Boolean).join(" · ")}
              </p>
              {sheet.description && <p className="mt-1 line-clamp-3 text-sm text-base-content/70">{sheet.description}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span className="smart-stat">
                  <Camera size={12} /> {sheet.versions} {sheet.versions === 1 ? "versão" : "versões"}
                </span>
                <span className="smart-stat">
                  <Shapes size={12} /> {sheet.diagrams} diagramas
                </span>
                {sheet.studioFileName && (
                  <span className="smart-stat">
                    <FileBox size={12} /> {sheet.studioFileName}
                  </span>
                )}
                {sheet.photoTitle && <span className="smart-stat">Última: {sheet.photoTitle}</span>}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {ROBOT_SPECS.map((s) => (
          <Field key={s.key} label={s.label}>
            <InlineText value={specs[s.key] ?? ""} onCommit={(v) => patch({ specs: { ...specs, [s.key]: v } })} placeholder={s.placeholder} editable={editable} />
          </Field>
        ))}
        <Field label="Anexos">
          <ChipsInput values={strList(d.attachments)} onChange={(attachments) => patch({ attachments })} placeholder="Garra, empurrador… e Enter" editable={editable} />
        </Field>
        <Field label="Pontos fortes">
          <InlineText value={str(d.strengths)} onCommit={(strengths) => patch({ strengths })} placeholder="O que o robô faz bem" multiline editable={editable} />
        </Field>
        <Field label="Pontos fracos">
          <InlineText value={str(d.weaknesses)} onCommit={(weaknesses) => patch({ weaknesses })} placeholder="O que ainda falha ou precisa melhorar" multiline editable={editable} />
        </Field>
      </div>
    </SmartShell>
  );
}
