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

function LineArt({ shape }: { shape: Shape }) {
  const p = { stroke: INK, strokeWidth: LINE_W, fill: "none" } as const;
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


/** gap: trecho sem linha (até 10 cm), posicionado conforme o formato */
function GapArt({ shape }: { shape: Shape }) {
  if (shape === "curve")
    return (
      <g>
        <circle cx="19.1" cy="10.9" r="3.6" fill="#fff" />
        <circle cx="19.1" cy="10.9" r="3.6" fill="none" stroke="#94a3b8" strokeWidth=".3" strokeDasharray="1 .8" />
      </g>
    );
  if (shape === "tee" || shape === "cross")
    return (
      <g>
        <rect x="12" y="20" width="6" height="7" fill="#fff" />
        <path d="M12.5 20H17.5M12.5 27H17.5" stroke="#94a3b8" strokeWidth=".3" />
      </g>
    );
  return (
    <g>
      <rect x="12" y="10" width="6" height="10" fill="#fff" />
      <path d="M12.5 10H17.5M12.5 20H17.5" stroke="#94a3b8" strokeWidth=".3" />
    </g>
  );
}

/** lombada: faixas atravessando a linha */
function BumpArt({ shape }: { shape: Shape }) {
  const f = { fill: "#f59e0b", stroke: "#b45309", strokeWidth: 0.3 } as const;
  if (shape === "curve")
    return (
      <g transform="translate(19.1 10.9) rotate(45)">
        <rect x="-2.6" y="-4.5" width="2" height="9" rx="1" {...f} />
        <rect x="0.6" y="-4.5" width="2" height="9" rx="1" {...f} />
      </g>
    );
  if (shape === "tee" || shape === "cross")
    return (
      <g>
        <rect x="9" y="21.5" width="12" height="2" rx="1" {...f} />
        <rect x="9" y="25.5" width="12" height="2" rx="1" {...f} />
      </g>
    );
  return (
    <g>
      <rect x="3" y="21.5" width="24" height="2" rx="1" {...f} />
      <rect x="3" y="25.5" width="24" height="2" rx="1" {...f} />
    </g>
  );
}

/** Desenha um ladrilho em coordenadas locais de 30 x 30 (cm). */
export function TileArt({ tile }: { tile: Tile }) {
  const { shape, rot, hazards, markL, markR } = tile;
  if (shape === "empty") return null;
  const has = (h: string) => hazards.includes(h as never);
  const inter = shape === "tee" || shape === "cross";

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

        {inter && markL && <rect x="11.25" y="16.25" width="2.5" height="2.5" fill="#16a34a" />}
        {inter && markR && <rect x="16.25" y="16.25" width="2.5" height="2.5" fill="#16a34a" />}
        {shape === "cross" && tile.markTL && <rect x="11.25" y="11.25" width="2.5" height="2.5" fill="#16a34a" />}
        {shape === "cross" && tile.markTR && <rect x="16.25" y="11.25" width="2.5" height="2.5" fill="#16a34a" />}

        {has("gap") && <GapArt shape={shape} />}
        {has("bump") && <BumpArt shape={shape} />}
        {has("obstacle") && (
          <g>
            <rect x="9.5" y="9.5" width="11" height="11" rx="1" fill="#b45309" stroke="#78350f" strokeWidth=".4" />
            <path d="M9.5 15H20.5M15 9.5V15M12.2 15V20.5M17.8 15V20.5" stroke="#78350f" strokeWidth=".3" />
          </g>
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
