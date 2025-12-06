"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/app/context/ToastContext";
import { Square, SquareStack, Bot } from "lucide-react";
import CardSeason from "../ui/Cards/CardSeason";
import UnearthedLogo from "@/public/images/logos/Unearthed.webp";
import SubmergedLogo from "@/public/images/logos/Submerged.webp";

interface LabTestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LabTestForm({ onSuccess, onCancel }: LabTestFormProps) {
  const [type, setType] = useState<"missao_individual" | "grupo">(
    "missao_individual"
  );
  const [season, setSeason] = useState<"submerged" | "unearthed" | "">("");
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [loadingMissions, setLoadingMissions] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (!season) return;
    setLoadingMissions(true);
    fetch("/api/data/missions")
      .then((res) => res.json())
      .then((data) => {
        const seasonMissions = data[season] || [];
        const filteredMissions = seasonMissions.filter(
          (m: any) => m.id !== "EL" && m.id !== "PT" && m.id !== "GP"
        );
        setMissions(filteredMissions);
        setSelectedMissions([]);
      })
      .finally(() => setLoadingMissions(false));
  }, [season]);

  const resetForm = () => {
    setType("missao_individual");
    setSeason("");
    setMissions([]);
    setSelectedMissions([]);
    setName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast("Você precisa estar logado!", "warning");
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
        const missionsInsert = selectedMissions.map((mId) => {
          const mission = missions.find((m) => m.id === mId);
          return {
            test_id: testId,
            mission_key: mission?.id,
            season: season,
            max_value: mission?.type[0] === "range" ? mission?.maxValue : null,
          };
        });
        await supabase.from("test_missions").insert(missionsInsert);
      }

      if (type === "grupo" && selectedMissions.length > 0) {
        const missionsInsert = selectedMissions.map((mId) => {
          const mission = missions.find((m) => m.id === mId);
          return {
            test_id: testId,
            mission_key: mission?.id,
            season: season,
            max_value: mission?.type[0] === "range" ? mission?.maxValue : null,
          };
        });
        await supabase.from("test_missions").insert(missionsInsert);
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

  const typeOptions = [
    {
      id: "missao_individual",
      name: "Individual",
      icon: Square,
      description: "Testagem de uma única missão",
    },
    {
      id: "grupo",
      name: "Grupo",
      icon: SquareStack,
      description: "Testagem de múltiplas missões",
    },
  ];

  const seasonOptions = [
    { id: "submerged", name: "Submerged", image: SubmergedLogo.src },
    { id: "unearthed", name: "Unearthed", image: UnearthedLogo.src },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Nome */}
      <div>
        <label className="label font-medium">Nome do Teste</label>
        <input
          type="text"
          className="input input-bordered w-full mt-2 border-primary focus:ring-primary focus:border-primary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Teste de Missão 01"
          required
        />
      </div>

      {/* Tipo de Teste */}
      <div>
        <label className="label font-medium">Tipo de Teste</label>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {typeOptions.map((opt) => {
            const Icon = opt.icon;
            const selected = type === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setType(opt.id as any)}
                className={`border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg ${
                  selected ? "border-primary bg-primary/10" : "border-base-300"
                }`}
              >
                <Icon className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-semibold">{opt.name}</span>
                <span className="text-xs text-base-content/70 mt-1 text-center">
                  {opt.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Temporada */}
      <div>
        <label className="label font-medium">Temporada</label>
        <div className="flex flex-row gap-4 mt-4 overflow-x-auto">
          {seasonOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSeason(opt.id as any)}
              className={`border rounded-xl overflow-hidden cursor-pointer shadow hover:shadow-lg transition-all ${
                season === opt.id
                  ? "border-primary scale-94"
                  : "hover:scale-100 active:scale-95"
              }`}
            >
              <CardSeason
                image={opt.image}
                name={opt.name}
                selected={season === opt.id}
                onSelect={() => setSeason(opt.id as any)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Missões */}
      <div className="divider text-base-content/75">Missões</div>
      {loadingMissions ? (
        <div className="flex justify-center items-center py-6">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max grid-flow-row">
          {missions
            .sort((a, b) => a.id.localeCompare(b.id)) // ordena alfabeticamente ou numericamente pelo id
            .map((m) => {
              const isSelected = selectedMissions.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    if (type === "missao_individual") {
                      setSelectedMissions([m.id]);
                    }
                  }}
                  className={`flex flex-col p-4 rounded-xl shadow hover:shadow-lg transition-all border cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-base-200"
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    {type === "grupo" && (
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        value={m.id}
                        checked={isSelected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedMissions((prev) =>
                            checked
                              ? [...prev, m.id]
                              : prev.filter((id) => id !== m.id)
                          );
                        }}
                        onClick={(e) => e.stopPropagation()} // evita disparar o onClick do card
                      />
                    )}
                    <Bot className="w-5 h-5 text-primary" />
                    <span
                      className={`font-semibold ${
                        isSelected ? "text-primary" : "text-base-content"
                      }`}
                    >
                      {m.id} - {m.name}
                    </span>
                  </label>

                  {m.type[0] === "range" && isSelected && (
                    <input
                      type="number"
                      min={m.type[1]}
                      max={m.type[2]}
                      placeholder={`Quantidade (mín: ${m.type[1]}, máx: ${m.type[2]})`}
                      className="input input-bordered w-full mt-2 border-primary focus:border-primary focus:ring-primary"
                      value={m.maxValue || ""}
                      onChange={(e) => {
                        const updated = missions.map((mission) =>
                          mission.id === m.id
                            ? { ...mission, maxValue: Number(e.target.value) }
                            : mission
                        );
                        setMissions(updated);
                      }}
                    />
                  )}
                </div>
              );
            })}
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
