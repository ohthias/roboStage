import { HAZARD_SPOTS, isBuiltinHazard, markSlots } from "@/utils/quickbrick/ArenaBuilder/tiles";
import type { Shape, Tile } from "@/utils/quickbrick/ArenaBuilder/types";

const INK = "#0f172a";
const LINE_W = 1.5; // 1,5 cm de linha

export function SvgDefs() {
  return (
    <defs>
      <linearGradient id="rampGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#e2e8f0" />
        <stop offset="1" stopColor="#94a3b8" />
      </linearGradient>
      <radialGradient id="silverBall" cx="35%" cy="35%" r="70%">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#94a3b8" />
      </radialGradient>
      <radialGradient id="darkBall" cx="35%" cy="35%" r="70%">
        <stop offset="0" stopColor="#64748b" />
        <stop offset="1" stopColor="#0f172a" />
      </radialGradient>
    </defs>
  );
}

/**
 * Ladrilhos de "Sugestões de Ladrilhos" (OBR, v1.0), em cm e na orientação
 * das pranchas: a linha entra pela borda de baixo (centro em x = 15).
 */
const OBR_PATHS: Partial<Record<Shape, string>> = {
  // atravessam (baixo → cima)
  deadEnd: "M15 30V15M7.5 15H22.5",
  dashed: "M15 0V2.5M15 12.5V17.5M15 27.5V30",
  spike: "M15 30V20L10 15L15 10V0",
  wave: "M15 30V26.5C15 23 19 22.5 19 19C19 16.5 17 15 15 15C13 15 11 13.5 11 11C11 7.5 15 7 15 3.5V0",
  zigzag: "M15 0V1L17.2 3.2L12.8 7.6L17.2 12L12.8 16.4L17.2 20.8L12.8 25.2L15 27.4V30",
  chevron: "M15 30L22.5 22.5L8.5 8.5L15 2V0",
  steps: "M15 30V26H19V15H11V4H15V0",
  stairs: "M15 30V26H21V20H27V10H21V4H15V0",
  meander: "M15 30V28.5H8.25V19.5H15V10.5H8.25V1.5H15V0",
  vee: "M15 30L29 15L15 0",
  uturn: "M15 0.75H29.25V29.25H15",
  // viram (baixo → direita)
  corner: "M15 30V15H30",
  diagonal: "M15 30L30 15",
  chamfer: "M15 30V21.5L21.5 15H30",
  jog: "M15 30V20H20V15H30",
  hook: "M15 30V19H11V11H21V15H30",
  edgeCorner: "M15 29.25H29.25V15",
  // laços
  loop: "M15 30V24A9 9 0 1 1 24 15H30",
  frame: "M15 30V22H6V6H24V15H30",
  ring: "M15 30V24M24 15H30M15 24A9 9 0 1 1 15 6A9 9 0 1 1 15 24",
  ringCut: "M15 30V24M24 15H30M15 6A9 9 0 1 1 6 15M6 15H15V6",
  // duas linhas independentes
  doubleDiag: "M15 0L0 15M15 30L30 15",
  curveDiag: "M15 0A15 15 0 0 1 0 15M15 30L30 15",
};

function LineArt({ shape }: { shape: Shape }) {
  const p = { stroke: INK, strokeWidth: LINE_W, fill: "none" } as const;
  const obr = OBR_PATHS[shape];
  if (obr) return <path d={obr} {...p} />;
  switch (shape) {
    case "straight":
    case "silver":
    case "black":
      return <path d="M15 0V30" {...p} />;
    case "curve":
      return <path d="M15 0C15 9 21 15 30 15" {...p} />;
    case "tee":
      return <path d="M0 15H30M15 15V30" {...p} />;
    case "cross":
      return <path d="M0 15H30M15 0V30" {...p} />;
    case "start":
      return <path d="M15 15V0" {...p} />;
    case "finish":
      return <path d="M15 30V15" {...p} />;
    default:
      return null;
  }
}


/** gap: trecho sem linha, apagado ao longo da direção da linha no ponto do formato */
function GapArt({ shape }: { shape: Shape }) {
  const g = HAZARD_SPOTS[shape]?.gap;
  if (!g) return null;
  const w = g.w ?? 6;
  const h = g.len / 2;
  return (
    <g transform={`translate(${g.x} ${g.y}) rotate(${g.a})`}>
      <rect x={-h} y={-w / 2} width={g.len} height={w} fill="#fff" />
      <path
        d={`M${-h} ${-w / 2 + 0.3}V${w / 2 - 0.3}M${h} ${-w / 2 + 0.3}V${w / 2 - 0.3}`}
        stroke="#94a3b8"
        strokeWidth=".3"
        strokeDasharray="1 .8"
      />
    </g>
  );
}

/** lombada: duas faixas atravessando a linha no ponto do formato */
function BumpArt({ shape }: { shape: Shape }) {
  const b = HAZARD_SPOTS[shape]?.bump;
  if (!b) return null;
  const f = { fill: "#f59e0b", stroke: "#b45309", strokeWidth: 0.3 } as const;
  const y = (b.off ?? 0) - b.len / 2;
  return (
    <g transform={`translate(${b.x} ${b.y}) rotate(${b.a})`}>
      <rect x="-2.6" y={y} width="2" height={b.len} rx="1" {...f} />
      <rect x="0.6" y={y} width="2" height={b.len} rx="1" {...f} />
    </g>
  );
}

/** Desenha um ladrilho em coordenadas locais de 30 x 30 (cm). */
export function TileArt({ tile }: { tile: Tile }) {
  const { shape, rot, hazards } = tile;
  if (shape === "empty") return null;
  const has = (h: string) => hazards.includes(h as never);

  return (
    <g>
      <g transform={`rotate(${rot * 90} 15 15)`}>
        {/* base inclinada */}
        {has("ramp") && (
          <g>
            <rect width="30" height="30" fill="url(#rampGrad)" />
            <rect width="1.4" height="30" fill="#64748b" />
            <rect x="28.6" width="1.4" height="30" fill="#64748b" />
            <path d="M10 8L15 3L20 8M10 27L15 22L20 27" stroke="#475569" strokeWidth=".6" fill="none" />
          </g>
        )}
        {has("seesaw") && (
          <g>
            <rect y="0" width="30" height="15" fill="#bae6fd" />
            <rect y="15" width="30" height="15" fill="#7dd3fc" />
          </g>
        )}

        <LineArt shape={shape} />

        {shape === "start" && (
          <rect
            x="8.5"
            y="14"
            width="13"
            height="14"
            rx="1.5"
            fill="none"
            stroke="#2563eb"
            strokeWidth=".5"
            strokeDasharray="1.2 1"
          />
        )}
        {shape === "finish" && <rect x="0" y="13.75" width="30" height="2.5" fill="#dc2626" />}
        {shape === "silver" && (
          <rect x="2.5" y="0" width="25" height="2.5" fill="#cbd5e1" stroke="#64748b" strokeWidth=".25" />
        )}
        {shape === "black" && <rect x="2.5" y="0" width="25" height="2.5" fill={INK} />}

        {has("gap") && !isBuiltinHazard(shape, "gap") && <GapArt shape={shape} />}
        {has("bump") && <BumpArt shape={shape} />}
        {has("obstacle") && (
          <g>
            <rect x="9.5" y="9.5" width="11" height="11" rx="1" fill="#b45309" stroke="#78350f" strokeWidth=".4" />
            <path d="M9.5 15H20.5M15 9.5V15M12.2 15V20.5M17.8 15V20.5" stroke="#78350f" strokeWidth=".3" />
          </g>
        )}
        {markSlots(shape).map(
          (m) => tile[m.key] && <rect key={m.key} x={m.x} y={m.y} width="2.5" height="2.5" fill="#16a34a" />,
        )}
        {has("seesaw") && <rect y="14" width="30" height="2" fill="#0369a1" />}
        {has("passage") && (
          <g fill="#f97316" stroke="#c2410c" strokeWidth=".3">
            <rect x="2" y="11" width="8" height="8" rx=".8" />
            <rect x="11" y="11" width="8" height="8" rx=".8" />
            <rect x="20" y="11" width="8" height="8" rx=".8" />
          </g>
        )}
      </g>

      {(shape === "start" || shape === "finish" || shape === "silver" || shape === "black") && (
        <text
          x={shape === "start" ? 2 : 28}
          y={shape === "start" ? 5.5 : 5.5}
          textAnchor={shape === "start" ? "start" : "end"}
          fontSize="3.4"
          fontWeight="700"
          fill={INK}
          stroke="#fff"
          strokeWidth=".8"
          paintOrder="stroke"
        >
          {shape === "start" ? "INÍCIO" : shape === "finish" ? "CHEGADA" : shape === "silver" ? "PRATA" : "PRETA"}
        </text>
      )}
    </g>
  );
}

/** miniatura para a paleta */
export function TilePreview({ tile, className }: { tile: Tile; className?: string }) {
  return (
    <svg viewBox="-1 -1 32 32" className={className} aria-hidden>
      <SvgDefs />
      <rect x="0" y="0" width="30" height="30" fill="#fff" stroke="#cbd5e1" strokeWidth=".8" />
      <TileArt tile={tile} />
    </svg>
  );
}