"use client";
import { SwitchInput } from "./SwitchInput";
import { RangeInput } from "./RangeInput";

function resolveRangePoints(
  selection: number | string | undefined,
  points: number | number[],
  start = 0,
  end = 10
): number {
  if (selection === undefined || selection === null) return 0;

  const count = end - start + 1;
  const toIdx = (): number | undefined => {
    if (typeof selection === "number") {
      if (Number.isInteger(selection) && selection >= 0 && selection < count)
        return selection; // já é idx
      // compat: se for pontos antigos
      if (Array.isArray(points)) {
        const idx = (points as number[]).findIndex((p) => p === selection);
        if (idx !== -1) return idx;
      } else {
        const step = Number(points) || 0;
        if (step > 0) {
          const idx = Math.round(selection / step);
          if (step * idx === selection && idx >= 0 && idx < count) return idx;
        }
      }
    } else if (typeof selection === "string") {
      const m = selection.match(/(?:^i:|^-?\d+(?:\.\d+)?-)(\d+)$/);
      if (m) {
        const idx = Number(m[1]);
        if (idx >= 0 && idx < count) return idx;
      }
    }
    return undefined;
  };

  const idx = toIdx();
  if (idx === undefined) return 0;

  if (Array.isArray(points)) return Number((points as number[])[idx] ?? 0);
  return (Number(points) || 0) * idx;
}

export function MissionCard({
  mission,
  responses = {},
  onSelect,
  imagesEnabled = true,
  isBadgeEnabled = true,
}: MissionCardProps) {
  const renderInput = (
    index: number,
    type: Mission["type"],
    points: number | number[]
  ) => {
    if (type[0] === "switch") {
      return (
        <SwitchInput
          missionId={mission.id}
          index={index}
          points={points}
          options={type.slice(1).filter(Boolean).map(String)}
          value={responses[index]}
          onSelect={onSelect}
        />
      );
    }

    if (type[0] === "range") {
      return (
        <RangeInput
          missionId={mission.id}
          index={index}
          points={points}
          start={Number(type[1]) || 0}
          end={Number(type[2]) || 10}
          value={responses[index]}
          onSelect={(mId, i, idx) => onSelect(mId, i, idx)}
        />
      );
    }

    return <span className="badge badge-ghost">Tipo inválido</span>;
  };

  const start = Number(mission.type[1]) || 0;
  const end = Number(mission.type[2]) || 10;
  const mainPoints =
    mission.type[0] === "range"
      ? resolveRangePoints(responses[0], mission.points, start, end)
      : Number(responses[0] || 0);

  return (
    <div className="card border border-base-200 mb-6">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="badge bg-base-300/50 text-base-content text-md p-4 rounded-md w-12 h-12 font-bold flex items-center justify-center">
            {mission.id}
          </div>
          <h3 className="card-title text-lg sm:text-xl font-bold flex-1">
            {mission.name.toUpperCase()}
          </h3>
          {mission.equipaments && (
            <img
              src="/images/icons/NoEquip.png"
              className="w-8 h-8 sm:w-10 sm:h-10"
              alt="Sem equipamentos"
            />
          )}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {mission.image && imagesEnabled && (
            <figure className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={mission.image}
                alt={`Missão ${mission.name}`}
                className="rounded-lg w-32 h-32 object-contain"
              />
            </figure>
          )}

          <div className="w-full">
            {mission.mission && (
              <div className="mb-4">
                <p className="mb-2 text-sm sm:text-base flex justify-between items-center">
                  <span className="max-w-3/4">
                    {mission.mission}
                  </span>
                  {mission.id !== "GP" && isBadgeEnabled && (
                    <span className="badge badge-neutral rounded-md badge-outline w-auto text-center badge-sm h-auto">
                    Pontos: {mainPoints}
                  </span>
                  )}
                </p>
                {renderInput(0, mission.type, mission.points)}
              </div>
            )}

            {mission["sub-mission"]?.length ? (
              <div className="divider my-2"></div>
            ) : null}

            {mission["sub-mission"]?.map((sub, idx) => {
              const subPoints =
                sub.type[0] === "range"
                  ? resolveRangePoints(
                      responses[idx + 1],
                      sub.points,
                      Number(sub.type[1]) || 0,
                      Number(sub.type[2]) || 10
                    )
                  : Number(responses[idx + 1] || 0);

              return (
                <div key={`${mission.id}-sub${idx}`} className="mb-4">
                  <p className="mb-2 text-sm sm:text-base flex justify-between items-center">
                    {sub.submission}
                    {isBadgeEnabled && (
                      <span className="badge badge-neutral rounded-md badge-outline w-auto text-center badge-sm h-auto">
                        Pontos: {subPoints}
                      </span>
                    )}
                  </p>
                  {renderInput(idx + 1, sub.type, sub.points)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
