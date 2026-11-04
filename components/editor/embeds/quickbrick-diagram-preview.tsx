"use client";

import { useId } from "react";
import type { Layer } from "@/types/CanvasType";
import type { Risco } from "@/types/MatrizRisco";
import type { HeatPoint, HeatmapConfig } from "@/types/heatmap";
import type { Mission } from "@/types/TableAnalytics";
import type { DiagramKind, SwotQuadrant } from "@/utils/quickbrick/notebook";

/**
 * Imagem estática de um diagrama do QuickBrick, desenhada a partir dos dados
 * salvos (o mesmo jsonb que o editor do diagrama usa). Fica sempre atualizada
 * com o caderno e não carrega os editores interativos dentro da página.
 */

// Mesmo sistema de coordenadas da Estratégia de Mesa (CanvasBoard).
const MAT_W = 900;
const MAT_H = 513;
const MAT_IMAGE = "/images/QuickBrick/Estrategia_fundo.png";

type AnyRecord = Record<string, unknown>;
const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" ? (value as AnyRecord) : {};
const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export function QuickbrickDiagramPreview({ kind, data }: { kind: DiagramKind; data: unknown }) {
  const d = asRecord(data);
  switch (kind) {
    case "estrategia":
      return <StrategyPreview layers={asArray<Layer>(d.layers)} />;
    case "heatmap":
      return (
        <HeatmapPreview
          points={asArray<HeatPoint>(d.points)}
          config={asRecord(d.config) as Partial<HeatmapConfig>}
        />
      );
    case "matriz-risco":
      return <RiskPreview riscos={asArray<Risco>(d.riscos)} />;
    case "swot":
    case "swot-missoes":
      return <SwotPreview swot={asRecord(d.swot)} />;
    case "tabela-missoes":
      return <MissionsPreview missions={asArray<Mission>(d.missions)} />;
  }
}

// ---------------------------------------------------------------------------
// Estratégia de Mesa
// ---------------------------------------------------------------------------

function StrategyPreview({ layers }: { layers: Layer[] }) {
  const visible = layers.filter((layer) => layer.visible !== false);
  return (
    <svg
      viewBox={`0 0 ${MAT_W} ${MAT_H}`}
      className="block h-auto w-full bg-[#d7d8d8]"
      role="img"
      aria-label="Estratégia de mesa"
    >
      <image href={MAT_IMAGE} x={0} y={0} width={MAT_W} height={MAT_H} preserveAspectRatio="none" />
      {visible.map((layer) => (
        <g key={layer.id}>
          {layer.zonesVisible !== false &&
            asArray<Layer["zones"][number]>(layer.zones).map((zone) => (
              <g key={zone.id}>
                <rect
                  x={Math.min(zone.x, zone.x + zone.width)}
                  y={Math.min(zone.y, zone.y + zone.height)}
                  width={Math.abs(zone.width)}
                  height={Math.abs(zone.height)}
                  fill={zone.color}
                  fillOpacity={0.25}
                  stroke={zone.color}
                  strokeWidth={2}
                />
                {zone.name && (
                  <text
                    x={Math.min(zone.x, zone.x + zone.width) + 6}
                    y={Math.min(zone.y, zone.y + zone.height) + 16}
                    fontSize={13}
                    fontWeight={600}
                    fill="#111"
                    stroke="#fff"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {zone.name}
                  </text>
                )}
              </g>
            ))}
          {asArray<Layer["lines"][number]>(layer.lines).map((line) => (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
          {asArray<Layer["freePaths"][number]>(layer.freePaths).map((path) => (
            <polyline
              key={path.id}
              points={asArray<{ x: number; y: number }>(path.points)
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              fill="none"
              stroke={path.color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {asArray<Layer["robots"][number]>(layer.robots).map((robot) => (
            <g key={robot.id} transform={`translate(${robot.x} ${robot.y}) rotate(${robot.rotation ?? 0})`}>
              <rect
                x={-robot.width / 2}
                y={-robot.height / 2}
                width={robot.width}
                height={robot.height}
                fill={robot.color}
                stroke="#fff"
                strokeWidth={2}
              />
              <path
                d={`M ${robot.width / 4} ${-robot.height / 4} L ${robot.width / 2 - 5} 0 L ${robot.width / 4} ${robot.height / 4} Z`}
                fill="#fff"
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Mapa de calor
// ---------------------------------------------------------------------------

function HeatmapPreview({ points, config }: { points: HeatPoint[]; config: Partial<HeatmapConfig> }) {
  const gradientId = `qbheat${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const max = Math.max(1, ...points.map((p) => Number(p.intensity) || 1));
  const radius = Math.max(12, Number(config.brushRadius) || 30);
  const opacity = Math.min(1, Math.max(0.2, Number(config.opacity) || 0.7));
  return (
    <svg
      viewBox={`0 0 ${MAT_W} ${MAT_H}`}
      className="block h-auto w-full bg-[#d7d8d8]"
      role="img"
      aria-label="Mapa de calor"
    >
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
          <stop offset="45%" stopColor="#f59e0b" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
        </radialGradient>
      </defs>
      <image href={MAT_IMAGE} x={0} y={0} width={MAT_W} height={MAT_H} preserveAspectRatio="none" />
      <g style={{ mixBlendMode: "multiply" }}>
        {points.map((p) => (
          <circle
            key={p.id}
            cx={p.x * MAT_W}
            cy={p.y * MAT_H}
            r={radius * (0.7 + 0.6 * ((Number(p.intensity) || 1) / max))}
            fill={`url(#${gradientId})`}
            opacity={opacity * (0.45 + 0.55 * ((Number(p.intensity) || 1) / max))}
          />
        ))}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Matriz de risco (impacto × probabilidade)
// ---------------------------------------------------------------------------

function riskTone(score: number) {
  if (score >= 15) return "bg-red-500/80 text-white";
  if (score >= 8) return "bg-orange-400/70 text-white";
  if (score >= 4) return "bg-yellow-300/70 text-yellow-950";
  return "bg-green-400/50 text-green-950";
}

function RiskPreview({ riscos }: { riscos: Risco[] }) {
  const numbered = riscos.map((r, i) => ({ ...r, n: i + 1 }));
  const at = (impacto: number, prob: number) =>
    numbered.filter((r) => Number(r.impacto) === impacto && Number(r.probabilidade) === prob);
  const top = [...numbered]
    .sort((a, b) => b.impacto * b.probabilidade - a.impacto * a.probabilidade)
    .slice(0, 6);

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
      <div className="flex gap-2">
        <div className="flex items-center">
          <span className="-rotate-180 text-[10px] font-semibold uppercase tracking-wider text-base-content/45 [writing-mode:vertical-rl]">
            Impacto
          </span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].flatMap((impacto) =>
              [1, 2, 3, 4, 5].map((prob) => {
                const items = at(impacto, prob);
                return (
                  <div
                    key={`${impacto}-${prob}`}
                    className={`flex aspect-[4/3] flex-wrap content-center items-center justify-center gap-0.5 rounded-md p-0.5 ${riskTone(impacto * prob)}`}
                  >
                    {items.map((r) => (
                      <span
                        key={r.id}
                        title={r.titulo}
                        className="flex h-5 min-w-5 items-center justify-center rounded-full bg-base-100 px-1 text-[10px] font-bold text-base-content shadow-sm"
                      >
                        {r.n}
                      </span>
                    ))}
                  </div>
                );
              }),
            )}
          </div>
          <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-base-content/45">
            Probabilidade
          </p>
        </div>
      </div>

      <ol className="space-y-1.5 text-xs">
        {top.length === 0 && <li className="text-base-content/45">Nenhum risco cadastrado.</li>}
        {top.map((r) => (
          <li key={r.id} className="flex items-start gap-2">
            <span
              className={`mt-px flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${riskTone(
                r.impacto * r.probabilidade,
              )}`}
            >
              {r.n}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{r.titulo || "Sem título"}</span>
              <span className="text-base-content/50">
                I{r.impacto} × P{r.probabilidade} = {r.impacto * r.probabilidade}
              </span>
            </span>
          </li>
        ))}
        {numbered.length > top.length && (
          <li className="text-base-content/45">+ {numbered.length - top.length} outros</li>
        )}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SWOT (texto ou missões)
// ---------------------------------------------------------------------------

const QUADRANTS: { id: SwotQuadrant; label: string; tone: string }[] = [
  { id: "strengths", label: "Forças", tone: "border-green-500/40 bg-green-500/10" },
  { id: "weaknesses", label: "Fraquezas", tone: "border-red-500/40 bg-red-500/10" },
  { id: "opportunities", label: "Oportunidades", tone: "border-blue-500/40 bg-blue-500/10" },
  { id: "threats", label: "Ameaças", tone: "border-amber-500/40 bg-amber-500/10" },
];

type SwotItem = { id: string; text?: string; name?: string; image?: string };

function SwotPreview({ swot }: { swot: AnyRecord }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {QUADRANTS.map((q) => {
        const items = asArray<SwotItem>(swot[q.id]);
        return (
          <div key={q.id} className={`min-h-24 rounded-xl border p-3 ${q.tone}`}>
            <h5 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/60">
              {q.label} <span className="font-normal text-base-content/40">· {items.length}</span>
            </h5>
            <ul className="space-y-1">
              {items.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center gap-1.5 text-xs leading-snug">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-5 w-5 shrink-0 rounded object-cover" loading="lazy" />
                  ) : (
                    <span className="h-1 w-1 shrink-0 rounded-full bg-base-content/40" />
                  )}
                  <span className="line-clamp-2">{item.text ?? item.name ?? ""}</span>
                </li>
              ))}
              {items.length > 6 && (
                <li className="text-[11px] text-base-content/45">+ {items.length - 6} itens</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabela de missões
// ---------------------------------------------------------------------------

function MissionsPreview({ missions }: { missions: Mission[] }) {
  if (missions.length === 0) {
    return <p className="p-4 text-sm text-base-content/50">Nenhuma missão carregada neste diagrama.</p>;
  }
  const total = missions.reduce((sum, m) => sum + (Number(m.points) || 0), 0);
  const max = missions.reduce((sum, m) => sum + (Number(m.maxPoints) || 0), 0);
  return (
    <div className="p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-2xl font-bold tabular-nums">
          {total}
          {max > 0 && <span className="text-sm font-normal text-base-content/45"> / {max} pts</span>}
        </span>
        <span className="text-xs text-base-content/50">
          {missions.length} {missions.length === 1 ? "missão" : "missões"}
        </span>
      </div>
      <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {missions.slice(0, 16).map((m) => {
          const pts = Number(m.points) || 0;
          const mx = Number(m.maxPoints) || 0;
          return (
            <li key={m.id} className="text-xs">
              <div className="flex justify-between gap-2">
                <span className="truncate">{m.name}</span>
                <span className="shrink-0 tabular-nums text-base-content/60">
                  {pts}
                  {mx > 0 ? `/${mx}` : ""}
                </span>
              </div>
              {mx > 0 && (
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-base-200">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (pts / mx) * 100)}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {missions.length > 16 && (
        <p className="mt-2 text-[11px] text-base-content/45">+ {missions.length - 16} missões</p>
      )}
    </div>
  );
}
