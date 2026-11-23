import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userPreferences, users } from "@/db/schema";
import { updatePersonaType } from "@/utils/stagebook/actions/account";
import { updatePreferences } from "@/utils/stagebook/actions/preferences";
import { getPreferencesFor } from "@/utils/stagebook/preferences-core";
import {
  PERSONA_LOCK_MS,
  formatLockCountdown,
  personaLockState,
} from "@/utils/stagebook/persona-lock";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createUser } from "./helpers/db";

const HOUR = 3_600_000;

async function userCreatedAgo(id: string, ms: number, persona: "entusiasta" | null = "entusiasta") {
  await createUser(id);
  await db
    .update(users)
    .set({ createdAt: new Date(Date.now() - ms), personaType: persona })
    .where(eq(users.id, id));
}

beforeAll(async () => {
  await applySchema();
});

describe("trava do tipo de conta (regra pura)", () => {
  it("fica livre por 48 h e trava depois", () => {
    const created = new Date("2026-11-01T12:00:00Z");
    expect(personaLockState(created, new Date("2026-11-03T11:59:00Z")).locked).toBe(false);
    expect(personaLockState(created, new Date("2026-11-03T12:00:00Z")).locked).toBe(true);
    expect(personaLockState(created, new Date("2026-11-01T12:00:00Z")).msLeft).toBe(PERSONA_LOCK_MS);
  });

  it("formata o prazo restante", () => {
    expect(formatLockCountdown(30 * 60_000)).toBe("menos de 1 h");
    expect(formatLockCountdown(5 * HOUR)).toBe("5 h");
    expect(formatLockCountdown(24 * HOUR)).toBe("1 dia");
    expect(formatLockCountdown(27 * HOUR)).toBe("1 dia e 3 h");
  });
});

describe("updatePersonaType respeita a trava", () => {
  it("troca livre nas primeiras 48 h", async () => {
    await userCreatedAgo("lock_novo", 10 * HOUR);
    actAs("lock_novo");
    await expect(call(updatePersonaType("organizador"))).resolves.toBe("organizador");
  });

  it("recusa depois de 48 h e manda falar com a equipe", async () => {
    await userCreatedAgo("lock_velho", 49 * HOUR);
    actAs("lock_velho");
    await expect(call(updatePersonaType("organizador"))).rejects.toThrow(/fale com a equipe/);
    const row = await db.query.users.findFirst({ where: eq(users.id, "lock_velho") });
    expect(row?.personaType).toBe("entusiasta");
  });

  it("salvar o mesmo tipo não é erro, mesmo travado", async () => {
    actAs("lock_velho");
    await expect(call(updatePersonaType("entusiasta"))).resolves.toBe("entusiasta");
  });

  it("quem ainda não escolheu pode escolher mesmo depois do prazo", async () => {
    await userCreatedAgo("lock_sem_tipo", 100 * HOUR, null);
    actAs("lock_sem_tipo");
    await expect(call(updatePersonaType("mentor_tecnico"))).resolves.toBe("mentor_tecnico");
  });
});

describe("preferência do ShowLive", () => {
  it("começa desligada e liga/desliga", async () => {
    await createUser("sl_pref");
    actAs("sl_pref");
    expect((await getPreferencesFor("sl_pref")).showliveEnabled).toBe(false);
    await call(updatePreferences({ showliveEnabled: true }));
    expect((await getPreferencesFor("sl_pref")).showliveEnabled).toBe(true);
    const [row] = await db.select().from(userPreferences).where(eq(userPreferences.userId, "sl_pref"));
    expect(row.showliveEnabled).toBe(true);
    await call(updatePreferences({ showliveEnabled: false }));
    expect((await getPreferencesFor("sl_pref")).showliveEnabled).toBe(false);
  });
});
