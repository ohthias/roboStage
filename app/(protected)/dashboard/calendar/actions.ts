"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { calendarEvents, calendarEventDocuments, documents } from "@/db/schema";
import { resolveStagebookScope, scopeOwnership } from "@/lib/stagebook/scope";
import { scopeWhere, assertSameScope } from "@/lib/stagebook/permissions";
import { cleanText, optionalText, requireDate, optionalDate, requireUuid } from "@/lib/stagebook/validation";

const PATH = "/dashboard/calendar";

export async function listEventsInRange(rangeStart: Date, rangeEnd: Date) {
  const scope = await resolveStagebookScope();
  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        scopeWhere(scope, { userId: calendarEvents.userId, teamId: calendarEvents.teamId }),
        gte(calendarEvents.startAt, rangeStart),
        lte(calendarEvents.startAt, rangeEnd)
      )
    )
    .orderBy(calendarEvents.startAt);
}

export async function getEventWithDocuments(id: string) {
  const scope = await resolveStagebookScope();
  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(
      and(eq(calendarEvents.id, id), scopeWhere(scope, { userId: calendarEvents.userId, teamId: calendarEvents.teamId }))
    )
    .limit(1);
  if (!event) return null;

  const linkedDocuments = await db
    .select({ id: documents.id, title: documents.title, icon: documents.icon })
    .from(calendarEventDocuments)
    .innerJoin(documents, eq(documents.id, calendarEventDocuments.documentId))
    .where(eq(calendarEventDocuments.eventId, id));

  return { ...event, documents: linkedDocuments };
}

export async function createEvent(input: {
  title: string;
  description?: string;
  startAt: string;
  endAt?: string | null;
  allDay?: boolean;
  type?: string;
  status?: string;
  color?: string | null;
  location?: string | null;
}) {
  const scope = await resolveStagebookScope();

  const [created] = await db
    .insert(calendarEvents)
    .values({
      ...scopeOwnership(scope),
      title: cleanText(input.title, { fallback: "Novo evento", maxLength: 200 }),
      description: optionalText(input.description, 2000),
      startAt: requireDate(input.startAt, "data de início"),
      endAt: optionalDate(input.endAt),
      allDay: Boolean(input.allDay),
      type: input.type || "evento",
      status: input.status || "confirmado",
      color: optionalText(input.color, 20),
      location: optionalText(input.location, 200),
      createdBy: scope.userId,
    })
    .returning({ id: calendarEvents.id });

  revalidatePath(PATH, "layout");
  return created;
}

export async function updateEvent(
  id: string,
  input: {
    title: string;
    description?: string;
    startAt: string;
    endAt?: string | null;
    allDay?: boolean;
    type?: string;
    status?: string;
    color?: string | null;
    location?: string | null;
  }
) {
  const scope = await resolveStagebookScope();

  await db
    .update(calendarEvents)
    .set({
      title: cleanText(input.title, { fallback: "Novo evento", maxLength: 200 }),
      description: optionalText(input.description, 2000),
      startAt: requireDate(input.startAt, "data de início"),
      endAt: optionalDate(input.endAt),
      allDay: Boolean(input.allDay),
      type: input.type || "evento",
      status: input.status || "confirmado",
      color: optionalText(input.color, 20),
      location: optionalText(input.location, 200),
      updatedBy: scope.userId,
      updatedAt: new Date(),
    })
    .where(
      and(eq(calendarEvents.id, id), scopeWhere(scope, { userId: calendarEvents.userId, teamId: calendarEvents.teamId }))
    );

  revalidatePath(PATH, "layout");
}

export async function deleteEvent(id: string) {
  const scope = await resolveStagebookScope();
  await db
    .delete(calendarEvents)
    .where(
      and(eq(calendarEvents.id, id), scopeWhere(scope, { userId: calendarEvents.userId, teamId: calendarEvents.teamId }))
    );
  revalidatePath(PATH, "layout");
}

/** Lista Pages do scope atual, para o seletor de "anexar página ao evento". */
export async function listPagesForLinking() {
  const scope = await resolveStagebookScope();
  return db
    .select({ id: documents.id, title: documents.title, icon: documents.icon })
    .from(documents)
    .where(scopeWhere(scope, { userId: documents.userId, teamId: documents.teamId }))
    .orderBy(documents.title);
}

export async function linkDocumentToEvent(eventId: string, documentId: string) {
  const scope = await resolveStagebookScope();
  requireUuid(eventId, "evento");
  requireUuid(documentId, "página");

  const [event] = await db
    .select({ userId: calendarEvents.userId, teamId: calendarEvents.teamId })
    .from(calendarEvents)
    .where(
      and(eq(calendarEvents.id, eventId), scopeWhere(scope, { userId: calendarEvents.userId, teamId: calendarEvents.teamId }))
    )
    .limit(1);
  if (!event) throw new Error("Evento não encontrado.");

  const [page] = await db
    .select({ userId: documents.userId, teamId: documents.teamId })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  if (!page) throw new Error("Página não encontrada.");

  assertSameScope(event, page);

  await db
    .insert(calendarEventDocuments)
    .values({ eventId, documentId })
    .onConflictDoNothing();

  revalidatePath(PATH, "layout");
}

export async function unlinkDocumentFromEvent(eventId: string, documentId: string) {
  await resolveStagebookScope();
  await db
    .delete(calendarEventDocuments)
    .where(and(eq(calendarEventDocuments.eventId, eventId), eq(calendarEventDocuments.documentId, documentId)));
  revalidatePath(PATH, "layout");
}
