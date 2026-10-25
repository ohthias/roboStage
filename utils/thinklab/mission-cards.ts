import { CanvasElement } from '@/types/thinklab.types';

/**
 * Missões liberadas para o ThinkLab a partir das ligas do usuário.
 * Tipos compartilhados entre a server action (que lê os dados) e a sidebar.
 */
export interface MissionSummary {
  code: string;
  name: string;
  description: string;
  /** Pontuação máxima da missão (incluindo bônus/sub-missões). */
  points: number;
  image?: string;
}

export interface MissionSeason {
  key: string;
  label: string;
  missions: MissionSummary[];
}

export interface MissionPack {
  leagueId: string;
  leagueCode: string;
  leagueName: string;
  relation: 'participante' | 'interessado';
  /** "available" libera as missões; "soon" indica liga reconhecida sem missões ainda. */
  status: 'available' | 'soon';
  note?: string;
  seasons: MissionSeason[];
  /** Temporada informada pelo usuário na liga, quando bate com uma disponível. */
  defaultSeason?: string;
}

type CardElement = Omit<CanvasElement, 'id' | 'zIndex'>;

const BASE = {
  strokeStyle: 'solid' as const,
  opacity: 1,
};

/** Quebra o título em até `maxLines` linhas de ~`maxChars` caracteres. */
function wrap(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.,;:]?$/, '')}…`;
    return kept;
  }
  return lines;
}

/** "INSPEÇÃO POR DRONE" → "Inspeção por drone" (mantém siglas curtas). */
export function sentenceCase(text: string) {
  if (text !== text.toUpperCase()) return text;
  const lower = text.toLocaleLowerCase('pt-BR');
  return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
}

/**
 * Monta o cartão de uma missão como um grupo de elementos do canvas
 * (fundo + miniatura + título + pontuação), posicionado a partir de (0, 0).
 */
export function buildMissionCard(
  mission: MissionSummary,
  context: { league: string; season: string },
  accent = '#cf2a2a',
): CardElement[] {
  const hasImage = !!mission.image;
  const textX = hasImage ? 100 : 18;
  const width = hasImage ? 300 : 260;
  const titleLines = wrap(`${mission.code} · ${sentenceCase(mission.name)}`, hasImage ? 22 : 26, 2);
  const titleSize = 16;
  const titleHeight = titleLines.length * titleSize * 1.35;
  const height = Math.max(hasImage ? 100 : 84, 24 + titleHeight + 30);

  const ref = { league: context.league, season: context.season, code: mission.code };

  const elements: CardElement[] = [
    {
      ...BASE,
      type: 'rectangle',
      x: 0,
      y: 0,
      width,
      height,
      strokeColor: accent,
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 0.5,
      roundness: true,
      missionRef: ref,
    },
  ];

  if (hasImage) {
    elements.push({
      ...BASE,
      type: 'image',
      x: 12,
      y: 12,
      width: 76,
      height: height - 24,
      imageSrc: mission.image,
      strokeColor: '#1e293b',
      backgroundColor: 'transparent',
      fillStyle: 'none',
      strokeWidth: 1,
      roughness: 0,
      roundness: true,
      missionRef: ref,
    });
  }

  elements.push(
    {
      ...BASE,
      type: 'text',
      x: textX,
      y: 14,
      width: width - textX - 12,
      height: titleHeight,
      text: titleLines.join('\n'),
      fontSize: titleSize,
      fontFamily: 'Plus Jakarta Sans',
      textAlign: 'left',
      strokeColor: '#1e293b',
      backgroundColor: 'transparent',
      fillStyle: 'none',
      strokeWidth: 1,
      roughness: 0,
    },
    {
      ...BASE,
      type: 'text',
      x: textX,
      y: height - 32,
      width: width - textX - 12,
      height: 20,
      text: `🎯 até ${mission.points} pts · ${context.season}`,
      fontSize: 13,
      fontFamily: 'Plus Jakarta Sans',
      textAlign: 'left',
      strokeColor: accent,
      backgroundColor: 'transparent',
      fillStyle: 'none',
      strokeWidth: 1,
      roughness: 0,
    },
  );

  return elements;
}
