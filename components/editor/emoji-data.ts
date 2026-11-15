/**
 * Catálogo de emojis (emojibase, rótulos em português + atalhos do GitHub em
 * inglês). Carregado sob demanda: só baixa quando alguém busca um emoji.
 */

export type Emoji = {
  emoji: string;
  label: string;
  group: number;
  /** Texto normalizado usado na busca (rótulo, tags e atalhos). */
  haystack: string;
  shortcodes: string[];
};

export const EMOJI_GROUP_LABELS: Record<number, string> = {
  0: "Rostos e emoções",
  1: "Pessoas",
  3: "Animais e natureza",
  4: "Comida e bebida",
  5: "Viagens e lugares",
  6: "Atividades",
  7: "Objetos",
  8: "Símbolos",
  9: "Bandeiras",
};

/** Mostrados quando a busca está vazia. */
export const POPULAR_EMOJIS = [
  "👍", "✅", "🚀", "🤖", "🔥", "💡", "🎯", "⚠️", "📌", "📝", "🏆", "🎉",
  "😀", "😂", "😍", "🤔", "👀", "🙌", "💪", "👏", "❤️", "⭐", "⚙️", "🔧",
];

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

type CompactEmoji = {
  unicode: string;
  label: string;
  hexcode: string;
  group?: number;
  tags?: string[];
};

let cache: Promise<Emoji[]> | null = null;

export function loadEmojis(): Promise<Emoji[]> {
  cache ??= Promise.all([
    import("emojibase-data/pt/compact.json").then((m) => (m.default ?? m) as unknown as CompactEmoji[]),
    import("emojibase-data/en/shortcodes/github.json").then(
      (m) => (m.default ?? m) as unknown as Record<string, string | string[]>,
    ),
  ])
    .then(([list, github]) =>
      list
        // Sem grupo = indicadores regionais soltos; grupo 2 = tons de pele.
        .filter((e) => typeof e.group === "number" && e.group !== 2)
        .map((e) => {
          const codes = github[e.hexcode];
          const shortcodes = codes ? (Array.isArray(codes) ? codes : [codes]) : [];
          return {
            emoji: e.unicode,
            label: e.label,
            group: e.group!,
            shortcodes,
            haystack: normalizeSearch([e.label, ...(e.tags ?? []), ...shortcodes].join(" ").replace(/_/g, " ")),
          };
        }),
    )
    .catch((error) => {
      cache = null;
      throw error;
    });
  return cache;
}

/** Busca por rótulo/tag/atalho; resultados que começam com o termo vêm antes. */
export function searchEmojis(all: Emoji[], query: string, limit = 48): Emoji[] {
  const q = normalizeSearch(query.trim()).replace(/_/g, " ");
  if (!q) {
    const byChar = new Map(all.map((e) => [e.emoji, e]));
    return POPULAR_EMOJIS.map((c) => byChar.get(c)).filter((e): e is Emoji => !!e).slice(0, limit);
  }
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { e: Emoji; score: number }[] = [];
  for (const e of all) {
    if (!tokens.every((t) => e.haystack.includes(t))) continue;
    const label = normalizeSearch(e.label);
    let score = 3;
    if (e.shortcodes.includes(q.replace(/\s+/g, "_")) || label === q) score = 0;
    else if (label.startsWith(q) || e.shortcodes.some((s) => s.startsWith(q))) score = 1;
    else if (e.haystack.split(" ").some((w) => w.startsWith(tokens[0]))) score = 2;
    scored.push({ e, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.e.label.length - b.e.label.length)
    .slice(0, limit)
    .map((s) => s.e);
}
