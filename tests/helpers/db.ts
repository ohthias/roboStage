import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { teamMembers, teams, users } from "@/db/schema";
import type { TeamRole } from "@/utils/stagebook/team-permissions";

let applied = false;

/** Cria as tabelas do schema atual no Postgres em memória (uma vez por arquivo). */
export async function applySchema() {
  if (applied) return;
  const { pushSchema } = await import("drizzle-kit/api");
  // `db` aqui é o drizzle/pglite que `tests/setup.ts` colocou no lugar do Neon.
  const { apply } = await pushSchema(schema, db as never);
  await apply();
  applied = true;
}

export async function createUser(id: string) {
  await db.insert(users).values({ id, email: `${id}@example.com`, name: id }).onConflictDoNothing();
  return id;
}

export async function createTeam(
  name: string,
  members: Array<{ userId: string; role: TeamRole }>,
) {
  for (const member of members) await createUser(member.userId);
  const [team] = await db
    .insert(teams)
    .values({ name, createdBy: members[0].userId })
    .returning({ id: teams.id });
  await db
    .insert(teamMembers)
    .values(members.map((member) => ({ teamId: team.id, ...member })));
  return team.id;
}
