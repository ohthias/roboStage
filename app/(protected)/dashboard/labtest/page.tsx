"use client";

// ---------------------------------------------------------------------------
// Dashboard do LabTest — lista os testes do usuário.
// Antes esse tipo de tela tinha que saber sobre os 3 modos manualmente
// (ícone, cor, rótulo) espalhado pelo JSX. Agora tudo isso vem do
// LAB_TEST_MODES — inclusive o modo "Personalizado", sem tocar neste arquivo.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Plus,
  Search,
  ListOrdered,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { useTests, type TestListItem } from "@/hooks/useLabTests";
import {
  LAB_TEST_MODE_LIST,
  getModeDefinition,
  ACCENT_STYLES,
} from "@/utils/labtest/modes";
import { fmtDate } from "@/components/labtest/shared";
import type { ModeId } from "@/types/labtest.types";
import LabTestForm from "@/components/labtest/LabTestForm";

type ModeFilter = ModeId | "all";

function TestCard({ test }: { test: TestListItem }) {
  const modeDef = getModeDefinition(test.mode);
  const style = ACCENT_STYLES[modeDef.accent];
  const Icon = modeDef.icon;

  return (
    <Link
      href={`/lab-test/${test.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-base-content/10 bg-base-100 p-5 transition-all hover:border-primary/25 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bgSoft}`}
        >
          <Icon className={`h-5 w-5 ${style.text}`} />
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-base-content/20 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/60" />
      </div>

      <div className="min-w-0 flex-1">
        <p className={`mb-1 text-xs font-medium uppercase tracking-widest ${style.text}`}>
          {modeDef.label}
        </p>
        <h3 className="truncate text-base font-semibold leading-tight">
          {test.name}
        </h3>
        {test.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-base-content/50">
            {test.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-base-content/8 pt-3 text-xs text-base-content/40">
        <span className="flex items-center gap-1.5">
          <ListOrdered className="h-3 w-3" />
          {test.executionsCount} lançamento{test.executionsCount === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {fmtDate(test.updatedAt)}
        </span>
      </div>
    </Link>
  );
}

export default function LabTestDashboard() {
  const { tests, loading, error, refresh } = useTests();
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const matchesMode = modeFilter === "all" || t.mode === modeFilter;
      const matchesSearch = t.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesMode && matchesSearch;
    });
  }, [tests, search, modeFilter]);

  return (
    <div className="min-h-screen bg-base-200/40 px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-base-content/10 bg-base-100">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">LabTest</h1>
              <p className="text-xs text-base-content/45">
                {tests.length} teste{tests.length === 1 ? "" : "s"} no total
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn btn-primary gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Novo teste
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="input input-bordered flex w-full items-center gap-2 sm:max-w-xs">
            <Search className="h-4 w-4 text-base-content/30" />
            <input
              type="text"
              placeholder="Buscar teste..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="grow bg-transparent text-sm outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setModeFilter("all")}
              className={`btn btn-xs rounded-lg ${
                modeFilter === "all" ? "btn-neutral" : "btn-ghost text-base-content/50"
              }`}
            >
              Todos
            </button>
            {LAB_TEST_MODE_LIST.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setModeFilter(id)}
                className={`btn btn-xs gap-1.5 rounded-lg ${
                  modeFilter === id
                    ? "btn-neutral"
                    : "btn-ghost text-base-content/50"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center text-sm text-error">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-base-content/15 bg-base-100 py-16 text-center">
            <FlaskConical className="h-8 w-8 text-base-content/20" />
            <p className="text-sm text-base-content/50">
              {tests.length === 0
                ? "Nenhum teste criado ainda."
                : "Nenhum teste corresponde à busca."}
            </p>
            {tests.length === 0 && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="btn btn-primary btn-sm gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar o primeiro teste
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <LabTestForm
          onCancel={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
