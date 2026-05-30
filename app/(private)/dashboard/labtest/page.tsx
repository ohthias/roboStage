"use client";

import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { useLabTest } from "@/hooks/useLabTest";
import LabTestCard from "@/components/Dashboard/LabTest/LabTestCard";

export default function LabTestPage() {
  const { tests, loading } = useLabTest();

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tests.filter((test) =>
      test.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [tests, search]);

  return (
    <div className="space-y-6">
      <div className="hero bg-base-200 rounded-3xl">
        <div className="hero-content text-center py-10">
          <div>
            <FlaskConical className="w-12 h-12 mx-auto text-primary" />
            <h1 className="text-3xl font-bold mt-3">
              LabTest
            </h1>
            <p className="text-base-content/60">
              Experimentos, calibrações e análise de desempenho.
            </p>
          </div>
        </div>
      </div>

      <input
        className="input input-bordered w-full"
        placeholder="Pesquisar testes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((test) => (
          <LabTestCard
            key={test.id}
            test={test}
          />
        ))}
      </div>
    </div>
  );
}