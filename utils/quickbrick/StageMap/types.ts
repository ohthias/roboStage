import type { Project } from "@/utils/quickbrick/ArenaBuilder/types";

/** ponto em cm; origem no canto superior esquerdo do palco (fundo à esquerda). A borda de baixo é a frente (plateia). */
export interface Pt {
  x: number;
  y: number;
}

export type MarkingKind = "tape" | "rect" | "circle" | "cross" | "text";

/** marcação de chão (fita, área, marca em X, texto) */
export interface Marking {
  id: string;
  kind: MarkingKind;
  /**
   * tape: polilinha (2+ pontos)
   * rect / circle: [canto ou centro, canto oposto ou ponto do raio]
   * cross / text: [posição]
   */
  points: Pt[];
  color: string;
  /** largura da fita / traço, em cm */
  width: number;
  label: string;
}

/** traço de desenho livre */
export interface Drawing {
  id: string;
  points: Pt[];
  color: string;
  width: number;
}

export type ActorKind = "robot" | "human" | "prop";

export interface Actor {
  id: string;
  name: string;
  kind: ActorKind;
  color: string;
  /** diâmetro (humano/objeto) ou lado (robô), em cm */
  size: number;
}

/** posição + orientação (graus, 0 = virado para a plateia, sentido horário) */
export interface Pose {
  x: number;
  y: number;
  angle: number;
}

/** quadro-chave: onde cada ator está naquele instante (ausente = fora de cena) */
export interface Frame {
  id: string;
  poses: Record<string, Pose>;
  note: string;
  /** recursos (dos 4 escolhidos) demonstrados neste quadro */
  resources: string[];
}

/** um dos 4 recursos avaliados na apresentação (ação visível do robô) */
export interface Resource {
  id: string;
  name: string;
  /** robô que demonstra o recurso (opcional) */
  actorId: string | null;
}

export interface Scene {
  id: string;
  name: string;
  /** segundos entre um quadro e o seguinte */
  frameDuration: number;
  /** trajetórias suavizadas (Catmull-Rom) em vez de retas entre quadros */
  smooth: boolean;
  frames: Frame[];
  notes: string;
}

export interface StageDoc {
  version: 1;
  name: string;
  stage: { width: number; depth: number };
  /** folga mínima entre atores para o verificador de colisões, em cm */
  safety: number;
  markings: Marking[];
  drawings: Drawing[];
  actors: Actor[];
  scenes: Scene[];
  /** os 4 recursos escolhidos pela equipe */
  resources: Resource[];
  /** estimativas para a janela de 7 min no palco, em segundos */
  setupTime: number;
  teardownTime: number;
  /** pista de seguidor de linha (mesmo formato do Criador de Arenas; a sala de resgate é ignorada) */
  track: Project;
  trackVisible: boolean;
}
