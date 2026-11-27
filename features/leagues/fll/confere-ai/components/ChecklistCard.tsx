"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { IconButton, ToolBadge, ToolButton, ToolEmpty } from "@/components/stage";
import { ConfereAIChecklist, ConfereAICustomItem } from "@/features/leagues/fll/confere-ai/lib/types";
import { calculateProgress, mergeChecklistItems } from "@/features/leagues/fll/confere-ai/lib/utils";
import ChecklistItem from "./ChecklistItem";
import ProgressSummary from "./ProgressSummary";
import AddItemModal from "./AddItemModal";

interface ChecklistCardProps {
  checklist: ConfereAIChecklist;
  isCustomChecklist: boolean;
  customItems: Record<string, ConfereAICustomItem[]>;
  completedItems: Record<string, boolean>;
  compact?: boolean;
  onToggleItem: (itemId: string) => void;
  onAddItem: (checklistId: string, text: string) => void;
  onRemoveItem: (checklistId: string, itemId: string) => void;
  onRemoveChecklist?: (checklistId: string) => void;
}

export default function ChecklistCard({
  checklist,
  isCustomChecklist,
  customItems,
  completedItems,
  compact = false,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onRemoveChecklist,
}: ChecklistCardProps) {
  const [addItemOpen, setAddItemOpen] = useState(false);

  const items = mergeChecklistItems(checklist, customItems);
  const progress = calculateProgress(items, completedItems);

  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-base-300 bg-base-100">
      <header className="flex items-start justify-between gap-2 border-b border-base-300 px-4 py-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            {checklist.title}
            {isCustomChecklist && <ToolBadge tone="secondary">Sua</ToolBadge>}
          </h3>
          {checklist.description && <p className="mt-0.5 text-xs text-base-content/60">{checklist.description}</p>}
        </div>
        {isCustomChecklist && onRemoveChecklist && (
          <IconButton
            label={`Remover checklist "${checklist.title}"`}
            icon={<Trash2 />}
            size="xs"
            variant="danger"
            onClick={() => onRemoveChecklist(checklist.id)}
          />
        )}
      </header>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="px-1">
          <ProgressSummary done={progress.done} total={progress.total} percent={progress.percent} />
        </div>

        {items.length === 0 ? (
          <ToolEmpty title="Nada por aqui ainda." description="Adicione seu primeiro item para começar." />
        ) : (
          <div className="flex flex-col">
            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                checked={!!completedItems[item.id]}
                onToggle={onToggleItem}
                onRemove={item.custom ? (id) => onRemoveItem(checklist.id, id) : undefined}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-base-300 bg-base-200/40 px-3 py-2">
        <ToolButton variant="ghost" size="xs" icon={<Plus />} onClick={() => setAddItemOpen(true)}>
          Adicionar item
        </ToolButton>
      </footer>

      <AddItemModal
        open={addItemOpen}
        checklistTitle={checklist.title}
        onClose={() => setAddItemOpen(false)}
        onConfirm={(text) => {
          onAddItem(checklist.id, text);
          setAddItemOpen(false);
        }}
      />
    </section>
  );
}
