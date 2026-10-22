"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { listTagsWithUsage } from "@/utils/stagebook/actions/tags";
import { listMilestonesWithUsage } from "@/utils/stagebook/actions/milestones";
import type { MilestoneWithUsage, TagWithUsage } from "@/types/labels";
import { LabelsManager } from "./labels-manager";

/**
 * Gestão de tags e milestones em um modal — para abrir de dentro de qualquer
 * ferramenta (Kanban, Calendário…) sem sair da tela. Mesmo catálogo da página
 * /dashboard/labels.
 */
export function LabelsManagerModal({
  initialTab = "tags",
  canDelete = true,
  onClose,
}: {
  initialTab?: "tags" | "milestones";
  canDelete?: boolean;
  onClose: (changed: boolean) => void;
}) {
  const [data, setData] = useState<{ tags: TagWithUsage[]; milestones: MilestoneWithUsage[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([listTagsWithUsage(), listMilestonesWithUsage()])
      .then(([tags, milestones]) => alive && setData({ tags, milestones }))
      .catch(() => alive && setError("Não foi possível carregar tags e milestones."));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Tags e milestones">
      <div className="modal-box max-h-[85vh] max-w-3xl overflow-y-auto">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square absolute right-3 top-3"
          aria-label="Fechar"
          onClick={() => onClose(true)}
        >
          <X size={16} />
        </button>
        {error ? (
          <p className="py-10 text-center text-sm text-error">{error}</p>
        ) : !data ? (
          <p className="py-10 text-center text-sm text-base-content/50">Carregando…</p>
        ) : (
          <LabelsManager
            embedded
            initialTab={initialTab}
            initialTags={data.tags}
            initialMilestones={data.milestones}
            canDelete={canDelete}
          />
        )}
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={() => onClose(true)} />
    </div>
  );
}
