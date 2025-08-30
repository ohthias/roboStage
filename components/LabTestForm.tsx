"use client";

import { useState, useEffect } from "react";
import CardTest from "@/components/ui/Cards/CardTest";
import CardSeason from "./ui/Cards/CardSeason";

export default function LabTestForm() {
  const [type, setType] = useState("missao_individual");
  const [season, setSeason] = useState("");
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [parameters, setParameters] = useState<
    { name: string; value: string }[]
  >([]);

  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => setMissions(data[season] || []));
  }, [season]);

  const addParameter = () => {
    setParameters([...parameters, { name: "", value: "" }]);
  };

  return (
    <form className="p-6 space-y-6">
      <div>
        <label className="label">Nome do teste</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Tipo de Teste</label>
        <div className="flex gap-6 justify-center mt-4 min-w-[350px]">
          <CardTest
            imageBackground="/images/CardsTest/Teste_individual.webp"
            nameTest="Individual"
            selected={type === "missao_individual"}
            onSelect={() => setType("missao_individual")}
          />
          <CardTest
            imageBackground="/images/CardsTest/Teste_grupo.webp"
            nameTest="Grupo"
            selected={type === "grupo"}
            onSelect={() => setType("grupo")}
          />
          <CardTest
            imageBackground="/images/CardsTest/Teste_Generico.webp"
            nameTest="Personalizado"
            selected={type === "personalizado"}
            onSelect={() => setType("personalizado")}
          />
        </div>
      </div>

      {/* Temporada */}
      {type !== "personalizado" && (
      <div className="form-control">
        <label className="label">Temporada</label>
        <div className="flex gap-6 justify-start mt-4">
          <CardSeason
            image="/images/logos/Submerged.webp"
            name="Submerged"
            selected={season === "submerged"}
            onSelect={() => setSeason("submerged")}
          />
          <CardSeason
            image="/images/logos/Unearthed.webp"
            name="Unearthed"
            selected={season === "unearthed"}
            onSelect={() => setSeason("unearthed")}
          />
        </div>
      </div>
      )}

      {/* Missão individual */}
      {type === "missao_individual" && (
        <div className="form-control">
          <label className="label">Missão</label>
          <select
            className="select select-bordered w-full"
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
      {type === "grupo" && (
        <div className="form-control">
          <label className="label">Selecione Missões</label>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: Math.ceil(missions.length / 2) }).map(
              (_, rowIdx) => (
                <div key={rowIdx} className="flex flex-col gap-2">
                  {missions
                    .filter((_, idx) => idx % 2 === rowIdx)
                    .map((m) => (
                      <label key={m.id} className="cursor-pointer label">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          value={m.id}
                          checked={selectedMissions.includes(m.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedMissions((prev) =>
                              checked
                                ? [...prev, m.id]
                                : prev.filter((id) => id !== m.id)
                            );
                          }}
                        />
                        <span className="label-text">
                          {m.id} - {m.name}
                        </span>
                      </label>
                    ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Personalizado */}
      {type === "personalizado" && (
        <div className="form-control space-y-2">
          <div className="flex justify-between">
            <label className="label">Parâmetros</label>
            <button
              type="button"
              onClick={addParameter}
              className="btn btn-outline btn-sm"
            >
              + Adicionar Parâmetro
            </button>
          </div>
          {parameters.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
              type="text"
              placeholder="Nome"
              className="input input-bordered w-full"
              value={p.name}
              onChange={(e) => {
                const newParams = [...parameters];
                newParams[i].name = e.target.value;
                setParameters(newParams);
              }}
              />
              <button
              type="button"
              className="btn btn-error btn-sm"
              onClick={() => {
                setParameters(parameters.filter((_, idx) => idx !== i));
              }}
              >
              Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botão de envio */}
      <button type="submit" className="btn btn-primary w-full">
        Criar Teste
      </button>
    </form>
  );
}
