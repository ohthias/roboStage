
export enum Impacto {
  MuitoBaixo = 1,
  Baixo = 2,
  Medio = 3,
  Alto = 4,
  MuitoAlto = 5,
}

export enum Probabilidade {
  MuitoBaixa = 1,
  Baixa = 2,
  Media = 3,
  Alta = 4,
  MuitoAlta = 5,
}

export interface Risco {
  id: number;
  titulo: string;
  descricao: string;
  impacto: Impacto;
  probabilidade: Probabilidade;
}
