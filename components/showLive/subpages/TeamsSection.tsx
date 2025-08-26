import { useToast } from "@/app/context/ToastContext";
import CardDefault from "@/components/ui/Cards/CardDefault";
import { supabase } from "@/utils/supabase/client";
import { motion } from "framer-motion";
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
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchTeams = async (id_event: number) => {
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .eq("id_event", id_event)
      .order("id_team", { ascending: true });

    if (error) {
      addToast("Erro ao buscar equipes: " + error.message, "error");
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
      addToast("O nome da equipe não pode estar vazio.", "warning");
      return;
    }
    if (!event) {
      addToast("Evento não encontrado.", "error");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const pointsObject = event.points.reduce<{ [key: string]: number }>(
      (acc, round) => {
        acc[round] = -1;
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
      addToast("Erro ao adicionar equipe: " + error.message, "error");
      addToast("Equipe adicionada com sucesso.", "success");
    } else if (data) {
      setTeamsList((prev) => [...prev, ...data]);
      setTeamName("");
      addToast("Equipe adicionada com sucesso.", "success");
    }

    setLoading(false);
  };

  const handleDelete = async (id_team: number) => {
    if (!confirm("Tem certeza que deseja excluir esta equipe?")) return;

    const { error } = await supabase.from("team").delete().eq("id_team", id_team);

    if (error) {
      addToast("Erro ao excluir equipe: " + error.message, "error");
      addToast("Equipe excluída com sucesso.", "success");
    } else {
      setTeamsList((prev) => prev.filter((t) => t.id_team !== id_team));
      addToast("Equipe excluída com sucesso.", "success");
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
      addToast("Equipe editada com sucesso.", "success");
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-8">
      <h4 className="text-primary font-bold text-3xl">Equipes</h4>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="card bg-base-200 p-4 shadow-md flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="flex-1 w-full">
          <label className="block text-md font-semibold text-base-content mb-2">
            Nome da Equipe
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="input input-bordered w-full input-primary"
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
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[350px]">
          {teamsList.map((team, i) => {
            const hasPoints = Object.values(team.points).some((p) => p !== -1);

            const buttons = [
              { label: "Editar", onClick: () => handleEdit(team) },
              { label: "Excluir", onClick: () => handleDelete(team.id_team) },
            ];
            if (hasPoints) {
              buttons.unshift({
                label: "Pontos",
                onClick: () => {
                  alert("Função de mudar pontuação ainda não implementada.");
                },
              });
            }

            return (
              <motion.div
                key={team.id_team}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CardDefault
                  title={team.name_team}
                  description={`Criada em: ${new Date(team.created_at).toLocaleString()}`}
                  buttons={buttons}
                  size="sm"
                />
              </motion.div>
            );
          })}
        </div>

      ) : (
        <p className="text-gray-500 text-sm text-center">
          Nenhuma equipe cadastrada ainda.
        </p>
      )}
    </div>
  );
}