"use client";
import { Starburst, cn } from "@/components/stage";
import { Mission, MissionValue } from "@/features/scoring/future-edition/types";
import ObjectiveControl from "./ObjectiveControl";

interface MissionCardProps {
  mission: Mission;
  values: Record<string, MissionValue>;
  objectiveScores: { id: string; score: number }[];
  missionScore: number;
  image?: string;
  onChange: (objectiveId: string, value: MissionValue) => void;
}

// Card no padrão do MissionScorer: selo de pontos, código em caixa azul e
// sombra vermelha quando a missão pontua.
export default function MissionCard({
  mission,
  values,
  objectiveScores,
  missionScore,
  image,
  onChange,
}: MissionCardProps) {
  const scoreById = Object.fromEntries(
    objectiveScores.map((o) => [o.id, o.score]),
  );
  const scored = missionScore > 0;
  const cover = image ?? mission.image;

  return (
    <article
      className={cn(
        "stage-paper relative flex h-full flex-col rounded-2xl border bg-base-100 p-5 transition-[border-color,box-shadow] duration-300",
        scored
          ? "border-primary/40 shadow-[4px_4px_0_0_var(--color-primary)]"
          : "border-base-300 hover:border-primary/30",
      )}
    >
      <div
        className="absolute -right-4 -top-5 z-10 transition-transform duration-300"
        style={{ rotate: scored ? "8deg" : "0deg" }}
        aria-label={`${missionScore} pontos nesta missão`}
      >
        <Starburst size={60} tone={scored ? "accent" : "paper"} shadow={false}>
          <span className="text-xl leading-none tabular-nums">
            {missionScore}
            <span className="block text-[0.55rem] tracking-widest">PTS</span>
          </span>
        </Starburst>
      </div>

      <header className="flex items-start gap-3 pr-12">
        <span className="grid h-10 min-w-12 shrink-0 place-items-center rounded-tl-lg rounded-br-lg bg-secondary px-2 font-mono text-sm font-bold tracking-wider text-secondary-content">
          {mission.code}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-black uppercase leading-tight tracking-tight">
            {mission.title}
          </h3>
          {mission.maxScore !== undefined && (
            <span className="stage-label mt-1.5 inline-block text-base-content/50">
              Máximo: {mission.maxScore} pts
            </span>
          )}
        </div>
      </header>

      <div className="mt-4 flex flex-1 flex-col gap-4 sm:flex-row">
        {cover && (
          <figure className="stage-dots flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-tl-xl rounded-br-xl border border-base-300 bg-base-200/60 p-2 [background-size:12px_12px] sm:h-44 sm:w-44 sm:self-start">
            <img
              src={cover}
              alt={mission.title}
              className="h-full w-full object-contain"
            />
          </figure>
        )}
        <div className="min-w-0 flex-1 space-y-3">
          {mission.description && (
            <p className="text-sm leading-snug text-base-content/65">
              {mission.description}
            </p>
          )}
          {mission.objectives.map((objective) => (
            <ObjectiveControl
              key={objective.id}
              objective={objective}
              value={values[objective.id]}
              score={scoreById[objective.id] ?? 0}
              onChange={(v) => onChange(objective.id, v)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
