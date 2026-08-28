import React, { useState, useRef, useEffect, useMemo } from 'react';
import { IshikawaData, DiagramSettings } from '@/app/(public)/[competicao]/thinklab/ishikawa/ishikawa.types';
import { THEMES } from '@/utils/thinklab/themes';
import { calculateDiagramLayout } from '@/utils/thinklab/diagramLayout';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Move } from 'lucide-react';

interface IshikawaDiagramProps {
  data: IshikawaData;
  settings: DiagramSettings;
  onSelectCause?: (causeText: string) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export const IshikawaDiagram: React.FC<IshikawaDiagramProps> = ({
  data,
  settings,
  onSelectCause,
  svgRef: externalSvgRef,
}) => {
  const internalSvgRef = useRef<SVGSVGElement | null>(null);
  const svgRef = externalSvgRef || internalSvgRef;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Zoom and Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const theme = THEMES[settings.theme] || THEMES['classic-blue'];

  // Dynamically calculate the auto-growing collision-free diagram layout
  const layout = useMemo(() => {
    return calculateDiagramLayout(data.title, data.categories, settings);
  }, [data.title, data.categories, settings]);

  const isRight = settings.fishDirection === 'right';

  // Handle Pan Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.3), 4.0));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const totalCausesCount = useMemo(() => {
    return data.categories.reduce((acc, cat) => acc + cat.causes.length, 0);
  }, [data.categories]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none transition-all card bg-base-100 border-2 border-base-content/20 shadow-xl ishikawa-print-container ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-base-300 p-4 rounded-none border-none'
          : 'rounded-3xl'
      }`}
      style={{ backgroundColor: isFullscreen ? undefined : theme.bg }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Top Left Live Status Pill - daisyUI Badge & Tooltip */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 no-print print:hidden">
        <div className="badge badge-lg gap-2 bg-base-100/90 dark:bg-base-200/90 backdrop-blur-md border-2 border-base-content/20 shadow-md font-bold py-3.5 px-4 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          <span className="truncate max-w-[240px]">{data.title || 'Diagrama Ativo'}</span>
        </div>
        <div className="badge badge-outline gap-1.5 font-bold text-xs py-3.5 px-3 bg-base-100/80">
          <span>{data.categories.length} Categorias</span>
          <span>•</span>
          <span>{totalCausesCount} Causas</span>
        </div>
      </div>

      {/* Floating Canvas Controls - daisyUI Join / Button Group */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 join bg-base-100/95 dark:bg-base-200/95 p-1 rounded-2xl shadow-lg border-2 border-base-content/20 backdrop-blur-md no-print print:hidden">
        <div className="tooltip tooltip-bottom" data-tip="Aproximar (Zoom In)">
          <button
            id="btn-zoom-in"
            onClick={() => setZoom((z) => Math.min(z * 1.2, 4.0))}
            className="btn btn-sm btn-ghost btn-square font-bold"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Afastar (Zoom Out)">
          <button
            id="btn-zoom-out"
            onClick={() => setZoom((z) => Math.max(z / 1.2, 0.3))}
            className="btn btn-sm btn-ghost btn-square font-bold"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs font-mono font-bold px-2 text-center min-w-[50px] text-base-content">
          {Math.round(zoom * 100)}%
        </span>

        <div className="tooltip tooltip-bottom" data-tip="Ajustar e Centralizar (100%)">
          <button
            id="btn-zoom-reset"
            onClick={handleResetZoom}
            className="btn btn-sm btn-ghost btn-square font-bold text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divider divider-horizontal mx-0.5 my-1" />

        <div className="tooltip tooltip-bottom" data-tip={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            className="btn btn-sm btn-ghost btn-square font-bold"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Info badge at bottom-left */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2.5 px-3 py-1.5 bg-base-100/90 dark:bg-base-200/90 backdrop-blur-md rounded-xl shadow-md border-2 border-base-content/20 text-xs font-bold text-base-content no-print print:hidden">
        <span className="flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 opacity-70" />
          Arraste & Zoom Dinâmico
        </span>
        <span className="badge badge-xs badge-info">Auto-ajustável</span>
      </div>

      {/* Main Dynamic Auto-growing SVG Render Area */}
      <div
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out ishikawa-svg-wrapper"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${layout.svgWidth} ${layout.svgHeight}`}
          className="w-full h-full max-w-full max-h-full drop-shadow-lg overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background Grid Pattern */}
            {settings.showGrid && (
              <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1.2" fill={theme.gridColor} />
              </pattern>
            )}

            {/* Marker for Spine Arrow */}
            <marker
              id="spine-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={theme.spineColor} />
            </marker>

            {/* Marker for Cause branch arrow */}
            <marker
              id="bone-arrow"
              viewBox="0 0 8 8"
              refX="4"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <polygon points="0 1, 6 4, 0 7" fill={theme.spineColor} opacity="0.8" />
            </marker>

            {/* Filters */}
            <filter id="card-shadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
            </filter>
            <filter id="glow-root" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Canvas Background Paper */}
          <rect
            x="0"
            y="0"
            width={layout.svgWidth}
            height={layout.svgHeight}
            rx="24"
            fill={theme.paperBg}
            stroke={theme.gridColor}
            strokeWidth="1.5"
          />

          {settings.showGrid && (
            <rect
              x="0"
              y="0"
              width={layout.svgWidth}
              height={layout.svgHeight}
              rx="24"
              fill="url(#grid-pattern)"
            />
          )}

          {/* Decorative Fish Tail Fin at Spine Start */}
          <g id="fish-tail" transform={`translate(${layout.spineStartX}, ${layout.spineY})`}>
            {isRight ? (
              <path
                d="M 0 0 L -60 -55 C -75 -20 -75 20 -60 55 Z"
                fill={theme.spineColor}
                opacity="0.22"
              />
            ) : (
              <path
                d="M 0 0 L 60 -55 C 75 -20 75 20 60 55 Z"
                fill={theme.spineColor}
                opacity="0.22"
              />
            )}
            <circle cx="0" cy="0" r="6" fill={theme.spineColor} />
          </g>

          {/* Central Main Spine (Vertebra central que cresce dinamicamente) */}
          <line
            id="main-spine"
            x1={layout.spineStartX}
            y1={layout.spineY}
            x2={layout.spineEndX}
            y2={layout.spineY}
            stroke={theme.spineColor}
            strokeWidth={settings.spineThickness + 2}
            strokeLinecap="round"
            markerEnd="url(#spine-arrow)"
          />

          {/* Render All Categories (Top and Bottom) */}
          {[...layout.topCategories, ...layout.bottomCategories].map((category) => {
            const catColor =
              theme.categoryColors[category.colorIndex % theme.categoryColors.length] ||
              theme.categoryColors[0];

            return (
              <g
                key={`cat-${category.placement}-${category.id}`}
                id={`category-${category.placement}-${category.id}`}
              >
                {/* Main Bone Rib */}
                <line
                  x1={category.tipX}
                  y1={category.tipY}
                  x2={category.spineAttachX}
                  y2={category.spineAttachY}
                  stroke={catColor.stroke}
                  strokeWidth={settings.spineThickness + 0.5}
                  strokeLinecap="round"
                />

                {/* Spine Joint Circle */}
                <circle
                  cx={category.spineAttachX}
                  cy={category.spineAttachY}
                  r="5"
                  fill={catColor.stroke}
                />

                {/* Category Header Label Box with multi-line support */}
                <g
                  transform={`translate(${category.tipX}, ${category.tipY})`}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <rect
                    x={-category.headerBoxWidth / 2}
                    y={category.placement === 'top' ? -category.headerBoxHeight : 0}
                    width={category.headerBoxWidth}
                    height={category.headerBoxHeight}
                    rx="14"
                    fill={catColor.fill}
                    stroke={catColor.stroke}
                    strokeWidth="2.5"
                    filter="url(#card-shadow)"
                  />

                  {/* Multi-line Category Name */}
                  {category.nameLines.map((line, lIdx) => {
                    const startY =
                      category.placement === 'top'
                        ? -category.headerBoxHeight / 2 -
                          ((category.nameLines.length - 1) * 15) / 2 +
                          5
                        : category.headerBoxHeight / 2 -
                          ((category.nameLines.length - 1) * 15) / 2 +
                          5;

                    return (
                      <text
                        key={`cat-line-${lIdx}`}
                        x={-10}
                        y={startY + lIdx * 15}
                        textAnchor="middle"
                        fill={catColor.text}
                        fontWeight="800"
                        fontSize={12.5 * settings.fontSizeScale}
                        className="font-sans tracking-wide"
                      >
                        {line}
                      </text>
                    );
                  })}

                  {/* Cause counter badge */}
                  <rect
                    x={category.headerBoxWidth / 2 - 28}
                    y={
                      category.placement === 'top'
                        ? -category.headerBoxHeight / 2 - 9
                        : category.headerBoxHeight / 2 - 9
                    }
                    width="22"
                    height="18"
                    rx="9"
                    fill={catColor.badgeBg}
                  />
                  <text
                    x={category.headerBoxWidth / 2 - 17}
                    y={
                      category.placement === 'top'
                        ? -category.headerBoxHeight / 2 + 4
                        : category.headerBoxHeight / 2 + 4
                    }
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill={catColor.badgeText}
                  >
                    {category.causes.length}
                  </text>
                </g>

                {/* Secondary Bones: Causes */}
                {category.causes.map((cause) => {
                  const isHovered = hoveredNode === cause.id;

                  return (
                    <g
                      key={`cause-${cause.id}`}
                      id={`cause-${cause.id}`}
                      onMouseEnter={() => setHoveredNode(cause.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => onSelectCause?.(cause.rawText)}
                      className="cursor-pointer group"
                    >
                      {/* Secondary Cause Line */}
                      <line
                        x1={cause.attachX}
                        y1={cause.attachY}
                        x2={cause.branchEndX}
                        y2={cause.branchEndY}
                        stroke={catColor.stroke}
                        strokeWidth="2"
                        strokeOpacity="0.85"
                      />

                      {/* Anchor dot on bone */}
                      <circle
                        cx={cause.attachX}
                        cy={cause.attachY}
                        r="3.5"
                        fill={catColor.stroke}
                      />

                      {/* Cause Card Pill Background to guarantee readability with no overlap */}
                      <rect
                        x={cause.cardX}
                        y={cause.cardY}
                        width={cause.boxWidth}
                        height={cause.boxHeight}
                        rx="8"
                        fill={
                          cause.isRootCause && settings.showRootCauseHighlights
                            ? '#fee2e2'
                            : isHovered
                            ? theme.paperBg
                            : theme.paperBg
                        }
                        stroke={
                          cause.isRootCause && settings.showRootCauseHighlights
                            ? '#ef4444'
                            : isHovered
                            ? catColor.stroke
                            : 'rgba(0, 0, 0, 0.15)'
                        }
                        strokeWidth={
                          cause.isRootCause && settings.showRootCauseHighlights
                            ? '2'
                            : isHovered
                            ? '1.8'
                            : '1'
                        }
                        filter={
                          cause.isRootCause && settings.showRootCauseHighlights
                            ? 'url(#glow-root)'
                            : 'url(#card-shadow)'
                        }
                        className="transition-all duration-150"
                      />

                      {/* Multi-line Cause Text with <tspan> */}
                      <text
                        x={cause.cardX + 12}
                        y={
                          cause.cardY +
                          cause.boxHeight / 2 -
                          ((cause.lines.length - 1) * 14 * settings.fontSizeScale) / 2 +
                          4
                        }
                        fill={
                          cause.isRootCause
                            ? '#b91c1c'
                            : isHovered
                            ? '#2563eb'
                            : theme.causeText
                        }
                        fontSize={11.5 * settings.fontSizeScale}
                        fontWeight={cause.isRootCause ? '800' : '600'}
                        className="transition-colors duration-150"
                      >
                        {cause.lines.map((line, lIdx) => (
                          <tspan
                            key={`cause-line-${lIdx}`}
                            x={cause.cardX + 12}
                            dy={lIdx === 0 ? 0 : 14 * settings.fontSizeScale}
                          >
                            {lIdx === 0 && cause.isRootCause && '⭐ '}
                            {line}
                          </tspan>
                        ))}
                      </text>

                      {/* Severity indicator pill if defined */}
                      {cause.severity && (
                        <circle
                          cx={cause.cardX + cause.boxWidth - 10}
                          cy={cause.cardY + 10}
                          r="4"
                          fill={
                            cause.severity === 'high'
                              ? '#ef4444'
                              : cause.severity === 'medium'
                              ? '#f59e0b'
                              : '#10b981'
                          }
                        />
                      )}

                      {/* Tertiary Bones: Sub-causes (5 Whys) with Multi-line Wrapping */}
                      {settings.showSubCauses &&
                        cause.subCauses.map((sub) => {
                          const connectorStartY = cause.branchEndY;
                          const connectorMidY = sub.relY + sub.boxHeight / 2;
                          const subAttachX = isRight ? cause.branchEndX + 18 : cause.branchEndX - 18;

                          return (
                            <g key={`sub-${sub.id}`} id={`sub-${sub.id}`}>
                              {/* Sub-cause connector step line */}
                              <path
                                d={`M ${subAttachX} ${connectorStartY} L ${subAttachX} ${connectorMidY} L ${
                                  isRight ? sub.relX : sub.relX + sub.boxWidth
                                } ${connectorMidY}`}
                                fill="none"
                                stroke={theme.subCauseLine}
                                strokeWidth="1.25"
                                strokeDasharray="3 2"
                              />

                              {/* Sub-cause Card */}
                              <rect
                                x={sub.relX}
                                y={sub.relY}
                                width={sub.boxWidth}
                                height={sub.boxHeight}
                                rx="6"
                                fill={theme.paperBg}
                                stroke="rgba(0, 0, 0, 0.12)"
                                strokeWidth="1"
                              />

                              {/* Sub-cause Multi-line Text */}
                              <text
                                x={sub.relX + 8}
                                y={
                                  sub.relY +
                                  sub.boxHeight / 2 -
                                  ((sub.lines.length - 1) * 12 * settings.fontSizeScale) / 2 +
                                  3.5
                                }
                                fill={theme.subCauseText}
                                fontSize={9.5 * settings.fontSizeScale}
                                fontWeight="500"
                                fontStyle="italic"
                              >
                                {sub.lines.map((sLine, sIdx) => (
                                  <tspan
                                    key={`sub-line-${sIdx}`}
                                    x={sub.relX + 8}
                                    dy={sIdx === 0 ? 0 : 12 * settings.fontSizeScale}
                                  >
                                    {sIdx === 0 ? `↳ ${sLine}` : `  ${sLine}`}
                                  </tspan>
                                ))}
                              </text>
                            </g>
                          );
                        })}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* FISH HEAD: Problem / Effect Box with Multi-Line Auto-Wrapping */}
          <g id="fish-head" transform={`translate(${layout.headCenterX}, ${layout.headCenterY})`}>
            {settings.headShape === 'hexagon' ? (
              <polygon
                points={
                  isRight
                    ? `${-layout.headWidth / 2},${-layout.headHeight / 2} ${layout.headWidth / 2 - 30},${-layout.headHeight / 2} ${layout.headWidth / 2 + 20},0 ${layout.headWidth / 2 - 30},${layout.headHeight / 2} ${-layout.headWidth / 2},${layout.headHeight / 2} ${-layout.headWidth / 2 + 20},0`
                    : `${-layout.headWidth / 2 + 30},${-layout.headHeight / 2} ${layout.headWidth / 2},${-layout.headHeight / 2} ${layout.headWidth / 2 - 20},0 ${layout.headWidth / 2},${layout.headHeight / 2} ${-layout.headWidth / 2 + 30},${layout.headHeight / 2} ${-layout.headWidth / 2 - 20},0`
                }
                fill={theme.headBg}
                stroke={theme.headBorder}
                strokeWidth="2.5"
                filter="url(#card-shadow)"
              />
            ) : settings.headShape === 'fish-head' ? (
              <path
                d={
                  isRight
                    ? `M ${-layout.headWidth / 2} ${-layout.headHeight / 2} Q ${layout.headWidth / 4} ${-layout.headHeight / 2 - 5} ${layout.headWidth / 2 + 10} 0 Q ${layout.headWidth / 4} ${layout.headHeight / 2 + 5} ${-layout.headWidth / 2} ${layout.headHeight / 2} C ${-layout.headWidth / 2 + 20} ${layout.headHeight / 4} ${-layout.headWidth / 2 + 20} ${-layout.headHeight / 4} ${-layout.headWidth / 2} ${-layout.headHeight / 2} Z`
                    : `M ${layout.headWidth / 2} ${-layout.headHeight / 2} Q ${-layout.headWidth / 4} ${-layout.headHeight / 2 - 5} ${-layout.headWidth / 2 - 10} 0 Q ${-layout.headWidth / 4} ${layout.headHeight / 2 + 5} ${layout.headWidth / 2} ${layout.headHeight / 2} C ${layout.headWidth / 2 - 20} ${layout.headHeight / 4} ${layout.headWidth / 2 - 20} ${-layout.headHeight / 4} ${layout.headWidth / 2} ${-layout.headHeight / 2} Z`
                }
                fill={theme.headBg}
                stroke={theme.headBorder}
                strokeWidth="2.5"
                filter="url(#card-shadow)"
              />
            ) : (
              <rect
                x={-layout.headWidth / 2}
                y={-layout.headHeight / 2}
                width={layout.headWidth}
                height={layout.headHeight}
                rx="20"
                fill={theme.headBg}
                stroke={theme.headBorder}
                strokeWidth="2.5"
                filter="url(#card-shadow)"
              />
            )}

            {/* Badge "PROBLEMA / EFEITO" */}
            <rect
              x="-65"
              y={-layout.headHeight / 2 + 12}
              width="130"
              height="20"
              rx="10"
              fill="rgba(255, 255, 255, 0.22)"
            />
            <text
              x="0"
              y={-layout.headHeight / 2 + 26}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="800"
              letterSpacing="1.4"
              className="tracking-widest font-mono uppercase"
            >
              PROBLEMA / EFEITO
            </text>

            {/* Multi-line Problem Title */}
            <text
              x="0"
              y={
                2 -
                ((layout.headLines.length - 1) * 19) / 2 +
                12
              }
              textAnchor="middle"
              fill={theme.headText}
              fontWeight="800"
              fontSize="13.5"
              className="font-sans"
            >
              {layout.headLines.map((line, i) => (
                <tspan
                  key={`head-line-${i}`}
                  x="0"
                  dy={i === 0 ? 0 : 19}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
