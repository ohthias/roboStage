"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import { loadTeamActivity } from "@/utils/stagebook/actions/training";
import type { TeamActivityItem } from "@/types/training";
import { ActivityItem, groupByDay } from "./activity-item";

const PAGE = 30;

/**
 * Feed completo da equipe (`?tab=geral&feed=all`): agrupado por dia, com
 * "carregar mais" por cursor. O LiveRefresh da página re-renderiza a primeira
 * página; as páginas extras carregadas aqui são mantidas.
 */
export function ActivityFeed({ teamId, initial }: { teamId: string; initial: TeamActivityItem[] }) {
  const [extra, setExtra] = useState<TeamActivityItem[]>([]);
  const [done, setDone] = useState(initial.length < PAGE);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Itens novos na primeira página não duplicam os já carregados.
  const ids = new Set(initial.map((i) => i.id));
  const items = [...initial, ...extra.filter((i) => !ids.has(i.id))];

  function loadMore() {
    const last = items[items.length - 1];
    if (!last) return;
    setError(null);
    startTransition(async () => {
      const result = await loadTeamActivity(teamId, last.updatedAt);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setExtra((prev) => [...prev, ...result.data]);
      if (result.data.length < PAGE) setDone(true);
    });
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/dashboard/team/${teamId}?tab=geral`} className="btn btn-ghost btn-sm btn-square" aria-label="Voltar">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-lg font-semibold">Atividade da equipe</h2>
          <p className="text-sm text-base-content/55">Tudo o que aconteceu, do mais recente ao mais antigo.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card border border-dashed border-base-300 bg-base-100">
          <div className="card-body items-center py-12 text-center">
            <History size={22} className="text-base-content/30" />
            <p className="text-sm text-base-content/55">Nada por aqui ainda.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {groupByDay(items).map((group) => (
            <div key={group.label}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/45" suppressHydrationWarning>
                {group.label}
              </h3>
              <ul className="divide-y divide-base-200 rounded-box border border-base-300 bg-base-100 px-4">
                {group.items.map((item) => (
                  <ActivityItem key={item.id} teamId={teamId} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error alert-soft mt-4 py-2 text-sm">
          {error}
        </div>
      )}

      {!done && items.length > 0 && (
        <div className="mt-5 flex justify-center">
          <button type="button" className="btn btn-sm" onClick={loadMore} disabled={isPending}>
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Carregar mais
          </button>
        </div>
      )}
    </section>
  );
}
