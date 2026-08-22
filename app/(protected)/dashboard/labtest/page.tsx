import { Filter, Plus } from "lucide-react";
import Link from "next/link";

export default function LabTestPage() {
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
        </div>
      </main>
    </div>
  );
}
