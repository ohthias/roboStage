"use client";
import React, { useState } from "react";
import { ChartPie, LayoutGrid, List, ListFilter } from "lucide-react";
import LabTestForm from "@/components/Dashboard/LabTest/LabTestForm";
import TestCard from "@/components/Dashboard/LabTest/CardTest";
import { useRouter } from "next/navigation";
import { useTests } from "@/hooks/useLabTests";
import TestListItem from "@/components/Dashboard/LabTest/TestListItem";
import LabTestResponseForm from "@/components/Dashboard/LabTest/ResultForm";

export default function LabTestPage() {
  const [showViewMode, setShowViewMode] = useState<"card" | "list">("card");
  const { tests } = useTests();

  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    season: "",
  });
  const router = useRouter();

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      test.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSeason = !filters.season || test.season === filters.season;
    return matchesSearch && matchesSeason;
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ChartPie className="text-primary" width={24} height={24} />
          <h1 className="text-2xl font-bold text-primary">LabTest</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="btn-group flex gap-1 ">
            <button
              className={`btn btn-sm btn-square btn-soft ${
                showViewMode === "card" ? "btn-primary" : "btn-default"
              }`}
              onClick={() => setShowViewMode("card")}
              title="Modo cartão"
            >
              <LayoutGrid width={16} height={16} />
            </button>

            <button
              className={`btn btn-sm btn-square btn-soft ${
                showViewMode === "list" ? "btn-primary" : "btn-default"
              }`}
              onClick={() => setShowViewMode("list")}
              title="Modo lista"
            >
              <List width={16} height={16} />
            </button>
          </div>
          <button
            className={`btn btn-sm btn-square ml-2 md:ml-4 lg:ml-6 ${
              showFilters ? "btn-info" : "btn-default"
            }`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
          >
            <ListFilter width={16} height={16} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm btn-outline ml-auto btn-primary hidden md:inline-flex"
          >
            Criar teste
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="rounded-lg border border-base-300 bg-base-100 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Buscar por nome ou descrição"
              className="input input-bordered w-full"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
        </div>
      )}

      {showViewMode === "card" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <TestCard
                key={test.id}
                test={{
                  ...test,
                  description: test.description ?? undefined,
                  season: test.season ?? undefined,
                  folderId: test.folder_id ?? undefined,
                  execution_count: test.executions?.[0]?.count ?? 0,
                }}
                onOpen={() => router.push(`/dashboard/labtest/${test.id}`)}
              />
            ))
          ) : (
            <p className="text-info">Nenhum teste encontrado.</p>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          {filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <TestListItem
                key={test.id}
                test={{
                  ...test,
                  description: test.description ?? undefined,
                  season: test.season ?? undefined,
                  folderId: test.folder_id ?? undefined,
                  execution_count: test.executions?.[0]?.count ?? 0,
                }}
                onOpen={() => router.push(`/dashboard/labtest/${test.id}`)}
              />
            ))
          ) : (
            <p className="text-info">Nenhum teste encontrado.</p>
          )}
        </section>
      )}

      {showModal && (
        <LabTestForm
          onCancel={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
