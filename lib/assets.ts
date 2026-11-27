/**
 * Ponte entre o código e public/.
 *
 * - `asset("/images/home/canopy.webp")` → URL checada no tipo: se o arquivo
 *   sair de public/, o `tsc` acusa.
 * - `PUBLIC_DIRS` → pastas base, para caminhos montados em tempo de execução.
 *
 * Estrutura de public/: ver public/README.md.
 */
import type { PublicFile } from "./assets-manifest";

export { PUBLIC_FILES, type PublicFile } from "./assets-manifest";

export const asset = <P extends PublicFile>(path: P): P => path;

export const PUBLIC_DIRS = {
  brand: "/brand",
  audio: "/audio",
  docs: "/files/docs",
  downloads: "/files/downloads",
  anatixPybricks: "/files/anatix/pybricks",
  missions: "/images/missions",
  seasons: "/images/seasons",
  stagebookCovers: "/images/products/stagebook/covers",
} as const;

/** Thumb de missão FLL: `missionThumb("bioglow", "01")`. */
export const missionThumb = (season: string, id: string) =>
  `${PUBLIC_DIRS.missions}/${season}/thumb-mission-${id}.png`;

/** Capa pronta do StageBook: `stagebookCover("montanhas")`. */
export const stagebookCover = (id: string) => `${PUBLIC_DIRS.stagebookCovers}/${id}.svg`;
