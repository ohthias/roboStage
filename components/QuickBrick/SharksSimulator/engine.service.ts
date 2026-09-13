import { TAPETE_WIDTH_CM, TAPETE_HEIGHT_CM } from './constants';
import { Command, PathPoint, RobotState, AnimationSegment } from '@/types/SharksSimulator.types';

/**
 * Converts CM coordinates to % for CSS positioning (Top-Left origin)
 * Note: FLL often uses Bottom-Left as (0,0), so we invert Y.
 */
export const cmToPct = (xCm: number, yCm: number) => {
  const xPct = (xCm / TAPETE_WIDTH_CM) * 100;
  // Invert Y because screen Y goes down, but physical Y goes up
  const yPct = ((TAPETE_HEIGHT_CM - yCm) / TAPETE_HEIGHT_CM) * 100;
  return { x: xPct, y: yPct };
};

/**
 * Converts screen pixels back to CM (for mouse tracking)
 * Strictly clamps values to stay within the Mat dimensions.
 */
export const pxToCm = (xPx: number, yPx: number, widthPx: number, heightPx: number) => {
  let xCm = (xPx / widthPx) * TAPETE_WIDTH_CM;
  let yCm = TAPETE_HEIGHT_CM - (yPx / heightPx) * TAPETE_HEIGHT_CM;
  
  // Clamp values to ensure they stay inside the mat
  xCm = Math.max(0, Math.min(xCm, TAPETE_WIDTH_CM));
  yCm = Math.max(0, Math.min(yCm, TAPETE_HEIGHT_CM));

  return { x: xCm, y: yCm };
};

export const parseCode = (code: string): Command[] => {
  const commands: Command[] = [];
  const lines = code.split('\n');

  lines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('#')) return;

    const parts = cleanLine.split(/\s+/);
    if (parts.length >= 2) {
      const type = parts[0].toLowerCase();
      const val = parseFloat(parts[1]);
      const speed = parts.length > 2 ? parseFloat(parts[2]) : 50;

      if (!isNaN(val) && (type === 'reto' || type === 'giro')) {
        commands.push({ type: type as 'reto' | 'giro', val, speed });
      }
    }
  });

  return commands;
};

export const commandsToCode = (commands: Command[]): string => {
  let code = `# Estratégia Visual\n`;
  commands.forEach(cmd => {
    code += `${cmd.type} ${cmd.val} ${cmd.speed}\n`;
  });
  return code;
};

export const calculateTrajectory = (
  commands: Command[], 
  startX: number, 
  startY: number, 
  startAngle: number
): PathPoint[] => {
  let currentX = startX;
  let currentY = startY;
  let currentAngle = startAngle;

  const trajectory: PathPoint[] = [
    { x: currentX, y: currentY, angle: currentAngle, type: 'start', velocity: 0 }
  ];

  commands.forEach(cmd => {
    if (cmd.type === 'giro') {
      // Don't modulo here to ensure smooth interpolation for >360 rotations
      currentAngle = currentAngle + cmd.val;
      
      trajectory.push({
        x: currentX,
        y: currentY,
        angle: currentAngle,
        type: 'giro',
        velocity: cmd.speed
      });
    } else if (cmd.type === 'reto') {
      const rad = (currentAngle * Math.PI) / 180;
      const xNew = currentX + cmd.val * Math.sin(rad);
      const yNew = currentY + cmd.val * Math.cos(rad);

      currentX = xNew;
      currentY = yNew;
      
      trajectory.push({
        x: currentX,
        y: currentY,
        angle: currentAngle,
        type: 'reto',
        velocity: cmd.speed
      });
    }
  });

  return trajectory;
};

export const generateSegments = (trajectory: PathPoint[], speedFactor: number = 1.0): AnimationSegment[] => {
  const segments: AnimationSegment[] = [];
  let currentTime = 0;

  for (let i = 0; i < trajectory.length - 1; i++) {
    const start = trajectory[i];
    const end = trajectory[i + 1];
    let duration = 0;

    if (end.type === 'reto') {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const velocity = (end.velocity || 30) * speedFactor; // cm/s
      // time (ms) = (dist / velocity) * 1000
      duration = (dist / Math.max(velocity, 0.1)) * 1000;
    } else if (end.type === 'giro') {
      const angleDiff = Math.abs(end.angle - start.angle);
      const angularVelocity = (end.velocity || 90) * speedFactor; // deg/s
      duration = (angleDiff / Math.max(angularVelocity, 1)) * 1000;
    }

    segments.push({
      startState: { ...start },
      endState: { ...end },
      startTime: currentTime,
      endTime: currentTime + duration,
      type: end.type
    });

    currentTime += duration;
  }

  return segments;
};

/**
 * ---------------------------------------------------------------------------
 * MOBILE "TAP TO DRIVE" HELPERS
 * ---------------------------------------------------------------------------
 * These helpers power the mobile experience, where the user builds a
 * trajectory purely by tapping points on the mat — no code, no block editor.
 * Each tap is converted into a small set of relative commands (an optional
 * turn followed by an optional straight move) that reach the tapped point
 * from wherever the robot currently ends up.
 */

/**
 * Given the last known point of the trajectory (position + heading) and a
 * newly tapped target (in cm), returns the "reto"/"giro" commands needed to
 * reach that target. Mirrors the desktop Visual Editor's click-to-drive
 * logic so both experiences stay perfectly consistent.
 */
export const pointToCommands = (
  lastPoint: { x: number; y: number; angle: number },
  targetX: number,
  targetY: number,
  turnSpeed: number = 60,
  moveSpeed: number = 50,
): Command[] => {
  const dx = targetX - lastPoint.x;
  const dy = targetY - lastPoint.y;
  const dist = Math.hypot(dx, dy);
  const targetAngleDeg = (Math.atan2(dx, dy) * 180) / Math.PI;
  let angleDiff = targetAngleDeg - (lastPoint.angle % 360);
  if (angleDiff > 180) angleDiff -= 360;
  if (angleDiff < -180) angleDiff += 360;

  const newCommands: Command[] = [];
  if (Math.abs(angleDiff) > 1.0)
    newCommands.push({ type: "giro", val: parseFloat(angleDiff.toFixed(1)), speed: turnSpeed });
  if (dist > 0.5)
    newCommands.push({ type: "reto", val: parseFloat(dist.toFixed(1)), speed: moveSpeed });

  return newCommands;
};

/** One tap = one "waypoint" made of an optional turn command + an optional move command. */
export interface Waypoint {
  index: number; // position of this waypoint within the waypoints array
  turnIdx?: number; // index of the 'giro' command inside the flat commands array
  moveIdx?: number; // index of the 'reto' command inside the flat commands array
  x: number;
  y: number;
  angle: number;
  moveSpeed?: number;
  turnSpeed?: number;
}

/**
 * Groups a flat command list (as produced by pointToCommands) back into
 * per-tap waypoints, and attaches the resulting x/y/angle from the
 * trajectory so the UI can render friendly point cards.
 */
export const commandsToWaypoints = (commands: Command[], trajectory: PathPoint[]): Waypoint[] => {
  const waypoints: Waypoint[] = [];
  let i = 0;
  while (i < commands.length) {
    const wp: Waypoint = { index: waypoints.length, x: 0, y: 0, angle: 0 };
    if (commands[i]?.type === "giro") {
      wp.turnIdx = i;
      i += 1;
    }
    if (commands[i]?.type === "reto") {
      wp.moveIdx = i;
      i += 1;
    }
    // Defensive fallback: never loop forever on unexpected orderings
    if (wp.turnIdx === undefined && wp.moveIdx === undefined) {
      i += 1;
      continue;
    }
    const lastCmdIdx = wp.moveIdx ?? wp.turnIdx!;
    const trajPoint = trajectory[lastCmdIdx + 1];
    if (trajPoint) {
      wp.x = trajPoint.x;
      wp.y = trajPoint.y;
      wp.angle = trajPoint.angle;
    }
    if (wp.moveIdx !== undefined) wp.moveSpeed = commands[wp.moveIdx].speed;
    if (wp.turnIdx !== undefined) wp.turnSpeed = commands[wp.turnIdx].speed;
    waypoints.push(wp);
  }
  return waypoints;
};

/** Removes every command belonging to one waypoint (its turn + its move). */
export const removeWaypoint = (commands: Command[], waypoint: Waypoint): Command[] => {
  const drop = new Set([waypoint.turnIdx, waypoint.moveIdx].filter((v) => v !== undefined) as number[]);
  return commands.filter((_, idx) => !drop.has(idx));
};

/** Updates the move distance and/or turn angle of a single waypoint in place. */
export const updateWaypoint = (
  commands: Command[],
  waypoint: Waypoint,
  updates: { moveVal?: number; moveSpeed?: number; turnSpeed?: number },
): Command[] => {
  const next = [...commands];
  if (waypoint.moveIdx !== undefined && next[waypoint.moveIdx]) {
    next[waypoint.moveIdx] = {
      ...next[waypoint.moveIdx],
      ...(updates.moveVal !== undefined ? { val: updates.moveVal } : {}),
      ...(updates.moveSpeed !== undefined ? { speed: updates.moveSpeed } : {}),
    };
  }
  if (waypoint.turnIdx !== undefined && next[waypoint.turnIdx] && updates.turnSpeed !== undefined) {
    next[waypoint.turnIdx] = { ...next[waypoint.turnIdx], speed: updates.turnSpeed };
  }
  return next;
};

export const interpolateState = (segments: AnimationSegment[], time: number): RobotState | null => {
  // 1. Find the active segment
  const segment = segments.find(s => time >= s.startTime && time <= s.endTime);

  if (!segment) {
    // Before start?
    if (segments.length > 0 && time < segments[0].startTime) {
      return segments[0].startState;
    }
    // After end?
    if (segments.length > 0 && time > segments[segments.length - 1].endTime) {
      return segments[segments.length - 1].endState;
    }
    return null;
  }

  // 2. Interpolate
  const duration = segment.endTime - segment.startTime;
  if (duration <= 0) return segment.endState;

  const progress = (time - segment.startTime) / duration;

  // Linear interpolation function
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return {
    x: lerp(segment.startState.x, segment.endState.x, progress),
    y: lerp(segment.startState.y, segment.endState.y, progress),
    angle: lerp(segment.startState.angle, segment.endState.angle, progress)
  };
};