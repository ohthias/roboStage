/**
 * Testes de caracterização de calendar/actions.ts (ver documents-actions.test.ts).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { calendarEvents } from "@/db/schema";
import {
  createEvent,
  deleteEvent,
  getEventWithDocuments,
  linkDocumentToEvent,
  listEventsInRange,
  listPagesForLinking,
  unlinkDocumentFromEvent,
  updateEvent,
} from "@/app/(protected)/dashboard/calendar/actions";
import { createDocument, renameDocument } from "@/app/(protected)/dashboard/documents/actions";
import { call } from "./helpers/actions";
import { actAs } from "./helpers/context";
import { applySchema, createTeam, createUser } from "./helpers/db";

const eventRow = async (id: string) =>
  (await db.select().from(calendarEvents).where(eq(calendarEvents.id, id)))[0];

let teamId: string;
let otherTeamId: string;

beforeAll(async () => {
  await applySchema();
  await createUser("user_gil");
  teamId = await createTeam("Equipe Delta", [
    { userId: "user_hana", role: "owner" },
    { userId: "user_ivo", role: "competidor" },
  ]);
  otherTeamId = await createTeam("Equipe Épsilon", [{ userId: "user_ivo", role: "competidor" }]);
});

describe("eventos", () => {
  it("cria com valores padrão e limpa o texto", async () => {
    actAs("user_hana");
    const event = await call(createEvent({ title: "  ", startAt: "2026-11-02T13:00:00.000Z" }));
    expect(await eventRow(event.id)).toMatchObject({
      title: "Novo evento",
      type: "evento",
      status: "confirmado",
      allDay: false,
      userId: "user_hana",
      teamId: null,
      createdBy: "user_hana",
    });
  });

  it("valida datas", async () => {
    actAs("user_hana");
    await expect(
      call(createEvent({ title: "Treino", startAt: "2026-11-02T13:00:00Z", endAt: "2026-11-01T13:00:00Z" })),
    ).rejects.toThrow("A data de fim não pode ser anterior à data de início.");
    await expect(call(createEvent({ title: "Treino", startAt: "ontem" }))).rejects.toThrow(
      "data de início inválida.",
    );
  });

  it("atualiza e exclui só dentro do escopo", async () => {
    actAs("user_hana");
    const event = await call(createEvent({ title: "Treino", startAt: "2026-11-03T13:00:00Z" }));

    actAs("user_gil");
    await call(updateEvent(event.id, { title: "Invadido", startAt: "2026-11-03T13:00:00Z" }));
    await call(deleteEvent(event.id));
    expect((await eventRow(event.id)).title).toBe("Treino");

    actAs("user_hana");
    await call(
      updateEvent(event.id, { title: "Treino de mesa", startAt: "2026-11-03T13:00:00Z", type: "treino" }),
    );
    expect(await eventRow(event.id)).toMatchObject({ title: "Treino de mesa", type: "treino", updatedBy: "user_hana" });
    await expect(
      call(updateEvent(event.id, { title: "x", startAt: "2026-11-03T13:00:00Z", endAt: "2026-11-02T00:00:00Z" })),
    ).rejects.toThrow("A data de fim não pode ser anterior à data de início.");
    await call(deleteEvent(event.id));
    expect(await eventRow(event.id)).toBeUndefined();
  });
});

describe("páginas ligadas ao evento", () => {
  it("liga, lista e desliga páginas do mesmo escopo", async () => {
    actAs("user_hana");
    const event = await call(createEvent({ title: "Revisão", startAt: "2026-11-04T13:00:00Z" }));
    const page = await call(createDocument());
    await call(renameDocument(page.id, "Ata"));

    expect((await listPagesForLinking()).map((p) => p.id)).toContain(page.id);
    await call(linkDocumentToEvent(event.id, page.id));
    await call(linkDocumentToEvent(event.id, page.id)); // repetido não duplica
    expect((await getEventWithDocuments(event.id))?.documents).toEqual([
      { id: page.id, title: "Ata", icon: null },
    ]);

    await call(unlinkDocumentFromEvent(event.id, page.id));
    expect((await getEventWithDocuments(event.id))?.documents).toEqual([]);
  });

  it("recusa página de outro escopo e evento inexistente", async () => {
    actAs("user_gil");
    const foreignPage = await call(createDocument());
    actAs("user_hana");
    const event = await call(createEvent({ title: "Revisão", startAt: "2026-11-04T13:00:00Z" }));
    await expect(call(linkDocumentToEvent(event.id, foreignPage.id))).rejects.toThrow(
      "Os recursos precisam pertencer ao mesmo espaço",
    );
    const missing = "00000000-0000-4000-8000-000000000000";
    await expect(call(linkDocumentToEvent(missing, foreignPage.id))).rejects.toThrow("Evento não encontrado.");
    await expect(call(unlinkDocumentFromEvent(missing, foreignPage.id))).rejects.toThrow(
      "Evento não encontrado.",
    );
    expect(await getEventWithDocuments(missing)).toBeNull();
  });
});

describe("listEventsInRange", () => {
  it("lista o escopo atual e, se pedido, outras equipes do usuário", async () => {
    actAs("user_ivo", teamId);
    const mine = await call(createEvent({ title: "Equipe Delta", startAt: "2026-12-01T10:00:00Z" }));
    actAs("user_ivo", otherTeamId);
    const other = await call(createEvent({ title: "Equipe Épsilon", startAt: "2026-12-02T10:00:00Z" }));
    actAs("user_hana", teamId);
    const notMine = await call(createEvent({ title: "Só Delta", startAt: "2026-12-03T10:00:00Z" }));

    actAs("user_ivo", teamId);
    const start = new Date("2026-12-01T00:00:00Z");
    const end = new Date("2026-12-31T00:00:00Z");
    const base = (await listEventsInRange(start, end)).map((e) => e.id);
    expect(base).toEqual(expect.arrayContaining([mine.id, notMine.id]));
    expect(base).not.toContain(other.id);

    const withOther = (await listEventsInRange(start, end, [otherTeamId])).map((e) => e.id);
    expect(withOther).toContain(other.id);

    actAs("user_hana", teamId); // não é da Épsilon: o id extra é ignorado
    expect((await listEventsInRange(start, end, [otherTeamId])).map((e) => e.id)).not.toContain(other.id);
  });
});
