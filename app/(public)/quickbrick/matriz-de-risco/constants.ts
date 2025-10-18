
import { Impacto, Probabilidade, Risco } from '@/types/MatrizRisco';

export const IMPACTO_LABELS: Record<Impacto, string> = {
  [Impacto.MuitoBaixo]: 'Muito Baixo',
  [Impacto.Baixo]: 'Baixo',
  [Impacto.Medio]: 'Médio',
  [Impacto.Alto]: 'Alto',
  [Impacto.MuitoAlto]: 'Muito Alto',
};

export const PROBABILIDADE_LABELS: Record<Probabilidade, string> = {
  [Probabilidade.MuitoBaixa]: 'Muito Baixa',
  [Probabilidade.Baixa]: 'Baixa',
  [Probabilidade.Media]: 'Média',
  [Probabilidade.Alta]: 'Alta',
  [Probabilidade.MuitoAlta]: 'Muito Alta',
};

export const INITIAL_RISCOS: Risco[] = [
  {
    id: 1,
    titulo: 'Sensor de Cor Falha',
    descricao: 'O sensor de cor não consegue ler a linha ou a cor do objeto alvo consistentemente.',
    impacto: Impacto.Alto,
    probabilidade: Probabilidade.Media,
  },
  {
    id: 2,
    titulo: 'Bateria Fraca',
    descricao: 'A bateria do robô perde carga durante uma partida, afetando a performance dos motores.',
    impacto: Impacto.MuitoAlto,
    probabilidade: Probabilidade.Baixa,
  },
  {
    id: 3,
    titulo: 'Anexo Emperra',
    descricao: 'Um anexo mecânico não é liberado ou ativado corretamente.',
    impacto: Impacto.Medio,
    probabilidade: Probabilidade.Media,
  },
  {
    id: 4,
    titulo: 'Robô Desalinhado',
    descricao: 'O robô inicia a missão fora da base de lançamento ou desalinhado, resultando em navegação imprecisa.',
    impacto: Impacto.Alto,
    probabilidade: Probabilidade.Alta,
  },
  {
    id: 5,
    titulo: 'Erro de Programação',
    descricao: 'Um bug no código causa um comportamento inesperado do robô na mesa.',
    impacto: Impacto.Medio,
    probabilidade: Probabilidade.Baixa,
  },
    {
    id: 6,
    titulo: 'Peça Quebra',
    descricao: 'Uma peça estrutural de LEGO quebra durante a manipulação ou em uma partida.',
    impacto: Impacto.MuitoAlto,
    probabilidade: Probabilidade.MuitoBaixa,
  },
  {
    id: 7,
    titulo: 'Interferência na Mesa',
    descricao: 'Condições da mesa de competição (luz, superfície) são diferentes da mesa de treino.',
    impacto: Impacto.Baixo,
    probabilidade: Probabilidade.Alta,
  },
];

export const getRiskColor = (impacto: Impacto, probabilidade: Probabilidade): string => {
  const score = impacto * probabilidade;
  if (score <= 4) return 'bg-green-200/80 border-green-400';
  if (score <= 8) return 'bg-yellow-200/80 border-yellow-400';
  if (score <= 12) return 'bg-orange-300/80 border-orange-500';
  return 'bg-red-300/80 border-red-500';
};

export const getRiskTextColor = (impacto: Impacto, probabilidade: Probabilidade): string => {
  const score = impacto * probabilidade;
  if (score <= 4) return 'text-green-800';
  if (score <= 8) return 'text-yellow-800';
  if (score <= 12) return 'text-orange-800';
  return 'text-red-800';
}
