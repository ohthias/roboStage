import type { Metadata } from "next";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import {
  getJournalScopeInfo,
  listJournalEntries,
  listJournalTemplates,
  listMyJournalDates,
  parseJournalMonth,
} from "@/utils/stagebook/journal-queries";
import { requireMilestoneInScope } from "@/utils/stagebook/labels-core";
import { JournalHome } from "./_components/journal-home";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata: Metadata = { title: "Diário" };

/**
 * O servidor não sabe o fuso de quem acessa; usamos o de Brasília só para o
 * mês padrão. O "hoje" de verdade (data nova, sequência) é calculado no navegador.
 */
function serverToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export default async function DiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; q?: string; marco?: string }>;
}) {
  const sp = await searchParams;
  const today = serverToday();
  const month = parseJournalMonth(sp.mes) ?? today.slice(0, 7);
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";

  const scope = await resolveStagebookScope();
  // ?marco= mostra todas as entradas daquela meta, de qualquer data.
  const goal = sp.marco && UUID_RE.test(sp.marco) ? await requireMilestoneInScope(scope, sp.marco).catch(() => null) : null;
  const [scopeInfo, entries, myDates, templates] = await Promise.all([
    getJournalScopeInfo(scope),
    listJournalEntries(scope, { month, q, milestoneId: goal?.id ?? null }),
    listMyJournalDates(scope, today),
    listJournalTemplates(scope),
  ]);

  return (
    <JournalHome
      key={`${month}|${q}|${goal?.id ?? ""}`}
      goal={goal}
      viewerId={scope.userId}
      scope={scopeInfo}
      month={month}
      query={q}
      entries={entries}
      myDates={myDates}
      templates={templates}
    />
  );
}
