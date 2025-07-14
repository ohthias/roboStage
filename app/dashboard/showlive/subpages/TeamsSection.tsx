import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

interface PropsTeamsSection {
  event: {
    id_event: number;
    points: string[];
  } | null;
}

interface Team {
  id_team: number;
  name_team: string;
  points: { [key: string]: number };
  created_at: string;
}

export default function TeamsSection({ event }: PropsTeamsSection) {
  const [teamName, setTeamName] = useState<string>("");
  const [teamsList, setTeamsList] = useState<Team[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTeams = async (id_event: number) => {
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .eq("id_event", id_event)
      .order("id_team", { ascending: true });

    if (error) {
      setErrorMsg("Erro ao buscar equipes: " + error.message);
    } else {
      setTeamsList(data as Team[]);
    }
  };

  useEffect(() => {
    if (event?.id_event) {
      fetchTeams(event.id_event);
    }
  }, [event?.id_event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setErrorMsg("O nome da equipe não pode estar vazio.");
      return;
    }
    if (!event) {
      setErrorMsg("Evento não encontrado.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Montar objeto points
    const pointsObject = event.points.reduce<{ [key: string]: number }>(
      (acc, round) => {
        acc[round] = 0;
        return acc;
      },
      {}
    );

    const newTeam = {
      name_team: teamName.trim(),
      id_event: event.id_event,
      points: pointsObject,
    };

    const { data, error } = await supabase
      .from("team")
      .insert([newTeam])
      .select();

    if (error) {
      setErrorMsg("Erro ao adicionar equipe: " + error.message);
    } else if (data) {
      setTeamsList((prev) => [...prev, ...data]);
      setTeamName("");
      setErrorMsg("");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome da Equipe
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="mt-1 p-2 w-full border rounded"
            placeholder="Digite o nome da equipe"
          />
        </div>

        {errorMsg && <p className="text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Salvando..." : "Adicionar Equipe"}
        </button>
      </form>

      {/* Lista de Equipes */}
      {teamsList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Equipes no evento</h2>
          <ul className="space-y-2">
            {teamsList.map((team) => (
              <li
                key={team.id_team}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-2 rounded"
              >
                <span className="text-gray-800">{team.name_team}</span>
                <span className="text-xs text-gray-500">
                  {new Date(team.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {teamsList.length === 0 && (
        <p className="text-gray-500 text-sm">
          Nenhuma equipe cadastrada ainda.
        </p>
      )}
    </div>
  );
}