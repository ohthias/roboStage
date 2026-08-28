import { Column, Mission } from '@/types/TableAnalytics';

export const INITIAL_COLUMNS: Column[] = [
  { id: 'name', label: 'Missão', type: 'text', isSystem: true },
  { id: 'points', label: 'Pontos Obtidos', type: 'number', isSystem: true, readOnly: true },
  { id: 'maxPoints', label: 'Pontos Máx.', type: 'number', isSystem: true, readOnly: true },
  { id: 'difficulty', label: 'Dificuldade (1-5)', type: 'number' },
  { id: 'time', label: 'Tempo Est. (s)', type: 'number' },
  { id: 'status', label: 'Status', type: 'select', options: ['Não Iniciado', 'Protótipo', 'Codificando', 'Concluído'] },
];

export const INITIAL_MISSIONS: Mission[] = [];