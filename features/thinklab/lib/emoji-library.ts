/**
 * Catálogo de emojis para o ThinkLab. Cada emoji vira um elemento `emoji`
 * redimensionável (o tamanho da fonte acompanha a caixa do elemento).
 */
export interface EmojiEntry {
  char: string;
  label: string;
}

export interface EmojiCategory {
  title: string;
  emojis: EmojiEntry[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    title: 'Robótica',
    emojis: [
      { char: '🤖', label: 'robô' },
      { char: '⚙️', label: 'engrenagem' },
      { char: '🔧', label: 'chave inglesa' },
      { char: '🔩', label: 'parafuso' },
      { char: '🛠️', label: 'ferramentas' },
      { char: '🔋', label: 'bateria' },
      { char: '⚡', label: 'energia' },
      { char: '🧲', label: 'ímã' },
      { char: '📡', label: 'sensor antena' },
      { char: '🦾', label: 'braço mecânico' },
      { char: '🚀', label: 'foguete lançamento' },
      { char: '🛰️', label: 'satélite' },
    ],
  },
  {
    title: 'Status',
    emojis: [
      { char: '✅', label: 'concluído ok' },
      { char: '❌', label: 'falhou erro' },
      { char: '⚠️', label: 'atenção risco' },
      { char: '❓', label: 'dúvida pergunta' },
      { char: '💡', label: 'ideia' },
      { char: '🔥', label: 'prioridade urgente' },
      { char: '⭐', label: 'estrela destaque' },
      { char: '🎯', label: 'alvo objetivo missão' },
      { char: '🏁', label: 'chegada fim' },
      { char: '🚧', label: 'em construção' },
      { char: '⏳', label: 'aguardando tempo' },
      { char: '🔁', label: 'repetir iteração' },
    ],
  },
  {
    title: 'Competição',
    emojis: [
      { char: '🏆', label: 'troféu' },
      { char: '🥇', label: 'ouro primeiro' },
      { char: '🥈', label: 'prata segundo' },
      { char: '🥉', label: 'bronze terceiro' },
      { char: '🎖️', label: 'medalha' },
      { char: '⏱️', label: 'cronômetro partida' },
      { char: '📊', label: 'gráfico pontuação' },
      { char: '📈', label: 'subindo melhora' },
      { char: '📉', label: 'caindo piora' },
      { char: '🗓️', label: 'calendário' },
      { char: '📌', label: 'fixar' },
      { char: '📍', label: 'posição local' },
    ],
  },
  {
    title: 'Equipe',
    emojis: [
      { char: '👍', label: 'aprovado' },
      { char: '👎', label: 'reprovado' },
      { char: '👏', label: 'palmas' },
      { char: '🙌', label: 'comemoração' },
      { char: '🤝', label: 'parceria' },
      { char: '👀', label: 'revisar olhar' },
      { char: '🧠', label: 'cérebro estratégia' },
      { char: '💪', label: 'força' },
      { char: '🙋', label: 'voluntário' },
      { char: '🧑‍💻', label: 'programador' },
      { char: '🧑‍🔧', label: 'mecânico' },
      { char: '🎉', label: 'festa' },
    ],
  },
  {
    title: 'Natureza & ciência',
    emojis: [
      { char: '🌱', label: 'broto' },
      { char: '🌿', label: 'folha' },
      { char: '🌳', label: 'árvore' },
      { char: '🍄', label: 'cogumelo' },
      { char: '🌊', label: 'onda água' },
      { char: '🐙', label: 'polvo' },
      { char: '🐠', label: 'peixe' },
      { char: '🦠', label: 'micróbio' },
      { char: '🧬', label: 'dna' },
      { char: '🔬', label: 'microscópio' },
      { char: '🧪', label: 'experimento' },
      { char: '🌍', label: 'planeta terra' },
    ],
  },
];

export const EMOJI_FONT_STACK = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';
