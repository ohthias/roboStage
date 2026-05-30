import { GripVertical, X } from "lucide-react";
import { useState } from "react";
import { MissionTag, InfoBox, SectionDivider, Mission } from "../CreateTest";

export function RunsPanel({ missions, loading }: { missions: Mission[]; loading: boolean }) {
  const [missionCount, setMissionCount] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const remove = (id: string) => setSelected((prev) => prev.filter((m) => m !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Missões por run</span>
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={missionCount}
            onChange={(e) => setMissionCount(Number(e.target.value))}
            className="input input-bordered input-sm w-28 focus:input-primary"
          />
        </div>
      </div>

      <SectionDivider label="Selecionar missões" />

      {loading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {missions.map((m) => (
            <MissionTag
              key={m.id}
              mission={m}
              selected={selected.includes(m.id)}
              onClick={() => toggle(m.id)}
            />
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <>
          <SectionDivider label="Ordem de execução" />
          <div className="flex flex-col gap-2">
            {selected.map((id, i) => {
              const m = missions.find((x) => x.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 bg-base-200/60 border border-base-content/10 rounded-xl px-4 py-2.5"
                >
                  <GripVertical className="w-4 h-4 text-base-content/30 shrink-0" />
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">
                    {m?.id} — {m?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    className="btn btn-ghost btn-xs text-base-content/40 hover:text-error hover:bg-error/10 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <InfoBox>
        Após criar, você poderá registrar cada lançamento inserindo os resultados por
        missão conforme a ordem definida acima.
      </InfoBox>
    </div>
  );
}