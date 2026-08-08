"use client";

import { RUBRIC, LEVEL_THRESHOLDS, LevelKey } from "@/app/(public)/[competicao]/(fll)/rubric/rubric";

interface ScorePanelProps {
  scores: Record<string, LevelKey | undefined>;
  comments: Record<string, string>;
  onReset: () => void;
  onPrint: () => void;
}

function classify(average: number) {
  let result = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (average >= t.min) result = t;
  }
  return result;
}

const toneClasses: Record<string, string> = {
  error: "badge-error",
  warning: "badge-warning",
  info: "badge-info",
  success: "badge-success",
};

export default function ScorePanel({ scores, comments, onReset, onPrint }: ScorePanelProps) {
  const allIndicators = RUBRIC.flatMap((cat) => cat.criteria.flatMap((c) => c.indicators));
  const answered = allIndicators.filter((ind) => scores[ind.id] !== undefined);
  const totalMax = allIndicators.length * 4;
  const totalScore = answered.reduce((sum, ind) => sum + (scores[ind.id] ?? 0), 0);
  const overallAverage = answered.length ? totalScore / answered.length : 0;
  const overallPct = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  const overallClass = classify(overallAverage);

  const missingComments = allIndicators.filter(
    (ind) => scores[ind.id] === 4 && !comments[ind.id]?.trim()
  );

  const categoryBreakdown = RUBRIC.map((cat) => {
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
    <div className="rounded-box border border-base-content/15 bg-base-200/80 backdrop-blur-sm p-5 sm:p-6">
      <div className="flex items-center gap-5 mb-5">
        <div
          className="radial-progress text-primary shrink-0"
          style={
            {
              "--value": overallPct,
              "--size": "5.5rem",
              "--thickness": "6px",
            } as React.CSSProperties
          }
          role="progressbar"
          aria-valuenow={overallPct}
        >
          <span className="font-mono-tech text-sm text-primary">{overallPct}%</span>
        </div>
        <div>
          <div className={`badge ${toneClasses[overallClass.tone]} badge-lg h-full mb-1.5`}>
            {overallClass.label}
          </div>
          <p className="font-mono-tech text-xs text-base-content/70">
            {totalScore} / {totalMax} pts
          </p>
          <p className="text-xs text-base-content/60 mt-1 max-w-[16rem]">{overallClass.hint}</p>
        </div>
      </div>

      <div className="divider my-2 before:bg-base-300 after:bg-base-300" />

      <div className="space-y-3 mb-4">
        {categoryBreakdown.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{cat.name}</span>
              <span className="font-mono-tech text-xs text-base-content/70">
                {cat.score}/{cat.max}
              </span>
            </div>
            <progress
              className="progress progress-secondary w-full h-2"
              value={cat.score}
              max={cat.max}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-base-content/60">
                {cat.completed}/{cat.total} indicadores
              </span>
              {cat.classification && (
                <span className={`badge badge-xs ${toneClasses[cat.classification.tone]} font-mono-tech`}>
                  {cat.classification.label}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-field,0.35rem)] border border-secondary/30 bg-secondary/10 px-3 py-2.5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium flex items-center gap-1.5">
            <span className="font-mono-tech text-secondary">⚙</span> Core Values (estimado)
          </span>
          <span className="font-mono-tech text-xs text-base-content/70">
            {gearScore}/{gearMax}
          </span>
        </div>
        <progress className="progress progress-secondary w-full h-2" value={gearScore} max={gearMax || 1} />
        <p className="text-[11px] text-base-content/60 mt-1">
          Soma dos {gearIndicators.length} indicadores marcados com ⚙ nas duas rubricas — no
          evento oficial, Core Values também soma pontos do Robot Game e representa 25% do
          Champion&apos;s Award.
        </p>
      </div>

      {answered.length < allIndicators.length && (
        <div className="alert alert-soft alert-warning text-xs py-2 px-3 mb-3">
          <span>Faltam {allIndicators.length - answered.length} indicador(es) para concluir a rubrica.</span>
        </div>
      )}

      {missingComments.length > 0 && (
        <div className="alert alert-soft alert-error text-xs py-2 px-3 mb-3">
          <span>
            {missingComments.length} indicador(es) marcados como &quot;Excedente&quot; sem
            comentário justificando a pontuação.
          </span>
        </div>
      )}

      {answered.length === allIndicators.length && missingComments.length === 0 && (
        <div className="alert alert-soft alert-success text-xs py-2 px-3 mb-3">
          <span>Rubrica validada — pronta para registrar o resultado.</span>
        </div>
      )}

      <div className="flex gap-2 no-print">
        <button onClick={onPrint} className="btn btn-primary btn-sm flex-1 font-mono-tech">
          Imprimir / PDF
        </button>
        <button onClick={onReset} className="btn btn-ghost btn-sm flex-1 font-mono-tech">
          Limpar
        </button>
      </div>
    </div>
  );
}
