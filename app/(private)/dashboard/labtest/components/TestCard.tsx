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
  group_id,
}: {
  test: any;
  testTypeName: string;
  images: string[];
  onAddResult: (testId: string) => void;
  onRename: (testId: string, oldName: string) => void;
  onDelete: (testId: string) => void;
  group_id?: boolean;
}) {
  const missionKeys = test.test_missions?.map((m: any) => m.mission_key) || [];

  return (
    <div className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition-all duration-300 rounded-lg">
      {/* IMAGE / PREVIEW */}
      <figure className="bg-base-300/20 h-40 flex items-center justify-center shadow-inner rounded-t-lg overflow-hidden">
        {images.length > 1 ? (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-28 h-28">
            {images.slice(0, 4).map(
              (img, idx) =>
                img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={idx}
                    src={img}
                    alt={`Missão ${missionKeys[idx]}`}
                    className="object-contain rounded-md p-1"
                  />
                )
            )}
          </div>
        ) : (
          images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt={`Missão ${missionKeys?.[0]}`}
              className="object-contain h-full p-4"
            />
          )
        )}
      </figure>

      {/* BODY */}
      <div className="card-body p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-base truncate">{test.name_test}</h2>
          <div className="flex flex-row gap-1 items-end">
            <span className="badge badge-outline badge-primary badge-xs">
              {testTypeName.toLocaleUpperCase()}
            </span>
            <span className="badge badge-outline badge-secondary badge-xs">
              {group_id ? "Equipe" : "Meu"}
            </span>
          </div>
        </div>

        {test.test_missions?.[0]?.season && (
          <p className="text-sm text-base-content/70">
            Temporada:{" "}
            <span className="font-semibold">
              {test.test_missions[0].season.toUpperCase()}
            </span>
          </p>
        )}

        {missionKeys.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {missionKeys.map((key: string) => (
              <span
                key={key}
                className="badge badge-sm badge-primary badge-outline"
                title={key}
              >
                {key}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-base-content/50 mt-auto">
          Criado em {new Date(test.created_at).toLocaleDateString("pt-BR")}
        </p>

        {/* ACTIONS */}
        <div className="card-actions justify-end pt-2">
          <button
            className="btn btn-primary btn-xs"
            onClick={() => onAddResult(test.id)}
            title="Adicionar resultado"
          >
            <PlusIcon className="size-4" />
          </button>

          <button
            className="btn btn-ghost btn-xs"
            onClick={() => onRename(test.id, test.name_test)}
            title="Renomear teste"
          >
            <PencilIcon className="size-4" />
          </button>

          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={() => onDelete(test.id)}
            title="Excluir teste"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
