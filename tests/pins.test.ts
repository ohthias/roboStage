import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, tests, thinklab, userPins } from "@/db/schema";
import { findPinCandidates, getPinState, listPins, movePin, pinResource, unpinResource } from "@/utils/stagebook/actions/pins";
import { pathAfterSwitch } from "@/components/stagebook/sidebar-space-switcher";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

const ANA = "pin_ana";
const BIA = "pin_bia";
let teamId: string;

async function personalTest(name: string, user = ANA) {
  const [row] = await db.insert(tests).values({ userId: user, name, config: {} }).returning({ id: tests.id });
  return row.id;
}

beforeAll(async () => {
  await applySchema();
  await createUser(ANA);
  teamId = await createTeam("Pins FC", [
    { userId: ANA, role: "competidor" },
    { userId: BIA, role: "owner" },
  ]);
});

describe("fixados", () => {
  it("fixa até 3 itens por espaço, na ordem, e reordena", async () => {
    actAs(ANA);
    const ids = [await personalTest("T1"), await personalTest("T2"), await personalTest("T3"), await personalTest("T4")];
    const [doc] = await db.insert(documents).values({ userId: ANA, title: "Caderno", createdBy: ANA }).returning({ id: documents.id });

    await call(pinResource("labtest", ids[0]));
    await call(pinResource("stagebook", doc.id));
    await call(pinResource("labtest", ids[1]));
    // repetido não conta
    await call(pinResource("labtest", ids[1]));
    const full = await pinResource("labtest", ids[2]);
    expect(full.ok).toBe(false);
    if (!full.ok) expect(full.error).toMatch(/já fixou 3/);

    let pins = await listPins();
    expect(pins.map((p) => p.title)).toEqual(["T1", "Caderno", "T2"]);
    expect(pins[1].href).toBe(`/dashboard/documents/${doc.id}`);
    expect(await getPinState("labtest", ids[0])).toEqual({ pinned: true, full: true });

    await call(movePin(pins[2].id, "up"));
    pins = await listPins();
    expect(pins.map((p) => p.title)).toEqual(["T1", "T2", "Caderno"]);

    await call(unpinResource(pins[0].id));
    expect((await listPins()).length).toBe(2);
  });

  it("cada espaço tem os seus fixados e não aceita item de outro espaço", async () => {
    actAs(ANA, teamId);
    const personal = await personalTest("Pessoal só");
    expect((await pinResource("labtest", personal)).ok).toBe(false);

    const [board] = await db
      .insert(thinklab)
      .values({ userId: BIA, teamId, name: "Quadro da equipe" })
      .returning({ id: thinklab.id });
    await call(pinResource("thinklab", board.id));
    expect((await listPins()).map((p) => p.title)).toEqual(["Quadro da equipe"]);

    actAs(ANA);
    expect((await listPins()).map((p) => p.title)).not.toContain("Quadro da equipe");
  });

  it("item excluído some da barra (e a linha é limpa)", async () => {
    actAs(BIA);
    const id = await personalTest("Vai sumir", BIA);
    await call(pinResource("labtest", id));
    await db.delete(tests).where(eq(tests.id, id));
    expect(await listPins()).toEqual([]);
    expect(await db.select().from(userPins).where(eq(userPins.resourceId, id))).toHaveLength(0);
  });

  it("busca candidatos só do espaço ativo, marcando os já fixados", async () => {
    actAs(ANA, teamId);
    const found = await call(findPinCandidates({ q: "quadro" }));
    expect(found.map((f) => f.title)).toEqual(["Quadro da equipe"]);
    expect(found[0].pinned).toBe(true);
    const none = await call(findPinCandidates({ q: "Pessoal só" }));
    expect(none).toEqual([]);
  });
});

describe("troca de espaço", () => {
  const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
  it("página de item volta para a lista da ferramenta", () => {
    expect(pathAfterSwitch(`/dashboard/labtest/${id}/execute`, null)).toBe("/dashboard/labtest");
    expect(pathAfterSwitch(`/dashboard/documents/${id}`, id)).toBe("/dashboard/documents");
    expect(pathAfterSwitch("/dashboard/labtest", id)).toBeNull();
  });
  it("na área de equipes abre a equipe escolhida", () => {
    expect(pathAfterSwitch(`/dashboard/team/${id}?tab=x`, id)).toBe(`/dashboard/team/${id}`);
    expect(pathAfterSwitch(`/dashboard/team/${id}`, null)).toBe("/dashboard/team?view=all");
  });
});
