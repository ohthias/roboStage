import { beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { trainingSessions } from "@/db/schema";
import { getMyTeamsSummary } from "@/utils/stagebook/team-queries";
import { applySchema, createTeam } from "./helpers/db";

describe("hub de equipes", () => {
  let teamId: string;
  beforeAll(async () => {
    await applySchema();
    teamId = await createTeam("Hub Alfa", [
      { userId: "hub_ana", role: "owner" },
      { userId: "hub_bia", role: "competidor" },
    ]);
    await createTeam("Hub Beta", [{ userId: "hub_bia", role: "mentor" }]);
    await db.insert(trainingSessions).values({
      teamId,
      title: "Treino de quinta",
      status: "em_andamento",
      startedAt: new Date(),
      createdBy: "hub_ana",
    });
  });

  it("lista as equipes do usuário com cargo, membros e treino ao vivo", async () => {
    const teams = await getMyTeamsSummary("hub_bia");
    expect(teams.map((t) => t.name)).toEqual(["Hub Alfa", "Hub Beta"]);
    expect(teams[0]).toMatchObject({ role: "competidor", memberCount: 2, liveSession: "Treino de quinta" });
    expect(teams[1]).toMatchObject({ role: "mentor", memberCount: 1, liveSession: null });
    expect(await getMyTeamsSummary("hub_ana")).toHaveLength(1);
  });
});
