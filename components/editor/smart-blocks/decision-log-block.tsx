"use client";

import { useCallback, useEffect, useState } from "react";
import type { NodeKey } from "lexical";
import { History, RefreshCw } from "lucide-react";
import { listDecisions, type DecisionIndexItem } from "@/app/(protected)/dashboard/documents/blocks-actions";
import { unwrapAction } from "@/utils/stagebook/action-result";
import type { SmartBlockData } from "../nodes/smart-block-node";
import { DocIcon } from "../doc-icon";
import { useStagebookEditor } from "../stagebook-context";
import { SmartShell, useSmartBlock } from "./shared";
import { DECISION_OUTCOME, DECISION_STATUS } from "./decision-block";

/** Lista viva de todas as decisões registradas nas páginas do espaço. */
export function DecisionLogBlock({ nodeKey }: { nodeKey: NodeKey; data: SmartBlockData }) {
  const { editable, remove } = useSmartBlock(nodeKey);
  const { navigate, documentId } = useStagebookEditor();
  const [items, setItems] = useState<DecisionIndexItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("todas");

  const load = useCallback(() => {
    listDecisions()
      .then((r) => {
        setItems(unwrapAction(r));
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Não foi possível carregar."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = (items ?? []).filter((i) => filter === "todas" || (i.status ?? "decidida") === filter);

  return (
    <SmartShell
      icon={<History size={15} />}
      label="Histórico de decisões"
      tone="secondary"
      editable={editable}
      onRemove={remove}
      actions={
        <button type="button" className="smart-icon-btn no-print" title="Atualizar" aria-label="Atualizar" onClick={load}>
          <RefreshCw size={13} />
        </button>
      }
    >
      <div className="no-print mb-2 flex flex-wrap gap-1">
        {[{ value: "todas", label: "Todas" }, ...DECISION_STATUS].map((s) => (
          <button key={s.value} type="button" className={`smart-pill ${filter === s.value ? "is-on" : ""}`} onClick={() => setFilter(s.value)}>
            {s.label}
          </button>
        ))}
      </div>
      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : !items ? (
        <p className="text-sm text-base-content/50">Carregando decisões…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-base-content/50">
          Nenhuma decisão registrada ainda. Use <kbd className="kbd kbd-xs">/decisao</kbd> em qualquer página.
        </p>
      ) : (
        <ol className="smart-log">
          {shown.map((item, i) => {
            const status = DECISION_STATUS.find((s) => s.value === (item.status ?? "decidida"));
            const outcome = DECISION_OUTCOME.find((o) => o.value === item.outcome);
            return (
              <li key={`${item.pageId}-${i}`}>
                <span className="smart-log-date">{item.date ?? "—"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium">{item.title || "Decisão sem título"}</span>
                    {status && <span className={`smart-pill is-on ${status.tone}`}>{status.label}</span>}
                    {outcome && <span className={`smart-pill is-on ${outcome.tone}`}>{outcome.label}</span>}
                  </div>
                  {item.decision && <p className="line-clamp-2 text-sm text-base-content/70">{item.decision}</p>}
                  <button
                    type="button"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-base-content/50 hover:text-primary"
                    onClick={() => item.pageId !== documentId && navigate(`/dashboard/documents/${item.pageId}`)}
                  >
                    <DocIcon value={item.pageIcon} size={13} />
                    {item.pageId === documentId ? "Nesta página" : item.pageTitle}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SmartShell>
  );
}
