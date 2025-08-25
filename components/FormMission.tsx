import React from "react";

interface Mission {
  id: string;
  name: string;
  mission?: string;
  type: string[];
  equipaments?: boolean;
  points?: number | number[];
  ["sub-mission"]?: {
    points: number | number[] | undefined;
    submission: string;
    type: string[];
  }[];
}

interface Responses {
  [missionId: string]: {
    [index: number]: string | number;
  };
}

interface FormMissionProps {
  missions?: Mission[];
  responses?: Responses;
  onSelect?: (missionId: string, index: number, value: string | number) => void;
  className?: string;
}

export default function FormMission({
  missions = [],
  responses = {},
  onSelect,
  className = "",
}: FormMissionProps) {
  const renderInput = (
    missionId: string,
    index: number,
    type: string[],
    depth = 0,
    customPoints?: number | number[]
  ): React.ReactNode => {
    if (depth > 3) {
      console.warn(
        `[FormMission] Máxima profundidade de recursão atingida para a missão: ${missionId}`
      );
      return null;
    }

    const mission = missions.find((m) => m.id === missionId);
    const value = responses?.[missionId]?.[index];

    if (!mission || !type || !type[0]) {
      console.warn(
        `[FormMission] Tipo de input inválido para a missão ${missionId}. Confira os dados do tipo de input.`
      );
      return null;
    }

    const points = customPoints ?? mission?.points;
    const isRangeType = type[0] === "range";

    if (type[0] === "switch") {
      const options = type.slice(1).filter(Boolean);

      let buttons: string[];
      let values: number[];
      let labels: string[];

      if (Array.isArray(points)) {
        buttons = options.length > 0 ? options : points.map(String);
        values = points.map((p) => Number(p));
        labels = buttons.map((opt, idx) => `${opt}`);
      } else if (typeof points === "number") {
        buttons = options.length > 0 ? options : ["Não", "Sim"];
        values = buttons.map((opt, idx) => (opt === "Sim" || idx === 1 ? points : 0));
        labels = buttons.map((opt, idx) => `${opt}`);
      } else {
        console.warn(`[FormMission] Pontos inválidos para missão ${missionId}`);
        return null;
      }

      return (
        <div className="flex flex-wrap mt-2 gap-2">
          {buttons.map((option, idx) => {
            const optionValue = values[idx];
            const displayLabel = labels[idx];
            return (
              <button
                key={`${missionId}-switch-${index}-${option}`}
                className={
                  value === optionValue
                    ? "bg-accent px-4 py-2 rounded-lg border-none font-bold cursor-pointer mt-2 mr-2 text-sm sm:text-base text-accent-content"
                    : "bg-base-200 text-base-content px-4 py-2 rounded-lg border-none cursor-pointer mt-2 mr-2 text-sm sm:text-base hover:bg-accent/25 transition"
                }
                onClick={() => onSelect?.(missionId, index, optionValue)}
                aria-pressed={value === optionValue}
                type="button"
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      );
    }

    if (isRangeType) {
      const start = Number(type[1]) ?? 0;
      const end = Number(type[2]) ?? 10;
      const count = end - start + 1;

      let pointOptions: number[];

      if (Array.isArray(points)) {
        pointOptions = points;
      } else if (typeof points === "number") {
        pointOptions = Array.from({ length: count }, (_, idx) => points * idx);
      } else {
        console.warn(
          `[FormMission] "points" está indefinido ou inválido para a missão ${missionId}:`,
          points
        );
        pointOptions = Array.from({ length: count }, () => 0);
      }

      return (
        <div>
          {pointOptions.map((val, idx) => {
            const displayLabel = start + idx;
            return (
              <button
                key={`${missionId}-range-${index}-${val}-${idx}`}
                className={
                  value === val
                    ? "bg-accent text-accent-content px-4 py-2 rounded-lg border-none font-bold cursor-pointer mt-2 mr-2"
                    : "bg-base-200 text-base-content px-4 py-2 rounded-lg border-none cursor-pointer mt-2 mr-2 hover:bg-accent/25 transition"
                }
                onClick={() => onSelect?.(missionId, index, val)}
                aria-pressed={value === val}
                type="button"
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`bg-base-100 p-4 rounded-lg max-w-4xl sm:mx-auto w-full ${className}`}>
      {Array.isArray(missions) &&
        missions.map((mission) => (
          <div
            className="flex flex-col sm:flex-row gap-4 sm:gap-8 rounded-lg p-4 mb-4 relative after:content-[''] after:absolute after:w-[calc(100%-32px)] after:h-0.5 after:bottom-0 after:bg-gray-200 after:left-1/2 after:-translate-x-1/2 after:mt-4"
            key={mission.id}
          >
            <span className="bg-secondary text-white rounded-lg font-bold flex items-center justify-center mb-2 w-12 h-12 sm:w-[50px] sm:h-[50px] text-center">
              {mission.id}
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-[1.1rem] mb-3 flex justify-start items-center">
                {mission.name.toUpperCase()}
                {mission.equipaments && (
                  <img src="/images/icons/NoEquip.png" className="ml-4 w-8 h-8" />
                )}
              </h3>

              {mission.mission && (
                <div className="mb-4">
                  <p>{mission.mission}</p>
                  {renderInput(mission.id, 0, mission.type)}
                </div>
              )}

              {Array.isArray(mission["sub-mission"]) &&
                mission["sub-mission"].map((sub, index) => (
                  <div key={`${mission.id}-sub${index}`} className="mb-4">
                    <p>{sub.submission}</p>
                    {renderInput(mission.id, index + 1, sub.type, 1, sub.points)}
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
