import {
  Layers,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { LabTestCard } from "@/components/labtest/LabTestCard";
import { LabTestToolbar } from "@/components/labtest/LabTestToolbar";
import { MODE_META, type ModeKey } from "@/utils/labtest/catalog";
import { listTests } from "./new/actions";

export default async function LabTestPage({
  searchParams,
}: {
  searchParams?: Promise<{ modo?: string; visualizacao?: string }>;
}) {
  const tests = await listTests();
  const params = await searchParams;
  const selectedMode = params?.modo;
  const viewMode = params?.visualizacao === "grid" ? "grid" : "list";
  const validMode = selectedMode && selectedMode in MODE_META
    ? selectedMode as ModeKey
    : null;
  const filteredTests = validMode
    ? tests.filter((test) => test.mode === validMode)
    : tests;

  return (
    <div className="w-full">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between px-5 py-6">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-base-content sm:text-4xl">
            Testes
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/50">
            Gerencie, configure e acompanhe os testes realizados pelo seu time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-neutral badge-sm h-7 rounded-lg px-3">
            {filteredTests.length} {filteredTests.length === 1 ? "teste" : "testes"}
          </span>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="flex w-full items-center justify-between border-b border-base-content/10 px-5">
        <div className="flex items-center gap-6">
          <div className="flex h-full items-center gap-1">
            <Link
              href="/dashboard/labtest"
              className="relative px-3 py-3 text-sm font-medium text-base-content"
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

        <LabTestToolbar viewMode={viewMode} validMode={validMode} />
      </nav>

      <main className="flex-1 px-5 py-6">
        {/* Empty state */}
        {filteredTests.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-200/20 px-6 py-16 text-center">
            <Layers className="size-9 text-base-content/20" />

            <p className="text-sm font-medium text-base-content">
              {validMode ? "Nenhum teste encontrado neste modo" : "Nenhum teste criado ainda"}
            </p>

            <p className="max-w-xs text-xs text-base-content/50">
              {validMode
                ? "Escolha outro modo ou remova o filtro para ver os demais testes."
                : "Crie seu primeiro teste para começar a acompanhar seus resultados."}
            </p>

            {validMode ? (
              <Link href="/dashboard/labtest" className="btn btn-ghost btn-sm mt-2">
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
          <div className={viewMode === "grid" ? "mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" : "mt-6 flex flex-col gap-3"}>
            {filteredTests.map((test) => (
              <LabTestCard key={test.id} test={test} viewMode={viewMode} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
