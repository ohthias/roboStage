export interface LinhaCriterio {
  descricoes: [string, string, string, string];
  nivel: number | null;
  comentario?: string;
}

export interface SecaoRubrica {
  titulo: string;
  subtitulo: string;
  linhas: LinhaCriterio[];
}

export type RubricaJson = {
  [key: string]: SecaoRubrica;
};
