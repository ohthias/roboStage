export type EmpathyCategory = 'thinks' | 'feels' | 'says' | 'does' | 'pains' | 'gains';

export type NoteColor = 'yellow' | 'pink' | 'emerald' | 'blue' | 'purple' | 'amber' | 'slate';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface EmpathyNote {
  id: string;
  text: string;
  category: EmpathyCategory;
  color: NoteColor;
  author: string;
  votes: number;
  sentiment: Sentiment;
  tags: string[];
  pinned?: boolean;
  createdAt: number;
  position?: { x: number; y: number };
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  segment: string;
  context: string;
  avatarUrl: string;
  demographics?: string;
  quote?: string;
}

export interface EmpathyMap {
  id: string;
  title: string;
  description: string;
  persona: Persona;
  notes: EmpathyNote[];
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'board' | 'analysis';

export interface CategoryDefinition {
  id: EmpathyCategory;
  title: string;
  subtitle: string;
  guidingQuestion: string;
  accentColor: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  iconName: string;
}

export interface AnalysisData {
  executiveSummary: string;
  archetypeTitle: string;
  topPains: string[];
  coreMotivations: string[];
  contradictions: {
    finding: string;
    uxInsight: string;
  }[];
  howMightWe: string[];
  actionableOpportunities: {
    title: string;
    impact: 'Alto' | 'Médio';
    description: string;
  }[];
}
