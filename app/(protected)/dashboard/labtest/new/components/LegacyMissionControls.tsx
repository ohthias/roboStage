import { CheckCircle2, CircleDot, ListTree, Target } from "lucide-react";

import {
  type LegacyMission,
  type LegacyType,
  isFEMission,
} from "../Usecreatetest";

export function LegacyMissionControls({
  mission,
  value,
  subAnswers,
  onChange,
  onSubChange,
}: {
  mission: LegacyMission;
  value: number;
  subAnswers: Record<string, number>;
  onChange: (v: number) => void;
  onSubChange: (subId: string, v: number) => void;
}) {
  const subMissions = mission["sub-mission"] ?? [];

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className={`overflow-hidden rounded-xl border border-base-300 ${value === 0 ? "bg-base-100" : "bg-primary/5 border-primary/20"} shadow-sm`}>
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
          <p className="text-sm text-base-content/80 sm:line-clamp-2">
            {mission.mission}
          </p>
          <div className="flex justify-end">
            <TypeControl type={mission.type} value={value} onChange={onChange} />
          </div>
        </div>
      </div>

      {subMissions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-base-300 bg-base-200/40 px-3 py-3 sm:px-4">
            <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/60">
                <ListTree className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Submissões</p>
                <p className="text-xs text-base-content/50">
                  Outros resultados que podem ser avaliados separadamente.
                </p>
              </div>
            </div>

            <span className="badge badge-neutral badge-sm">
              {subMissions.length}
            </span>
          </div>

          <div className="divide-y divide-base-300">
            {subMissions.map((s, i) => {
              const subId = s.id ?? `${mission.id}-sub-${i}`;

              return (
                <div
                  key={subId}
                    className={`group flex flex-col items-stretch gap-2.5 px-3 py-3 transition-colors hover:bg-base-200/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 ${subAnswers[subId] ?? 0 !== 0 ? "bg-primary/5" : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-base-300 bg-base-100 text-[11px] font-semibold text-base-content/50 transition group-hover:border-primary/40 group-hover:text-primary">
                      {i + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-base-content/80 sm:line-clamp-2 cursor-default" title={s.submission}>
                        {s.submission}
                      </p>

                      {s.id && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <CircleDot className="size-3 text-base-content/35" />
                          <code className="font-mono text-[10px] text-base-content/40">
                            {s.id}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="self-end rounded-lg p-1 sm:shrink-0 sm:self-auto">
                    <div className="flex justify-end">
                      <TypeControl
                        type={s.type}
                        value={subAnswers[subId] ?? 0}
                        onChange={(v) => onSubChange(subId, v)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subMissions.length === 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-base-300 bg-base-200/20 p-3 sm:items-center sm:p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-base-content/30 sm:mt-0" />

          <div>
            <p className="text-sm font-medium">Sem submissões adicionais</p>
            <p className="text-xs text-base-content/50">
              Esta missão utiliza apenas o resultado principal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TypeControl({
  type,
  value,
  onChange,
}: {
  type: LegacyType;
  value: number;
  onChange: (v: number) => void;
}) {
  if (type[0] === "range") {
    const [, min, max] = type;
    return (
      <input
        type="number"
        min={min}
        max={max}
        className="input input-bordered input-xs w-20"
        value={value}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, Number(e.target.value))))
        }
      />
    );
  }

  const labels = type.slice(1).filter((v): v is string => Boolean(v));

  if (labels.length === 0) {
    return (
      <input
        type="checkbox"
        className="toggle toggle-sm toggle-primary"
        checked={value === 1}
        onChange={(e) => onChange(e.target.checked ? 1 : 0)}
      />
    );
  }

  return (
    <select
      className="select select-bordered select-xs"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {labels.map((l, idx) => (
        <option key={l} value={idx}>
          {l}
        </option>
      ))}
    </select>
  );
}

export function MissionBody({
  mission,
  value,
  subAnswers,
  onChange,
  onSubChange,
}: {
  mission: LegacyMission;
  value: number;
  subAnswers: Record<string, number>;
  onChange: (v: number) => void;
  onSubChange: (subId: string, v: number) => void;
}) {
  if (isFEMission(mission)) {
    return (
      <div className="flex flex-col divide-y divide-base-content/10">
        {mission.objectives.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
          >
            <span className="text-xs font-medium">{o.label}</span>

            {o.type === "toggle" ? (
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked ? 1 : 0)}
              />
            ) : (
              <input
                type="number"
                min={o.min ?? 0}
                max={o.max}
                className="input input-bordered input-sm w-24 bg-base-100 text-right"
                value={value ?? o.min ?? 0}
                onChange={(e) => onChange(Number(e.target.value))}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <LegacyMissionControls
      mission={mission}
      value={value}
      subAnswers={subAnswers}
      onChange={onChange}
      onSubChange={onSubChange}
    />
  );
}
