/**
 * Identidade visual de cada liga/competição (logo, cor e temporadas sugeridas).
 *
 * As ligas vivem no banco (tabela `leagues`) e são reconhecidas aqui pelo
 * código + nome, do mesmo jeito que `utils/stagebook/league-features.ts`.
 * Ligas sem marca cadastrada caem em `generic` e aparecem com um monograma.
 *
 * Para adicionar o logo de uma liga: coloque o arquivo em
 * `public/images/logos/leagues/<chave>.png` (ou .svg/.webp) e preencha `logo`
 * na entrada correspondente de BRANDS. Use sempre o arquivo oficial da liga.
 */

export type LeagueBrandKey =
  | "fll"
  | "fll-future"
  | "ftc"
  | "frc"
  | "obr"
  | "obr-resgate"
  | "wro"
  | "vex"
  | "generic";

export type LeagueLogo = {
  src: string;
  width: number;
  height: number;
  /** Logo claro/branco: precisa de fundo escuro para aparecer. */
  onDark?: boolean;
  /** Quando o logo é da temporada (e não da liga), mostramos isso como legenda. */
  seasonLabel?: string;
};

export type LeagueBrand = {
  key: LeagueBrandKey;
  logo?: LeagueLogo;
  /** Cor da faixa/sombra do card (variável do tema daisyUI). */
  color: string;
  /** Frase curta exibida abaixo do nome. */
  tagline: string;
  /** Sugestões para o campo "temporada" (a primeira é a atual). */
  seasons: string[];
};

const BRANDS: Record<LeagueBrandKey, Omit<LeagueBrand, "key">> = {
  fll: {
    logo: {
      src: "/images/logos/fll/FLLc_logo_white.png",
      width: 300,
      height: 94,
      onDark: true,
    },
    color: "var(--color-primary)",
    tagline: "Robô de LEGO, missões na mesa e projeto de inovação.",
    seasons: ["2026/2027 · BIOGLOW", "2025/2026 · UNEARTHED", "2024/2025 · SUBMERGED"],
  },
  "fll-future": {
    logo: {
      src: "/images/logos/fll/seasons/bioglow_logo_future_edition.webp",
      width: 1726,
      height: 1225,
      seasonLabel: "Temporada BIOGLOW",
    },
    color: "var(--color-success)",
    tagline: "A nova edição da FIRST LEGO League com SPIKE Prime.",
    seasons: ["2026/2027 · BIOGLOW"],
  },
  ftc: {
    logo: {
      src: "/images/logos/ftc/biobuzz_logo.png",
      width: 1726,
      height: 1227,
      seasonLabel: "Temporada BIOBUZZ",
    },
    color: "var(--color-accent)",
    tagline: "Alianças, robôs de médio porte e partidas 2 × 2.",
    seasons: ["2026/2027 · BIOBUZZ"],
  },
  frc: {
    color: "var(--color-secondary)",
    tagline: "Robôs de grande porte e alianças de três equipes.",
    seasons: [],
  },
  obr: {
    color: "var(--color-secondary)",
    tagline: "Olimpíada Brasileira de Robótica: prática e teórica.",
    seasons: ["2027", "2026"],
  },
  "obr-resgate": {
    color: "var(--color-secondary)",
    tagline: "Modalidade prática: robô autônomo no resgate.",
    seasons: ["2027", "2026"],
  },
  wro: {
    color: "var(--color-info)",
    tagline: "World Robot Olympiad: desafios por categoria e idade.",
    seasons: [],
  },
  vex: {
    color: "var(--color-error)",
    tagline: "VEX IQ e VEX V5: jogos anuais em alianças.",
    seasons: [],
  },
  generic: {
    color: "var(--color-neutral)",
    tagline: "",
    seasons: [],
  },
};

/** Descobre a marca de uma liga pelo código e pelo nome cadastrados. */
export function resolveLeagueBrandKey(league: {
  code: string;
  name: string;
}): LeagueBrandKey {
  const haystack = `${league.code} ${league.name}`.toLowerCase();

  if (/\bftc\b|tech challenge/.test(haystack)) return "ftc";
  if (/\bfrc\b|robotics competition/.test(haystack)) return "frc";
  if (/\b(fll|lego league)\b/.test(haystack) || haystack.includes("fll")) {
    return haystack.includes("future") ? "fll-future" : "fll";
  }
  if (/\bobr\b|olimp[ií]ada brasileira de rob[oó]tica/.test(haystack)) {
    return haystack.includes("resgate") ? "obr-resgate" : "obr";
  }
  if (/\bwro\b|world robot olympiad/.test(haystack)) return "wro";
  if (/\bvex\b/.test(haystack)) return "vex";
  return "generic";
}

export function getLeagueBrand(league: { code: string; name: string }): LeagueBrand {
  const key = resolveLeagueBrandKey(league);
  return { key, ...BRANDS[key] };
}

/** Até 3 letras do código da liga, para o monograma quando não há logo. */
export function leagueMonogram(code: string) {
  const clean = code.replace(/[^\p{L}\p{N}]/gu, "").toUpperCase();
  return clean.slice(0, 3) || "?";
}
