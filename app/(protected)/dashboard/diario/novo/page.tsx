import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveStagebookScope } from "@/features/stagebook/lib/scope";
import {
  findMyJournalEntryOn,
  getJournalScopeInfo,
  listJournalTemplates,
} from "@/features/stagebook/lib/journal-queries";
import { DEFAULT_JOURNAL_TEMPLATE_KEY, isIsoDate } from "@/features/stagebook/types/journal";
import { requireMilestoneInScope } from "@/features/stagebook/lib/labels-core";
import { JournalEditor } from "@/features/stagebook/journal/components/journal-editor";

export const metadata: Metadata = { title: "Nova entrada · Diário" };

/**
 * Entrada nova. Nada vai para o banco até a pessoa escrever algo (o editor
 * cria a entrada no primeiro salvamento), então abrir e sair não deixa lixo.
 *
 * `?data=` vem do navegador com o "hoje" local. Se a pessoa já tem uma entrada
 * nesse dia, abre a existente — a não ser que tenha pedido outra (`?nova=1`).
 */
export default async function NovaEntradaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; template?: string; nova?: string; marco?: string }>;
}) {
  const sp = await searchParams;
  const date = isIsoDate(sp.data) ? sp.data : null;
  const scope = await resolveStagebookScope();

  // "Registrar no diário" a partir de uma meta: sempre uma entrada nova, já com a meta.
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const milestone = sp.marco && UUID.test(sp.marco) ? await requireMilestoneInScope(scope, sp.marco).catch(() => null) : null;

  if (date && sp.nova !== "1" && !milestone) {
    const existing = await findMyJournalEntryOn(scope, date);
    if (existing) redirect(`/dashboard/diario/${existing}`);
  }

  const [scopeInfo, templates] = await Promise.all([getJournalScopeInfo(scope), listJournalTemplates(scope)]);
  const template =
    templates.find((t) => t.key === sp.template) ??
    templates.find((t) => t.key === DEFAULT_JOURNAL_TEMPLATE_KEY) ??
    templates[0];

  const me = scopeInfo.type === "team" ? scopeInfo.members.find((m) => m.id === scope.userId) : undefined;

  return (
    <JournalEditor
      mode="new"
      scope={scopeInfo}
      templates={templates}
      initialTemplateKey={template.key}
      initialDate={date}
      initialMilestone={milestone}
      author={me ?? { id: scope.userId, name: null, avatarUrl: null }}
    />
  );
}
