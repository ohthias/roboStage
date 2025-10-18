import type { Movement, Point } from "@/types/RobotTrackType";
import {
  INITIAL_X_CM,
  INITIAL_Y_CM,
  INITIAL_ANGLE,
  TAPETE_WIDTH_CM,
  TAPETE_HEIGHT_CM,
} from "@/app/(public)/quickbrick/robot-track/constants";

export const calculatePathFromMovements = (movements: Movement[]): Point[] => {
  let x = INITIAL_X_CM;
  let y = INITIAL_Y_CM;
  let angle = INITIAL_ANGLE;
  const calculatedPath: Point[] = [
    { x_cm: x, y_cm: y, angle, speed: 0, type: "inicio" },
  ];

  for (const move of movements) {
    if (move.type === "giro") {
      angle = angle + move.value;
      // Normalize angle to be within [-180, 180] for consistency, then map to [0, 360] if needed elsewhere
      while (angle <= -180) angle += 360;
      while (angle > 180) angle -= 360;
    } else if (move.type === "reto") {
      const rad = (angle * Math.PI) / 180;
      x += move.value * Math.sin(rad);
      y += move.value * Math.cos(rad);
    }
    x = Math.max(0, Math.min(TAPETE_WIDTH_CM, x));
    y = Math.max(0, Math.min(TAPETE_HEIGHT_CM, y));

    calculatedPath.push({
      x_cm: x,
      y_cm: y,
      angle,
      speed: move.speed,
      type: move.type,
    });
  }
  return calculatedPath;
};
