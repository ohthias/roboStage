export function calculateTotalPoints(missions, responses) {
    let total = 0;
  
    missions.forEach((mission) => {
      const missionResponses = responses[mission.id] || {};
  
      // Pontuação da missão principal
      if (mission.type?.[0] === "switch") {
        const response = missionResponses[0];
        const options = mission.type.slice(1).filter(Boolean);
        const isValid =
          options.length > 0
            ? response && options.includes(response)
            : response === "Sim";
        if (isValid) total += mission.points || 0;
      } else if (mission.type?.[0] === "range") {
        const value = missionResponses[0];
        if (!isNaN(value)) total += value * (mission.points || 0);
      }
  
      // Pontuação das sub-missões
      if (Array.isArray(mission["sub-mission"])) {
        mission["sub-mission"].forEach((sub, index) => {
          const response = missionResponses[index + 1];
          if (sub.type?.[0] === "switch") {
            const options = sub.type.slice(1).filter(Boolean);
            const isValid =
              options.length > 0
                ? response && options.includes(response)
                : response === "Sim";
            if (isValid) total += sub.points || 0;
          } else if (sub.type?.[0] === "range") {
            if (!isNaN(response)) total += response * (sub.points || 0);
          }
        });
      }
    });
  
    return total;
  }
  