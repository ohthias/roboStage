/**
 * Regras de "onboarding completo" — fonte única usada pelo formulário,
 * pela server action e pelo guard das rotas protegidas.
 *
 * Arquivo puro (sem banco), para poder ser importado no cliente e testado.
 */

export const NAME_MIN = 2;

export type OnboardingMissing =
  | "name"
  | "persona"
  | "leagues"
  | "league_team"
  | "league_season"
  | "preferences"
  | "completed_at";

export type OnboardingSnapshot = {
  name: string | null | undefined;
  personaType: string | null | undefined;
  onboardingCompletedAt: Date | string | null | undefined;
  leagues: {
    relationType: "participante" | "interessado" | null | undefined;
    teamName: string | null | undefined;
    season: string | null | undefined;
  }[];
  /** Existe linha em user_preferences (as escolhas foram feitas explicitamente). */
  hasPreferences: boolean;
};

export const MISSING_LABELS: Record<OnboardingMissing, string> = {
  name: "seu nome",
  persona: "o seu perfil",
  leagues: "ao menos uma competição",
  league_team: "o nome da equipe nas competições em que você participa",
  league_season: "a temporada nas competições em que você participa",
  preferences: "as preferências de convites e e-mails",
  completed_at: "a confirmação final",
};

export const filled = (v: string | null | undefined) => (v ?? "").trim().length > 0;

/** Erros de uma liga marcada como "Participo" (equipe e temporada obrigatórias). */
export function leagueGaps(l: OnboardingSnapshot["leagues"][number]): OnboardingMissing[] {
  if (l.relationType !== "participante") return [];
  const gaps: OnboardingMissing[] = [];
  if (!filled(l.teamName)) gaps.push("league_team");
  if (!filled(l.season)) gaps.push("league_season");
  return gaps;
}

/** Lista o que falta; vazio = onboarding completo. */
export function missingOnboardingFields(s: OnboardingSnapshot): OnboardingMissing[] {
  const missing = new Set<OnboardingMissing>();
  if ((s.name ?? "").trim().length < NAME_MIN) missing.add("name");
  if (!s.personaType) missing.add("persona");

  const active = s.leagues.filter((l) => l.relationType);
  if (active.length === 0) missing.add("leagues");
  for (const l of active) leagueGaps(l).forEach((g) => missing.add(g));

  if (!s.hasPreferences) missing.add("preferences");
  if (!s.onboardingCompletedAt) missing.add("completed_at");
  return [...missing];
}

export function describeMissing(missing: OnboardingMissing[]) {
  const labels = missing.filter((m) => m !== "completed_at").map((m) => MISSING_LABELS[m]);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} e ${labels.at(-1)}`;
}
