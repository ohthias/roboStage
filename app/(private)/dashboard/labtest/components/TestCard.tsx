"use client";

import React from "react";
import { Folder, Pencil, Plus, Trash } from "lucide-react";

export default function TestCard({
  test,
  testTypeName,
  images,
  onAddResult,
  onRename,
  onDelete,
  group_id,
  onMoveToFolder,
}: {
  test: any;
  testTypeName: string;
  images: string[];
  onAddResult: (testId: string) => void;
  onRename: (testId: string, oldName: string) => void;
  onDelete: (testId: string) => void;
  group_id?: boolean;
  onMoveToFolder?: (testId: string, folderId?: number | null) => void;
}) {
  const missionKeys = test.test_missions?.map((m: any) => m.mission_key) || [];

  return (
    <div className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition-all duration-300 rounded-lg">
      <figure className="bg-base-300/20 h-40 flex items-center justify-center shadow-inner rounded-t-lg overflow-hidden">
        {images.length > 1 ? (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-28 h-28">
            {images
              .slice(0, 4)
              .map(
                (img, idx) =>
                  img && (
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
            <img
              src={images[0]}
              alt={`Missão ${missionKeys?.[0]}`}
              className="object-contain h-full p-4"
            />
          )
        )}
      </figure>

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

        <div className="divider my-1" />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-circle btn-sm tooltip tooltip-right"
              data-tip="Adicionar resultado"
              onClick={() => onAddResult(test.id)}
            >
              <Plus size={16} />
            </button>

            <button
              className="btn btn-ghost btn-circle btn-sm tooltip tooltip-top"
              data-tip="Mover para pasta"
              onClick={() => onMoveToFolder?.(test.id, test.folder_id)}
            >
              <Folder size={16} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-circle btn-sm tooltip tooltip-top"
              data-tip="Renomear teste"
              onClick={() => onRename(test.id, test.name_test)}
            >
              <Pencil size={16} />
            </button>

            <button
              className="btn btn-ghost btn-circle btn-sm tooltip tooltip-top text-error"
              data-tip="Excluir teste"
              onClick={() => onDelete(test.id)}
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
