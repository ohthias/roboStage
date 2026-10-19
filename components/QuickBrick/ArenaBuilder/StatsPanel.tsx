import type { Analysis, Check, Level } from "@/utils/quickbrick/ArenaBuilder/analysis";

const ICON: Record<Level, string> = { ok: "✓", warn: "!", error: "✕", info: "i" };
const STYLE: Record<Level, string> = {
  ok: "bg-success/20 text-success",
  warn: "bg-warning/25 text-warning-content",
  error: "bg-error/20 text-error",
  info: "bg-info/20 text-info",
};

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {checks.map((c, i) => (
        <li key={i} className="flex items-start gap-2 text-xs leading-snug">
          <span
            className={`mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${STYLE[c.level]}`}
            aria-label={c.level}
          >
            {ICON[c.level]}
          </span>
          <span>{c.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function StatsPanel({ path, rescue }: { path: Analysis; rescue: Check[] }) {
  const errors = [...path.checks, ...rescue].filter((c) => c.level === "error").length;
  return (
    <aside className="flex flex-col gap-4">
      <div className="card card-border bg-base-100 rounded-none rounded-tl-xl rounded-br-xl">
        <div className="card-body gap-2 p-4">
          <div className="stats w-full shadow-none">
            <div className="stat px-0 py-1">
              <div className="stat-title">Pontuação máx. do percurso</div>
              <div className="stat-value text-primary">{path.total}</div>
              <div className="stat-desc">
                {errors === 0 ? "Arena válida segundo as checagens" : `${errors} problema(s) a corrigir`}
              </div>
            </div>
          </div>
          <table className="table table-xs">
            <tbody>
              {path.score.map((l) => (
                <tr key={l.label}>
                  <td>{l.label}</td>
                  <td className="text-right opacity-60">
                    {l.count} × {l.each}
                  </td>
                  <td className="text-right font-semibold">{l.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] opacity-60">
            Considera cada perigo superado uma vez, sem falhas de progresso. Multiplicadores do resgate não estão incluídos.
          </p>
        </div>
      </div>

      <div className="card card-border bg-base-100">
        <div className="card-body gap-2 p-4">
          <h3 className="card-title text-sm">Percurso</h3>
          <CheckList checks={path.checks} />
        </div>
      </div>

      <div className="card card-border bg-base-100">
        <div className="card-body gap-2 p-4">
          <h3 className="card-title text-sm">Sala de resgate</h3>
          <CheckList checks={rescue} />
        </div>
      </div>
    </aside>
  );
}
