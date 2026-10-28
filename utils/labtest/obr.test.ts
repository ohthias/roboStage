import assert from "node:assert/strict";
import { emptyRound, breakdown } from "../competitions/obr/scoring";
import {
  buildObrResult,
  depositContributions,
  emptyAttempts,
  failureHeat,
  hazardRates,
  normalizeObrResult,
  rescueTimes,
  validateObrResult,
} from "./obr";
import { computeCalc } from "./calc";
import { sampleProject } from "../quickbrick/ArenaBuilder/project";

const base = () => {
  const round = emptyRound();
  round.hazards.gangorras = 2; // 40
  round.hazards.gaps = 1; // 10
  round.checkpoints = [{ tiles: 4, attempt: 1 }]; // 20
  round.chegada = true;
  round.tempo = 200;
  const attempts = { ...emptyAttempts(), gangorras: 3, gaps: 2 };
  return { round, attempts };
};

// 1) Placar igual ao do Pontuador, com falhas e vítimas derivadas
{
  const { round, attempts } = base();
  const r = buildObrResult({
    round,
    attempts,
    failures: [
      { t: 30, kind: "falha", tile: { board: 1, cell: 4 }, checkpoint: 1 },
      { t: 90, kind: "desistencia", tile: null, checkpoint: 2 },
    ],
    rescue: {
      entrySec: 150,
      captureAttempts: 4,
      deposits: [
        { t: 170, kind: "viva", area: "correta" },
        { t: 230, kind: "morta", area: "correta" },
      ],
    },
    elapsedSec: 250,
  });
  assert.equal(r.round.falhas, 1, "só falhas de progresso contam");
  assert.equal(r.round.vivasVerde, 1);
  assert.equal(r.round.mortasVermelha, 1);
  const expected = breakdown({ ...round, falhas: 1, vivasVerde: 1, mortasVermelha: 1 });
  assert.equal(r.scores.total, expected.total);
  // base = 40+10+20+5 + (60-5) = 130 ; ×1,69 → 220 (219,7 arredonda para cima)
  assert.equal(r.scores.base, 130);
  assert.equal(r.scores.total, 220);

  // 2) Validação aceita o pacote certo e recusa total adulterado
  const arena = sampleProject();
  const tile = arena.boards[0].tiles.findIndex((t) => t.shape !== "empty");
  r.failures[0].tile = { board: 1, cell: tile };
  assert.equal(validateObrResult(r, arena).scores.total, 220);
  assert.throws(() => validateObrResult({ ...r, scores: { ...r.scores, total: 999 } }, arena));
  assert.throws(() => validateObrResult({ ...r, round: { ...r.round, falhas: 3 } }, arena));
  assert.throws(() => validateObrResult(r, null), /ladrilho/);

  // 3) Análise
  const rates = hazardRates([r]);
  assert.equal(rates.find((x) => x.key === "gangorras")!.rate, 66.7);
  assert.equal(rates.find((x) => x.key === "gaps")!.rate, 50);
  const heat = failureHeat([r]);
  assert.equal(heat.checkpoints.get(2), 1);
  assert.deepEqual(rescueTimes(r).perVictim, [20, 60]);
  const contrib = depositContributions(r);
  assert.equal(contrib.length, 2);
  assert.ok(contrib.every((c) => c.gain > 0));

  // 4) Leitura defensiva: tentativas nunca menores que superados
  const n = normalizeObrResult({ ...r, attempts: { gangorras: 0 } })!;
  assert.equal(n.attempts.gangorras, 2);
}

// 5) Campos calculados
assert.equal(computeCalc("ratio:a/b", { a: 2, b: 3 }), 66.7);
assert.equal(computeCalc("per:a/b", { a: 3, b: 4 }), 0.75);
assert.equal(computeCalc("ratio:a/b", { a: 2, b: 0 }), null);
assert.equal(computeCalc("mingap:p,b,v", { p: 8, b: 92, v: 30 }), 22);
assert.equal(computeCalc("mingap:p,b", { p: 8 }), null);

console.log("obr.test: ok");
