"use client";

// ---------------------------------------------------------------------------
// Detalhe de uma rodada da OBR Resgate no histórico do teste: placar por
// parte, perigos superados × tentativas, falhas e sala de resgate.
// ---------------------------------------------------------------------------

import { HAZARD_KEYS, HAZARD_SHORT, formatSec, rescueTimes, type ObrRoundResult } from "@/utils/labtest/obr";
import { formatNumber } from "@/utils/labtest/chart-data";

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-base-content/8 bg-base-100 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">{label}</p>
      <p className={`mt-0.5 text-sm font-bold tabular-nums ${tone ?? ""}`}>{value}</p>
    </div>
  );
}

export default function ObrEntryDetails({
  result,
  accentText,
}: {
  result: ObrRoundResult;
  accentText: string;
}) {
  const { scores, round, attempts, failures, rescue } = result;
  const times = rescueTimes(result);
  const desistencias = failures.filter((f) => f.kind === "desistencia").length;
  const hazards = HAZARD_KEYS.filter((k) => Math.max(attempts[k], round.hazards[k]) > 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-base-content/40">Placar</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Perigos" value={`${scores.hazards} pts`} />
          <Stat label="Ladrilho de início" value={`${scores.start} pts`} />
          <Stat label="Checkpoints" value={`${scores.checkpoints} pts`} />
          <Stat label="Chegada" value={`${scores.chegada} pts`} />
          <Stat label="Subtotal" value={`${scores.base} pts`} />
          <Stat label="Multiplicador" value={`×${formatNumber(Math.round(scores.multiplier * 100) / 100)}`} />
          <Stat label="Final" value={`${scores.total} pts`} tone={accentText} />
          <Stat label="Tempo" value={formatSec(scores.tempo)} />
        </div>
      </div>

      {hazards.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-base-content/40">
            Perigos (superados / tentativas)
          </p>
          <div className="flex flex-wrap gap-2">
            {hazards.map((k) => {
              const ok = round.hazards[k];
              const tries = Math.max(attempts[k], ok);
              return (
                <span
                  key={k}
                  className={`badge gap-1.5 py-3 ${ok === tries ? "badge-success badge-soft" : "badge-outline"}`}
                >
                  {HAZARD_SHORT[k]} <b className="tabular-nums">{ok}/{tries}</b>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-base-content/40">
          Percurso e resgate
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat
            label="Falhas"
            value={`${round.falhas}${desistencias ? ` · ${desistencias} desist.` : ""}`}
            tone={round.falhas ? "text-error" : undefined}
          />
          <Stat label="Checkpoints passados" value={String(round.checkpoints.length)} />
          <Stat label="Entrada na sala" value={formatSec(times.entry)} />
          <Stat label="Capturas → depósitos" value={`${rescue.deposits.length}/${rescue.captureAttempts}`} />
          <Stat label="Vivas (área verde)" value={String(round.vivasVerde)} />
          <Stat label="Mortas (área vermelha)" value={String(round.mortasVermelha)} />
          <Stat label="Invertidas" value={String(round.invertidas)} />
          <Stat label="Tempo jogado" value={formatSec(result.elapsedSec)} />
        </div>
      </div>

      {(round.surpresa || round.desistiu) && (
        <div className="flex flex-wrap gap-2">
          {round.surpresa && <span className="badge badge-info badge-soft py-3">Desafio surpresa cumprido</span>}
          {round.desistiu && <span className="badge badge-error badge-soft py-3">Rodada encerrada por desistência</span>}
        </div>
      )}
    </div>
  );
}
