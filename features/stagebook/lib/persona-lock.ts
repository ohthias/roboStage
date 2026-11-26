/**
 * Trava do tipo de conta. O usuário pode trocar o tipo livremente nas
 * primeiras 48 horas depois de criar a conta; depois disso só a equipe do
 * RoboStage troca (pedido por e-mail). Sem dependências de servidor: a UI
 * usa as mesmas contas para mostrar o prazo.
 */

export const PERSONA_LOCK_HOURS = 48;
export const PERSONA_LOCK_MS = PERSONA_LOCK_HOURS * 60 * 60 * 1000;
export const PERSONA_SUPPORT_EMAIL = "robostage.dev@gmail.com";

export type PersonaLockState = {
  locked: boolean;
  /** Momento em que a troca deixa (ou deixou) de ser livre. */
  locksAt: Date;
  /** Milissegundos até travar (0 se já travou). */
  msLeft: number;
};

export function personaLockState(createdAt: Date | string | number, now: Date = new Date()): PersonaLockState {
  const created = new Date(createdAt);
  const locksAt = new Date(created.getTime() + PERSONA_LOCK_MS);
  const msLeft = Math.max(0, locksAt.getTime() - now.getTime());
  return { locked: msLeft === 0, locksAt, msLeft };
}

/** "1 dia e 3 h", "5 h", "menos de 1 h". */
export function formatLockCountdown(msLeft: number): string {
  const hours = Math.floor(msLeft / 3_600_000);
  if (hours < 1) return "menos de 1 h";
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  if (days === 0) return `${hours} h`;
  const d = `${days} ${days === 1 ? "dia" : "dias"}`;
  return rest ? `${d} e ${rest} h` : d;
}

export const PERSONA_LOCKED_MESSAGE =
  `O tipo de conta só pode ser trocado nas primeiras ${PERSONA_LOCK_HOURS} horas. ` +
  `Para mudar agora, fale com a equipe do RoboStage em ${PERSONA_SUPPORT_EMAIL}.`;
