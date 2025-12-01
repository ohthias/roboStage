import { TAPETE_WIDTH_CM, TAPETE_HEIGHT_CM } from '@/app/(public)/quickbrick/robot-track/constants';
import { Command, PathPoint, RobotState, AnimationSegment } from '@/types/RobotTrackType';

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