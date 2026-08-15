"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createRunExecution } from "../../actions";
import type { ExecuteMission } from "./types";

interface MissionEntry {
  scoreObtained: string;
  completed: boolean;
  notes: string;
}

export function RunExecuteForm({
  testId,
  missions,
  season,
}: {
  testId: string;
  missions: ExecuteMission[];
  season: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [operatorId, setOperatorId] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [arena, setArena] = useState("");
  const [penalties, setPenalties] = useState("0");
  const [finalResult, setFinalResult] = useState("");
  const [notes, setNotes] = useState("");

  const [entries, setEntries] = useState<Record<string, MissionEntry>>(() =>
    Object.fromEntries(
      missions.map((m) => [m.missionId, { scoreObtained: "0", completed: false, notes: "" }])
    )
  );

  const totalScore = useMemo(
    () =>
      Object.values(entries).reduce((sum, e) => sum + (Number.parseInt(e.scoreObtained, 10) || 0), 0),
    [entries]
  );

  function updateEntry(missionId: string, patch: Partial<MissionEntry>) {
    setEntries((prev) => ({ ...prev, [missionId]: { ...prev[missionId], ...patch } }));
  }

  function handleSubmit() {
    if (!operatorId.trim()) {
      setError("Informe quem operou o robô nessa execução.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await createRunExecution(
          {
            testId,
            operatorId: operatorId.trim(),
            durationSeconds: durationSeconds ? Number.parseFloat(durationSeconds) : undefined,
            notes: notes.trim() || undefined,
            resultSummary: `${totalScore} pontos`,
          },
          {
            season,
            arena: arena.trim() || undefined,
            totalScore,
            penalties: penalties ? Number.parseInt(penalties, 10) : undefined,
            finalResult: finalResult.trim() || undefined,
            missions: missions.map((m) => ({
              missionId: m.missionId,
              scoreObtained: Number.parseInt(entries[m.missionId].scoreObtained, 10) || 0,
              completed: entries[m.missionId].completed,
              notes: entries[m.missionId].notes.trim() || undefined,
            })),
          }
        );
        router.push(`/dashboard/labtest/${testId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível registrar a execução.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Operador</span>
          </div>
          <input
            className="input input-bordered"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            placeholder="Nome de quem rodou o robô"
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Duração (segundos, opcional)</span>
          </div>
          <input
            type="number"
            min="0"
            className="input input-bordered"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(e.target.value)}
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Mesa / arena (opcional)</span>
          </div>
          <input
            className="input input-bordered"
            value={arena}
            onChange={(e) => setArena(e.target.value)}
            placeholder="ex: Mesa 1"
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Penalidades</span>
          </div>
          <input
            type="number"
            min="0"
            className="input input-bordered"
            value={penalties}
            onChange={(e) => setPenalties(e.target.value)}
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label-text">Resultado por missão</span>
          <span className="badge badge-warning badge-lg">{totalScore} pts</span>
        </div>
        <ul className="flex flex-col gap-2">
          {missions.map((mission) => {
            const entry = entries[mission.missionId];
            return (
              <li
                key={mission.missionId}
                className="flex flex-col gap-2 rounded-lg border border-base-300 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-base-content/50">{mission.missionCode}</span>{" "}
                  <span className="text-sm font-medium">{mission.missionName}</span>
                  <span className="ml-2 badge badge-ghost badge-xs">
                    {mission.fullAttempt ? "completa" : "parcial"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-warning checkbox-sm"
                      checked={entry.completed}
                      onChange={(e) => updateEntry(mission.missionId, { completed: e.target.checked })}
                    />
                    Cumprida
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={mission.maxScore}
                    className="input input-bordered input-sm w-24"
                    value={entry.scoreObtained}
                    onChange={(e) => updateEntry(mission.missionId, { scoreObtained: e.target.value })}
                  />
                  <span className="text-xs text-base-content/40">/ {mission.maxScore}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <label className="form-control">
        <div className="label">
          <span className="label-text">Observações gerais (opcional)</span>
        </div>
        <textarea
          className="textarea textarea-bordered"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      <div className="flex justify-end">
        <button type="button" className="btn btn-warning" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Registrando…" : "Registrar execução"}
        </button>
      </div>
    </div>
  );
}