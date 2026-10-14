"use client";
import { useState } from "react";
import Counter from "./Counter";
import {
  HAZARD_DEFS,
  MAX_MORTAS,
  MAX_VIVAS,
  ROUND_MAX_SECONDS,
  breakdown,
  checkpointRate,
  emptyRound,
  formatTime,
} from "../../../../utils/competitions/obr/scoring";
import type { Round } from "../../../../utils/competitions/obr/types";
import Header from "@/components/UI/Header";

export default function Pontuador() {
  const [r, setR] = useState<Round>(emptyRound);
  const patch = (p: Partial<Round>) => setR((cur) => ({ ...cur, ...p }));
  const b = breakdown(r);
  const mm = Math.floor(r.tempo / 60);
  const ss = r.tempo % 60;

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-3 py-5 sm:space-y-8 sm:px-5 sm:py-8 lg:px-6 lg:py-12">
      <Header
        type="OBR"
        name="Pontuador"
        description="Sua referência para pontuar, acompanhar e avaliar o desempenho nas provas de Resgate da OBR"
        highlight=""
      />

      <main className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* Perigos */}
          <section className="card min-w-0 rounded-2xl bg-base-100 shadow-sm">
            <div className="card-body gap-2">
              <h2 className="card-title">Perigos do trajeto</h2>
              <p className="text-xs opacity-60">
                Cada perigo pontua apenas uma vez por direção do percurso; não
                há pontos em tentativas subsequentes.
              </p>
              {HAZARD_DEFS.map((d) => (
                <Row key={d.key} label={d.label} hint={d.hint}>
                  <Counter
                    value={r.hazards[d.key]}
                    onChange={(n) =>
                      patch({ hazards: { ...r.hazards, [d.key]: n } })
                    }
                  />
                </Row>
              ))}
            </div>
          </section>

          {/* Checkpoints */}
          <section className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body gap-3 p-4 sm:gap-4 sm:p-5">
              <h2 className="card-title">Checkpoints</h2>
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={r.startTile}
                  onChange={(e) => patch({ startTile: e.target.checked })}
                />
                <span>Superou o ladrilho de início (+5)</span>
              </label>
              <p className="text-xs opacity-60">
                Ao alcançar um checkpoint, registre os ladrilhos percorridos
                desde o anterior e a tentativa em que foi superado: 1ª = 5
                pts/ladrilho, 2ª = 3, 3ª = 1, 4ª+ = 0.
              </p>
              {r.checkpoints.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-box bg-base-200 p-3"
                >
                  <span className="badge badge-neutral">CP {i + 1}</span>
                  <label className="flex items-center gap-2 text-sm">
                    Ladrilhos
                    <Counter
                      value={c.tiles}
                      max={60}
                      onChange={(n) =>
                        patch({
                          checkpoints: r.checkpoints.map((x, j) =>
                            j === i ? { ...x, tiles: n } : x,
                          ),
                        })
                      }
                    />
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={c.attempt}
                    onChange={(e) =>
                      patch({
                        checkpoints: r.checkpoints.map((x, j) =>
                          j === i
                            ? { ...x, attempt: Number(e.target.value) }
                            : x,
                        ),
                      })
                    }
                  >
                    <option value={1}>1ª tentativa (5/ladr.)</option>
                    <option value={2}>2ª tentativa (3/ladr.)</option>
                    <option value={3}>3ª tentativa (1/ladr.)</option>
                    <option value={4}>4ª ou mais (0/ladr.)</option>
                  </select>
                  <span className="ml-auto font-mono">
                    +{c.tiles * checkpointRate(c.attempt)}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    aria-label="remover checkpoint"
                    onClick={() =>
                      patch({
                        checkpoints: r.checkpoints.filter((_, j) => j !== i),
                      })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn btn-outline btn-sm self-start"
                onClick={() =>
                  patch({
                    checkpoints: [...r.checkpoints, { tiles: 1, attempt: 1 }],
                  })
                }
              >
                + Checkpoint alcançado
              </button>
            </div>
          </section>

          {/* Resgate */}
          <section className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body gap-2">
              <h2 className="card-title">
                Resgate de vítimas (multiplicadores)
              </h2>
              <Row label="Vítima viva na área verde" hint="×1,3 — há 2 vivas">
                <Counter
                  value={r.vivasVerde}
                  max={MAX_VIVAS}
                  onChange={(n) => patch({ vivasVerde: n })}
                />
              </Row>
              <Row
                label="Vítima morta na área vermelha"
                hint="×1,3 — há 1 morta"
              >
                <Counter
                  value={r.mortasVermelha}
                  max={MAX_MORTAS}
                  onChange={(n) => patch({ mortasVermelha: n })}
                />
              </Row>
              <Row label="Vítima na área invertida" hint="×1,1 (viva ou morta)">
                <Counter
                  value={r.invertidas}
                  max={Math.max(
                    r.invertidas,
                    3 - (r.vivasVerde + r.mortasVermelha),
                  )}
                  onChange={(n) => patch({ invertidas: n })}
                />
              </Row>
              <label className="label cursor-pointer justify-start gap-3 pt-2">
                <input
                  type="checkbox"
                  className="toggle toggle-secondary"
                  checked={r.surpresa}
                  onChange={(e) => patch({ surpresa: e.target.checked })}
                />
                <p className="flex flex-col">
                  Desafio Surpresa demonstrado{" "}
                  <span className="opacity-60">
                    (×1,5 — só na fase Estadual, 2ª e 3ª rodadas)
                  </span>
                </p>
              </label>
            </div>
          </section>

          {/* Chegada e tempo */}
          <section className="card bg-base-100 shadow rounded-2xl">
            <div className="card-body gap-3">
              <h2 className="card-title">Chegada, falhas e tempo</h2>
              <Row
                label="Falhas de Progresso (total)"
                hint="Cada falha reduz 5 pts do ladrilho de chegada"
              >
                <Counter
                  value={r.falhas}
                  max={99}
                  onChange={(n) => patch({ falhas: n })}
                />
              </Row>
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={r.chegada}
                  onChange={(e) =>
                    patch({
                      chegada: e.target.checked,
                      desistiu: e.target.checked ? false : r.desistiu,
                    })
                  }
                />
                <p className="flex flex-col">
                  Parou na faixa vermelha do ladrilho de chegada por ≥ 5 s{" "}
                  <span className="opacity-60">(60 − 5 × falhas)</span>
                </p>
              </label>
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error"
                  checked={r.desistiu}
                  onChange={(e) =>
                    patch({
                      desistiu: e.target.checked,
                      chegada: e.target.checked ? false : r.chegada,
                    })
                  }
                />
                <span>
                  Capitão anunciou FIM DA RODADA{" "}
                  <span className="opacity-60">(tempo = 5:00)</span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Tempo de execução</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  className="input input-bordered input-sm w-16"
                  value={mm}
                  disabled={!r.chegada}
                  onChange={(e) =>
                    patch({
                      tempo: Math.min(
                        ROUND_MAX_SECONDS,
                        Number(e.target.value) * 60 + ss,
                      ),
                    })
                  }
                />
                <span>min</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  className="input input-bordered input-sm w-16"
                  value={ss}
                  disabled={!r.chegada}
                  onChange={(e) =>
                    patch({
                      tempo: Math.min(
                        ROUND_MAX_SECONDS,
                        mm * 60 + Math.min(59, Number(e.target.value)),
                      ),
                    })
                  }
                />
                <span>s</span>
              </div>
              <p className="text-xs opacity-60">
                Sem chegada, desistência ou estouro dos 5 minutos, o tempo
                considerado para desempate é o máximo (5:00).
              </p>
            </div>
          </section>
        </div>

        {/* Resumo */}
        <aside className="lg:sticky lg:top-4 h-fit">
          <div className="card bg-base-100 shadow rounded-none rounded-tl-2xl rounded-br-2xl">
            <div className="card-body gap-2">
              <div className="stats stats-vertical bg-primary text-primary-content">
                <div className="stat">
                  <div className="stat-title text-primary-content/80">
                    Pontuação
                  </div>
                  <div className="stat-value tabular-nums">{b.total}</div>
                  <div className="stat-desc text-primary-content/80">
                    Tempo considerado: {formatTime(b.tempo)}
                  </div>
                </div>
              </div>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td>Perigos do trajeto</td>
                    <td className="text-right font-mono">{b.hazards}</td>
                  </tr>
                  <tr>
                    <td>Ladrilho de início</td>
                    <td className="text-right font-mono">{b.start}</td>
                  </tr>
                  <tr>
                    <td>Checkpoints</td>
                    <td className="text-right font-mono">{b.checkpoints}</td>
                  </tr>
                  <tr>
                    <td>Ladrilho de chegada</td>
                    <td className="text-right font-mono">{b.chegada}</td>
                  </tr>
                  <tr className="font-semibold">
                    <td>Subtotal</td>
                    <td className="text-right font-mono">{b.base}</td>
                  </tr>
                  <tr>
                    <td>
                      Multiplicador
                      {b.multiplierParts.length > 0 && (
                        <div className="text-xs opacity-60">
                          {b.multiplierParts.join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="text-right font-mono">
                      ×
                      {b.multiplier
                        .toFixed(3)
                        .replace(/0+$/, "")
                        .replace(/\.$/, "")}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs opacity-60">
                Resultado arredondado para cima ao inteiro mais próximo.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-b border-base-200 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="font-medium leading-snug">{label}</div>
        {hint && (
          <div className="mt-1 text-xs leading-relaxed opacity-60">{hint}</div>
        )}
      </div>

      <div className="flex shrink-0 items-center self-start sm:self-center">
        {children}
      </div>
    </div>
  );
}
