import React from "react";

interface Mission {
  id: string;
  name: string;
  mission?: string;
  type: string[];
  points?: number | number[];
  ["sub-mission"]?: {
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
}

export default function FormMission({
  missions = [],
  responses = {},
  onSelect,
}: FormMissionProps) {
  const renderInput = (
    missionId: string,
    index: number,
    type: string[],
    depth = 0
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

    const points = mission.points;
    const isRangeType = type[0] === "range";

    if (type[0] === "switch") {
      const options = type.slice(1).filter(Boolean);
      const buttons = options.length > 0 ? options : ["Não", "Sim"];

      return (
        <>
          {buttons.map((option) => (
            <button
              key={`${missionId}-switch-${index}-${option}`}
              className={
                value === option
                  ? "bg-[#ED1E25] text-white px-4 py-2 rounded-lg border-none font-bold cursor-pointer mt-2 mr-2"
                  : "bg-[#dcdcdc] text-[#121212] px-4 py-2 rounded-lg border-none cursor-pointer mt-2 mr-2"
              }
              onClick={() => onSelect?.(missionId, index, option)}
              aria-pressed={value === option}
              type="button"
            >
              {option}
            </button>
          ))}
        </>
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
        pointOptions = Array.from({ length: count }, () => points);
      } else {
        console.warn(
          `[FormMission] "points" está indefinido ou inválido para a missão ${missionId}:`,
          points
        );
        pointOptions = Array.from({ length: count }, () => 0);
      }

      return (
        <div
          className="flex mt-2"
          role="group"
          aria-label={`Opções de pontuação para ${mission.name}`}
        >
          {pointOptions.map((val, idx) => {
            const displayLabel = idx + start;
            return (
              <button
                key={`${missionId}-range-${index}-${val}-${idx}`}
                className={
                  value === displayLabel
                    ? "bg-[#ED1E25] text-white px-4 py-2 rounded-lg border-none font-bold cursor-pointer mt-2 mr-2"
                    : "bg-[#dcdcdc] text-[#121212] px-4 py-2 rounded-lg border-none cursor-pointer mt-2 mr-2"
                }
                onClick={() => onSelect?.(missionId, index, displayLabel)}
                aria-pressed={value === displayLabel}
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
    <div className="bg-light-smoke p-4 rounded-lg max-w-4xl mx-auto">
      {Array.isArray(missions) &&
        missions.map((mission) => (
          <div
            className="flex gap-8 rounded-lg p-4 mb-8 relative after:content-[''] after:absolute after:w-[calc(100%-32px)] after:h-0.5 after:bottom-0 after:bg-[rgba(18,18,18,0.5)] after:left-1/2 after:-translate-x-1/2 after:mt-4"
            key={mission.id}
          >
            <span className="bg-[#ED1E25] text-white rounded-lg font-bold flex items-center justify-center mb-2 w-[50px] h-[50px] text-center">
              {mission.id}
            </span>
            <div>
              <h3 className="font-bold text-[1.1rem] mb-3">
                {mission.name.toUpperCase()}
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
                    {renderInput(mission.id, index + 1, sub.type, 1)}
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
