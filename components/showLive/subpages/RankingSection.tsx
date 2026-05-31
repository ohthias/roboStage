"use client";

import { Trophy, Info } from "lucide-react";
import { useMemo } from "react";
import { useEvent } from "@/hooks/useEvent";

interface PropsRankingSection {
  codeEvent: string;
}

const excludedRounds = ["Semi-final", "Final"];

export default function RankingSection({ codeEvent }: PropsRankingSection) {
  const { loading, error, ranking, eventData } = useEvent(codeEvent);

  const filteredRanking = useMemo(() => {
    return ranking.map((team) => {
      const filteredPoints = Object.fromEntries(
        Object.entries(team.points || {}).filter(
          ([key]) => !excludedRounds.includes(key),
        ),
      );

      const total = Object.values(filteredPoints).reduce(
        (acc, value) => acc + (Number(value) || 0),
        0,
      );

      return {
        ...team,
        filteredPoints,
        total,
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">
              Ranking do Evento
            </h1>
          </div>
          <p className="text-base-content/60 mt-1 text-sm">
            {eventData.name_event}
          </p>
        </div>

        <div
          className="tooltip tooltip-left"
          data-tip="Pontuações -1 indicam rodadas ainda não avaliadas."
        >
          <button className="btn btn-ghost btn-sm btn-circle">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-base-200">
              <tr>
                <th className="text-center w-20">#</th>
                <th>Equipe</th>
                {allRounds.map((round) => (
                  <th key={round} className="text-center">
                    {round}
                  </th>
                ))}
                <th className="text-center">Total</th>
              </tr>
            </thead>

            <tbody>
              {filteredRanking.map((team, index) => (
                <tr key={team.id_team} className="hover">
                  <td className="text-center">
                    <span
                      className={`font-bold ${
                        index === 0
                          ? "text-warning"
                          : index === 1
                            ? "text-base-content"
                            : index === 2
                              ? "text-orange-500"
                              : "text-base-content/70"
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium">{team.name_team}</div>
                  </td>

                  {allRounds.map((round) => (
                    <td key={round} className="text-center">
                      {Number(team.filteredPoints[round]) || 0}
                    </td>
                  ))}
                  <td className="text-center font-bold text-primary">
                    {team.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
