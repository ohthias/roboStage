import { Filter, Plus, ListChecks, Gauge, SlidersHorizontal, Calendar, Layers } from "lucide-react";
import Link from "next/link";
import { listTests } from "./new/actions";

// ---------------------------------------------------------------------------
// Metadados visuais por modo/status. Ajuste labels/cores como preferir.
// ---------------------------------------------------------------------------

const MODE_META: Record<
  string,
  { label: string; icon: typeof ListChecks; badgeClass: string }
> = {
  runs: { label: "Runs", icon: ListChecks, badgeClass: "badge-primary" },
  calibrabot: { label: "Calibrabot", icon: Gauge, badgeClass: "badge-info" },
  individual: {
    label: "Calibrabot · Motores",
    icon: Gauge,
    badgeClass: "badge-info",
  },
  custom: {
    label: "Customizado",
    icon: SlidersHorizontal,
    badgeClass: "badge-secondary",
  },
};

const STATUS_META: Record<string, { label: string; badgeClass: string }> = {
  planejamento: { label: "Planejamento", badgeClass: "badge-ghost" },
  em_andamento: { label: "Em andamento", badgeClass: "badge-warning" },
  concluido: { label: "Concluído", badgeClass: "badge-success" },
  cancelado: { label: "Cancelado", badgeClass: "badge-error" },
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

// ---------------------------------------------------------------------------
// Resume o jsonb `config` em uma linha curta, de acordo com o modo do teste.
// ---------------------------------------------------------------------------

function summarizeConfig(mode: string, config: unknown): string {
  if (!config || typeof config !== "object") return "Sem configuração";
  const c = config as Record<string, unknown>;

  if (mode === "runs") {
    const missions = Array.isArray(c.missions) ? c.missions.length : 0;
    return `${missions} ${missions === 1 ? "missão" : "missões"}`;
  }

  if (mode === "individual" || (mode === "calibrabot" && c.tipo === "motores")) {
    const motores = Array.isArray(c.motores) ? c.motores.length : 0;
    const modo = typeof c.modo === "string" ? c.modo : "individual";
    return `${motores} ${motores === 1 ? "motor" : "motores"} · ${modo}`;
  }

  if (mode === "calibrabot" && c.tipo === "giroscopio") {
    const indicadores = Array.isArray(c.indicadores) ? c.indicadores.length : 0;
    return `Alvo ${c.anguloAlvo ?? "?"}° · ${indicadores} indicador(es)`;
  }

  if (mode === "calibrabot" && c.tipo === "pid") {
    const parametros = Array.isArray(c.parametros) ? c.parametros.length : 0;
    return `Distância ${c.distanciaAlvo ?? "?"}cm · ${parametros} parâmetro(s)`;
  }

  if (mode === "custom") {
    const parametros = Array.isArray(c.parametros) ? c.parametros.length : 0;
    return `${parametros} ${parametros === 1 ? "parâmetro" : "parâmetros"}`;
  }

  return "Configuração personalizada";
}

export default async function LabTestPage() {
  const tests = await listTests();

  return (
    <div className="w-full">
      <nav className="flex w-full items-center justify-between border-b border-base-content/10 bg-base-100 px-5">
        <div className="flex items-center gap-6">
          <div className="flex h-full items-center gap-1">
            <Link
              href="/dashboard/labtest"
              className="relative px-3 py-3 text-sm font-medium text-base-content transition-colors hover:text-primary"
            >
              Geral
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
            </Link>
            <Link
              href="/dashboard/labtest/analytics"
              className="px-3 py-3 text-sm font-medium text-base-content/50 transition-colors hover:text-base-content"
            >
              Analytics
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
            aria-label="Filtrar testes"
          >
            <Filter size={16} />
          </button>
          <div className="h-5 w-px bg-base-content/10" />
          <Link
            href="/dashboard/labtest/new"
            className="btn btn-primary btn-sm gap-2 px-3 font-medium shadow-sm"
          >
            <Plus size={16} />
            Novo teste
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-5 py-6">
        <div className="flex items-end justify-between border-l border-base-content/10 bg-base-100 px-6 py-5">
          <div>
            <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/35">
              LabTest
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-base-content">
              Testes
            </h2>
            <p className="mt-1 text-sm text-base-content/50">
              Gerencie e acompanhe os seus testes realizados.
            </p>
          </div>

          <span className="badge badge-neutral badge-lg">
            {tests.length} {tests.length === 1 ? "teste" : "testes"}
          </span>
        </div>

        {/* ================================================================= */}
        {/* Grid de testes */}
        {/* ================================================================= */}
        {tests.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-200/20 px-6 py-16 text-center">
            <Layers className="size-9 text-base-content/20" />
            <p className="text-sm font-medium text-base-content">
              Nenhum teste criado ainda
            </p>
            <p className="max-w-xs text-xs text-base-content/50">
              Crie seu primeiro teste para começar a acompanhar seus
              resultados.
            </p>
            <Link
              href="/dashboard/labtest/new"
              className="btn btn-primary btn-sm mt-2 gap-2"
            >
              <Plus size={16} />
              Novo teste
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => {
              const modeMeta = MODE_META[test.mode] ?? {
                label: test.mode,
                icon: Layers,
                badgeClass: "badge-neutral",
              };
              const statusMeta = STATUS_META[test.status] ?? {
                label: test.status,
                badgeClass: "badge-ghost",
              };
              const ModeIcon = modeMeta.icon;

              return (
                <Link
                  key={test.id}
                  href={`/dashboard/labtest/${test.id}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ModeIcon className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-base-content group-hover:text-primary">
                          {test.name}
                        </p>
                        <p className="text-xs text-base-content/50">
                          {modeMeta.label}
                        </p>
                      </div>
                    </div>

                    <span className={`badge badge-sm shrink-0 ${statusMeta.badgeClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  {test.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-base-content/60">
                      {test.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-base-300 pt-3 text-xs text-base-content/50">
                    <span className="truncate">
                      {summarizeConfig(test.mode, test.config)}
                    </span>

                    <span className="flex shrink-0 items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {dateFormatter.format(new Date(test.createdAt))}
                    </span>
                  </div>

                  {test.season && (
                    <span className="badge badge-outline badge-xs w-fit font-mono uppercase">
                      {test.season}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}