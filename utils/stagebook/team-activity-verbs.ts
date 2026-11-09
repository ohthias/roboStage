/**
 * Verbos conhecidos do feed de atividade (sem dependências de servidor: a UI
 * usa a mesma lista para escolher ícone e texto). O banco guarda texto livre,
 * então um verbo novo só precisa entrar aqui e no `activity-item.tsx`.
 */
export const ACTIVITY_VERBS = [
  "board.created",
  "board.deleted",
  "thinklab.created",
  "thinklab.deleted",
  "test.created",
  "test.deleted",
  "test.executed",
  "test.record",
  "milestone.created",
  "member.joined",
  "member.role_changed",
  "anatix.session_ended",
  "session.created",
  "session.started",
  "session.ended",
  "session.deleted",
  "session.checked_in",
  "roster.published",
  "roster.updated",
] as const;

export type ActivityVerb = (typeof ACTIVITY_VERBS)[number];

export type ActivityEntityType =
  | "board"
  | "thinklab"
  | "test"
  | "session"
  | "milestone"
  | "member"
  | "anatix_session";

export function isActivityVerb(value: unknown): value is ActivityVerb {
  return typeof value === "string" && (ACTIVITY_VERBS as readonly string[]).includes(value);
}
