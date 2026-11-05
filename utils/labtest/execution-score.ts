import type { FieldDefinition, TestEntry, TestRecord } from "@/types/labtest.types";
import type { FllMissionDefinition } from "./fll";
import { fllEntryScore, missionsForTest } from "./fll-analysis";
import { isFutureEditionConfig } from "./future-edition";
import { isObrConfig } from "./obr";
import { entryTotal } from "./stats";

/**
 * Pontuação total de cada lançamento, com a MESMA regra da tela do LabTest
 * (histórico em `labtest/[id]/page.tsx`):
 *
 *  - Rodada OBR / partida Future Edition: o placar já gravado.
 *  - FLL "runs" com temporada: Round 2:30 (`roundTotal`) ou a soma das missões.
 *  - Demais testes "runs": soma dos campos numéricos (`entryTotal`).
 *
 * Testes que não são de pontuação (calibração, individual, personalizado)
 * devolvem `null` — somar leituras de sensor não é um "placar".
 */
export function scoreEntries(
  test: TestRecord,
  fields: FieldDefinition[],
  entries: TestEntry[],
  seasonMissions: FllMissionDefinition[] | null,
): Map<string, number | null> {
  const scores = new Map<string, number | null>();
  const config = test.config ?? {};
  const isFe = isFutureEditionConfig(config);
  const isObr = isObrConfig(config);

  if (test.mode !== "runs" && !isFe && !isObr) {
    for (const entry of entries) scores.set(entry.id, null);
    return scores;
  }

  const fllSeason = !isFe && !isObr && test.season ? String(test.season) : null;
  const missions =
    fllSeason && seasonMissions?.length
      ? missionsForTest(seasonMissions, (config as { missions?: unknown }).missions, entries)
      : [];

  for (const entry of entries) {
    if (entry.obrRound) {
      scores.set(entry.id, entry.obrRound.scores.total);
    } else if (entry.futureEdition) {
      scores.set(entry.id, entry.futureEdition.scores.total);
    } else if (missions.length && (typeof entry.roundTotal === "number" || entry.fllAnswers)) {
      scores.set(entry.id, fllEntryScore(missions, entry) ?? entryTotal(entry, fields));
    } else if (typeof entry.roundTotal === "number") {
      scores.set(entry.id, entry.roundTotal);
    } else {
      scores.set(entry.id, entryTotal(entry, fields));
    }
  }
  return scores;
}
