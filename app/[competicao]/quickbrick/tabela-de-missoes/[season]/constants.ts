import { Column, Mission } from '@/types/TableAnalytics';

export const INITIAL_COLUMNS: Column[] = [
  { id: 'name', label: 'Nome da Missão', type: 'text', isSystem: true },
  { id: 'points', label: 'Pontos Máx.', type: 'number' },
  { id: 'difficulty', label: 'Dificuldade (1-5)', type: 'number' },
  { id: 'time', label: 'Tempo Est. (s)', type: 'number' },
  { id: 'status', label: 'Status', type: 'select', options: ['Não Iniciado', 'Protótipo', 'Codificando', 'Concluído'] },
];

export const INITIAL_MISSIONS: Mission[] = [
];
