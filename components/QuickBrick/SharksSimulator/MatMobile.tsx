"use client";
import React, { useRef, useMemo, useCallback } from "react";
import { TAPETE_WIDTH_CM, TAPETE_HEIGHT_CM } from "./constants";
import { PathPoint, RobotState, RobotConfig } from "@/types/SharksSimulator.types";
import { cmToPct, pxToCm } from "./engine.service";

interface MatMobileProps {
  trajectory: PathPoint[];
  robotState: RobotState;
  robotConfig: RobotConfig;
  scale: number;
  isMoving: boolean;
  time: number;
  /** Tap on empty mat area -> add a new point driving the robot there. */
  onTap: (xCm: number, yCm: number) => void;
  /** Tap on an existing waypoint marker -> select it for editing. */
  onSelectWaypoint: (commandTrajectoryIndex: number) => void;
  selectedTrajectoryIndex: number | null;
  /** When true, taps move the START position instead of adding a point. */
  isSettingStart?: boolean;
}

const MatMobile: React.FC<MatMobileProps> = ({
  trajectory,
  robotState,
  robotConfig,
  scale,
  isMoving,
  time,
  onTap,
  onSelectWaypoint,
  selectedTrajectoryIndex,
  isSettingStart = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // --- Metadata for "traveled so far" highlighting -------------------------
  const trajectoryMetadata = useMemo(() => {
    let accumulated = 0;
    return trajectory.map((point, i) => {
      let duration = 0;
      if (i > 0) {
        const prev = trajectory[i - 1];
        if (point.type === "reto") {
          const dist = Math.hypot(point.x - prev.x, point.y - prev.y);
          duration = dist / Math.max(point.velocity || 30, 0.1);
        } else if (point.type === "giro") {
          const diff = Math.abs(point.angle - prev.angle);
          duration = diff / Math.max(point.velocity || 90, 1);
        }
      }
      accumulated += duration;
      return { totalTime: accumulated };
    });
  }, [trajectory]);

  const fullPathString = useMemo(() => {
    if (trajectory.length === 0) return "";
    return trajectory.map((p) => { const pos = cmToPct(p.x, p.y); return `${pos.x},${pos.y}`; }).join(" ");
  }, [trajectory]);

  const traveledPathString = useMemo(() => {
    if (trajectory.length === 0) return "";
    const passed: PathPoint[] = [trajectory[0]];
    for (let i = 1; i < trajectory.length; i++) {
      if (trajectoryMetadata[i].totalTime <= time) passed.push(trajectory[i]);
      else break;
    }
    passed.push({ ...robotState, type: "reto" } as PathPoint);
    return passed.map((p) => { const pos = cmToPct(p.x, p.y); return `${pos.x},${pos.y}`; }).join(" ");
  }, [trajectory, trajectoryMetadata, time, robotState]);

  // --- Touch handling: distinguish a tap from a scroll/drag ----------------
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current || !pointerDownPos.current) return;
      const moved = Math.hypot(
        e.clientX - pointerDownPos.current.x,
        e.clientY - pointerDownPos.current.y,
      );
      pointerDownPos.current = null;
      if (moved > 10) return; // treat as a scroll/drag gesture, not a tap

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cm = pxToCm(x, y, rect.width, rect.height);
      onTap(cm.x, cm.y);
    },
    [onTap],
  );

  const currentPos = cmToPct(robotState.x, robotState.y);

  const robotWidthPx = (robotConfig?.widthCm || 18) * scale;
  const robotHeightPx = (robotConfig?.lengthCm || 22) * scale;
  const robotColor = robotConfig?.color || "#06b6d4";
  const robotShape = robotConfig?.shape || "tank";

  const glowStyle = isMoving
    ? { filter: `drop-shadow(0 0 12px ${robotColor}60)` }
    : { filter: "drop-shadow(0 3px 5px rgb(0 0 0 / 0.5))" };

  return (
    <div className="relative select-none touch-none">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
          width: `${TAPETE_WIDTH_CM * scale}px`,
          height: `${TAPETE_HEIGHT_CM * scale}px`,
          background: 'url("/images/QuickBrick/quickbrick_robottrack.png")',
          backgroundSize: "cover",
          touchAction: "none",
          cursor: isSettingStart ? "crosshair" : "pointer",
        }}
        className="relative mx-auto overflow-visible rounded-lg border border-base-content/10"
      >
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="mgrid-small" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(23,23,23,0.03)" strokeWidth="0.5" />
              </pattern>
              <pattern id="mgrid-large" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="url(#mgrid-small)" />
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(26,25,25,0.08)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mgrid-large)" />
          </svg>
        </div>

        {/* Path + waypoints */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 pointer-events-auto"
          style={{ overflow: "visible" }}
        >
          {fullPathString && (
            <>
              <polyline
                points={fullPathString}
                fill="none"
                stroke={robotColor}
                strokeOpacity="0.25"
                strokeWidth="1.2"
                strokeDasharray="2 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {traveledPathString && (
                <polyline
                  points={traveledPathString}
                  fill="none"
                  stroke={robotColor}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </>
          )}

          {trajectory.map((p, i) => {
            const pos = cmToPct(p.x, p.y);
            const isStart = i === 0;
            const isEnd = i === trajectory.length - 1;
            const isSelected = selectedTrajectoryIndex === i;
            const isPassed = trajectoryMetadata[i].totalTime <= time;

            // Only "reto"/end-of-waypoint points are tappable targets — turn-only
            // points sit on top of the previous position so they'd be redundant taps.
            const tappable = !isStart;

            return (
              <g key={i} transform={`translate(${pos.x} ${pos.y})`}>
                {/* Generous invisible hit target for fingers */}
                {tappable && (
                  <circle
                    r="6"
                    fill="transparent"
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      onSelectWaypoint(i);
                    }}
                  />
                )}

                {isStart ? (
                  <g vectorEffect="non-scaling-stroke">
                    <circle r="2.2" stroke="#10b981" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke" />
                    <circle r="1" fill="#10b981" vectorEffect="non-scaling-stroke" />
                  </g>
                ) : isEnd ? (
                  <g vectorEffect="non-scaling-stroke">
                    <circle r="2.8" fill="#ef4444" fillOpacity="0.2" className={isMoving ? "" : "animate-pulse"} vectorEffect="non-scaling-stroke" />
                    <circle r="1.4" fill="#ef4444" stroke="#0f172a" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  </g>
                ) : (
                  <circle
                    r={isSelected ? "1.8" : "1.3"}
                    fill={isSelected ? "#fff" : isPassed ? robotColor : "#475569"}
                    fillOpacity={isSelected ? 1 : isPassed ? 1 : 0.55}
                    stroke={isSelected ? robotColor : "none"}
                    strokeWidth={isSelected ? "0.6" : "0"}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Robot */}
        <div
          style={{
            position: "absolute",
            left: `${currentPos.x}%`,
            top: `${currentPos.y}%`,
            width: `${robotWidthPx}px`,
            height: `${robotHeightPx}px`,
            transform: `translate(-50%, -50%) rotate(${robotState.angle}deg)`,
            zIndex: 20,
          }}
          className="flex items-center justify-center pointer-events-none"
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ overflow: "visible", ...glowStyle }}>
            {robotShape === "tank" && (
              <g>
                <rect x="20" y="5" width="60" height="90" fill="#0f172a" rx="4" stroke={robotColor} strokeWidth="2" />
                <path d="M 50 10 L 45 15 L 55 15 Z" fill={robotColor} />
                <rect x="0" y="2" width="16" height="96" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                <rect x="84" y="2" width="16" height="96" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
              </g>
            )}
            {robotShape === "4x4" && (
              <g>
                <path d="M 20 15 L 80 15 L 80 85 L 20 85 Z" fill="#0f172a" stroke={robotColor} strokeWidth="2" strokeLinejoin="round" />
                <path d="M 50 20 L 45 30 L 55 30 Z" fill={robotColor} />
                <rect x="0" y="5" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                <rect x="82" y="5" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                <rect x="0" y="70" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                <rect x="82" y="70" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
              </g>
            )}
            {robotShape === "fwd" && (
              <g>
                <path d="M 25 20 L 75 20 L 70 90 L 30 90 Z" fill="#0f172a" stroke={robotColor} strokeWidth="2" />
                <rect x="0" y="5" width="20" height="35" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
                <rect x="80" y="5" width="20" height="35" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
              </g>
            )}
            {robotShape === "rwd" && (
              <g>
                <path d="M 30 10 L 70 10 L 75 80 L 25 80 Z" fill="#0f172a" stroke={robotColor} strokeWidth="2" />
                <rect x="0" y="60" width="22" height="40" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
                <rect x="78" y="60" width="22" height="40" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
              </g>
            )}
            {robotShape === "custom" && (
              <path
                d={robotConfig?.customPath || "M 50 0 L 100 50 L 50 100 L 0 50 Z"}
                fill="#0f172a"
                stroke={robotColor}
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MatMobile;
