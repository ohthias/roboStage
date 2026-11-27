import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveStagebookScope } from "@/features/stagebook/lib/scope";
import { getJournalEntry, getJournalScopeInfo, listJournalTemplates } from "@/features/stagebook/lib/journal-queries";
import { formatJournalDate } from "@/features/stagebook/types/journal";
import { JournalEditor } from "@/features/stagebook/journal/components/journal-editor";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(id: string) {
  if (!UUID_RE.test(id)) return null;
  const scope = await resolveStagebookScope();
  const entry = await getJournalEntry(scope, id);
  return entry ? { scope, entry } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const data = await load((await params).id);
  if (!data) return { title: "Diário" };
  return { title: `${data.entry.title || formatJournalDate(data.entry.entryDate, "weekday")} · Diário` };
}

export default async function EntradaPage({ params }: { params: Promise<{ id: string }> }) {
  const data = await load((await params).id);
  if (!data) notFound();
  const { scope, entry } = data;

  const [scopeInfo, templates] = await Promise.all([
    getJournalScopeInfo(scope),
    entry.canEdit ? listJournalTemplates(scope) : Promise.resolve([]),
  ]);

  return <JournalEditor mode="edit" scope={scopeInfo} templates={templates} entry={entry} author={entry.author} />;
}
