import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { userPreferences, users } from "@/db/schema";
import { DEFAULT_PREFERENCES, type UserPreferences } from "@/types/preferences";

/**
 * Leituras de preferências usadas pelo servidor. Ficam FORA de arquivos
 * "use server" de propósito: tudo que um desses arquivos exporta vira um
 * endpoint chamável pelo navegador, e `emailOptedOutOfTeamInvites` não pode
 * virar um oráculo público ("este e-mail bloqueia convites?").
 */

export async function getPreferencesFor(userId: string): Promise<UserPreferences> {
  const [row] = await db
    .select({
      layoutLocked: userPreferences.layoutLocked,
      sidebarExpanded: userPreferences.sidebarExpanded,
      allowTeamInvites: userPreferences.allowTeamInvites,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return row ?? DEFAULT_PREFERENCES;
}

export async function userOptedOutOfTeamInvites(userId: string): Promise<boolean> {
  return !(await getPreferencesFor(userId)).allowTeamInvites;
}

export async function emailOptedOutOfTeamInvites(email: string): Promise<boolean> {
  const [row] = await db
    .select({ allow: userPreferences.allowTeamInvites })
    .from(users)
    .innerJoin(userPreferences, eq(userPreferences.userId, users.id))
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);
  return row ? !row.allow : false;
}
