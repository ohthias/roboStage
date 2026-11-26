/**
 * Dados estáticos de data/ lidos no servidor. Importados (e não lidos
 * com `fs` a cada chamada): entram no bundle do servidor no build, então
 * actions e rotas não tocam o disco nem refazem `JSON.parse` por requisição.
 *
 * No cliente, use `lib/data/missions-client.ts`.
 */
import "server-only";

import masterpiece from "@/data/leagues/fll/seasons/masterpiece.json";
import submerged from "@/data/leagues/fll/seasons/submerged.json";
import unearthed from "@/data/leagues/fll/seasons/unearthed.json";
import bioglow from "@/data/leagues/fll/seasons/bioglow.json";
import futureEdition from "@/data/leagues/fll/future-edition.json";
import toolsAbout from "@/data/tools-about.json";
import type { FEData } from "@/features/labtest/lib/future-edition";

/**
 * `{ [temporada]: missões[] }`, um arquivo por temporada em data/leagues/fll/seasons/.
 * Temporada nova: crie o JSON, importe aqui e em SEASON_ORDER de
 * scripts/generate-mission-images.mjs (mesma ordem).
 */
export const MISSIONS_CATALOG: Record<string, unknown[]> = { masterpiece, submerged, unearthed, bioglow };

export const FUTURE_EDITION_DATA = futureEdition as unknown as FEData;

export const TOOLS_ABOUT = toolsAbout;
