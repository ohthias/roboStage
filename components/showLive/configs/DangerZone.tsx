import { useToast } from "@/app/context/ToastContext";
import { supabase } from "@/utils/supabase/client";
import { useState } from "react";

export default function DangerZone({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleResetScores = async () => {
    if (!eventId) return;
    if (
      !confirm(
        "Tem certeza que deseja resetar todas as pontuações das equipes? Essa ação não pode ser desfeita!"
      )
    )
      return;
    setLoading(true);
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .eq("id_event", eventId);
    if (error) {
      addToast("Erro ao buscar equipes: " + error.message, "error");
      setLoading(false);
      return;
    }

    for (const team of data) {
      const emptyPoints = Object.fromEntries(
        Object.keys(team.points).map((round) => [round, -1])
      );
      await supabase
        .from("team")
        .update({ points: emptyPoints })
        .eq("id_team", team.id_team);
    }
    setLoading(false);
    addToast("Pontuações resetadas com sucesso!", "success");
  };

  const handleResetTeams = async () => {
    if (
      !confirm("Tem certeza que deseja apagar todas as equipes deste evento?")
    )
      return;

    if (!eventId) return;
    setLoading(true);
    const { error } = await supabase
      .from("team")
      .delete()
      .eq("id_event", eventId);
    if (error) {
      addToast("Erro ao resetar equipes: " + error.message, "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    addToast("Todas as equipes foram apagadas.", "success");
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    if (
      !confirm(
        "Tem certeza que deseja apagar este evento? Essa ação não pode ser desfeita!"
      )
    )
      return;
    setLoading(true);
    await supabase.from("typeEvent").delete().eq("id_event", eventId);
    await supabase.from("team").delete().eq("id_event", eventId);

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id_evento", eventId);
    if (error) {
      addToast("Erro ao apagar evento: " + error.message, "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    addToast("Evento apagado com sucesso!", "success");
    window.location.href = "/dashboard#showLive";
  };

  if (loading) {
    return (
      <section className="mt-8 border border-error bg-error/10 rounded-lg p-4">
        <div className="mb-4 flex flex-col gap-2">
          <span className="text-2xl font-bold text-error">Zona de Perigo</span>
            <span className="text-base-content text-sm">
                Ações irreversíveis. Tenha certeza antes de prosseguir.
            </span>
        </div>
        <div className="flex justify-center items-center">
          <span className="loading loading-spinner loading-lg text-error"></span>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 border border-error bg-error/10 rounded-lg p-4">
      <div className="mb-4 flex flex-col gap-2">
        <span className="text-2xl font-bold text-error">Zona de Perigo</span>
        <span className="text-base-content text-sm">
          Ações irreversíveis. Tenha certeza antes de prosseguir.
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-row-reverse">
          <button
            onClick={handleResetScores}
            className="btn btn-outline btn-error"
          >
            Resetar Pontuações
          </button>
          <p className="text-xs text-base-content mt-1 ml-1">
            Zera a pontuação de todas as equipes deste evento. Os dados das
            equipes permanecem.
          </p>
        </div>
        <div className="flex justify-between items-center flex-row-reverse">
          <button
            onClick={handleResetTeams}
            className="btn btn-outline btn-error"
          >
            Resetar Equipes
          </button>
          <p className="text-xs text-base-content mt-1 ml-1">
            Remove todas as equipes deste evento. As configurações e pontuações
            serão apagadas.
          </p>
        </div>
        <div className="flex justify-between items-center flex-row-reverse">
          <button onClick={handleDeleteEvent} className="btn btn-error">
            Apagar Evento
          </button>
          <p className="text-xs text-base-content mt-1 ml-1">
            Apaga o evento, todas as equipes e configurações permanentemente.
            Esta ação não pode ser desfeita.
          </p>
        </div>
      </div>
    </section>
  );
}
