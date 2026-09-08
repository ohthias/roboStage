"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ConfereAIChecklist, ConfereAICustomItem } from "@/utils/competitions/confere-ai/types";
import { calculateProgress, mergeChecklistItems } from "@/utils/competitions/confere-ai/utils";
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
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="card-title text-base sm:text-lg">{checklist.title}</h3>
            {checklist.description && (
              <p className="text-sm text-base-content/60">{checklist.description}</p>
            )}
          </div>
          {isCustomChecklist && onRemoveChecklist && (
            <button
              type="button"
              onClick={() => onRemoveChecklist(checklist.id)}
              aria-label={`Remover checklist "${checklist.title}"`}
              className="btn btn-ghost btn-sm btn-circle shrink-0"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <ProgressSummary done={progress.done} total={progress.total} percent={progress.percent} />

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-base-300 p-4 text-center text-sm text-base-content/60">
            <p>Nada por aqui ainda.</p>
            <p>Adicione seu primeiro item para começar.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
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

        <button
          type="button"
          onClick={() => setAddItemOpen(true)}
          className="btn btn-outline btn-sm self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adicionar item
        </button>
      </div>

      <AddItemModal
        open={addItemOpen}
        checklistTitle={checklist.title}
        onClose={() => setAddItemOpen(false)}
        onConfirm={(text) => {
          onAddItem(checklist.id, text);
          setAddItemOpen(false);
        }}
      />
    </div>
  );
}
