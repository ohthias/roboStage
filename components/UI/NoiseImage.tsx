import { CSSProperties, ReactNode } from "react";

// ─── SVG noise URL (inline, sem arquivo externo) ───────────────────────────
const makeSvgNoise = (freq = 0.75, octaves = 4) =>
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${octaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ─── Keyframes injetados uma vez no <head> ─────────────────────────────────
let injected = false;
function injectKeyframes() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes noise-grain {
      0%   { transform: translate(0,    0); }
      25%  { transform: translate(-3%,  2%); }
      50%  { transform: translate( 2%, -3%); }
      75%  { transform: translate(-2%, -2%); }
      100% { transform: translate( 3%,  1%); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Tipos ─────────────────────────────────────────────────────────────────
export type NoiseVariant = "static" | "animated" | "gradient" | "hover";

export interface NoiseImageProps {
  /** Variante do efeito de ruído */
  variant?: NoiseVariant;
  /** Frequência base do ruído (0.5 = grosso · 0.85 = fino) */
  frequency?: number;
  /** Número de oitavas do fractal */
  octaves?: number;
  /** Opacidade da camada de noise (0–1) */
  noiseOpacity?: number;
  /** blend mode da camada de noise */
  blendMode?: CSSProperties["mixBlendMode"];
  /** Gradiente escuro na base (só usado em variant="gradient") */
  gradientColor?: string;
  /** Conteúdo: pode ser <img>, <video> ou qualquer filho */
  children?: ReactNode;
  /** Classe extra no container */
  className?: string;
  /** Estilos inline no container */
  style?: CSSProperties;
  /** Largura do container */
  width?: number | string;
  /** Altura do container */
  height?: number | string;
}

// ─── Componente ────────────────────────────────────────────────────────────
export function NoiseImage({
  variant = "static",
  frequency = 0.75,
  octaves = 4,
  noiseOpacity = 0.18,
  blendMode = "overlay",
  gradientColor = "rgba(0,0,0,0.55)",
  children,
  className,
  style,
  width = "100%",
  height = "100%",
}: NoiseImageProps) {
  injectKeyframes();

  const noiseUrl = makeSvgNoise(frequency, octaves);

  // Camada base do container
  const containerStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    width,
    height,
    display: "block",
    ...style,
  };

  // ── Camada de noise (overlay principal) ──────────────────────────────────
  const noiseLayer: CSSProperties = {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage: noiseUrl,
    opacity: noiseOpacity,
    pointerEvents: "none",
    mixBlendMode: blendMode,
    zIndex: 2,
  };

  // ── Animado: noise num wrapper maior para dar tremida ────────────────────
  if (variant === "animated") {
    Object.assign(noiseLayer, {
      inset: "-50%",
      width: "200%",
      height: "200%",
      backgroundImage: makeSvgNoise(0.85, octaves),
      animation: "noise-grain 0.4s steps(2) infinite",
    });
  }

  return (
    <div className={className} style={containerStyle}>
      {/* Conteúdo (img, video, etc.) */}
      <div style={{ width: "100%", height: "100%" }}>{children}</div>

      {/* Gradiente escuro na base (variant === "gradient") */}
      {variant === "gradient" && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, transparent 30%, ${gradientColor} 100%)`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* Camada de noise */}
      {variant !== "hover" && (
        <div aria-hidden style={noiseLayer} />
      )}

      {/* Hover: noise aparece só no :hover via CSS class */}
      {variant === "hover" && (
        <HoverNoiseLayer noiseUrl={noiseUrl} opacity={noiseOpacity} blendMode={blendMode} />
      )}
    </div>
  );
}

// ─── Camada hover com injeção de CSS ──────────────────────────────────────
let hoverInjected = false;
function injectHoverCSS() {
  if (hoverInjected || typeof document === "undefined") return;
  hoverInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    .noise-hover-layer { opacity: 0; transition: opacity 0.3s ease; }
    *:hover > .noise-hover-layer { opacity: 1; }
  `;
  document.head.appendChild(style);
}

function HoverNoiseLayer({
  noiseUrl,
  opacity,
  blendMode,
}: {
  noiseUrl: string;
  opacity: number;
  blendMode: CSSProperties["mixBlendMode"];
}) {
  injectHoverCSS();
  return (
    <div
      aria-hidden
      className="noise-hover-layer"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: noiseUrl,
        pointerEvents: "none",
        mixBlendMode: blendMode,
        zIndex: 2,
        // opacity controlado pelo CSS da classe acima
      }}
    />
  );
}

export default NoiseImage;