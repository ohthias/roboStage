"use client";

import { useState, useEffect } from "react";
import CardTest from "@/components/ui/Cards/CardTest";
import CardSeason from "./ui/Cards/CardSeason";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/app/context/ToastContext";

interface LabTestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LabTestForm({ onSuccess, onCancel }: LabTestFormProps) {
  const [type, setType] = useState("missao_individual");
  const [season, setSeason] = useState("");
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [parameters, setParameters] = useState<
    { name: string; value: string }[]
  >([]);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetch("/data/missions.json")
      .then((res) => res.json())
      .then((data) => setMissions(data[season] || []));
  }, [season]);

  const resetForm = () => {
    setType("missao_individual");
    setSeason("");
    setMissions([]);
    setSelectedMissions([]);
    setName("");
    setParameters([]);
  };

  const addParameter = () => {
    setParameters([...parameters, { name: "", value: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Você precisa estar logado!");
      return;
    }

    try {
      // 1. Pegar type_id do test_types
      const { data: typeData, error: typeError } = await supabase
        .from("test_types")
        .select("id")
        .eq("name", type)
        .single();

      if (typeError) throw typeError;
      const typeId = typeData.id;

      const { data: testData, error: testError } = await supabase
        .from("tests")
        .insert({
          user_id: user.id,
          type_id: typeId,
          name_test: name,
        })
        .select("id")
        .single();

      if (testError) throw testError;
      const testId = testData.id;

      if (type === "missao_individual" && selectedMissions.length === 1) {
        await supabase.from("test_missions").insert({
          test_id: testId,
          mission_key: selectedMissions[0],
          season: season
        });
      }

      if (type === "grupo" && selectedMissions.length > 0) {
        const missionsInsert = selectedMissions.map((m) => ({
          test_id: testId,
          mission_key: m,
          season: season
        }));
        await supabase.from("test_missions").insert(missionsInsert);
      }

      if (type === "personalizado" && parameters.length > 0) {
        const paramsInsert = parameters.map((p) => ({
          test_id: testId,
          name: p.name,
          value: p.value,
        }));
        await supabase.from("test_parameters").insert(paramsInsert);
      }

      addToast("Teste criado com sucesso!", "success");
      resetForm();
      onSuccess?.();
      window.location.reload();
    } catch (err) {
      console.error(err);
      addToast("Erro ao criar teste.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary flex-1">
          Criar Teste
        </button>
        <button
          type="button"
          className="btn btn-ghost flex-1"
          onClick={() => {
            resetForm();
            onCancel?.();
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
