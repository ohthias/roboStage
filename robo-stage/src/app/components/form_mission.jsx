import React from "react";
import styles from "../../../styles/FormMission.module.css";

export default function FormMission({ missions = [], responses = {}, onSelect }) {
  const renderInput = (missionId, index, type, depth = 0) => {
    if (depth > 3) {
      console.warn(`[FormMission] Máxima profundidade de recursão atingida para a missão: ${missionId}`);
      return null;
    }

    const mission = missions.find((m) => m.id === missionId);
    const value = responses?.[missionId]?.[index];

    if (!mission || !type || !type[0]) {
      console.warn(`[FormMission] Tipo de input inválido para a missão ${missionId}. Confira os dados do tipo de input.`);
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
                value === option ? styles.activeButton : styles.inactiveButton
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

      let pointOptions;

      if (Array.isArray(points)) {
        pointOptions = points;
      } else if (typeof points === "number") {
        pointOptions = Array.from({ length: count }, () => points);
      } else {
        console.warn(`[FormMission] "points" está indefinido ou inválido para a missão ${missionId}:`, points);
        pointOptions = Array.from({ length: count }, () => 0);
      }

      return (
        <div
          className={styles.buttonGroup}
          role="group"
          aria-label={`Opções de pontuação para ${mission.name}`}
        >
          {pointOptions.map((val, idx) => {
            const displayLabel = idx + start;
            return (
              <button
                key={`${missionId}-range-${index}-${val}-${idx}`}
                className={
                  value === displayLabel ? styles.activeButton : styles.inactiveButton
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
    <div className={styles.formContainer}>
      {Array.isArray(missions) &&
        missions.map((mission) => (
          <div className={styles.missionCard} key={mission.id}>
            <span className={styles.missionLabel}>{mission.id}</span>
            <div className={styles.missionContainer}>
              <h3 className={styles.missionTitle}>{mission.name.toUpperCase()}</h3>

              {mission.mission && (
                <div className={styles.questionBlock}>
                  <p>{mission.mission}</p>
                  {renderInput(mission.id, 0, mission.type)}
                </div>
              )}

              {Array.isArray(mission["sub-mission"]) &&
                mission["sub-mission"].map((sub, index) => (
                  <div key={`${mission.id}-sub${index}`} className={styles.questionBlock}>
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