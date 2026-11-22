import { Activity, CheckCircle2, FlaskConical, Layers, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { LabTestCard } from "@/components/labtest/LabTestCard";
import { StatCard } from "@/components/labtest/shared";
import { LabTestToolbar } from "@/components/labtest/LabTestToolbar";
import { PersonalTransferButton } from "@/components/stagebook/transfer/personal-transfer-button";
import { LabTestTabs } from "@/components/labtest/LabTestTabs";
import { LabTestFilters } from "@/components/labtest/LabTestFilters";
import { normalizeStatus } from "@/utils/labtest/catalog";
import {
  LIST_SORT_LABEL,
  activeListFilterCount,
  applyListFilters,
  listHref,
  parseListFilters,
  type ListParams,
} from "@/utils/labtest/list-filters";
import { getLatestExecutionScores, listTests } from "./new/actions";
import { getResourcesTags } from "@/utils/stagebook/actions/tags";
import { listMilestones } from "@/utils/stagebook/actions/milestones";

export default async function LabTestPage({
  searchParams,
}: {
  searchParams?: Promise<ListParams>;
}) {
  const tests = await listTests();
  const raw = (await searchParams) ?? {};
  // Só os parâmetros conhecidos seguem nos links (evita lixo na URL).
  const params: ListParams = {
    q: raw.q,
    modo: raw.modo,
    status: raw.status,
    temporada: raw.temporada,
    ordem: raw.ordem,
    novos: raw.novos,
    visualizacao: raw.visualizacao,
  };
  const viewMode = params.visualizacao === "grid" ? "grid" : "list";
  const filters = parseListFilters(params);
  const hasFilters = activeListFilterCount(filters) > 0;
  const filteredTests = applyListFilters(tests, filters);
  const seasons = [...new Set(tests.map((t) => t.season).filter((s): s is string => Boolean(s)))].sort();
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filteredTests.length / pageSize));
  const currentPage = Math.min(
    Math.max(Number(raw.pagina) || 1, 1),
    totalPages,
  );
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Tags e milestones universais dos testes exibidos nesta página.
  // e pontos da última execução de cada um.
  const [tagsByTest, milestoneList, lastScores] = await Promise.all([
    getResourcesTags("labtest", paginatedTests.map((t) => t.id)),
    listMilestones(),
    getLatestExecutionScores(paginatedTests.filter((t) => t.executionCount > 0).map((t) => t.id)),
  ]);
  const milestoneById = new Map(milestoneList.map((m) => [m.id, m]));
  const labeledTests = paginatedTests.map((test) => ({
    ...test,
    tags: tagsByTest[test.id] ?? [],
    milestone: test.milestoneId ? (milestoneById.get(test.milestoneId) ?? null) : null,
    lastScore: lastScores[test.id] ?? null,
  }));
  // A lista já vem da execução mais recente para a mais antiga; o primeiro
  // teste da primeira página ganha destaque se já foi executado.
  const featuredId =
    filters.sort === "recente" && currentPage === 1 && labeledTests[0]?.lastExecutedAt ? labeledTests[0].id : null;

  const countBy = (predicate: (t: (typeof tests)[number]) => boolean) =>
    tests.filter(predicate).length;

  return (
    <div className="min-h-full bg-base-200/40 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Lab<span className="text-primary">Test</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
            Gerencie, configure e acompanhe os testes realizados pelo seus
            teste, seja nos desafios das competições ou testes isolados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PersonalTransferButton kind="labtest" />
          <LabTestToolbar viewMode={viewMode} params={params} />
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo dos testes">
        <StatCard
          label="Total de testes"
          value={tests.length}
          sub="criados pela equipe"
          icon={FlaskConical}
          accent="primary"
          href={listHref({ visualizacao: params.visualizacao, ordem: params.ordem }, {})}
          active={!hasFilters}
        />
        <StatCard
          label="Em andamento"
          value={countBy((t) => normalizeStatus(t.status) === "em_andamento")}
          sub="testes ativos agora"
          icon={Activity}
          accent="secondary"
          href={listHref(params, { status: filters.status === "em_andamento" ? undefined : "em_andamento", pagina: undefined })}
          active={filters.status === "em_andamento"}
        />
        <StatCard
          label="Concluídos"
          value={countBy((t) => normalizeStatus(t.status) === "concluido")}
          sub="finalizados"
          icon={CheckCircle2}
          accent="info"
          href={listHref(params, { status: filters.status === "concluido" ? undefined : "concluido", pagina: undefined })}
          active={filters.status === "concluido"}
        />
        <StatCard
          label="Runs de competição"
          value={countBy((t) => t.mode === "runs")}
          sub="pontuação por temporada"
          icon={Trophy}
          accent="accent"
          href={listHref(params, { modo: filters.mode === "runs" ? undefined : "runs", pagina: undefined })}
          active={filters.mode === "runs"}
        />
      </section>

      <nav className="mt-8 space-y-4">
        <LabTestTabs active="geral" />
        <LabTestFilters
          filters={filters}
          params={params}
          seasons={seasons}
          shown={filteredTests.length}
          total={tests.length}
        />
      </nav>

      <main className="flex-1">
        {filteredTests.length > 0 && (
          <p className="mt-5 text-xs text-base-content/50">
            Ordenados por {LIST_SORT_LABEL[filters.sort].toLowerCase()}
          </p>
        )}
        {/* Empty state */}
        {filteredTests.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
            <Layers className="size-9 text-base-content/20" />

            <p className="text-sm font-medium text-base-content">
              {hasFilters ? "Nenhum teste com esses filtros" : "Nenhum teste criado ainda"}
            </p>

            <p className="max-w-xs text-xs text-base-content/50">
              {hasFilters
                ? "Mude ou limpe os filtros para ver os demais testes."
                : "Crie seu primeiro teste para começar a acompanhar seus resultados."}
            </p>

            {hasFilters ? (
              <Link
                href={listHref({ visualizacao: params.visualizacao, ordem: params.ordem }, {})}
                className="btn btn-ghost btn-sm mt-2"
              >
                Limpar filtros
              </Link>
            ) : (
              <Link
                href="/dashboard/labtest/new"
                className="btn btn-primary btn-sm mt-2 gap-2"
              >
                <Plus size={16} />
                Novo teste
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                : "mt-3 flex flex-col gap-3"
            }
          >
            {labeledTests.map((test) => (
              <LabTestCard key={test.id} test={test} viewMode={viewMode} featured={test.id === featuredId} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              return (
                <Link
                  key={page}
                  href={listHref(params, { pagina: page === 1 ? undefined : String(page) })}
                  className={`btn btn-sm btn-circle ${
                    page === currentPage ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
