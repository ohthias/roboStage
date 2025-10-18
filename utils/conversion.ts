import {
  TAPETE_WIDTH_CM,
  TAPETE_HEIGHT_CM,
} from "@/app/(public)/quickbrick/robot-track/constants";
import type { CanvasPoint } from "@/types/RobotTrackType";

export const cmToPixel = (
  x_cm: number,
  y_cm: number,
  canvasWidth: number,
  canvasHeight: number
): CanvasPoint => {
  const x_px = (x_cm / TAPETE_WIDTH_CM) * canvasWidth;
  // Invert Y-axis: cm origin is bottom-left, canvas origin is top-left
  const y_px = ((TAPETE_HEIGHT_CM - y_cm) / TAPETE_HEIGHT_CM) * canvasHeight;
  return { x_px, y_px };
};

export const pixelToCm = (
  x_px: number,
  y_px: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  const x_cm = (x_px / canvasWidth) * TAPETE_WIDTH_CM;
  const y_cm = TAPETE_HEIGHT_CM - (y_px / canvasHeight) * TAPETE_HEIGHT_CM;
  return { x_cm, y_cm };
};
