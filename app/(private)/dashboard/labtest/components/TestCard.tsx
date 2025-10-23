"use client";
import React from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function TestCard({
  test,
  testTypeName,
  images,
  onAddResult,
  onRename,
  onDelete,
}: {
  test: any;
  testTypeName: string;
  images: string[];
  onAddResult: (testId: string) => void;
  onRename: (testId: string, oldName: string) => void;
  onDelete: (testId: string) => void;
}) {
  const missionKeys = test.test_missions?.map((m: any) => m.mission_key) || [];

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300 rounded-xl flex flex-col overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="bg-base-200 flex items-center justify-center p-4 h-40">
        {images.length > 1 ? (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-28 h-28">
            {images.slice(0, 4).map((img, idx) =>
              img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={img}
                  alt={`Missão ${missionKeys[idx]}`}
                  className="w-full h-full object-contain rounded"
                />
              ) : null
            )}
          </div>
        ) : (
          images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt={`Missão ${missionKeys?.[0]}`}
              className="w-full h-full object-contain rounded"
            />
          )
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-lg font-bold text-base-content truncate">
          {test.name_test}
        </h3>
        <p className="text-sm text-base-content">
          <span className="font-semibold">Tipo:</span> {testTypeName}
        </p>

        {test.test_missions?.[0]?.season && (
          <p className="text-sm text-base-content">
            <span className="font-semibold">Temporada:</span>{" "}
            {test.test_missions[0].season.toUpperCase()}
          </p>
        )}

        {missionKeys.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {missionKeys.map((key: string) => (
              <span
                key={key}
                className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold"
                title={key}
              >
                {key}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-base-content/70 mt-auto">
          Criado em: {new Date(test.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="flex justify-end gap-2 p-3 border-t border-base-300 bg-base-50">
        <button
          onClick={() => onAddResult(test.id)}
          className="btn btn-primary btn-xs"
          title="Adicionar resultado"
        >
          <PlusIcon className="size-4" />
        </button>
        <button
          onClick={() => onRename(test.id, test.name_test)}
          className="btn btn-ghost btn-xs text-primary"
          title="Renomear teste"
        >
          <PencilIcon className="size-4" />
        </button>
        <button
          onClick={() => onDelete(test.id)}
          className="btn btn-ghost btn-xs text-error"
          title="Excluir teste"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
