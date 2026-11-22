"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { InlineAlert, ToolDialog } from "@/components/stage";
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
    <ToolDialog open onClose={() => onClose(true)} size="lg" title="Tags e metas" description="O mesmo catálogo vale para todas as ferramentas deste espaço.">
      <div className="pb-2">
        {error ? (
          <InlineAlert type="error">{error}</InlineAlert>
        ) : !data ? (
          <p className="flex items-center justify-center gap-2 py-10 text-[13px] text-base-content/50">
            <Loader2 size={14} className="animate-spin" /> Carregando…
          </p>
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
    </ToolDialog>
  );
}
