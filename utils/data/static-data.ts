/**
 * Dados estáticos de public/data lidos no servidor. Importados (e não lidos
 * com `fs` a cada chamada): entram no bundle do servidor no build, então
 * actions e rotas não tocam o disco nem refazem `JSON.parse` por requisição.
 *
 * No cliente, use `utils/data/missions-client.ts`.
 */
import "server-only";

import missions from "@/public/data/missions.json";
import futureEdition from "@/public/data/fll/future-edition.json";
import toolsAbout from "@/public/data/toolsAbout.json";
import type { FEData } from "@/utils/labtest/future-edition";

/** `{ [temporada]: missões[] }`, no formato de public/data/missions.json. */
export const MISSIONS_CATALOG = missions as Record<string, unknown[]>;

export const FUTURE_EDITION_DATA = futureEdition as unknown as FEData;

export const TOOLS_ABOUT = toolsAbout;
