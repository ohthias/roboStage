import type { Movement } from "@/types/RobotTrackType";

export const TAPETE_WIDTH_CM = 200;
export const TAPETE_HEIGHT_CM = 114;

export const INITIAL_X_CM = 20.5;
export const INITIAL_Y_CM = 20.5;
export const INITIAL_ANGLE = 0;

export const ROBOT_WIDTH_PX = 22;
export const ROBOT_HEIGHT_PX = 26;

// The path for the robot to follow
// type: 'giro' (turn, value in degrees), 'reto' (straight, value in cm)
// speed: degrees/sec for 'giro', cm/sec for 'reto'
export const INITIAL_MOVEMENTS: Movement[] = [
  { type: "reto", value: 50, speed: 40 },
  { type: "giro", value: 90, speed: 90 },
  { type: "reto", value: 40, speed: 50 },
  { type: "giro", value: 45, speed: 90 },
  { type: "reto", value: 60, speed: 40 },
  { type: "giro", value: -135, speed: 180 },
  { type: "reto", value: 80, speed: 60 },
];

export const MAP_IMAGE_URL = "/images/quickbrick_robottrack.png";
export const MAP_IMAGE_BASE_WIDTH = 1000;
export const MAP_IMAGE_BASE_HEIGHT = 570;
