export enum AppMode {
  MENU = 'MENU',
  ROBOT_GAME = 'ROBOT_GAME',
  JUDGING = 'JUDGING',
  CUSTOM = 'CUSTOM'
}

export interface TimerConfig {
  duration: number; // in seconds
  label: string;
  color: string;
}

export interface JudgingStep {
  id: string;
  label: string;
  duration: number;
  description: string;
  color: string;
}

export interface Theme {
  id: string;
  label: string;
  bgClass: string;
  accentColor: string;
  buttonColor: string;
}

export const ROBOT_GAME_DURATION = 150;

export const DEFAULT_JUDGING_FLOW: JudgingStep[] = [
  { id: 'setup', label: 'Entrada', duration: 120, description: 'Boas-vindas e montagem de material.', color: 'text-blue-400' },
  { id: 'presentation', label: 'Apresentação', duration: 300, description: 'Projeto de Inovação (sem interrupções).', color: 'text-fll-red' },
  { id: 'qa', label: 'Perguntas & Respostas', duration: 300, description: 'Perguntas dos juízes sobre o projeto.', color: 'text-fll-yellow' },
  { id: 'presentation', label: 'Apresentação', duration: 300, description: 'Design do Robô (sem interrupções).', color: 'text-fll-red' },
  { id: 'qa', label: 'Perguntas & Respostas', duration: 300, description: 'Perguntas dos juízes sobre o design.', color: 'text-fll-yellow' },
  { id: 'feedback', label: 'Feedback / Saída', duration: 480, description: 'Feedback e Core Values.', color: 'text-green-400' },
];