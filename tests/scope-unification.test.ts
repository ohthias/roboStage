import { beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { leagues, userLeagueInterests } from "@/db/schema";
import { createThinkLab, listThinkLabsByUserId } from "@/app/(protected)/dashboard/thinklab/actions";
import { getThinkLabMissionPacks } from "@/app/(protected)/dashboard/thinklab/mission-actions";
import { requireTeamAccess } from "@/utils/stagebook/scope";
import { getUserLeagues } from "@/utils/stagebook/user-leagues";
import { isOwnedByScope } from "@/utils/stagebook/permissions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

let teamId: string;

beforeAll(async () => {
  await applySchema();
  await createUser("user_solo");
  teamId = await createTeam("Equipe Beta", [
    { userId: "user_mentor", role: "mentor" },
    { userId: "user_aluno", role: "competidor" },
  ]);
  const [fll] = await db
    .insert(leagues)
    .values({ code: "FLL", name: "FIRST LEGO League Challenge" })
    .returning();
  await db.insert(userLeagueInterests).values({
    userId: "user_aluno",
    leagueId: fll.id,
    relationType: "participante",
    season: "bioglow",
  });
});

describe("ThinkLab com creatorScopeWhere", () => {
  it("quadros da equipe aparecem para todos os membros", async () => {
    actAs("user_aluno", teamId);
    const created = await createThinkLab("Estratégia da equipe");
    actAs("user_mentor", teamId);
    const ids = (await listThinkLabsByUserId()).map((t) => t.id);
    expect(ids).toContain(created.id);
  });

  it("quadros pessoais não vazam para o espaço da equipe", async () => {
    actAs("user_aluno");
    const personal = await createThinkLab("Rascunho pessoal");
    actAs("user_aluno", teamId);
    const ids = (await listThinkLabsByUserId()).map((t) => t.id);
    expect(ids).not.toContain(personal.id);
  });
});

describe("requireTeamAccess", () => {
  it("devolve o scope de equipe para membros", async () => {
    actAs("user_mentor");
    const scope = await requireTeamAccess(teamId);
    expect(scope).toMatchObject({ type: "team", teamId, role: "mentor" });
  });

  it("rejeita quem não é membro e ids inválidos", async () => {
    actAs("user_solo");
    await expect(requireTeamAccess(teamId)).rejects.toThrow("não é membro");
    await expect(requireTeamAccess("nao-e-uuid")).rejects.toThrow();
  });
});

describe("getUserLeagues", () => {
  it("lista as ligas do usuário com a relação e a temporada", async () => {
    const rows = await getUserLeagues("user_aluno");
    expect(rows).toEqual([
      expect.objectContaining({ code: "FLL", relationType: "participante", season: "bioglow" }),
    ]);
    expect(await getUserLeagues("user_solo")).toEqual([]);
  });

  it("alimenta as missões do ThinkLab", async () => {
    actAs("user_aluno");
    const packs = await getThinkLabMissionPacks();
    expect(packs[0].seasons.map((s) => s.key)).toContain("bioglow");
  });
});

describe("isOwnedByScope", () => {
  it("segue a mesma regra de creatorScopeWhere", () => {
    const personal = { type: "personal" as const, userId: "u1" };
    const team = { type: "team" as const, teamId: "t1", userId: "u1", role: "competidor" as const };
    expect(isOwnedByScope(personal, { userId: "u1", teamId: null })).toBe(true);
    expect(isOwnedByScope(personal, { userId: "u1", teamId: "t1" })).toBe(false);
    expect(isOwnedByScope(team, { userId: "u2", teamId: "t1" })).toBe(true);
    expect(isOwnedByScope(team, { userId: null, teamId: "t1" })).toBe(true);
    expect(isOwnedByScope(team, { userId: "u1", teamId: null })).toBe(false);
  });
});
