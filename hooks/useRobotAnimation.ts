import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type {
  Movement,
  Point,
  RobotState,
  MousePosition,
} from "@/types/RobotTrackType";
import { calculatePathFromMovements } from "@/utils/path";

interface UseRobotAnimationProps {
  movements: Movement[];
  speed: number;
}

const getInitialState = (path: Point[]): RobotState => ({
  ...path[0],
  isRunning: false,
  segmentIndex: 0,
  progress: 0,
});

export const useRobotAnimation = ({
  movements,
  speed,
}: UseRobotAnimationProps) => {
  const path = useMemo<Point[]>(
    () => calculatePathFromMovements(movements),
    [movements]
  );

  const [robotState, setRobotState] = useState<RobotState>(() =>
    getInitialState(path)
  );
  const [mousePos, setMousePos] = useState<MousePosition>({
    pixel: null,
    cm: null,
  });

  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const animate = useCallback(
    (time: number) => {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setRobotState((s) => {
        if (!s.isRunning) {
          return s;
        }

        let segmentIndex = s.segmentIndex;
        let progress = s.progress;

        const startPoint = path[segmentIndex];
        const endPoint = path[segmentIndex + 1];

        if (!endPoint) {
          return { ...s, isRunning: false };
        }

        let progressMade = 0;
        if (endPoint.type === "reto") {
          const distance = Math.hypot(
            endPoint.x_cm - startPoint.x_cm,
            endPoint.y_cm - startPoint.y_cm
          );
          if (distance > 0) {
            const moveSpeed = endPoint.speed * speed;
            progressMade = (moveSpeed * deltaTime) / distance;
          }
        } else if (endPoint.type === "giro") {
          let angleDiff = endPoint.angle - startPoint.angle;
          if (angleDiff > 180) angleDiff -= 360;
          if (angleDiff < -180) angleDiff += 360;
          if (angleDiff !== 0) {
            const turnSpeed = endPoint.speed * speed;
            progressMade = (turnSpeed * deltaTime) / Math.abs(angleDiff);
          }
        }

        progress += progressMade;

        if (progress >= 1) {
          const overflow = progress - 1;
          // In a more complex sim, we'd use `overflow` to start the next segment
          progress = 0;
          segmentIndex++;
        }

        if (segmentIndex >= path.length - 1) {
          animationFrameRef.current = 0;
          return {
            ...path[path.length - 1],
            isRunning: false,
            segmentIndex: path.length - 1,
            progress: 1,
          };
        }

        const newStart = path[segmentIndex];
        const newEnd = path[segmentIndex + 1];

        const t = progress;
        const newX =
          newStart.x_cm +
          (newEnd.x_cm - newStart.x_cm) * (newEnd.type === "reto" ? t : 0);
        const newY =
          newStart.y_cm +
          (newEnd.y_cm - newStart.y_cm) * (newEnd.type === "reto" ? t : 0);

        let angleDiff = newEnd.angle - newStart.angle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        const newAngle =
          newStart.angle + angleDiff * (newEnd.type === "giro" ? t : 0);

        animationFrameRef.current = requestAnimationFrame(animate);
        return {
          ...s,
          x_cm: newX,
          y_cm: newY,
          angle: newAngle,
          segmentIndex,
          progress,
        };
      });
    },
    [path, speed]
  );

  const play = () => {
    setRobotState((s) => {
      if (s.isRunning) return s;
      // If at the end, reset before playing
      if (s.segmentIndex >= path.length - 1) {
        lastTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
        return { ...getInitialState(path), isRunning: true };
      }
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
      return { ...s, isRunning: true };
    });
  };

  const pause = () => {
    setRobotState((s) => ({ ...s, isRunning: false }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
  };

  const reset = () => {
    pause();
    setRobotState(getInitialState(path));
  };

  useEffect(() => {
    // Reset if movements change, which recalculates the path
    reset();
  }, [path]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return { robotState, path, play, pause, reset, mousePos, setMousePos };
};
