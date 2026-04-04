
import { FeatureCardProps } from './types';
import { 
  Radio, 
  Box, 
  FlaskConical, 
  Lightbulb, 
  BookOpen, 
  Palette, 
  Timer,
  MessageSquare,
  Trophy
} from 'lucide-react';

export const PLATFORM_FEATURES: FeatureCardProps[] = [
  {
    title: 'ShowLive',
    description: 'Crie eventos da FIRST LEGO League com rodadas automáticas, gestão de visitantes e temas personalizados.',
    icon: Radio,
    colorClass: 'text-blue-600 bg-blue-50'
  },
  {
    title: 'QuickBrick Studio',
    description: 'Análise de desafios, matrizes, tabelas e simulação de robôs para a fase inicial de documentação.',
    icon: Box,
    colorClass: 'text-orange-600 bg-orange-50'
  },
  {
    title: 'FLL Score',
    description: 'Pontuador oficial digital para FIRST LEGO League, com uma interface intuitiva e simulação de rounds.',
    icon: Trophy,
    colorClass: 'text-red-600 bg-red-50'
  },
  {
    title: 'Timers',
    description: 'Sistema de cronômetros personalizáveis para gerenciar o tempo durante treinos e competições.',
    icon: Timer,
    colorClass: 'text-teal-600 bg-teal-50'
  },
  {
    title: 'Flask QA',
    description: 'Flashcards pensados para revisão rápida de conceitos e preparação para competições e salas de avaliação.',
    icon: MessageSquare,
    colorClass: 'text-cyan-600 bg-cyan-50'
  }
];