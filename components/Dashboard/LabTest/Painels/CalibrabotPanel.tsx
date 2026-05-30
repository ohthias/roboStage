import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { SectionDivider, InfoBox, combination } from "../CreateTest";

interface CalibVariable {
  id: number;
  name: string;
}

const COMPONENT_TYPES = [
  { group: "Atuadores", options: ["Motor grande", "Motor médio", "Motor pequeno"] },
  { group: "Sensores", options: ["Sensor ultrassônico", "Sensor de cor", "Giroscópio"] },
];

export function CalibrabotPanel() {
  const [componentType, setComponentType] = useState("");
  const [qtyOnRobot, setQtyOnRobot] = useState(2);
  const [totalComponents, setTotalComponents] = useState(4);
  const [variables, setVariables] = useState<CalibVariable[]>([{ id: 1, name: "" }]);
  const [nextId, setNextId] = useState(2);

  const combos = combination(totalComponents, qtyOnRobot);

  const addVar = () => {
    setVariables((v) => [...v, { id: nextId, name: "" }]);
    setNextId((n) => n + 1);
  };
  const removeVar = (id: number) =>
    setVariables((v) => v.filter((x) => x.id !== id));
  const updateVar = (id: number, name: string) =>
    setVariables((v) => v.map((x) => (x.id === id ? { ...x, name } : x)));

  return (
    <div className="flex flex-col gap-5">
      <div className="form-control gap-1.5">
        <label className="label py-0">
          <span className="label-text font-medium">Tipo de componente</span>
        </label>
        <select
          className="select select-bordered select-sm focus:select-primary w-full"
          value={componentType}
          onChange={(e) => setComponentType(e.target.value)}
        >
          <option value="">Selecione...</option>
          {COMPONENT_TYPES.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Qtd. no robô</span>
            <span className="label-text-alt text-base-content/40">simultâneos</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={qtyOnRobot}
            onChange={(e) => setQtyOnRobot(Number(e.target.value))}
            className="input input-bordered input-sm focus:input-primary"
          />
        </div>
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Total a testar</span>
            <span className="label-text-alt text-base-content/40">disponíveis</span>
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={totalComponents}
            onChange={(e) => setTotalComponents(Number(e.target.value))}
            className="input input-bordered input-sm focus:input-primary"
          />
        </div>
      </div>

      {/* Combo preview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat bg-base-200/60 rounded-xl border border-base-content/10 p-4">
          <div className="stat-title text-xs">Combinações geradas</div>
          <div className="stat-value text-2xl text-primary">
            {combos > 0 ? combos : "—"}
          </div>
          <div className="stat-desc">C({totalComponents}, {qtyOnRobot})</div>
        </div>
        <div className="stat bg-base-200/60 rounded-xl border border-base-content/10 p-4">
          <div className="stat-title text-xs">Runs totais</div>
          <div className="stat-value text-2xl">{combos > 0 ? combos : "—"}</div>
          <div className="stat-desc">um por combinação</div>
        </div>
      </div>

      <SectionDivider label="Variáveis observadas" />

      <div className="flex flex-col gap-2">
        {variables.map((v) => (
          <div key={v.id} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Nome da variável (ex: velocidade, ângulo...)"
              value={v.name}
              onChange={(e) => updateVar(v.id, e.target.value)}
              className="input input-bordered input-sm flex-1 focus:input-primary"
            />
            {variables.length > 1 && (
              <button
                type="button"
                onClick={() => removeVar(v.id)}
                className="btn btn-ghost btn-sm text-base-content/40 hover:text-error hover:bg-error/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addVar}
          className="btn btn-ghost btn-sm gap-2 self-start text-primary hover:bg-primary/10 mt-1"
        >
          <Plus className="w-4 h-4" />
          Adicionar variável
        </button>
      </div>

      <InfoBox>
        O sistema gerará automaticamente C({totalComponents},{qtyOnRobot}) ={" "}
        <strong>{combos}</strong> combinações únicas de componentes para teste.
      </InfoBox>
    </div>
  );
}