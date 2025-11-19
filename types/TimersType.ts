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

export const APP_THEMES: Theme[] = [
  { 
    id: 'default', 
    label: 'Padrão', 
    bgClass: 'bg-base-100', 
    accentColor: 'text-accent',
    buttonColor: 'bg-primary'
  },
  { 
    id: 'ocean', 
    label: 'Oceano', 
    bgClass: 'bg-gradient-to-br from-blue-950 to-slate-900', 
    accentColor: 'text-blue-400',
    buttonColor: 'bg-blue-600'
  },
  { 
    id: 'magma', 
    label: 'Magma', 
    bgClass: 'bg-gradient-to-br from-red-950 to-slate-900', 
    accentColor: 'text-orange-500',
    buttonColor: 'bg-orange-600'
  },
  { 
    id: 'forest', 
    label: 'Floresta', 
    bgClass: 'bg-gradient-to-br from-green-950 to-slate-900', 
    accentColor: 'text-green-400',
    buttonColor: 'bg-green-600'
  },
  { 
    id: 'cyber', 
    label: 'Cyber', 
    bgClass: 'bg-slate-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950', 
    accentColor: 'text-purple-400',
    buttonColor: 'bg-purple-600'
  }
];