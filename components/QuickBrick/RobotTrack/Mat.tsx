
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { TAPETE_WIDTH_CM, TAPETE_HEIGHT_CM } from '@/app/(public)/quickbrick/robot-track/constants';
import { PathPoint, RobotState, RobotConfig } from '@/types/RobotTrackType';
import { cmToPct, pxToCm } from '@/utils/engineRobotTrack';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MatProps {
  trajectory: PathPoint[];
  robotState: RobotState;
  robotConfig: RobotConfig;
  scale: number;
  onMapClick?: (x: number, y: number, isShiftKey: boolean) => void;
  isInteractive?: boolean;
  isSettingStart?: boolean; 
  isMoving?: boolean;
  time?: number; // Current simulation time
}

const Mat: React.FC<MatProps> = ({ 
  trajectory, 
  robotState, 
  robotConfig, 
  scale, 
  onMapClick, 
  isInteractive,
  isSettingStart = false,
  isMoving = false,
  time = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  
  // Pan and Zoom (Drag) state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Track Space key for panning
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // UI State
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);

  // Rotation Arc Visualization
  const [showRotationArc, setShowRotationArc] = useState(false);
  const [arcEndAngle, setArcEndAngle] = useState(0);

  // Track keyboard state for Spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Calculate metadata (time, distance) for each point for the tooltip
  const trajectoryMetadata = useMemo(() => {
    let accumulatedTime = 0;
    return trajectory.map((point, i) => {
      let duration = 0;
      let diff = 0; // distance or angle difference

      if (i > 0) {
        const prev = trajectory[i - 1];
        if (point.type === 'reto') {
          const dx = point.x - prev.x;
          const dy = point.y - prev.y;
          diff = Math.sqrt(dx * dx + dy * dy); // Distance in cm
          const vel = point.velocity || 30;
          duration = diff / Math.max(vel, 0.1);
        } else if (point.type === 'giro') {
          diff = Math.abs(point.angle - prev.angle); // Angle in degrees
          const vel = point.velocity || 90;
          duration = diff / Math.max(vel, 1);
        }
      }

      accumulatedTime += duration;

      return {
        totalTime: accumulatedTime,
        segmentVal: diff,
      };
    });
  }, [trajectory]);

  // --- Path Calculation Logic ---

  // 1. Planned Path (Full trajectory)
  const fullPathString = useMemo(() => {
     if (trajectory.length === 0) return '';
     return trajectory.map(p => {
        const pos = cmToPct(p.x, p.y);
        return `${pos.x},${pos.y}`;
     }).join(' ');
  }, [trajectory]);

  // 2. Traveled Path (Up to current time)
  const traveledPathString = useMemo(() => {
    if (trajectory.length === 0) return '';
    
    // Find all points that we have fully passed
    const passedPoints: PathPoint[] = [trajectory[0]]; // Always include start
    
    for (let i = 1; i < trajectory.length; i++) {
        // Simple check: if the point's scheduled time is <= current time, we passed it
        // Note: This is approximate visualization.
        if (trajectoryMetadata[i].totalTime <= time) {
            passedPoints.push(trajectory[i]);
        } else {
            break;
        }
    }
    
    // Add current robot position as the head of the path
    passedPoints.push({ ...robotState, type: 'reto' } as PathPoint);

    return passedPoints.map(p => {
        const pos = cmToPct(p.x, p.y);
        return `${pos.x},${pos.y}`;
    }).join(' ');
  }, [trajectory, trajectoryMetadata, time, robotState]);


  // --- Event Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click OR Space+Left Click to Pan
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
       e.preventDefault();
       setIsPanning(true);
       setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Handle Panning
    if (isPanning) {
        setPanOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
        return; // Skip other logic while panning
    }

    // Handle Coordinate Tracking
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cmCoords = pxToCm(x, y, rect.width, rect.height);
    setMousePos(cmCoords);

    // Handle Shift+Hover Rotation Arc Logic
    if (e.shiftKey && (isInteractive || isSettingStart)) {
         const dx = cmCoords.x - robotState.x;
         const dy = cmCoords.y - robotState.y;
         // In simulation engine Y is inverted relative to screen (0 is bottom). 
         // But pxToCm handles that. robotState is in CM.
         // engine uses standard math: 0 deg is typically East or North depending on setup.
         // Let's assume standard atan2 (East=0, CCW positive).
         // BUT robotState.angle is likely Nav degrees (North=0, CW positive) or Math.
         // Let's compute simple angle to target.
         
         // Visual adjustment:
         // cmCoords Y is "physical" (0 at bottom). robotState Y is physical.
         // Math.atan2(dy, dx)
         
         const angleRad = Math.atan2(dx, dy); // Using (dx, dy) implies 0 is North (Up), CW is positive-ish
         let angleDeg = (angleRad * 180) / Math.PI;
         setArcEndAngle(angleDeg);
         setShowRotationArc(true);
    } else {
        setShowRotationArc(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isPanning) return; 
    if (!onMapClick || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cmCoords = pxToCm(x, y, rect.width, rect.height);
    onMapClick(cmCoords.x, cmCoords.y, e.shiftKey);
  };

  const currentPos = cmToPct(robotState.x, robotState.y);

  // Background grid pattern
  const gridPattern = (
    <>
      <pattern id="grid-small" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="0.5" />
      </pattern>
      <pattern id="grid-large" width="50" height="50" patternUnits="userSpaceOnUse">
        <rect width="50" height="50" fill="url(#grid-small)" />
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 0, 0, 0.14)" strokeWidth="1" />
      </pattern>
    </>
  );

  // Robot Visuals
  const robotWidthPx = (robotConfig?.widthCm || 18) * scale;
  const robotHeightPx = (robotConfig?.lengthCm || 22) * scale;
  const robotColor = robotConfig?.color || '#06b6d4';
  const robotShape = robotConfig?.shape || 'tank';

  const glowStyle = isMoving 
    ? { filter: `drop-shadow(0 0 15px ${robotColor}60)` } 
    : { filter: 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.5))' };

  // Generate ticks for rulers
  const xTicks = [];
  for (let i = 0; i <= TAPETE_WIDTH_CM; i += 20) xTicks.push(i);
  const yTicks = [];
  for (let i = 0; i <= TAPETE_HEIGHT_CM; i += 20) yTicks.push(i);

  // Determine cursor style
  let cursorStyle = 'default';
  if (isPanning) cursorStyle = 'grabbing';
  else if (isSettingStart) cursorStyle = 'crosshair';
  else if (isInteractive) cursorStyle = 'pointer';

  // Helper for Arc Path
  const getArcPath = (startAngle: number, endAngle: number, radius: number) => {
      // Convert to standard math frame for SVG (0 is Right, CW is positive for SVG screen coords, but we are inside a flipped Y or complex transform?)
      // Let's keep it simple: We draw a path relative to the robot center.
      // 0 deg is Up (North).
      const toRad = (d: number) => (d - 90) * (Math.PI / 180); // Adjusting so 0 is up
      
      const startRad = toRad(startAngle);
      const endRad = toRad(endAngle);
      
      const x1 = 50 + radius * Math.cos(startRad);
      const y1 = 50 + radius * Math.sin(startRad);
      const x2 = 50 + radius * Math.cos(endRad);
      const y2 = 50 + radius * Math.sin(endRad);
      
      // Arc flag logic
      const diff = endAngle - startAngle;
      // normalize
      let dNorm = diff;
      while (dNorm <= -180) dNorm += 360;
      while (dNorm > 180) dNorm -= 360;
      
      const largeArc = Math.abs(dNorm) > 180 ? 1 : 0;
      const sweep = dNorm > 0 ? 1 : 0;
      
      return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2} ${y2} Z`;
  };

  return (
    <div className="relative group/mat overflow-hidden rounded-lg bg-white border border-white/10 select-none overflow-visible">
       {/* Collapsible Info Overlay */}
       <div className="absolute -top-12 left-2 z-50 pointer-events-auto flex flex-col items-start gap-2">
          <div className="card bg-base-200/70 backdrop-blur-md border border-base-200 shadow-lg">
            {/* Header / Toggle */}
            <div className="card-body p-0">
              <button
                onClick={() => setIsInfoCollapsed(!isInfoCollapsed)}
                className="btn btn-ghost btn-block justify-between rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Telemetria</span>
                </div>
                {isInfoCollapsed ? (
                  <ChevronDown size={14} className="text-base-content" />
                ) : (
                  <ChevronUp size={14} className="text-base-content" />
                )}
              </button>

              {/* Content (daisyUI collapse emulation) */}
              <div className={`overflow-hidden transition-all ${isInfoCollapsed ? 'max-h-0 opacity-0' : 'h-full opacity-100'}`}>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <div className="text-[9px] text-base-content opacity-60 uppercase font-bold">POS X/Y</div>
                      <div className="text-primary font-bold text-sm">{robotState.x.toFixed(1)} / {robotState.y.toFixed(1)}</div>
                    </div>

                    <div>
                      <div className="text-[9px] text-base-content opacity-60 uppercase font-bold">ANGLE</div>
                      <div className="text-success font-bold text-sm">{(robotState.angle % 360).toFixed(1)}°</div>
                    </div>
                  </div>

                  {mousePos && (
                    <>
                      <div className="divider my-2" />
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-base-content opacity-60 font-bold">CURSOR</span>
                        <span className="text-neutral">{mousePos.x.toFixed(1)}, {mousePos.y.toFixed(1)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isSettingStart && (
            <div className="alert alert-warning shadow-lg mt-2">
              <div>
                <span className="font-bold text-white">📍 POSIÇÃO INICIAL</span>
                <span className="block text-[10px] text-white/80">Clique no tapete para definir o início</span>
              </div>
            </div>
          )}
        </div>

        {/* Mat Container (Clipped Viewport) */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setMousePos(null);
            setHoveredPointIdx(null);
            setIsPanning(false);
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          style={{
            width: `${TAPETE_WIDTH_CM * scale}px`,
            height: `${TAPETE_HEIGHT_CM * scale}px`,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            cursor: cursorStyle,
            backgroundImage: "url('/images/QuickBrick/quickbrick_robottrack.png')",
            backgroundSize: 'cover',
          }}
          className="relative mx-auto overflow-visible rounded-lg transition-transform duration-75 ease-out"
        >
          {/* Rulers (Inside scaled container to move with Pan) */}
           <div className="absolute -top-6 left-0 w-full h-6 flex justify-between px-2 text-[9px] text-slate-900 font-mono select-none pointer-events-none">
              {xTicks.map(tick => (
                 <div key={tick} style={{ left: `${(tick / TAPETE_WIDTH_CM) * 100}%` }} className="absolute transform -translate-x-1/2 flex flex-col items-center">
                    <span>{tick}</span>
                    <div className="w-px h-1 bg-slate-800"></div>
                 </div>
              ))}
           </div>
           <div className="absolute -left-8 top-0 h-full w-8 flex flex-col justify-between py-2 text-[9px] text-slate-900 font-mono select-none pointer-events-none">
              {yTicks.map(tick => (
                <div key={tick} style={{ top: `${((TAPETE_HEIGHT_CM - tick) / TAPETE_HEIGHT_CM) * 100}%` }} className="absolute transform -translate-y-1/2 w-full flex items-center justify-end pr-1 gap-1">
                    <span>{tick}</span>
                    <div className="w-1 h-px bg-slate-800"></div>
                </div>
              ))}
           </div>


          {/* Grid Layer */}
          <div className="absolute inset-0 pointer-events-none">
              <svg width="100%" height="100%">
                  <defs>{gridPattern}</defs>
                  <rect width="100%" height="100%" fill="url(#grid-large)" />
              </svg>
          </div>

          {/* Visualization Layer */}
          <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              className="absolute inset-0 pointer-events-auto"
              style={{ overflow: 'visible' }}
          >
              {fullPathString && (
                <>
                  {/* --- Planned Path (Remaining) --- */}
                   <polyline 
                      points={fullPathString}
                      fill="none"
                      stroke={robotColor} 
                      strokeOpacity="0.2"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                  />

                  {/* --- Traveled Path (Progress) --- */}
                   {traveledPathString && (
                      <g>
                         {/* Glow */}
                         <polyline 
                            points={traveledPathString}
                            fill="none"
                            stroke={robotColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-30"
                            style={{ filter: 'blur(3px)' }}
                            vectorEffect="non-scaling-stroke"
                        />
                        {/* Core Line */}
                        <polyline 
                            points={traveledPathString}
                            fill="none"
                            stroke={robotColor} 
                            strokeOpacity="1"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                      </g>
                   )}
                </>
              )}
              
              {/* Waypoints */}
              {trajectory.map((p, i) => {
                  const pos = cmToPct(p.x, p.y);
                  const isStart = i === 0;
                  const isEnd = i === trajectory.length - 1;
                  const isHovered = hoveredPointIdx === i;
                  // Has this point been passed?
                  const isPassed = trajectoryMetadata[i].totalTime <= time;
                  
                  return (
                      <g key={i} transform={`translate(${pos.x} ${pos.y})`}>
                          {/* Invisible hover target (larger) */}
                          <circle
                             r="4"
                             fill="transparent"
                             className="cursor-pointer"
                             onMouseEnter={() => setHoveredPointIdx(i)}
                             onMouseLeave={() => setHoveredPointIdx(null)}
                             vectorEffect="non-scaling-stroke"
                          />
                          
                          {/* Visual Points */}
                          {isStart ? (
                             <g vectorEffect="non-scaling-stroke">
                               <circle r="2" stroke="#10b981" strokeWidth="0.5" fill="none" vectorEffect="non-scaling-stroke" />
                               <circle r="0.8" fill="#10b981" vectorEffect="non-scaling-stroke" />
                             </g>
                          ) : isEnd ? (
                             <g vectorEffect="non-scaling-stroke">
                                <circle r="2.5" fill="#ef4444" fillOpacity="0.2" className="animate-pulse" vectorEffect="non-scaling-stroke" />
                                <circle r="1.2" fill="#ef4444" stroke="#0f172a" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                             </g>
                          ) : (
                             <rect 
                               width="1.5" 
                               height="1.5" 
                               x="-0.75" 
                               y="-0.75"
                               fill={isHovered ? '#fff' : (isPassed ? robotColor : '#475569')} 
                               fillOpacity={isHovered ? 1 : (isPassed ? 1 : 0.5)}
                               transform="rotate(45)"
                               className="transition-all duration-200"
                               vectorEffect="non-scaling-stroke"
                               pointerEvents="none"
                             />
                          )}
                      </g>
                  );
              })}
          </svg>
          
           {/* Minimal Tooltip */}
           {hoveredPointIdx !== null && trajectory[hoveredPointIdx] && (
            <div 
              className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full pb-4"
              style={{
                left: `${cmToPct(trajectory[hoveredPointIdx].x, trajectory[hoveredPointIdx].y).x}%`,
                top: `${cmToPct(trajectory[hoveredPointIdx].x, trajectory[hoveredPointIdx].y).y}%`,
              }}
            >
               <div className="bg-base-300/60 backdrop-blur-xl border border-base-200 rounded-lg shadow-2xl p-3 w-32 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-base-200">
                        <span className="text-[9px] font-bold text-primary uppercase">{trajectory[hoveredPointIdx].type}</span>
                        <span className="text-[10px] font-mono text-primary/80">{trajectoryMetadata[hoveredPointIdx].totalTime.toFixed(2)}s</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-base-content">
                      <span>X: {trajectory[hoveredPointIdx].x.toFixed(0)}</span>
                      <span className="text-right">Y: {trajectory[hoveredPointIdx].y.toFixed(0)}</span>
                      {trajectory[hoveredPointIdx].velocity && (
                        <span className="col-span-2 text-secondary">Speed: {trajectory[hoveredPointIdx].velocity}</span>
                      )}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* The Robot */}
          <div
              style={{
                  position: 'absolute',
                  left: `${currentPos.x}%`,
                  top: `${currentPos.y}%`,
                  width: `${robotWidthPx}px`,
                  height: `${robotHeightPx}px`,
                  transform: `translate(-50%, -50%) rotate(${robotState.angle}deg)`,
                  willChange: 'transform, left, top',
                  zIndex: 20
              }}
              className="flex items-center justify-center pointer-events-none"
          >
              <div className="w-full h-full relative flex items-center justify-center">
                  
                  {/* Rotation Arc (Visual Helper) */}
                  {showRotationArc && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-visible" style={{ width: '400%', height: '400%', left: '-150%', top: '-150%' }}>
                         <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: `rotate(${-robotState.angle}deg)` }}>
                             <path 
                                d={getArcPath(0, arcEndAngle - robotState.angle, 25)} 
                                fill={robotColor} 
                                fillOpacity="0.1" 
                                stroke={robotColor} 
                                strokeWidth="0.5" 
                                strokeDasharray="2 2"
                             />
                             {/* Text Label */}
                             <text x="50" y="20" fill="white" fontSize="4" textAnchor="middle" fontWeight="bold">
                                {(arcEndAngle - robotState.angle).toFixed(0)}°
                             </text>
                         </svg>
                      </div>
                  )}

                  <svg 
                      viewBox="0 0 100 100" 
                      preserveAspectRatio="none"
                      className="w-full h-full transition-all duration-300 ease-out"
                      style={{ 
                          overflow: 'visible',
                          ...glowStyle 
                      }}
                  >
                      {/* Bounding Box (Clean minimal lines) */}
                      <g className="transition-opacity duration-300" opacity={isMoving ? "0.1" : "0.3"}>
                          <path d="M 0 20 L 0 0 L 20 0" fill="none" stroke={robotColor} strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                          <path d="M 80 0 L 100 0 L 100 20" fill="none" stroke={robotColor} strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                          <path d="M 100 80 L 100 100 L 80 100" fill="none" stroke={robotColor} strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                          <path d="M 20 100 L 0 100 L 0 80" fill="none" stroke={robotColor} strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                      </g>


                      {/* Robot Shapes */}
                      
                      {/* --- TANK (Esteira) --- */}
                      {robotShape === 'tank' && (
                        <g className={isMoving ? "animate-[vibrate_0.1s_infinite]" : ""}>
                           <rect x="20" y="5" width="60" height="90" fill="#0f172a" rx="4" stroke={robotColor} strokeWidth="2" />
                           <rect x="35" y="25" width="30" height="40" fill={robotColor} fillOpacity="0.1" rx="2" />
                           <path d="M 50 10 L 45 15 L 55 15 Z" fill={robotColor} />

                           <g transform="translate(0, 0)">
                             <rect x="0" y="2" width="16" height="96" rx="4" fill="#1e293b" stroke="none" />
                             <rect x="0" y="2" width="16" height="96" rx="4" fill="none" stroke={robotColor} strokeWidth="1" strokeDasharray="4 4" className={isMoving ? "animate-[dash_0.5s_linear_infinite]" : ""} />
                             <circle cx="8" cy="12" r="4" fill="#334155" />
                             <circle cx="8" cy="88" r="4" fill="#334155" />
                             <circle cx="8" cy="50" r="4" fill="#334155" />
                           </g>

                           <g transform="translate(84, 0)">
                             <rect x="0" y="2" width="16" height="96" rx="4" fill="#1e293b" stroke="none" />
                             <rect x="0" y="2" width="16" height="96" rx="4" fill="none" stroke={robotColor} strokeWidth="1" strokeDasharray="4 4" className={isMoving ? "animate-[dash_0.5s_linear_infinite]" : ""} />
                             <circle cx="8" cy="12" r="4" fill="#334155" />
                             <circle cx="8" cy="88" r="4" fill="#334155" />
                             <circle cx="8" cy="50" r="4" fill="#334155" />
                           </g>

                           {isMoving && (
                             <>
                               <path d="M 30 5 L 30 0" stroke="#fbbf24" strokeWidth="2" className="animate-pulse" />
                               <path d="M 70 5 L 70 0" stroke="#fbbf24" strokeWidth="2" className="animate-pulse" />
                             </>
                           )}
                        </g>
                      )}

                      {/* --- 4x4 Offroad --- */}
                      {robotShape === '4x4' && (
                        <g className={isMoving ? "animate-[vibrate_0.15s_infinite]" : ""}>
                            <path d="M 20 15 L 80 15 L 80 85 L 20 85 Z" fill="#0f172a" stroke={robotColor} strokeWidth="2" strokeLinejoin="round" />
                            <path d="M 20 50 L 80 50" stroke={robotColor} strokeOpacity="0.3" strokeWidth="1" />
                            <circle cx="50" cy="50" r="10" fill={robotColor} fillOpacity="0.2" />
                            <rect x="0" y="5" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                            <rect x="82" y="5" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                            <rect x="0" y="70" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                            <rect x="82" y="70" width="18" height="25" rx="4" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                            <path d="M 50 20 L 45 30 L 55 30 Z" fill={robotColor} />
                        </g>
                      )}
                      
                      {/* --- FWD (Tração Dianteira) --- */}
                      {robotShape === 'fwd' && (
                         <g className={isMoving ? "animate-[vibrate_0.1s_infinite]" : ""}>
                             <path d="M 25 20 L 75 20 L 70 90 L 30 90 Z" fill="#0f172a" stroke={robotColor} strokeWidth="2" />
                             <g transform="translate(0, 5)">
                                <rect x="0" y="0" width="20" height="35" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
                                <rect x="80" y="0" width="20" height="35" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
                             </g>
                             <circle cx="50" cy="85" r="8" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                             <rect x="35" y="30" width="30" height="40" fill="none" stroke={robotColor} strokeOpacity="0.3" rx="2" />
                             {isMoving && (
                                <path d="M 30 20 L 30 15" stroke="#fbbf24" strokeWidth="3" className="animate-pulse" />
                             )}
                             {isMoving && (
                                <path d="M 70 20 L 70 15" stroke="#fbbf24" strokeWidth="3" className="animate-pulse" />
                             )}
                         </g>
                      )}

                       {/* --- RWD (Tração Traseira) --- */}
                       {robotShape === 'rwd' && (
                         <g className={isMoving ? "animate-[vibrate_0.1s_infinite]" : ""}>
                             <path d="M 30 10 L 70 10 L 75 80 L 25 80 Z" fill="#0f172a" stroke={robotColor} strokeWidth="2" />
                             <rect x="5" y="10" width="15" height="20" rx="3" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                             <rect x="80" y="10" width="15" height="20" rx="3" fill="#1e293b" stroke={robotColor} strokeWidth="1" />
                             <g transform="translate(0, 60)">
                                <rect x="0" y="0" width="22" height="40" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
                                <rect x="78" y="0" width="22" height="40" rx="6" fill="#1e293b" stroke={robotColor} strokeWidth="1.5" />
                             </g>
                             <rect x="35" y="85" width="30" height="4" fill={robotColor} />
                             <circle cx="50" cy="40" r="10" fill="none" stroke={robotColor} strokeOpacity="0.3" />
                         </g>
                      )}

                      {robotShape === 'custom' && (
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
                  
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="radar-gradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor={robotColor} stopOpacity="0" />
                         <stop offset="100%" stopColor={robotColor} stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                  </svg>
              </div>
          </div>
        </div>
      <style>{`
        @keyframes vibrate {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-0.5px, 0.5px); }
          50% { transform: translate(0.5px, -0.5px); }
          75% { transform: translate(-0.5px, -0.5px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -12;
          }
        }
      `}</style>
      </div>
  );
};

export default Mat;
