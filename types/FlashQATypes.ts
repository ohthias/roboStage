export enum Category {
  ALL = 'Todas',
  CORE_VALUES = 'Core Values',
  INNOVATION_PROJECT = 'Projeto de Inovação',
  ROBOT_DESIGN = 'Design do Robô',
  BIOGLOW = 'BIOGLOW',
  // OBR
  OBR_MECHANICS = 'Mecânica e Estrutura',
  OBR_SENSORS = 'Sensores',
  OBR_PROGRAMMING = 'Programação',
  OBR_TRACK = 'Desafios da Pista',
  OBR_RESCUE = 'Área de Resgate',
  OBR_STRATEGY = 'Estratégia de Prova',
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

export interface FlashQAMode {
  name: string;
  /** destaque do header (ex.: "Flashcards FLL") */
  highlight?: string;
  description?: string;
  /** pergunta usada no card de exemplo da tela inicial */
  sampleQuestion?: string;
  questions: Question[];
  categories: Category[];
  defaultSettings: GameSettings;
}