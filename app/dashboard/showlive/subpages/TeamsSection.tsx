import { supabase } from "@/utils/supabase/client";
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
    }

    setLoading(false);
  };

  const handleDelete = async (id_team: number) => {
    if (!confirm("Tem certeza que deseja excluir esta equipe?")) return;

    const { error } = await supabase.from("team").delete().eq("id_team", id_team);
    if (error) {
      alert("Erro ao excluir equipe: " + error.message);
    } else {
      setTeamsList((prev) => prev.filter((t) => t.id_team !== id_team));
    }
  };

  const handleEdit = (team: Team) => {
    const novoNome = prompt("Digite o novo nome da equipe:", team.name_team);
    if (novoNome && novoNome.trim() !== "") {
      supabase
        .from("team")
        .update({ name_team: novoNome.trim() })
        .eq("id_team", team.id_team)
        .then(({ error }) => {
          if (error) {
            alert("Erro ao editar equipe: " + error.message);
          } else {
            setTeamsList((prev) =>
              prev.map((t) =>
                t.id_team === team.id_team ? { ...t, name_team: novoNome.trim() } : t
              )
            );
          }
        });
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-primary font-bold text-3xl">Equipes</h4>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="card bg-base-200 p-4 shadow-md flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="flex-1 w-full">
          <label className="block text-md font-bold text-gray-500 mb-2">
            Nome da Equipe
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="input input-bordered w-full"
            placeholder="Digite o nome da equipe"
          />
        </div>

        {errorMsg && <p className="text-error">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full md:w-auto"
        >
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {/* Lista */}
      {teamsList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsList.map((team) => (
            <div
              key={team.id_team}
              className="card bg-base-100 shadow-md border border-base-300"
            >
              <div className="card-body">
                <h3 className="card-title text-lg font-bold break-words">
                  {team.name_team}
                </h3>
                <p className="text-xs opacity-60">
                  Criada em: {new Date(team.created_at).toLocaleString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    className="btn btn-outline btn-sm flex items-center gap-1"
                    onClick={() => handleEdit(team)}
                  >
                    <i className="fi fi-rr-edit"></i> Editar
                  </button>
                  <button
                    className="btn btn-error btn-sm flex items-center gap-1"
                    onClick={() => handleDelete(team.id_team)}
                  >
                    <i className="fi fi-rr-trash"></i> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center">
          Nenhuma equipe cadastrada ainda.
        </p>
      )}
    </div>
  );
}