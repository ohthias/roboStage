/** Tipos de liga e temporada usados no projeto todo. */

/** Ligas atendidas. Cada uma tem entrada em COMPETICOES (features/leagues/shared/lib/competicoes.ts). */
export type League = "fll" | "ftc" | "obr";

/** Temporadas FLL com dados em data/leagues/fll/seasons/. */
export type FllSeason = "bioglow" | "unearthed" | "submerged" | "masterpiece";

/** Temporada de qualquer liga (hoje só a FLL tem temporadas com dados próprios). */
export type Season = FllSeason;
