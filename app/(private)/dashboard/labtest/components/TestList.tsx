"use client";
import React, { useMemo } from "react";
import TestCard from "./TestCard";

export default function TestList({
  tests,
  testTypes,
  missionsData,
  loading,
  onAddResult,
  onRename,
  onDelete,
  onMoveToFolder,
}: {
  tests: any[];
  testTypes: Record<string, string>;
  missionsData: Record<string, any[]>;
  loading: boolean;
  onAddResult: (id: string) => void;
  onRename: (id: string, oldName: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder?: (testId: string, folderId?: number | null) => void;
}) {
  const getMissionImages = (season: string, missionKeys: string[] | string) => {
    if (!missionsData || !missionsData[season]) return [];
    const keys = Array.isArray(missionKeys) ? missionKeys.slice(0, 4) : [missionKeys];
    return keys.map((key) => missionsData[season].find((m) => m.id === key)?.image || "");
  };

  if (loading) {
    return <div>Carregando testes...</div>;
  }

  if (!tests || tests.length === 0) {
    return (
      <div className="col-span-full flex flex-col justify-center items-center p-6 border border-base-300 rounded-xl bg-base-100 shadow-md">
        <div className="text-4xl mb-2">🧪</div>
        <h2 className="text-center text-lg font-bold text-gray-500">Nenhum teste encontrado!</h2>
        <p className="text-center text-sm text-gray-400 mt-1">Ajuste os filtros ou crie um novo teste.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {tests.map((test) => {
        const testTypeName = testTypes[test.type_id] || "Desconhecido";
        const temporada = test.test_missions?.[0]?.season;
        const missionKeys = test.test_missions?.map((m: any) => m.mission_key) || [];
        const images = temporada ? getMissionImages(temporada, missionKeys) : [];
        return (
          <TestCard
            key={test.id}
            test={test}
            testTypeName={testTypeName}
            images={images}
            onAddResult={onAddResult}
            onRename={onRename}
            onDelete={onDelete}
            onMoveToFolder={onMoveToFolder}
          />
        );
      })}
    </section>
  );
}
