"use client";

import { Eraser, Printer, Settings } from "lucide-react";
import { ChunkyProgress, InlineAlert, Panel, ProgressRing, ToolBadge, ToolButton, type Tone } from "@/components/stage";
import { RUBRIC as FLL_RUBRIC, LEVEL_THRESHOLDS, LevelKey, type RubricCategory } from "@/features/rubric/lib/fll";

interface ScorePanelProps {
  scores: Record<string, LevelKey | undefined>;
  comments: Record<string, string>;
  onReset: () => void;
  onPrint: () => void;
  /** Rubrica usada no cálculo. Padrão: FLL Challenge. */
  rubric?: RubricCategory[];
}

function classify(average: number) {
  let result = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (average >= t.min) result = t;
  }
  return result;
}

// Tons do daisyUI → tons da Stage UI (o "error" vira o vermelho da marca).
const stageTone: Record<string, Tone> = {
  error: "primary",
  warning: "warning",
  info: "info",
  success: "success",
};

export default function ScorePanel({ scores, comments, onReset, onPrint, rubric = FLL_RUBRIC }: ScorePanelProps) {
  const allIndicators = rubric.flatMap((cat) => cat.criteria.flatMap((c) => c.indicators));
  const answered = allIndicators.filter((ind) => scores[ind.id] !== undefined);
  const totalMax = allIndicators.length * 4;
  const totalScore = answered.reduce((sum, ind) => sum + (scores[ind.id] ?? 0), 0);
  const overallAverage = answered.length ? totalScore / answered.length : 0;
  const overallPct = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  const overallClass = classify(overallAverage);

  const missingComments = allIndicators.filter((ind) => scores[ind.id] === 4 && !comments[ind.id]?.trim());

  const categoryBreakdown = rubric.map((cat) => {
    const indicators = cat.criteria.flatMap((c) => c.indicators);
    const catAnswered = indicators.filter((ind) => scores[ind.id] !== undefined);
    const catScore = catAnswered.reduce((s, ind) => s + (scores[ind.id] ?? 0), 0);
    const catMax = indicators.length * 4;
    const catAvg = catAnswered.length ? catScore / catAnswered.length : 0;
    return {
      id: cat.id,
      name: cat.name,
      score: catScore,
      max: catMax,
      completed: catAnswered.length,
      total: indicators.length,
      classification: catAnswered.length ? classify(catAvg) : null,
    };
  });

  const gearIndicators = allIndicators.filter((ind) => ind.gear);
  const gearAnswered = gearIndicators.filter((ind) => scores[ind.id] !== undefined);
  const gearScore = gearAnswered.reduce((s, ind) => s + (scores[ind.id] ?? 0), 0);
  const gearMax = gearIndicators.length * 4;

  return (
    <Panel
      title="Pontuação"
      footer={
        <div className="no-print flex w-full gap-2">
          <ToolButton variant="ghost" icon={<Eraser />} onClick={onReset} className="flex-1">
            Limpar
          </ToolButton>
          <ToolButton variant="primary" icon={<Printer />} onClick={onPrint} className="flex-1">
            Imprimir / PDF
          </ToolButton>
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <ProgressRing value={overallPct} size={84} tone={stageTone[overallClass.tone]} />
        <div className="min-w-0">
          <ToolBadge tone={stageTone[overallClass.tone]} dot>
            {overallClass.label}
          </ToolBadge>
          <p className="mt-1 font-mono text-xs text-base-content/70">
            {totalScore} / {totalMax} pts
          </p>
          <p className="mt-1 text-[11px] leading-snug text-base-content/60">{overallClass.hint}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-base-300 pt-3">
        {categoryBreakdown.map((cat) => (
          <div key={cat.id}>
            <ChunkyProgress
              value={cat.score}
              max={cat.max || 1}
              tone="secondary"
              showValue={false}
              label={cat.name}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-base-content/60">
              <span>
                {cat.completed}/{cat.total} indicadores · <span className="font-mono">{cat.score}/{cat.max}</span>
              </span>
              {cat.classification && <ToolBadge tone={stageTone[cat.classification.tone]}>{cat.classification.label}</ToolBadge>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-secondary/30 bg-secondary/[0.07] px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[13px] font-semibold">
          <span className="flex items-center gap-1.5">
            <Settings size={14} className="text-secondary" /> Core Values (estimado)
          </span>
          <span className="font-mono text-xs text-base-content/70">
            {gearScore}/{gearMax}
          </span>
        </div>
        <ChunkyProgress value={gearScore} max={gearMax || 1} tone="secondary" showValue={false} />
        <p className="mt-1.5 text-[11px] leading-snug text-base-content/60">
          Soma dos {gearIndicators.length} indicadores marcados com ⚙ nas rubricas — no evento oficial, Core Values
          também soma pontos do Robot Game e representa 25% do Champion&apos;s Award.
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {answered.length < allIndicators.length && (
          <InlineAlert type="warning">
            Faltam {allIndicators.length - answered.length} indicador(es) para concluir a rubrica.
          </InlineAlert>
        )}
        {missingComments.length > 0 && (
          <InlineAlert type="error">
            {missingComments.length} indicador(es) marcados como &quot;Excedente&quot; sem comentário justificando a
            pontuação.
          </InlineAlert>
        )}
        {answered.length === allIndicators.length && missingComments.length === 0 && (
          <InlineAlert type="success">Rubrica validada — pronta para registrar o resultado.</InlineAlert>
        )}
      </div>
    </Panel>
  );
}
