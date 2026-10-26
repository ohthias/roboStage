import { Database, HardDrive, Users } from "lucide-react";
import type { UserUsage } from "@/utils/stagebook/usage";
import { formatBytes } from "@/utils/format-bytes";
import { SettingsCard } from "./settings-card";

/**
 * Painel de uso: o que a conta tem e quanto ocupa. As barras mostram a fatia de
 * cada categoria no total de itens; o tamanho é uma estimativa do conteúdo
 * armazenado e não há cota rígida aplicada.
 */
export function UsagePanel({ usage }: { usage: UserUsage }) {
  const rows = usage.categories.map((c) => ({ ...c, items: c.personalCount + c.teamCount, bytes: c.personalBytes + c.teamBytes }));
  const maxItems = Math.max(1, ...rows.map((r) => r.items));

  return (
    <div className="space-y-6">
      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 sm:stats-horizontal">
        <div className="stat">
          <div className="stat-figure text-primary">
            <Database size={22} />
          </div>
          <div className="stat-title">Itens criados</div>
          <div className="stat-value text-3xl">{usage.totals.items.toLocaleString("pt-BR")}</div>
          <div className="stat-desc">em todas as ferramentas</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary">
            <HardDrive size={22} />
          </div>
          <div className="stat-title">Conteúdo armazenado</div>
          <div className="stat-value text-3xl">{formatBytes(usage.totals.bytes)}</div>
          <div className="stat-desc">
            {formatBytes(usage.totals.personalBytes)} pessoal · {formatBytes(usage.totals.teamBytes)} em equipes
          </div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary">
            <Users size={22} />
          </div>
          <div className="stat-title">Equipes</div>
          <div className="stat-value text-3xl">{usage.teams.member}</div>
          <div className="stat-desc">{usage.teams.owner} como técnico</div>
        </div>
      </div>

      <SettingsCard
        icon={Database}
        title="Consumo por categoria"
        description="“Equipes” conta o que você criou dentro de equipes — esse conteúdo pertence à equipe."
      >
        <ul className="divide-y divide-base-200">
          {rows.map((row) => (
            <li key={row.key} className="px-5 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-base-content/55">
                  <span className="font-semibold text-base-content">{row.items.toLocaleString("pt-BR")}</span>{" "}
                  {row.items === 1 ? "item" : "itens"} · {formatBytes(row.bytes)}
                </p>
              </div>
              <progress
                className="progress progress-primary mt-2 h-1.5 w-full"
                value={row.items}
                max={maxItems}
                aria-label={`${row.label}: ${row.items} itens`}
              />
              <p className="mt-1.5 text-[11px] text-base-content/45">
                {row.personalCount.toLocaleString("pt-BR")} pessoais · {row.teamCount.toLocaleString("pt-BR")} em equipes
              </p>
            </li>
          ))}
        </ul>
      </SettingsCard>

      <p className="text-xs text-base-content/45">
        O tamanho é uma estimativa do conteúdo (páginas, quadros, testes e textos); não inclui índices nem o espaço
        interno do banco. Não há limite aplicado à sua conta.
      </p>
    </div>
  );
}
