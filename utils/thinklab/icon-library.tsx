import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Bot,
  Cpu,
  Cog,
  Wrench,
  BatteryFull,
  Zap,
  Gauge,
  Radar,
  Navigation,
  Compass,
  CircuitBoard,
  Cable,
  Magnet,
  Ruler,
  Target,
  Flag,
  Trophy,
  Medal,
  Timer,
  Clock,
  Route,
  Map as MapIcon,
  Lightbulb,
  Rocket,
  Puzzle,
  Users,
  User,
  MessageSquare,
  Heart,
  Star,
  ThumbsUp,
  Handshake,
  Smile,
  CircleCheck,
  CircleX,
  TriangleAlert,
  Info,
  Ban,
  Award,
  FileText,
  Calendar,
  ClipboardList,
  BookOpen,
  Code,
  Camera,
  Leaf,
  Sprout,
  Waves,
  Fish,
  Microscope,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';

/**
 * Catálogo de ícones (Lucide) que podem ser inseridos no ThinkLab.
 * O elemento guarda só a chave (`iconName`); a cor vem do `strokeColor`
 * do elemento, então o ícone muda de cor pelo inspetor como qualquer forma.
 */
export interface IconEntry {
  key: string;
  label: string;
  Icon: LucideIcon;
  tags?: string[];
}

export interface IconCategory {
  title: string;
  icons: IconEntry[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    title: 'Robótica',
    icons: [
      { key: 'bot', label: 'Robô', Icon: Bot },
      { key: 'cpu', label: 'Controlador', Icon: Cpu, tags: ['hub', 'processador'] },
      { key: 'cog', label: 'Engrenagem', Icon: Cog, tags: ['mecanismo'] },
      { key: 'wrench', label: 'Ferramenta', Icon: Wrench, tags: ['ajuste', 'manutenção'] },
      { key: 'battery', label: 'Bateria', Icon: BatteryFull },
      { key: 'zap', label: 'Energia', Icon: Zap, tags: ['motor'] },
      { key: 'gauge', label: 'Sensor / velocidade', Icon: Gauge },
      { key: 'radar', label: 'Sensor de distância', Icon: Radar, tags: ['ultrassom'] },
      { key: 'navigation', label: 'Direção', Icon: Navigation, tags: ['giroscópio'] },
      { key: 'compass', label: 'Bússola', Icon: Compass },
      { key: 'circuit', label: 'Circuito', Icon: CircuitBoard },
      { key: 'cable', label: 'Cabo', Icon: Cable },
      { key: 'magnet', label: 'Ímã', Icon: Magnet },
      { key: 'ruler', label: 'Medida', Icon: Ruler },
    ],
  },
  {
    title: 'Estratégia',
    icons: [
      { key: 'target', label: 'Objetivo', Icon: Target, tags: ['alvo', 'missão'] },
      { key: 'flag', label: 'Bandeira', Icon: Flag, tags: ['largada', 'chegada'] },
      { key: 'trophy', label: 'Troféu', Icon: Trophy },
      { key: 'medal', label: 'Medalha', Icon: Medal },
      { key: 'award', label: 'Prêmio', Icon: Award },
      { key: 'timer', label: 'Cronômetro', Icon: Timer, tags: ['tempo'] },
      { key: 'clock', label: 'Relógio', Icon: Clock },
      { key: 'route', label: 'Rota', Icon: Route, tags: ['caminho', 'run'] },
      { key: 'map', label: 'Mapa / tapete', Icon: MapIcon },
      { key: 'lightbulb', label: 'Ideia', Icon: Lightbulb },
      { key: 'rocket', label: 'Lançamento', Icon: Rocket },
      { key: 'puzzle', label: 'Peça', Icon: Puzzle },
    ],
  },
  {
    title: 'Equipe',
    icons: [
      { key: 'users', label: 'Equipe', Icon: Users },
      { key: 'user', label: 'Pessoa', Icon: User },
      { key: 'message', label: 'Comentário', Icon: MessageSquare },
      { key: 'handshake', label: 'Parceria', Icon: Handshake },
      { key: 'heart', label: 'Coração', Icon: Heart, tags: ['valores'] },
      { key: 'star', label: 'Estrela', Icon: Star },
      { key: 'thumbs-up', label: 'Aprovado', Icon: ThumbsUp },
      { key: 'smile', label: 'Sorriso', Icon: Smile },
    ],
  },
  {
    title: 'Status',
    icons: [
      { key: 'check', label: 'Concluído', Icon: CircleCheck, tags: ['ok'] },
      { key: 'x', label: 'Falhou', Icon: CircleX, tags: ['erro'] },
      { key: 'alert', label: 'Atenção', Icon: TriangleAlert, tags: ['risco'] },
      { key: 'info', label: 'Informação', Icon: Info },
      { key: 'ban', label: 'Bloqueado', Icon: Ban },
    ],
  },
  {
    title: 'Projeto & ciência',
    icons: [
      { key: 'file', label: 'Documento', Icon: FileText },
      { key: 'calendar', label: 'Calendário', Icon: Calendar },
      { key: 'clipboard', label: 'Checklist', Icon: ClipboardList },
      { key: 'book', label: 'Caderno de engenharia', Icon: BookOpen },
      { key: 'code', label: 'Código', Icon: Code },
      { key: 'camera', label: 'Câmera', Icon: Camera },
      { key: 'microscope', label: 'Pesquisa', Icon: Microscope },
      { key: 'flask', label: 'Experimento', Icon: FlaskConical },
      { key: 'leaf', label: 'Folha', Icon: Leaf, tags: ['natureza'] },
      { key: 'sprout', label: 'Broto', Icon: Sprout, tags: ['natureza'] },
      { key: 'waves', label: 'Água', Icon: Waves },
      { key: 'fish', label: 'Peixe', Icon: Fish },
    ],
  },
];

const ICON_INDEX: Record<string, IconEntry> = Object.fromEntries(
  ICON_CATEGORIES.flatMap((c) => c.icons.map((i) => [i.key, i]))
);

export function getIconEntry(key?: string): IconEntry | undefined {
  return key ? ICON_INDEX[key] : undefined;
}

const markupCache = new Map<string, string>();

/**
 * Markup SVG (24×24) de um ícone do catálogo, já com cor e espessura aplicadas.
 * Usado tanto para desenhar no canvas (via data URL) quanto na exportação SVG.
 */
export function getIconSvgMarkup(key: string, color: string, strokeWidth = 2): string | null {
  const entry = getIconEntry(key);
  if (!entry) return null;
  const cacheKey = `${key}|${color}|${strokeWidth}`;
  const cached = markupCache.get(cacheKey);
  if (cached) return cached;
  const { Icon } = entry;
  const markup = renderToStaticMarkup(
    <Icon color={color} strokeWidth={strokeWidth} width={24} height={24} xmlns="http://www.w3.org/2000/svg" />
  );
  markupCache.set(cacheKey, markup);
  return markup;
}

export function getIconDataUrl(key: string, color: string, strokeWidth = 2): string | null {
  const markup = getIconSvgMarkup(key, color, strokeWidth);
  return markup ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}` : null;
}
