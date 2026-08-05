interface Responses {
  [missionId: string]: {
    [index: number]: number;
  };
}

interface FormMissionProps {
  missions?: Mission[];
  responses?: Responses;
  onSelect?: (missionId: string, index: number, idx: number) => void;
  className?: string;
  imagesEnabled?: boolean;
  isBadgeEnabled?: boolean;
}

interface RangeInputProps {
  missionId: string;
  index: number;
  start?: number;
  end?: number;
  value?: number;
  onSelect: (missionId: string, index: number, idx: number) => void;
}

/* Interface Switch Input */

interface SwitchInputProps {
  missionId: string;
  index: number;
  options?: string[];
  value?: number;
  onSelect: (missionId: string, index: number, idx: number) => void;
}

/* Regras de dependência entre missões/sub-missões (novo modelo) */
interface RequirementRule {
  /** ["if", true] -> regra ativa; ["if", false] -> regra ignorada. Padrão: ativa. */
  condition?: ["if", boolean];
  /** Só avalia esta regra quando a própria opção escolhida (switch de múltipla escolha) for este label. */
  when_self?: string;
  /** id da missão principal ou sub-missão (com campo "id") cujo valor será verificado. */
  mission: string;
  /** true/false -> compara com índice 1/0. [min,max] -> índice dentro do intervalo. número -> índice exato. */
  value: boolean | number | [number, number];
}

/* Interface Mission Card */
interface SubMission {
  /** Identificador opcional, usado para ser referenciado por `requires` de outra sub-missão da mesma missão. */
  id?: string;
  submission: string;
  points: number | number[];
  type: ["switch" | "range", ...(string | number | null)[]];
  /** Texto explicativo extra, exibido abaixo do enunciado. */
  note?: string;
  /** Condições que precisam ser satisfeitas para esta sub-missão pontuar. */
  requires?: RequirementRule[];
  /** Se a resposta desta sub-missão não for "Sim" (índice 1), zera a missão inteira (principal + todas as sub-missões). */
  zero_whole_mission_if_false?: boolean;
  /** Não é derivável olhando o tapete no final — o juiz precisa acompanhar ao vivo. Apenas para aviso na UI. */
  manual_tracking_required?: boolean;
  manual_tracking_note?: string;
  /** Opções mutuamente exclusivas entre si (uso apenas informativo/UI; o switch já impede múltipla seleção). */
  bonus_exclusive?: boolean;
}

interface Mission {
  id: string;
  name: string;
  mission: string;
  points: number | number[];
  equipaments: boolean;
  type: ["switch" | "range", ...(string | number | null)[]];
  image?: string;
  ["sub-mission"]?: SubMission[];
}

interface MissionCardProps {
  mission: Mission;
  responses?: { [index: number]: number };
  onSelect: (missionId: string, index: number, idx: number) => void;
  imagesEnabled?: boolean;
  isBadgeEnabled?: boolean;
}