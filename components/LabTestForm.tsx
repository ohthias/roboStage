"use client";

import { useState, useEffect } from "react";

export default function LabTestForm() {
  const [type, setType] = useState("missao_individual");
  const [season, setSeason] = useState("");
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [parameters, setParameters] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => setMissions(data[season] || []));
  }, [season]);

  const addParameter = () => {
    setParameters([...parameters, { name: "", value: "" }]);
  };

  return (
    <form className="p-6 space-y-4">
      {/* Tipo de teste */}
      <div className="form-control">
        <label className="label">Tipo de Teste</label>
        <select
          className="select select-bordered"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="missao_individual">Missão Individual</option>
          <option value="conjunto">Conjunto de Missões</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>

      {/* Temporada */}
      <div className="form-control">
        <label className="label">Temporada</label>
        <select
          className="select select-bordered"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="submerged">Submerged</option>
          <option value="superpowered">SuperPowered</option>
        </select>
      </div>

      {/* Missão individual */}
      {type === "missao_individual" && (
        <div className="form-control">
          <label className="label">Missão</label>
          <select
            className="select select-bordered"
            onChange={(e) => setSelectedMissions([e.target.value])}
          >
            <option value="">Selecione...</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Conjunto de missões */}
      {type === "conjunto" && (
        <div className="form-control">
          <label className="label">Selecione Missões</label>
          <div className="flex flex-col gap-2">
            {missions.map((m) => (
              <label key={m.id} className="cursor-pointer label">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  value={m.id}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedMissions((prev) =>
                      checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                    );
                  }}
                />
                <span className="label-text">{m.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Personalizado */}
      {type === "personalizado" && (
        <div className="form-control space-y-2">
          <label className="label">Parâmetros</label>
          {parameters.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Nome"
                className="input input-bordered w-1/2"
                value={p.name}
                onChange={(e) => {
                  const newParams = [...parameters];
                  newParams[i].name = e.target.value;
                  setParameters(newParams);
                }}
              />
              <input
                type="text"
                placeholder="Valor"
                className="input input-bordered w-1/2"
                value={p.value}
                onChange={(e) => {
                  const newParams = [...parameters];
                  newParams[i].value = e.target.value;
                  setParameters(newParams);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={addParameter} className="btn btn-outline btn-sm">
            + Adicionar Parâmetro
          </button>
        </div>
      )}

      {/* Botão de envio */}
      <button type="submit" className="btn btn-primary w-full">
        Criar Teste
      </button>
    </form>
  );
}
