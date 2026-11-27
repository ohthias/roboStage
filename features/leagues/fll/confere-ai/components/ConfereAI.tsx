"use client";

import { useMemo, useState } from "react";
import { HardDrive, ListPlus, Plus, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";
import {
  InlineAlert,
  ToolBadge,
  ToolButton,
  ToolEmpty,
  ToolScope,
  Toolbar,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
  cn,
} from "@/components/stage";
import { useConfereAI } from "@/features/leagues/fll/confere-ai/hooks/useConfereAI";
import {
  calculateProgress,
  findNextPendingItem,
  getChecklistsForMode,
  mergeChecklistItems,
} from "@/features/leagues/fll/confere-ai/lib/utils";
import ModeSelector from "./ModeSelector";
import ChecklistCard from "./ChecklistCard";
import AddChecklistModal from "./AddChecklistModal";
import ResetProgressModal from "./ResetProgressModal";
import Header from "@/components/layout/Header";
import {
  CONFERE_AI_COMPETITIONS,
  ConfereAICompetition,
} from "@/features/leagues/fll/confere-ai/lib/types";

export default function ConfereAI({
  competicao = "fll",
}: {
  competicao?: ConfereAICompetition;
}) {
  const info = CONFERE_AI_COMPETITIONS[competicao];
  const {
    status,
    config,
    state,
    reloadConfig,
    setActiveMode,
    toggleItem,
    markAllInMode,
    addCustomItem,
    removeCustomItem,
    addCustomChecklist,
    removeCustomChecklist,
    resetProgress,
    restoreDefaults,
  } = useConfereAI(competicao);

  const [addChecklistOpen, setAddChecklistOpen] = useState(false);
  const [resetModal, setResetModal] = useState<"progress" | "restore-defaults" | null>(null);
  const [markAllModal, setMarkAllModal] = useState(false);

  const activeMode = useMemo(
    () => config?.modes.find((m) => m.id === state.activeMode) ?? config?.modes[0] ?? null,
    [config, state.activeMode]
  );

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center" role="status">
        <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
        <p className="text-base-content/70">Carregando suas checklists...</p>
      </div>
    );
  }

  if (status === "error" || !config) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <InlineAlert
          type="error"
          title="Não conseguimos carregar as checklists."
          action={
            <ToolButton onClick={reloadConfig} icon={<RefreshCw />}>
              Tentar novamente
            </ToolButton>
          }
        >
          Tente atualizar a página.
        </InlineAlert>
      </div>
    );
  }

  if (!activeMode) {
    return null;
  }

  const checklistEntries = getChecklistsForMode(activeMode, state.customChecklists);
  const isChampionship = activeMode.id === "championship";

  // Progresso agregado do modo (usado no cabeçalho do modo Campeonato).
  let overallDone = 0;
  let overallTotal = 0;
  let nextPendingText: string | null = null;
  for (const { checklist } of checklistEntries) {
    const items = mergeChecklistItems(checklist, state.customItems);
    const progress = calculateProgress(items, state.completedItems);
    overallDone += progress.done;
    overallTotal += progress.total;
    if (!nextPendingText) {
      const pending = findNextPendingItem(items, state.completedItems);
      if (pending) nextPendingText = pending.text;
    }
  }

  const hasCustom = checklistEntries.some((e) => e.custom);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-8 px-4 pb-24 pt-8">
      <Header name="Confia," highlight="mas Confira!" type="Checklist" description={info.description} />

      {/* Seleção de modo */}
      <ModeSelector modes={config.modes} activeMode={activeMode.id} onSelect={setActiveMode} />

      <ToolScope className="overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] border border-base-300">
        <Toolbar label="Ações da checklist" className="px-3">
          <ToolbarGroup>
            <span className="px-1 text-[13px] font-bold">{activeMode.shortName}</span>
            <ToolBadge>{checklistEntries.length} listas</ToolBadge>
          </ToolbarGroup>
          <ToolbarSpacer />
          <ToolbarGroup>
            <ToolButton variant="ghost" size="xs" icon={<RotateCcw />} onClick={() => setResetModal("progress")}>
              Limpar progresso
            </ToolButton>
            <ToolButton variant="ghost" size="xs" onClick={() => setResetModal("restore-defaults")}>
              Restaurar padrão
            </ToolButton>
            <ToolbarDivider />
            <ToolButton variant="primary" size="xs" icon={<Plus />} onClick={() => setAddChecklistOpen(true)}>
              Nova checklist
            </ToolButton>
          </ToolbarGroup>
        </Toolbar>

        <div className="space-y-4 p-4 sm:p-5">
          {isChampionship && (
            <section className="flex flex-col gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/55">Campeonato</p>
                <p className="mt-0.5 text-base-content/70">{info.nextStepLabel}</p>
                <p className="mt-2 text-lg font-bold tabular-nums">
                  {overallDone} de {overallTotal} concluídos
                </p>
                {nextPendingText && (
                  <p className="text-xs text-base-content/60">
                    Próximo passo: <span className="font-semibold text-base-content">{nextPendingText}</span>
                  </p>
                )}
              </div>
              <ToolButton variant="primary" size="md" icon={<ShieldCheck />} onClick={() => setMarkAllModal(true)}>
                Marcar tudo como conferido
              </ToolButton>
            </section>
          )}

          {/* Checklists do modo ativo */}
          <div className={cn("grid grid-cols-1 gap-3", isChampionship ? "md:grid-cols-3" : "md:grid-cols-2")}>
            {checklistEntries.map(({ checklist, custom }) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                isCustomChecklist={custom}
                customItems={state.customItems}
                completedItems={state.completedItems}
                compact={isChampionship}
                onToggleItem={toggleItem}
                onAddItem={addCustomItem}
                onRemoveItem={removeCustomItem}
                onRemoveChecklist={custom ? removeCustomChecklist : undefined}
              />
            ))}
          </div>

          {!hasCustom && (
            <ToolEmpty
              icon={<ListPlus />}
              title="Sua própria checklist"
              description="Crie uma checklist para organizar algo específico da sua equipe."
              action={
                <ToolButton variant="primary" icon={<Plus />} onClick={() => setAddChecklistOpen(true)}>
                  Nova checklist
                </ToolButton>
              }
            />
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-base-300 bg-base-100 px-4 py-2 text-xs text-base-content/55">
          <HardDrive className="size-3.5" aria-hidden="true" />
          Seus dados ficam salvos neste dispositivo.
        </footer>
      </ToolScope>

      <AddChecklistModal
        open={addChecklistOpen}
        onClose={() => setAddChecklistOpen(false)}
        onConfirm={(title, description) => {
          addCustomChecklist(activeMode.id, title, description);
          setAddChecklistOpen(false);
        }}
      />

      <ResetProgressModal
        open={resetModal !== null}
        variant={resetModal ?? "progress"}
        onClose={() => setResetModal(null)}
        onConfirm={() => {
          if (resetModal === "progress") resetProgress();
          if (resetModal === "restore-defaults") restoreDefaults();
        }}
      />

      <ResetProgressModal
        open={markAllModal}
        variant="mark-all"
        onClose={() => setMarkAllModal(false)}
        onConfirm={() => markAllInMode(activeMode.id, true)}
      />
    </main>
  );
}
