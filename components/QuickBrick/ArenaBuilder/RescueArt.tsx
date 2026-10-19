import {
  cornerTriangle,
  doorGap,
  doorStrip,
  doorStub,
  roomH,
  roomW,
  VICTIM_R,
  WALL_T,
} from "@/utils/quickbrick/ArenaBuilder/rescue";
import type { Door, Rescue } from "@/utils/quickbrick/ArenaBuilder/types";

interface VictimHandlers {
  onDown: (e: React.PointerEvent, id: string) => void;
  onMove: (e: React.PointerEvent) => void;
  onUp: () => void;
}

interface Props {
  rescue: Rescue;
  level: 1 | 2;
  /** cor do fundo atrás da sala (usada nos vãos das portas) */
  bg?: string;
  /** mostra os rótulos ENTRADA / SAÍDA fora da sala */
  labels?: boolean;
  /** vítimas arrastáveis (somente na aba da sala) */
  victimHandlers?: VictimHandlers;
}

function tri(r: Rescue, c: Rescue["green"]) {
  const t = cornerTriangle(r, c);
  return { pts: `${t.corner.join(",")} ${t.a.join(",")} ${t.b.join(",")}`, a: t.a, b: t.b, corner: t.corner };
}

/** Desenha a sala de resgate em coordenadas locais (cm), origem no canto do piso. */
export default function RescueArt({ rescue: r, level, bg = "#e8edf3", labels = false, victimHandlers }: Props) {
  const W = roomW(r);
  const H = roomH(r);
  const g = tri(r, r.green);
  const rd = tri(r, r.red);
  const gaps = [doorGap(r, r.entrance), doorGap(r, r.exit)];
  const stripIn = doorStrip(r, r.entrance);
  const stripOut = doorStrip(r, r.exit);

  const label = (d: Door, text: string) => {
    const stub = doorStub(r, d, 13);
    const anchor = d.wall === "E" ? "start" : d.wall === "W" ? "end" : "middle";
    const dy = d.wall === "N" ? -1 : d.wall === "S" ? 4 : 1.2;
    return (
      <text x={stub.x2} y={stub.y2 + dy} textAnchor={anchor} fontSize="3.6" fontWeight="700" fill="#334155">
        {text}
      </text>
    );
  };

  const hyp = level === 2 ? 2.4 : 0.9;

  return (
    <g>
      {/* paredes (mín. 10 cm de altura, cor clara) */}
      <rect x={-WALL_T} y={-WALL_T} width={W + WALL_T * 2} height={H + WALL_T * 2} fill="#94a3b8" stroke="#475569" strokeWidth=".5" />
      <rect width={W} height={H} fill="#fff" />
      {gaps.map((gp, i) => (
        <rect key={i} x={gp.x} y={gp.y} width={gp.w} height={gp.h} fill={bg} />
      ))}

      {/* quadrícula de lápis */}
      <g stroke="#94a3b8" strokeWidth=".3" strokeDasharray="1.5 1.5">
        {Array.from({ length: W / 30 - 1 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 30} y1="0" x2={(i + 1) * 30} y2={H} />
        ))}
        {Array.from({ length: H / 30 - 1 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * 30} x2={W} y2={(i + 1) * 30} />
        ))}
      </g>

      {/* áreas de resgate */}
      <polygon points={g.pts} fill="#22c55e" fillOpacity=".35" stroke="#15803d" strokeWidth=".5" />
      <line x1={g.a[0]} y1={g.a[1]} x2={g.b[0]} y2={g.b[1]} stroke="#15803d" strokeWidth={hyp} />
      <polygon points={rd.pts} fill="#ef4444" fillOpacity=".35" stroke="#b91c1c" strokeWidth=".5" />
      <line x1={rd.a[0]} y1={rd.a[1]} x2={rd.b[0]} y2={rd.b[1]} stroke="#b91c1c" strokeWidth={hyp} />
      <text
        x={(g.corner[0] * 2 + g.a[0] + g.b[0]) / 4}
        y={(g.corner[1] * 2 + g.a[1] + g.b[1]) / 4}
        textAnchor="middle"
        fontSize="3.4"
        fontWeight="700"
        fill="#14532d"
      >
        VERDE
      </text>
      <text
        x={(rd.corner[0] * 2 + rd.a[0] + rd.b[0]) / 4}
        y={(rd.corner[1] * 2 + rd.a[1] + rd.b[1]) / 4}
        textAnchor="middle"
        fontSize="3.4"
        fontWeight="700"
        fill="#7f1d1d"
      >
        VERM.
      </text>

      {/* fitas e linhas de acesso */}
      <line {...doorStub(r, r.entrance)} stroke="#0f172a" strokeWidth="1.5" />
      <line {...doorStub(r, r.exit)} stroke="#0f172a" strokeWidth="1.5" />
      <rect x={stripIn.x} y={stripIn.y} width={stripIn.w} height={stripIn.h} fill="#cbd5e1" stroke="#64748b" strokeWidth=".25" />
      <rect x={stripOut.x} y={stripOut.y} width={stripOut.w} height={stripOut.h} fill="#0f172a" />
      {labels && label(r.entrance, "ENTRADA")}
      {labels && label(r.exit, "SAÍDA")}

      {/* vítimas */}
      {r.victims.map((v) => (
        <g key={v.id} pointerEvents={victimHandlers ? undefined : "none"}>
          <circle
            cx={v.x}
            cy={v.y}
            r={VICTIM_R}
            fill={v.kind === "alive" ? "url(#silverBall)" : "url(#darkBall)"}
            stroke={v.kind === "alive" ? "#475569" : "#000"}
            strokeWidth=".4"
          />
          {victimHandlers && (
            <circle
              cx={v.x}
              cy={v.y}
              r={VICTIM_R + 2}
              fill="transparent"
              className="no-export cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => victimHandlers.onDown(e, v.id)}
              onPointerMove={victimHandlers.onMove}
              onPointerUp={victimHandlers.onUp}
              onPointerCancel={victimHandlers.onUp}
            />
          )}
        </g>
      ))}
    </g>
  );
}
