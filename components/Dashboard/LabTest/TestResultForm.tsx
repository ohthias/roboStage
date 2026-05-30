"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { RunsResultSection } from "./Section/RunsResultSection";
import { CalibrabotResultSection } from "./Section/CalibrabotResultSection";
import { useLabTest } from "@/hooks/useLabTest";

interface TestResultFormProps {
  test: any;
  onSuccess?: () => void;
}

export default function TestResultForm({
  test,
  onSuccess,
}: TestResultFormProps) {
  const [saving, setSaving] = useState(false);
  const [returnedToBase, setReturnedToBase] = useState(false);
  const [notes, setNotes] = useState("");
  const [missionScores, setMissionScores] = useState<Record<string, number>>(
    {},
  );

  const { createExecution } = useLabTest();

  const [variables, setVariables] = useState<Record<string, string>>({});

  const totalScore = useMemo(() => {
    return Object.values(missionScores).reduce(
      (acc, value) => acc + (Number(value) || 0),
      0,
    );
  }, [missionScores]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await createExecution({
        testId: test.id,
        returnedToBase,
        notes,
        score: totalScore,
        missionScores,
        variables,
      });

      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar resultado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Nova Execução</h2>

          <p className="text-sm opacity-70">
            Registrar resultado do experimento
          </p>
        </div>

        {(test.mode === "runs" || test.mode === "individual") && (
          <div className="stat bg-primary/10 rounded-xl px-5 py-3">
            <div className="stat-title">Pontuação</div>

            <div className="stat-value text-primary text-3xl">{totalScore}</div>
          </div>
        )}
      </div>

      {(test.mode === "runs" || test.mode === "individual") && (
        <RunsResultSection
          test={test}
          missionScores={missionScores}
          setMissionScores={setMissionScores}
        />
      )}

      {test.mode === "calibrabot" && (
        <CalibrabotResultSection
          test={test}
          variables={variables}
          setVariables={setVariables}
        />
      )}

      <div className="card bg-base-200">
        <div className="card-body">
          <label className="label cursor-pointer">
            <span className="label-text">Retornou à base</span>

            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={returnedToBase}
              onChange={(e) => setReturnedToBase(e.target.checked)}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="label">
          <span className="label-text">Observações</span>
        </label>

        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="textarea textarea-bordered w-full"
          placeholder="Descreva o comportamento observado..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary w-full"
      >
        {saving ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            Salvando...
          </>
        ) : (
          <>
            <Save size={18} />
            Salvar Resultado
          </>
        )}
      </button>
    </form>
  );
}
