export function calculateTotalPoints(missions, responses) {
  let total = 0;

  missions.forEach((mission) => {
    const missionResponses = responses[mission.id] || {};

    // ===== Missão principal =====
    const mainResponse = missionResponses[0];

    if (typeof mainResponse === "number") {
      total += mainResponse;
    } else if (mission.type?.[0] === "range") {
      const idx = Number(mainResponse);
      if (!isNaN(idx)) {
        if (Array.isArray(mission.points)) {
          total += mission.points[idx] ?? 0;
        } else {
          total += idx * (mission.points || 0);
        }
      }
    }

    // ===== Sub-missões =====
    if (Array.isArray(mission["sub-mission"])) {
      mission["sub-mission"].forEach((sub, index) => {
        const response = missionResponses[index + 1];

        if (typeof response === "number") {
          total += response;
        } else if (sub.type?.[0] === "range") {
          const idx = Number(response);
          if (!isNaN(idx)) {
            if (Array.isArray(sub.points)) {
              total += sub.points[idx] ?? 0;
            } else {
              total += idx * (sub.points || 0);
            }
          }
        }
      });
    }
  });

  return total;
}
