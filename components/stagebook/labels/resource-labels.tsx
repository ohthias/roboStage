"use client";

import { useState } from "react";
import {
  removeResourceTag,
  toggleResourceTag,
} from "@/utils/stagebook/actions/tags";
import { setResourceMilestone } from "@/utils/stagebook/actions/milestones";
import type { LabelableKind, MilestoneDTO, TagDTO } from "@/types/labels";
import { MilestoneSelector } from "./milestone-selector";
import { TagSelector } from "./tag-selector";

import { unwrapAction } from "@/utils/stagebook/action-result";
/**
 * Tags + milestone de um item JÁ EXISTENTE de qualquer ferramenta. Persistir é
 * automático (server actions universais); `onChange` avisa o pai para
 * atualizar listas/cartões.
 */
export function ResourceLabels({
  kind,
  resourceId,
  initialTags,
  initialMilestone,
  showMilestone = true,
  onChange,
  disabled,
}: {
  kind: LabelableKind;
  resourceId: string;
  initialTags: TagDTO[];
  initialMilestone?: MilestoneDTO | null;
  showMilestone?: boolean;
  onChange?: (state: { tags: TagDTO[]; milestone: MilestoneDTO | null }) => void;
  disabled?: boolean;
}) {
  const [tags, setTags] = useState(initialTags);
  const [milestone, setMilestone] = useState<MilestoneDTO | null>(initialMilestone ?? null);

  const commit = (nextTags: TagDTO[], nextMilestone: MilestoneDTO | null = milestone) => {
    setTags(nextTags);
    setMilestone(nextMilestone);
    onChange?.({ tags: nextTags, milestone: nextMilestone });
  };

  return (
    <div className="space-y-2">
      <TagSelector
        value={tags}
        disabled={disabled}
        onAdd={async (tag) => commit(await toggleOn(kind, resourceId, tag, tags))}
        onRemove={async (tag) => commit(unwrapAction(await removeResourceTag(kind, resourceId, tag.id)))}
        onTagUpdated={(updated) => commit(tags.map((t) => (t.id === updated.id ? updated : t)))}
      />
      {showMilestone && (
        <MilestoneSelector
          value={milestone}
          disabled={disabled}
          onChange={async (m) => {
            const saved = unwrapAction(await setResourceMilestone(kind, resourceId, m?.id ?? null));
            commit(tags, saved);
          }}
        />
      )}
    </div>
  );
}

// `toggle` só adiciona quando a tag ainda não está no item (evita remover sem querer).
async function toggleOn(kind: LabelableKind, id: string, tag: TagDTO, current: TagDTO[]) {
  if (current.some((t) => t.id === tag.id)) return current;
  return unwrapAction(await toggleResourceTag(kind, id, tag.id));
}

