"use client";

import { useState } from "react";

import {
  FolderPlus,
  BarChart3,
  PlayCircle,
  MoreVertical,
} from "lucide-react";
import TestResultForm from "./TestResultForm";

export default function LabTestCard({
  test,
}: {
  test: any;
}) {
  const [open, setOpen] = useState(false);

  const executionCount =
    test.test_executions?.length ?? 0;

  const missionCount =
    test.test_missions?.length ?? 0;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">
              {test.name}
            </h2>

            <div className="flex gap-2 mt-2">
              <div className="badge badge-primary">
                {test.mode}
              </div>

              {test.season && (
                <div className="badge badge-outline">
                  {test.season}
                </div>
              )}
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-sm">
              <MoreVertical size={16} />
            </button>

            <ul className="dropdown-content menu bg-base-100 rounded-box shadow w-52">
              <li>
                <button>
                  <FolderPlus size={16} />
                  Salvar em pasta
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="stats shadow bg-base-200 mt-4">
          <div className="stat p-3">
            <div className="stat-title">
              Missões
            </div>
            <div className="stat-value text-lg">
              {missionCount}
            </div>
          </div>

          <div className="stat p-3">
            <div className="stat-title">
              Execuções
            </div>
            <div className="stat-value text-lg">
              {executionCount}
            </div>
          </div>
        </div>

        <div className="card-actions mt-4">
          <button className="btn btn-primary btn-sm flex-1" onClick={() => setOpen(true)}>
            <PlayCircle size={16} />
            Abrir
          </button>

          <button className="btn btn-outline btn-sm">
            <BarChart3 size={16} />
            Resultados
          </button>
        </div>
      </div>

      {open && (
        
        <TestResultForm
          test={test}
          onSuccess={() => setOpen(false)}
        />
      )}
    </div>
  );
}