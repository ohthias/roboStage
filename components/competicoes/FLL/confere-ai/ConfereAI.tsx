"use client";

import { useMemo, useState } from "react";
import { Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { useConfereAI } from "@/utils/competitions/fll/confere-ai/useConfereAI";
import {
  calculateProgress,
  findNextPendingItem,
  getChecklistsForMode,
  mergeChecklistItems,
} from "@/utils/competitions/fll/confere-ai/utils";
import ModeSelector from "./ModeSelector";
import ChecklistCard from "./ChecklistCard";
import AddChecklistModal from "./AddChecklistModal";
import ResetProgressModal from "./ResetProgressModal";
import Header from "@/components/UI/Header";

export default function ConfereAI() {
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
  } = useConfereAI();

  const [addChecklistOpen, setAddChecklistOpen] = useState(false);
  const [resetModal, setResetModal] = useState<"progress" | "restore-defaults" | null>(null);
  const [markAllModal, setMarkAllModal] = useState(false);

  const activeMode = useMemo(
    () => config?.modes.find((m) => m.id === state.activeMode) ?? config?.modes[0] ?? null,
    [config, state.activeMode]
  );

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true" />
        <p className="text-base-content/70">Carregando suas checklists...</p>
      </div>
    );
  }

  if (status === "error" || !config) {
    return (
      <div className="alert alert-error mx-auto max-w-md flex-col items-start gap-2 text-left">
        <div>
          <p className="font-semibold">Não conseguimos carregar as checklists.</p>
          <p className="text-sm opacity-80">Tente atualizar a página.</p>
        </div>
        <button type="button" className="btn btn-sm" onClick={reloadConfig}>
          Tentar novamente
        </button>
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

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 space-y-8 pb-8 pt-4">
      {/* Hero */}
      <Header name="Confia," highlight="mas Confira!" type="Cheklist" description="Organize sua equipe para os treinos e campeonatos da FLL. Adicione itens personalizados às suas checklists, e acompanhe o progresso de forma simples e eficiente. " />

      {/* Seleção de modo */}
      <ModeSelector modes={config.modes} activeMode={activeMode.id} onSelect={setActiveMode} />

      {isChampionship ? (
        <section className="rounded-2xl border border-accent/30 bg-accent/5 p-4 sm:p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              Campeonato
            </span>
            <p className="text-base-content/70">Próxima missão: estar pronto.</p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">
                {overallDone} de {overallTotal} concluídos
              </p>
              {nextPendingText && (
                <p className="text-sm text-base-content/60">
                  Próximo passo: <span className="font-medium">{nextPendingText}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => setMarkAllModal(true)}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Marcar tudo como conferido
            </button>
          </div>
        </section>
      ) : null}

      {/* Checklists do modo ativo */}
      <section
        className={`grid grid-cols-1 gap-4 ${
          isChampionship ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
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
      </section>

      {/* Checklists personalizadas: empty state + criação */}
      {checklistEntries.filter((e) => e.custom).length === 0 && (
        <div className="rounded-xl border border-dashed border-base-300 p-5 text-center">
          <p className="text-sm text-base-content/60">
            Crie uma checklist para organizar algo específico da sua equipe.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm mt-3"
            onClick={() => setAddChecklistOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova checklist
          </button>
        </div>
      )}

      {checklistEntries.filter((e) => e.custom).length > 0 && (
        <button
          type="button"
          className="btn btn-outline btn-sm self-start"
          onClick={() => setAddChecklistOpen(true)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nova checklist
        </button>
      )}

      {/* Rodapé: privacidade + reset */}
      <footer className="flex flex-col items-start gap-3 border-t border-base-300 pt-4 text-sm text-base-content/60 sm:flex-row sm:items-center sm:justify-between">
        <p>Seus dados ficam salvos neste dispositivo.</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setResetModal("progress")}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Limpar progresso
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setResetModal("restore-defaults")}
          >
            Restaurar padrão
          </button>
        </div>
      </footer>

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
    </div>
  );
}
