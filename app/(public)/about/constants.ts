
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
    title: 'LabTest',
    description: 'Documentação e análise estatística de testes para acompanhar a evolução e eficácia das soluções do robô.',
    icon: FlaskConical,
    colorClass: 'text-emerald-600 bg-emerald-50'
  },
  {
    title: 'InnoLab',
    description: 'Criador de diagramas (5W2H, Ishikawa, fluxogramas) focado no desenvolvimento do projeto de inovação.',
    icon: Lightbulb,
    colorClass: 'text-yellow-600 bg-yellow-50'
  },
  {
    title: 'Workspace',
    description: 'Diário de bordo colaborativo para documentar progressos, comentários e coleta de dados globais.',
    icon: BookOpen,
    colorClass: 'text-purple-600 bg-purple-50'
  },
  {
    title: 'StyleLab',
    description: 'Ferramenta de personalização visual para criar temas únicos e imersivos para os seus eventos.',
    icon: Palette,
    colorClass: 'text-pink-600 bg-pink-50'
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