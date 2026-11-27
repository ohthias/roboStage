
import { Impacto, Probabilidade, Risco } from '@/features/quickbrick/matriz-risco/types';

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

export type RiskLevel = { key: "baixo" | "moderado" | "alto" | "critico"; label: string; tone: "success" | "warning" | "accent" | "error" };

/** Nível do risco pelo produto impacto × probabilidade (1–25). */
export const getRiskLevel = (impacto: Impacto, probabilidade: Probabilidade): RiskLevel => {
  const score = impacto * probabilidade;
  if (score <= 4) return { key: "baixo", label: "Baixo", tone: "success" };
  if (score <= 8) return { key: "moderado", label: "Moderado", tone: "warning" };
  if (score <= 12) return { key: "alto", label: "Alto", tone: "accent" };
  return { key: "critico", label: "Crítico", tone: "error" };
};

// Cores da célula na paleta da Stage UI (tokens do tema, funcionam no escuro).
const CELL: Record<RiskLevel["key"], string> = {
  baixo: "bg-success/15 border-success/35",
  moderado: "bg-warning/20 border-warning/45",
  alto: "bg-[color-mix(in_oklab,var(--color-warning)_45%,var(--color-error))]/25 border-[color-mix(in_oklab,var(--color-warning)_45%,var(--color-error))]/50",
  critico: "bg-error/20 border-error/45",
};

const TEXT: Record<RiskLevel["key"], string> = {
  baixo: "border-success/40 text-success",
  moderado: "border-warning/60 text-[color-mix(in_oklab,var(--color-warning)_55%,var(--color-base-content))]",
  alto: "border-[color-mix(in_oklab,var(--color-warning)_45%,var(--color-error))]/60 text-[color-mix(in_oklab,var(--color-warning)_35%,var(--color-error))]",
  critico: "border-error/50 text-error",
};

export const getRiskColor = (impacto: Impacto, probabilidade: Probabilidade): string =>
  CELL[getRiskLevel(impacto, probabilidade).key];

export const getRiskTextColor = (impacto: Impacto, probabilidade: Probabilidade): string =>
  TEXT[getRiskLevel(impacto, probabilidade).key];
