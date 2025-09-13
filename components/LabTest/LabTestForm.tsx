"use client";

import { useState, useEffect } from "react";
import CardTest from "@/components/ui/Cards/CardTest";
import CardSeason from "../ui/Cards/CardSeason";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/app/context/ToastContext";
import CardIndividaualBackground from "@/public/images/CardsTest/Teste_individual.webp";
import CardGroupBackground from "@/public/images/CardsTest/Teste_grupo.webp";
import UnearthedLogo from "@/public/images/logos/Unearthed.webp";
import SubmergedLogo from "@/public/images/logos/Submerged.webp";

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
    fetch("/api/data/missions.json")
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
          season: season,
        });
      }

      if (type === "grupo" && selectedMissions.length > 0) {
        const missionsInsert = selectedMissions.map((m) => ({
          test_id: testId,
          mission_key: m,
          season: season,
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
    <form
      onSubmit={handleSubmit}
      className="p-2 space-y-6 w-full max-w-2xl mx-auto"
    >
      {/* Nome */}
      <div>
        <label className="label font-medium">Nome do Teste</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Teste de Missão 01"
          required
        />
      </div>

      {/* Tipo */}
      <div>
        <label className="label font-medium">Tipo de Teste</label>
        <div className="flex flex-row gap-8 justify-start mt-4">
          <CardTest
            imageBackground={CardIndividaualBackground.src}
            nameTest="Individual"
            selected={type === "missao_individual"}
            onSelect={() => setType("missao_individual")}
          />
          <CardTest
            imageBackground={CardGroupBackground.src}
            nameTest="Grupo"
            selected={type === "grupo"}
            onSelect={() => setType("grupo")}
          />
        </div>
      </div>

      {/* Temporada */}
      {type !== "personalizado" && (
        <div>
          <label className="label font-medium">Temporada</label>
          <div className="flex flex-wrap gap-4 justify-start mt-4">
            <CardSeason
              image={SubmergedLogo.src}
              name="Submerged"
              selected={season === "submerged"}
              onSelect={() => setSeason("submerged")}
            />
            <CardSeason
              image={UnearthedLogo.src}
              name="Unearthed"
              selected={season === "unearthed"}
              onSelect={() => setSeason("unearthed")}
            />
          </div>
        </div>
      )}

      {/* Missão individual */}
      {type === "missao_individual" && (
        <div>
          <label className="label font-medium">Missão</label>
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

      {/* Grupo de missões */}
      {type === "grupo" && (
        <div>
          <label className="label font-medium">Selecione Missões</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {missions.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition"
              >
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
                <span className="text-sm">
                  {m.id} - {m.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Personalizado */}
      {type === "personalizado" && (
        <div>
          <label className="label font-medium">Parâmetros</label>
          <div className="space-y-3">
            {parameters.map((p, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome"
                  className="input input-bordered flex-1"
                  value={p.name}
                  onChange={(e) => {
                    const updated = [...parameters];
                    updated[idx].name = e.target.value;
                    setParameters(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Valor"
                  className="input input-bordered flex-1"
                  value={p.value}
                  onChange={(e) => {
                    const updated = [...parameters];
                    updated[idx].value = e.target.value;
                    setParameters(updated);
                  }}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addParameter}
            className="btn btn-outline btn-sm mt-2"
          >
            + Adicionar Parâmetro
          </button>
        </div>
      )}

      {/* Botões */}
      <div className="flex flex-row gap-3 justify-center">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            resetForm();
            onCancel?.();
          }}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Criar Teste
        </button>
      </div>
    </form>
  );
}
