// Gera features/labtest/lib/mission-images.ts a partir de data/leagues/fll/seasons/*.json.
// Os cards do LabTest só precisam da imagem de cada missão; importar o
// catálogo inteiro levava o catálogo todo para o JavaScript do cliente.
//
// Rode depois de editar as temporadas:  npm run data:mission-images
// (tests/mission-images.test.ts falha se o arquivo gerado estiver desatualizado)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const SEASONS_DIR = new URL("data/leagues/fll/seasons/", root);

/** Mesma ordem de MISSIONS_CATALOG em lib/data/static-data.ts. Temporada fora da lista vai no fim. */
export const SEASON_ORDER = ["masterpiece", "submerged", "unearthed", "bioglow"];

/** Catálogo `{ [temporada]: missões[] }` lido de data/leagues/fll/seasons/. */
export function readMissionCatalog() {
  const names = readdirSync(SEASONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -5));
  const rank = (n) => (SEASON_ORDER.includes(n) ? SEASON_ORDER.indexOf(n) : SEASON_ORDER.length);
  names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return Object.fromEntries(
    names.map((n) => [n, JSON.parse(readFileSync(new URL(`${n}.json`, SEASONS_DIR), "utf8"))]),
  );
}

export function buildMissionImages(data) {
  const out = {};
  for (const [season, missions] of Object.entries(data)) {
    const images = Object.fromEntries(
      (missions ?? []).filter((m) => m?.id && m.image).map((m) => [m.id, m.image]),
    );
    if (Object.keys(images).length) out[season] = images;
  }
  return out;
}

export function renderMissionImages(data) {
  return `// Gerado por scripts/generate-mission-images.mjs a partir de data/leagues/fll/seasons/*.json.
// Não edite à mão: rode \`npm run data:mission-images\`.

/** Imagem de cada missão, por temporada: \`MISSION_IMAGES[temporada][idDaMissão]\`. */
export const MISSION_IMAGES: Record<string, Record<string, string>> = ${JSON.stringify(buildMissionImages(data), null, 2)};
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL("features/labtest/lib/mission-images.ts", root), renderMissionImages(readMissionCatalog()));
  console.log("features/labtest/lib/mission-images.ts atualizado.");
}
