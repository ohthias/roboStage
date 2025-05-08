"use client";

import styles from "../styles/FormMission.module.css";

export default function FormMission({ missions = [], responses = {}, onSelect }) {
  const renderInput = (missionId, index, type) => {
    const value = responses[missionId]?.[index];

    if (type[0] === "switch") {
      const options = type.slice(1).filter(Boolean);
      const buttons = options.length > 0 ? options : ["Não", "Sim"];
      return buttons.map((option) => (
        <button
          key={option}
          className={value === option ? styles.activeButton : styles.inactiveButton}
          onClick={() => onSelect(missionId, index, option)}
        >
          {option}
        </button>
      ));
    }

    if (type[0] === "range") {
      const pointOptions = Array.isArray(missions.points)
        ? missions.points
        : Array.from({ length: (type[2] || 10) - (type[1] || 0) + 1 }, (_, i) => (type[1] || 0) + i);
    
      return (
        <div className={styles.buttonGroup}>
          {pointOptions.map((val) => (
            <button
              key={val}
              className={value === val ? styles.activeButton : styles.inactiveButton}
              onClick={() => onSelect(missionId, index, val)}
            >
              {val}
            </button>
          ))}
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
                  <div key={index} className={styles.questionBlock}>
                    <p>{sub.submission}</p>
                    {renderInput(mission.id, index + 1, sub.type)}
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
