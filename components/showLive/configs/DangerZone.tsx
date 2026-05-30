import { useToast } from "@/app/context/ToastContext";
import { useUser } from "@/app/context/UserContext";
import { useEvent } from "@/hooks/useEvent";
import { createClient } from "@/utils/supabase/client";
import { AlertTriangle, Flag, Trash2, Users, ToggleLeft } from "lucide-react";
import { useRouter } from "next/navigation";
const supabase = createClient();
import { useState } from "react";

export default function DangerZone({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const { eventData } = useEvent(eventId);
  const { profile } = useUser();
  const { addToast } = useToast();
  const router = useRouter();

  const handleResetScores = async () => {
    if (!eventId) return;
    if (
      !confirm(
        "Tem certeza que deseja resetar todas as pontuações das equipes? Essa ação não pode ser desfeita!",
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
        Object.keys(team.points).map((round) => [round, -1]),
      );
      await supabase
        .from("team")
        .update({ points: emptyPoints })
        .eq("id_team", team.id_team);
    }
    setLoading(false);
    addToast("Pontuações resetadas com sucesso!", "success");
    router.refresh();
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
    router.refresh();
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    if (
      !confirm(
        "Tem certeza que deseja apagar este evento? Essa ação não pode ser desfeita!",
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
    router.refresh();
    router.push("/dashboard/showlive");
  };

  const handleToggleEventStatus = async (status: "active" | "inactive") => {
    if (!eventId) return;
    if (
      !confirm(
        `Tem certeza que deseja marcar o evento como ${status === "active" ? "ativo" : "inativo"}? Essa ação irá ${status === "active" ? "permitir" : "proibir"} que as equipes continuem pontuando.`,
      )
    )
      return;
    setLoading(true);
    const { error } = await supabase
      .from("events")
      .update({ event_active: status === "active" ? true : false })
      .eq("id_evento", eventId);
    if (error) {
      addToast("Erro ao atualizar status do evento: " + error.message, "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    addToast("Status do evento atualizado para " + status, "success");
    router.refresh();
  };

  const handleResetCodes = async () => {
    if (!eventId) return;
    if (
      !confirm(
        "Tem certeza que deseja resetar os códigos de acesso das equipes? Os códigos atuais deixarão de funcionar!",
      )
    )
      return;
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("code_volunteer, code_visit")
      .eq("id_evento", eventId)
      .single();
    if (error) {
      addToast("Erro ao buscar códigos: " + error.message, "error");
      setLoading(false);
      return;
    }
    const newCodeVolunteer = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCodeVisit = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error: updateError } = await supabase
      .from("events")
      .update({ code_volunteer: newCodeVolunteer, code_visit: newCodeVisit })
      .eq("id_evento", eventId);
    if (updateError) {
      addToast("Erro ao resetar códigos: " + updateError.message, "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    addToast("Códigos de acesso resetados com sucesso!", "success");
    router.refresh();
  };

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-error/10 bg-error/10 p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-base-content">
              Zona de Perigo
            </h2>
            <p className="text-sm text-base-content/70">
              Ações irreversíveis. Tenha certeza antes de prosseguir.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <span className="loading loading-spinner loading-lg text-error"></span>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-error/10 bg-error/10 p-5 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-base-content">
            Zona de Perigo
          </h2>
          <p className="text-sm text-base-content/70">
            Ações irreversíveis. Tenha certeza antes de prosseguir.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <ToggleLeft className="h-4 w-4 text-error" />
                <p className="font-medium text-base-content">
                  Status do evento
                </p>
              </div>
              <p className="text-xs leading-relaxed text-base-content/70">
                Se o evento continua ativo, ou se o evento foi finalizado.
                Proibindo ou permitindo que as equipes e voluntários continuem
                pontuando.
              </p>
            </div>
            <select
              className="select select-error w-full max-w-[180px] rounded-lg px-3 py-2"
              defaultValue={eventData?.event_active ? "active" : "inactive"}
              onChange={(e) =>
                handleToggleEventStatus(e.target.value as "active" | "inactive")
              }
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Flag className="h-4 w-4 text-error" />
                <p className="font-medium text-base-content">Resetar códigos</p>
              </div>
              <p className="text-xs leading-relaxed text-base-content/70">
                Reseta os códigos de acesso ao evento para as equipes. Os
                códigos atuais deixarão de funcionar.
              </p>
            </div>
            <button
              onClick={handleResetCodes}
              className="btn btn-outline btn-error btn-sm rounded-lg"
            >
              Resetar
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-error" />
                <p className="font-medium text-base-content">
                  Resetar pontuações
                </p>
              </div>
              <p className="text-xs leading-relaxed text-base-content/70">
                Zera a pontuação de todas as equipes deste evento. Os dados das
                equipes permanecem.
              </p>
            </div>
            <button
              onClick={handleResetScores}
              className="btn btn-outline btn-error btn-sm rounded-lg"
            >
              Resetar
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-error" />
                <p className="font-medium text-base-content">Resetar equipes</p>
              </div>
              <p className="text-xs leading-relaxed text-base-content/70">
                Remove todas as equipes deste evento. As configurações e
                pontuações serão apagadas.
              </p>
            </div>
            <button
              onClick={handleResetTeams}
              className="btn btn-outline btn-error btn-sm rounded-lg"
            >
              Resetar
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-error bg-error/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-error" />
                <p className="font-medium text-base-content">Apagar evento</p>
              </div>
              <p className="text-xs leading-relaxed text-base-content/70">
                Apaga o evento, todas as equipes e configurações
                permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
            <button
              onClick={handleDeleteEvent}
              className="btn btn-error btn-sm rounded-lg"
            >
              Apagar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
