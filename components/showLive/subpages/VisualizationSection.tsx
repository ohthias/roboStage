"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Monitor } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { createClient } from "@/utils/supabase/client";
import { useEvent } from "@/hooks/useEvent";

const supabase = createClient();

interface PropsVisualizationSection {
  codeEvent: string;
}

const excludedRounds = ["Semi-final", "Final"];

export default function VisualizationSection({
  codeEvent,
}: PropsVisualizationSection) {
  const { addToast } = useToast();
  const { loading, error, ranking, eventData } = useEvent(codeEvent);
  const [visibleRounds, setVisibleRounds] = useState<string[]>([]);

  const filteredRanking = useMemo(() => {
    return ranking.map((team) => {
      const filteredPoints = Object.fromEntries(
        Object.entries(team.points || {}).filter(
          ([key]) => !excludedRounds.includes(key),
        ),
      );

      const bestRound = Math.max(
        ...Object.values(filteredPoints).map((value) => Number(value) || 0),
        0,
      );

      return {
        ...team,
        filteredPoints,
        bestRound,
      };
    });
  }, [ranking]);

  const allRounds = useMemo(() => {
    return Array.from(
      new Set(
        filteredRanking.flatMap((team) => Object.keys(team.filteredPoints)),
      ),
    );
  }, [filteredRanking]);

  useEffect(() => {
    const loadConfig = async () => {
      if (!eventData) return;

      const { data } = await supabase
        .from("typeEvent")
        .select("config")
        .eq("id_event", eventData.id_evento)
        .single();

      const savedRounds = data?.config?.visibleRounds;

      if (savedRounds && savedRounds.length > 0) {
        setVisibleRounds(savedRounds);
      } else {
        setVisibleRounds(allRounds);
      }
    };

    loadConfig();
  }, [eventData, allRounds]);

  const toggleRound = async (round: string) => {
    if (!eventData) return;

    const updatedRounds = visibleRounds.includes(round)
      ? visibleRounds.filter((r) => r !== round)
      : [...visibleRounds, round];

    setVisibleRounds(updatedRounds);

    const { data } = await supabase
      .from("typeEvent")
      .select("id, config")
      .eq("id_event", eventData.id_evento)
      .single();

    const mergedConfig = {
      ...(data?.config || {}),

      visibleRounds: updatedRounds,
    };

    if (data?.id) {
      const { error } = await supabase
        .from("typeEvent")
        .update({
          config: mergedConfig,
        })
        .eq("id", data.id);

      if (error) {
        addToast("Erro ao salvar visualização.", "error");
      }
    } else {
      const { error } = await supabase.from("typeEvent").insert({
        id_event: eventData.id_evento,

        config: mergedConfig,
      });

      if (error) {
        addToast("Erro ao salvar visualização.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="alert alert-error">
        <span>Evento não encontrado.</span>
      </div>
    );
  }

  return (
    <section className="space-y-6 px-4 md:px-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Monitor size={22} className="text-primary" />

            <h1 className="text-2xl md:text-3xl font-bold">
              Visualização do Ranking
            </h1>
          </div>

          <p className="text-sm text-base-content/60 mt-1">
            Escolha quais rodadas serão exibidas aos visitantes.
          </p>
        </div>

        <div className="badge badge-outline">
          {visibleRounds.length} visíveis
        </div>
      </div>

      {/* Rounds */}
      <div className="flex flex-wrap gap-2">
        {allRounds.map((round) => {
          const visible = visibleRounds.includes(round);

          return (
            <button
              key={round}
              onClick={() => toggleRound(round)}
              className={`btn btn-sm gap-2 ${
                visible ? "btn-primary" : "btn-ghost border border-base-300"
              }`}
            >
              {visible ? <Eye size={14} /> : <EyeOff size={14} />}

              {round}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-base-200">
              <tr>
                <th className="w-20 text-center">#</th>

                <th>Equipe</th>

                {visibleRounds.map((round) => (
                  <th key={round} className="text-center">
                    {round}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRanking.map((team, index) => (
                <tr key={team.id_team} className="hover">
                  <td className="text-center font-bold text-base-content/60">
                    #{index + 1}
                  </td>

                  <td className="font-medium">{team.name_team}</td>

                  {visibleRounds.map((round) => (
                    <td key={round} className="text-center">
                      {Number(team.filteredPoints[round]) || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}