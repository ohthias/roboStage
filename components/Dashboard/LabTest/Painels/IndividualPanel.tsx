import { useState } from "react";
import { InfoBox, Mission, MissionTag } from "../CreateTest";

export default function IndividualPanel({
  missions,
  loading,
}: {
  missions: Mission[];
  loading: boolean;
}) {
  const [selected, setSelected] = useState<string>("");
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <div className="form-control gap-1.5">
        <label className="label py-0">
          <span className="label-text font-medium">Missão</span>
        </label>
        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner text-primary" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missions.map((m) => (
              <MissionTag
                key={m.id}
                mission={m}
                selected={selected === m.id}
                onClick={() => setSelected(m.id === selected ? "" : m.id)}
                single
              />
            ))}
          </div>
        )}
      </div>

      <div className="form-control gap-1.5">
        <label className="label py-0">
          <span className="label-text font-medium">Observações iniciais</span>
          <span className="label-text-alt text-base-content/40">opcional</span>
        </label>
        <textarea
          rows={3}
          placeholder="Hipótese ou contexto do teste..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="textarea textarea-bordered focus:textarea-primary resize-none text-sm leading-relaxed"
        />
      </div>

      <InfoBox>
        Fluxo: base → executa a missão → retorna à base. Após criar, registre múltiplas
        tentativas e acompanhe a evolução do desempenho.
      </InfoBox>
    </div>
  );
}