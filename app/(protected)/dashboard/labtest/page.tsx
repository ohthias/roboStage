import { Activity, CheckCircle2, FlaskConical, Layers, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { LabTestCard } from "@/components/labtest/LabTestCard";
import { StatCard } from "@/components/labtest/shared";
import { LabTestToolbar } from "@/components/labtest/LabTestToolbar";
import { MODE_META, normalizeStatus, type ModeKey } from "@/utils/labtest/catalog";
import { listTests } from "./new/actions";
import { getResourcesTags } from "@/utils/stagebook/actions/tags";
import { listMilestones } from "@/utils/stagebook/actions/milestones";

export default async function LabTestPage({
  searchParams,
}: {
  searchParams?: Promise<{
    modo?: string;
    visualizacao?: string;
    pagina?: string;
  }>;
}) {
  const tests = await listTests();
  const params = await searchParams;
  const selectedMode = params?.modo;
  const viewMode = params?.visualizacao === "grid" ? "grid" : "list";
  const validMode =
    selectedMode && selectedMode in MODE_META
      ? (selectedMode as ModeKey)
      : null;
  const filteredTests = validMode
    ? tests.filter((test) => test.mode === validMode)
    : tests;
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filteredTests.length / pageSize));
  const currentPage = Math.min(
    Math.max(Number(params?.pagina) || 1, 1),
    totalPages,
  );
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Tags e milestones universais dos testes exibidos nesta página.
  const [tagsByTest, milestoneList] = await Promise.all([
    getResourcesTags("labtest", paginatedTests.map((t) => t.id)),
    listMilestones(),
  ]);
  const milestoneById = new Map(milestoneList.map((m) => [m.id, m]));
  const labeledTests = paginatedTests.map((test) => ({
    ...test,
    tags: tagsByTest[test.id] ?? [],
    milestone: test.milestoneId ? (milestoneById.get(test.milestoneId) ?? null) : null,
  }));

  const countBy = (predicate: (t: (typeof tests)[number]) => boolean) =>
    tests.filter(predicate).length;
  const viewQuery = viewMode === "grid" ? "&visualizacao=grid" : "";

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
        <LabTestToolbar viewMode={viewMode} validMode={validMode} />
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo dos testes">
        <StatCard label="Total de testes" value={tests.length} sub="criados pela equipe" icon={FlaskConical} accent="primary" />
        <StatCard label="Em andamento" value={countBy((t) => normalizeStatus(t.status) === "em_andamento")} sub="testes ativos agora" icon={Activity} accent="secondary" />
        <StatCard label="Concluídos" value={countBy((t) => normalizeStatus(t.status) === "concluido")} sub="finalizados" icon={CheckCircle2} accent="info" />
        <StatCard label="Runs de competição" value={countBy((t) => t.mode === "runs")} sub="pontuação por temporada" icon={Trophy} accent="accent" />
      </section>

      <nav className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="tabs tabs-box bg-base-100">
          <Link role="tab" href="/dashboard/labtest" className="tab tab-active">
            Geral
          </Link>
          <span role="tab" aria-disabled="true" className="tab tab-disabled">
            Anatix · em breve
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" aria-label="Filtrar por modo">
          <Link
            href={`/dashboard/labtest?${viewQuery.slice(1)}`}
            className={`btn btn-sm rounded-full ${!validMode ? "btn-primary" : "btn-ghost border-base-300 bg-base-100"}`}
          >
            Todos
          </Link>
          {Object.entries(MODE_META).map(([mode, meta]) => {
            const ModeIcon = meta.icon;
            return (
              <Link
                key={mode}
                href={`/dashboard/labtest?modo=${mode}${viewQuery}`}
                className={`btn btn-sm gap-1.5 rounded-full ${validMode === mode ? "btn-primary" : "btn-ghost border-base-300 bg-base-100"}`}
              >
                <ModeIcon size={14} />
                {meta.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1">
        {/* Empty state */}
        {filteredTests.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
            <Layers className="size-9 text-base-content/20" />

            <p className="text-sm font-medium text-base-content">
              {validMode
                ? "Nenhum teste encontrado neste modo"
                : "Nenhum teste criado ainda"}
            </p>

            <p className="max-w-xs text-xs text-base-content/50">
              {validMode
                ? "Escolha outro modo ou remova o filtro para ver os demais testes."
                : "Crie seu primeiro teste para começar a acompanhar seus resultados."}
            </p>

            {validMode ? (
              <Link
                href="/dashboard/labtest"
                className="btn btn-ghost btn-sm mt-2"
              >
                Remover filtro
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
                ? "mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                : "mt-6 flex flex-col gap-3"
            }
          >
            {labeledTests.map((test) => (
              <LabTestCard key={test.id} test={test} viewMode={viewMode} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              const query = new URLSearchParams();
              if (validMode) query.set("modo", validMode);
              if (viewMode === "grid") query.set("visualizacao", "grid");
              query.set("pagina", String(page));

              return (
                <Link
                  key={page}
                  href={`/dashboard/labtest?${query.toString()}`}
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
