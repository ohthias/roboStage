"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { users, userLeagueInterests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PERSONA_LOCKED_MESSAGE, personaLockState } from "@/utils/stagebook/persona-lock";
import { leagues, userLeagueInterests, userPreferences, users } from "@/db/schema";
import {
  describeMissing,
  missingOnboardingFields,
} from "@/utils/onboarding/completeness";

const PERSONA_VALUES = [
  "competidor",
  "mentor_tecnico",
  "entusiasta",
  "organizador",
] as const;

const RELATION_VALUES = ["participante", "interessado"] as const;

const NAME_MAX = 80;
const TEAM_MAX = 80;
const SEASON_MAX = 40;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PersonaValue = (typeof PERSONA_VALUES)[number];

export type LeagueSelectionInput = {
  leagueId: string;
  relationType: (typeof RELATION_VALUES)[number];
  teamName?: string;
  season?: string;
};

export type OnboardingInput = {
  /** users.name — como a pessoa aparece para a equipe. */
  name: string;
  /** users.persona_type */
  personaType: PersonaValue;
  /** user_league_interests */
  leagues: LeagueSelectionInput[];
  /** user_preferences.allow_team_invites */
  allowTeamInvites: boolean;
  /** user_preferences.email_product_updates (opt-in explícito) */
  emailProductUpdates: boolean;
};

/** Erros de validação voltam como valor: mensagens lançadas são mascaradas em produção. */
export type OnboardingResult = { ok: false; error: string };

function clip(value: string | undefined, max: number) {
  const clean = value?.replace(/\s+/g, " ").trim() ?? "";
  return clean ? clean.slice(0, max) : null;
}

export async function completeOnboarding(
  input: OnboardingInput,
): Promise<OnboardingResult | void> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sua sessão expirou. Entre de novo." };

  const name = clip(input.name, NAME_MAX);
  if (!name || name.length < 2) {
    return { ok: false, error: "Conte como podemos te chamar (pelo menos 2 letras)." };
  }

  if (!PERSONA_VALUES.includes(input.personaType)) {
    return { ok: false, error: "Escolha um perfil válido." };
  }

  if (typeof input.allowTeamInvites !== "boolean" || typeof input.emailProductUpdates !== "boolean") {
    return { ok: false, error: "Preferências inválidas." };
  }

  // Uma linha por liga (a última escolha vence) e só ids com formato válido.
  const byLeague = new Map<string, LeagueSelectionInput>();
  for (const l of Array.isArray(input.leagues) ? input.leagues : []) {
    if (l && UUID_RE.test(l.leagueId) && RELATION_VALUES.includes(l.relationType)) {
      byLeague.set(l.leagueId, l);
    }
  }
  if (byLeague.size === 0) {
    return { ok: false, error: "Selecione ao menos uma competição." };
  }

  // Confere se as ligas existem antes de gravar (evita erro de FK opaco).
  const known = await db
    .select({ id: leagues.id })
    .from(leagues)
    .where(inArray(leagues.id, [...byLeague.keys()]));
  const knownIds = new Set(known.map((k) => k.id));

  const cleanLeagues = [...byLeague.values()]
    .filter((l) => knownIds.has(l.leagueId))
    .map((l) => {
      const participates = l.relationType === "participante";
      return {
        userId,
        leagueId: l.leagueId,
        relationType: l.relationType,
        teamName: participates ? clip(l.teamName, TEAM_MAX) : null,
        season: participates ? clip(l.season, SEASON_MAX) : null,
      };
    });

  if (cleanLeagues.length === 0) {
    return { ok: false, error: "As competições escolhidas não estão mais disponíveis." };
  }

  // Mesma regra do guard do dashboard: nada é gravado com campo faltando.
  const missing = missingOnboardingFields({
    name,
    personaType: input.personaType,
    onboardingCompletedAt: new Date(),
    leagues: cleanLeagues,
    hasPreferences: true,
  });
  if (missing.length > 0) {
    return { ok: false, error: `Falta preencher ${describeMissing(missing)}.` };
  }

  const client = await clerkClient();
  const now = new Date();

  // O webhook do Clerk normalmente já criou a linha; isso cobre a corrida
  // entre o webhook e o primeiro acesso.
  const existing = await db.query.users.findFirst({ where: eq(users.id, userId) });
  let email = existing?.email ?? "";
  let avatarUrl = existing?.avatarUrl ?? null;
  if (!existing) {
    const clerkUser = await client.users.getUser(userId);
    email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    avatarUrl = clerkUser.imageUrl ?? null;
  }

  const preferences = {
    allowTeamInvites: input.allowTeamInvites,
    emailProductUpdates: input.emailProductUpdates,
  };

  // neon-http: batch roda tudo numa única transação.
  await db.batch([
    db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        avatarUrl,
        personaType: input.personaType,
        onboardingCompletedAt: now,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { name, personaType: input.personaType, onboardingCompletedAt: now, updatedAt: now },
      }),
    // Substitui as escolhas anteriores (idempotente ao reabrir o formulário).
    db.delete(userLeagueInterests).where(eq(userLeagueInterests.userId, userId)),
    db.insert(userLeagueInterests).values(cleanLeagues),
    db
      .insert(userPreferences)
      .values({ userId, ...preferences })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: now },
      }),
  ]);

  // Mantém o nome igual no Clerk: o webhook user.updated sobrescreve users.name
  // com first/last name do Clerk. Falhar aqui não deve travar o onboarding.
  try {
    const [firstName, ...rest] = name.split(" ");
    await client.users.updateUser(userId, { firstName, lastName: rest.join(" ") });
  } catch (error) {
    console.warn("[onboarding] não foi possível atualizar o nome no Clerk", error);
  }

  // O proxy lê essa flag direto do token de sessão, sem consultar o banco.
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboardingComplete: true },
  });

  redirect("/dashboard");
}
