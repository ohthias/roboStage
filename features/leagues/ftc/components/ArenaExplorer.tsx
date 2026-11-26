"use client";

import { useState } from "react";
import { Box, Info, MapPin, Ruler, Scale, Trophy } from "lucide-react";

import { ARENA_ELEMENTS, type ArenaElement } from "@/features/leagues/ftc/lib/arena";

const KIND_LABEL: Record<ArenaElement["kind"], string> = {
  estrutura: "Estrutura",
  zona: "Zona",
  peca: "Elemento de jogo",
};

/* Campo esquemático: 144 pol = 600 px (1 TILE = 100 px). */
const T = 100;
const F = { x: 70, y: 40 }; // origem do campo dentro do SVG

function isOn(active: string, ...ids: string[]) {
  return ids.includes(active);
}

function FieldSvg({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  const dim = (...ids: string[]) => (isOn(active, ...ids) ? 1 : 0.28);
  const glow = (...ids: string[]) => (isOn(active, ...ids) ? "var(--color-primary)" : "transparent");
  const hit = (id: string) => ({
    onClick: () => onPick(id),
    style: { cursor: "pointer" },
    role: "button" as const,
    "aria-label": ARENA_ELEMENTS.find((e) => e.id === id)?.name,
  });

  const cx = F.x + 3 * T;
  const cy = F.y + 3 * T;
  // HIVE: 49,5 × 39 pol → 206 × 162 px
  const hw = 206;
  const hh = 162;

  return (
    <svg viewBox="0 0 740 680" className="h-auto w-full" role="img" aria-label="Esquema da arena BIOBUZZ">
      <defs>
        <pattern id="tiles" width={T} height={T} patternUnits="userSpaceOnUse" x={F.x} y={F.y}>
          <rect width={T} height={T} fill="var(--color-base-200)" />
          <path d={`M ${T} 0 L 0 0 0 ${T}`} fill="none" stroke="var(--color-base-300)" strokeWidth="2" />
        </pattern>
      </defs>

      {/* ALLIANCE AREAS (fora do campo) */}
      <g opacity={dim("alliance")} {...hit("alliance")}>
        <rect x={8} y={F.y + 120} width={52} height={360} rx={8} fill="#ef4444" fillOpacity="0.18" stroke="#ef4444" strokeWidth="2" />
        <rect x={F.x + 600 + 10} y={F.y + 120} width={52} height={360} rx={8} fill="#3b82f6" fillOpacity="0.18" stroke="#3b82f6" strokeWidth="2" />
        <text x={34} y={F.y + 300} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ef4444" transform={`rotate(-90 34 ${F.y + 300})`}>ALLIANCE AREA</text>
        <text x={F.x + 636} y={F.y + 300} textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b82f6" transform={`rotate(90 ${F.x + 636} ${F.y + 300})`}>ALLIANCE AREA</text>
      </g>

      {/* campo */}
      <rect x={F.x} y={F.y} width={600} height={600} fill="url(#tiles)" stroke="var(--color-base-content)" strokeOpacity="0.5" strokeWidth="4" rx="6" />

      {/* LOADING ZONES */}
      <g opacity={dim("loading")} {...hit("loading")}>
        <rect x={F.x + 2} y={cy - 48} width={46} height={96} fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" />
        <rect x={F.x + 552} y={cy - 48} width={46} height={96} fill="#3b82f6" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" />
        <rect x={F.x - 2} y={cy - 52} width={54} height={104} fill="none" stroke={glow("loading")} strokeWidth="3" rx="4" />
        <rect x={F.x + 548} y={cy - 52} width={54} height={104} fill="none" stroke={glow("loading")} strokeWidth="3" rx="4" />
      </g>

      {/* GARDENS — cantos opostos */}
      <g opacity={dim("garden", "pollen")} {...hit("garden")}>
        <rect x={F.x + 4} y={F.y + 4} width={96} height={12} fill="#3b82f6" fillOpacity="0.55" />
        <rect x={F.x + 500} y={F.y + 584} width={96} height={12} fill="#ef4444" fillOpacity="0.55" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={F.x + 18 + i * 22} cy={F.y + 28} r="7" fill="#facc15" stroke="#a16207" />
            <circle cx={F.x + 514 + i * 22} cy={F.y + 572} r="7" fill="#facc15" stroke="#a16207" />
          </g>
        ))}
        <rect x={F.x} y={F.y} width={104} height={40} fill="none" stroke={glow("garden")} strokeWidth="3" rx="4" />
        <rect x={F.x + 496} y={F.y + 560} width={104} height={40} fill="none" stroke={glow("garden")} strokeWidth="3" rx="4" />
      </g>

      {/* FLOWERS na parede */}
      <g opacity={dim("flower", "pollen", "nectar")} {...hit("flower")}>
        {[
          [F.x + 200, F.y - 2],
          [F.x + 400, F.y - 2],
          [F.x + 200, F.y + 602],
          [F.x + 400, F.y + 602],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="22" fill="var(--color-base-100)" stroke={isOn(active, "flower") ? "var(--color-primary)" : "var(--color-base-content)"} strokeOpacity={isOn(active, "flower") ? 1 : 0.5} strokeWidth="4" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={x} cy={y - 13} rx="6" ry="10" fill="#f472b6" fillOpacity="0.55" transform={`rotate(${a} ${x} ${y})`} />
            ))}
            <circle cx={x} cy={y} r="7" fill="#facc15" stroke="#a16207" />
          </g>
        ))}
      </g>

      {/* HIVE central */}
      <g {...hit("hive")}>
        <rect
          x={cx - hw / 2}
          y={cy - hh / 2}
          width={hw}
          height={hh}
          rx="10"
          fill="var(--color-base-100)"
          stroke={isOn(active, "hive") ? "var(--color-primary)" : "var(--color-base-content)"}
          strokeOpacity={isOn(active, "hive") ? 1 : 0.45}
          strokeWidth="4"
          opacity={dim("hive", "cell", "nectar", "pollen")}
        />
        <line x1={cx} y1={cy - hh / 2} x2={cx} y2={cy + hh / 2} stroke="var(--color-base-content)" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="5 5" />
        {/* HIVE vermelha (esq.) e azul (dir.), com 2 CELLS cada */}
        {[
          { x: cx - hw / 2 + 12, color: "#ef4444" },
          { x: cx + 12, color: "#3b82f6" },
        ].map(({ x, color }) => (
          <g key={color} opacity={dim("hive", "cell", "nectar")}>
            {[0, 1].map((row) => {
              const up = row === 0;
              const y = cy - hh / 2 + 14 + row * 72;
              return (
                <g key={row} {...hit("cell")}>
                  <rect
                    x={x}
                    y={y}
                    width={hw / 2 - 24}
                    height={62}
                    rx="8"
                    fill={color}
                    fillOpacity={up ? 0.28 : 0.1}
                    stroke={isOn(active, "cell") ? "var(--color-primary)" : color}
                    strokeWidth={isOn(active, "cell") ? 3 : 2}
                  />
                  <text x={x + 8} y={y + 16} fontSize="10" fontWeight="700" fill={color}>
                    {up ? "CELL ↑" : "CELL ↓"}
                  </text>
                  {/* AprilTag */}
                  <rect x={x + hw / 2 - 44} y={y + 6} width="14" height="14" fill="var(--color-base-content)" opacity="0.7" />
                  {up &&
                    [0, 1, 2].map((n) => (
                      <circle key={n} cx={x + 18 + n * 22} cy={y + 42} r="9" fill={color} stroke="var(--color-base-100)" strokeWidth="2" opacity={dim("nectar", "cell", "hive")} />
                    ))}
                </g>
              );
            })}
          </g>
        ))}
        <text x={cx} y={cy + hh / 2 + 22} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--color-base-content)" opacity="0.7">
          HIVE
        </text>
      </g>

      {/* robôs com POLLEN pré-carregado */}
      <g opacity={dim("pollen")} {...hit("pollen")}>
        {[
          [F.x + 110, F.y + 150, "#ef4444"],
          [F.x + 110, F.y + 410, "#ef4444"],
          [F.x + 446, F.y + 150, "#3b82f6"],
          [F.x + 446, F.y + 410, "#3b82f6"],
        ].map(([x, y, c], i) => (
          <g key={i}>
            <rect x={Number(x)} y={Number(y)} width="44" height="44" rx="6" fill="var(--color-base-100)" stroke={String(c)} strokeWidth="3" />
            {[0, 1, 2, 3].map((n) => (
              <circle key={n} cx={Number(x) + 12 + (n % 2) * 20} cy={Number(y) + 12 + Math.floor(n / 2) * 20} r="6" fill="#facc15" stroke="#a16207" />
            ))}
          </g>
        ))}
      </g>

      {/* NECTAR na ALLIANCE AREA */}
      <g opacity={dim("nectar", "alliance")} {...hit("nectar")}>
        {[0, 1, 2, 3, 4].map((n) => (
          <g key={n}>
            <circle cx={34} cy={F.y + 150 + n * 22} r="8" fill="#ef4444" stroke="var(--color-base-100)" strokeWidth="2" />
            <circle cx={F.x + 636} cy={F.y + 150 + n * 22} r="8" fill="#3b82f6" stroke="var(--color-base-100)" strokeWidth="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function ArenaExplorer() {
  const [active, setActive] = useState<string>("hive");
  const el = ARENA_ELEMENTS.find((e) => e.id === active) ?? ARENA_ELEMENTS[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
      <div>
        <div className="overflow-hidden rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-3 shadow-[8px_8px_0_0_var(--color-secondary)] sm:p-5">
          <FieldSvg active={active} onPick={setActive} />
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-base-content/50">
          <Info size={14} className="mt-0.5 shrink-0" />
          Esquema fora de escala, para estudo. As posições exatas de FLOWERS, GARDENS e LOADING ZONES estão no Field CAD oficial.
          Toque em um elemento do desenho ou da lista.
        </p>

        <div role="tablist" aria-label="Elementos da arena" className="mt-5 flex flex-wrap gap-2">
          {ARENA_ELEMENTS.map((e) => (
            <button
              key={e.id}
              role="tab"
              aria-selected={active === e.id}
              onClick={() => setActive(e.id)}
              className={`rounded-tl-lg rounded-br-lg border px-3 py-1.5 font-mono text-xs font-bold transition-colors ${
                active === e.id
                  ? "border-primary bg-primary text-primary-content"
                  : "border-base-300 bg-base-100 text-base-content/70 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <article role="tabpanel" className="rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-outline badge-sm gap-1 font-mono">
            {el.kind === "peca" ? <Box size={11} /> : <MapPin size={11} />}
            {KIND_LABEL[el.kind]}
          </span>
          <span className="font-mono text-xs text-base-content/45">“{el.alias}”</span>
        </div>
        <h3 className="mt-3 text-3xl font-bold tracking-tight">{el.name}</h3>
        <p className="mt-3 text-base leading-7 text-base-content/70">{el.summary}</p>

        <ul className="mt-5 space-y-2.5">
          {el.details.map((d) => (
            <li key={d} className="flex gap-3 text-sm leading-6 text-base-content/70">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {d}
            </li>
          ))}
        </ul>

        {el.measures && (
          <p className="mt-5 flex items-start gap-2 rounded-tl-lg rounded-br-lg bg-base-200/70 px-3 py-2 text-xs leading-5 text-base-content/65">
            <Ruler size={14} className="mt-0.5 shrink-0" />
            {el.measures}
          </p>
        )}

        {el.scoring.length > 0 && (
          <div className="mt-6">
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] text-primary">
              <Trophy size={13} /> COMO PONTUAR
            </p>
            <ul className="mt-3 divide-y divide-base-300 rounded-tl-xl rounded-br-xl border border-base-300">
              {el.scoring.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span>
                    {s.label}
                    <span className="ml-2 font-mono text-[10px] uppercase text-base-content/40">{s.when}</span>
                  </span>
                  <span className="shrink-0 font-mono font-bold tabular-nums">{s.points}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {el.rules.length > 0 && (
          <div className="mt-6">
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] text-secondary">
              <Scale size={13} /> REGRAS PARA FICAR DE OLHO
            </p>
            <ul className="mt-3 space-y-2">
              {el.rules.map((r) => (
                <li key={r.code + r.text} className="text-sm leading-6 text-base-content/70">
                  <a
                    href={`https://ftc.game/cm-html#${r.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-2 rounded bg-base-200 px-1.5 py-0.5 font-mono text-xs font-bold hover:text-primary"
                  >
                    {r.code}
                  </a>
                  {r.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
