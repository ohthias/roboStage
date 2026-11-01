// Gera utils/labtest/mission-images.ts a partir de public/data/missions.json.
// Os cards do LabTest só precisam da imagem de cada missão; importar o
// missions.json inteiro levava o catálogo todo para o JavaScript do cliente.
//
// Rode depois de editar missions.json:  npm run data:mission-images
// (tests/mission-images.test.ts falha se o arquivo gerado estiver desatualizado)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("public/data/missions.json", root), "utf8"));

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
  return `// Gerado por scripts/generate-mission-images.mjs a partir de public/data/missions.json.
// Não edite à mão: rode \`npm run data:mission-images\`.

/** Imagem de cada missão, por temporada: \`MISSION_IMAGES[temporada][idDaMissão]\`. */
export const MISSION_IMAGES: Record<string, Record<string, string>> = ${JSON.stringify(buildMissionImages(data), null, 2)};
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL("utils/labtest/mission-images.ts", root), renderMissionImages(catalog));
  console.log("utils/labtest/mission-images.ts atualizado.");
}
