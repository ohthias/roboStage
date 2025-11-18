export enum Category {
  ALL = 'Todas',
  CORE_VALUES = 'Core Values',
  INNOVATION_PROJECT = 'Projeto de Inovação',
  ROBOT_DESIGN = 'Design do Robô'
}

export interface Question {
  id: string;
  category: Category;
  text: string;
  hint?: string; // Static hint from JSON
}

export interface GameSettings {
  category: Category;
  count: number;
  timePerCard: number; // in seconds
}

export interface GameState {
  status: 'setup' | 'playing' | 'finished';
  currentQuestionIndex: number;
  selectedQuestions: Question[];
  answers: { questionId: string; flagged: boolean }[]; // Track which ones were difficult
}