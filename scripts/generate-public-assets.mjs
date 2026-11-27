// Gera lib/assets-manifest.ts com a lista de arquivos de public/.
// Com ela, `asset("/images/...")` dá erro de tipo se o arquivo não existir.
//
// Rode depois de adicionar, mover ou apagar arquivo em public/:  npm run data:assets
// (tests/public-assets.test.ts falha se o arquivo gerado estiver desatualizado)
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const IGNORE = new Set(["README.md", ".DS_Store"]);

export function listPublicFiles(dir = path.join(root, "public"), base = "") {
  return readdirSync(dir)
    .filter((name) => !IGNORE.has(name))
    .flatMap((name) => {
      const full = path.join(dir, name);
      const rel = `${base}/${name}`;
      return statSync(full).isDirectory() ? listPublicFiles(full, rel) : [rel];
    })
    .sort();
}

export function renderPublicAssets(files = listPublicFiles()) {
  return `// Gerado por scripts/generate-public-assets.mjs a partir de public/.
// Não edite à mão: rode \`npm run data:assets\`.

export const PUBLIC_FILES = ${JSON.stringify(files, null, 2)} as const;

/** Qualquer arquivo servido de public/, como URL (\`/images/...\`). */
export type PublicFile = (typeof PUBLIC_FILES)[number];
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(path.join(root, "lib/assets-manifest.ts"), renderPublicAssets());
  console.log("lib/assets-manifest.ts atualizado.");
}
