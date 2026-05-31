"use client";

import { useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Plus, Users, Target } from "lucide-react";

import { useToast } from "@/app/context/ToastContext";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";
import ModalInput, { ModalInputRef } from "@/components/UI/Modal/ModalInput";
import ModalPoints, { ModalPointsRef } from "@/components/UI/Modal/ModalPoints";

import { createClient } from "@/utils/supabase/client";
import { useEvent } from "@/hooks/useEvent";

const supabase = createClient();

interface PropsTeamsSection {
  codeEvent: string;
}

export default function TeamsSection({ codeEvent }: PropsTeamsSection) {
  const { addToast } = useToast();

  const { loading, error, teams, eventData, eventConfig } = useEvent(codeEvent);

  const [teamName, setTeamName] = useState("");

  const [saving, setSaving] = useState(false);

  const modalEditRef = useRef<ModalInputRef>(null);

  const modalDeleteRef = useRef<ModalConfirmRef>(null);

  const modalPointsRef = useRef<ModalPointsRef>(null);

  const rankingTeams = useMemo(() => {
    return [...teams]
      .map((team) => {
        const total = Object.values(team.points || {}).reduce(
          (acc, value) => acc + (Number(value) || 0),
          0,
        );

        return {
          ...team,
          total,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [teams]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      addToast("Digite o nome da equipe.", "warning");

      return;
    }

    if (!eventData || !eventConfig) {
      addToast("Evento inválido.", "error");

      return;
    }

    setSaving(true);

    const rounds = eventConfig.config.rodadas || [];

    const pointsObject = rounds.reduce<Record<string, number>>((acc, round) => {
      acc[round] = -1;

      return acc;
    }, {});

    const { error } = await supabase.from("team").insert([
      {
        id_event: eventData.id_evento,

        name_team: teamName.trim(),

        points: pointsObject,
      },
    ]);

    if (error) {
      addToast("Erro ao criar equipe.", "error");
    } else {
      addToast("Equipe criada com sucesso.", "success");

      window.location.reload();
    }

    setSaving(false);

    setTeamName("");
  };

  const handleDelete = (id: number, name: string) => {
    modalDeleteRef.current?.open(`Deseja excluir "${name}"?`, async () => {
      const { error } = await supabase.from("team").delete().eq("id_team", id);

      if (error) {
        addToast("Erro ao excluir equipe.", "error");
      } else {
        addToast("Equipe removida.", "success");

        window.location.reload();
      }
    });
  };

  const handleEdit = (id: number, currentName: string) => {
    modalEditRef.current?.open(currentName, async (newName) => {
      if (!newName.trim()) return;

      const { error } = await supabase
        .from("team")
        .update({
          name_team: newName.trim(),
        })
        .eq("id_team", id);

      if (error) {
        addToast("Erro ao editar equipe.", "error");
      } else {
        addToast("Equipe atualizada.", "success");

        window.location.reload();
      }
    });
  };

  const handlePoints = (team: any) => {
    modalPointsRef.current?.open(
      team.name_team,
      team.points,
      async (newPoints) => {
        const { error } = await supabase
          .from("team")
          .update({
            points: newPoints,
          })
          .eq("id_team", team.id_team);

        if (error) {
          addToast("Erro ao atualizar pontos.", "error");
        } else {
          addToast("Pontuação atualizada.", "success");

          window.location.reload();
        }
      },
    );
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

  return (
    <section className="space-y-6 px-4 md:px-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={22} className="text-primary" />

            <h1 className="text-2xl md:text-3xl font-bold">Equipes</h1>
          </div>

          <p className="text-sm text-base-content/60 mt-1">
            Gerencie as equipes do evento.
          </p>
        </div>

        <div className="badge badge-outline">{rankingTeams.length} equipes</div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleCreateTeam}
        className="flex flex-col md:flex-row gap-3"
      >
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Nome da equipe"
          className="input input-bordered w-full"
        />

        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <Plus size={18} />
              Adicionar
            </>
          )}
        </button>
      </form>

      {/* Teams */}
      {rankingTeams.length > 0 ? (
        <div className="space-y-3">
          {rankingTeams.map((team, index) => (
            <div
              key={team.id_team}
              className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-100 px-4 py-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 flex justify-center">
                  <span className="font-bold text-base-content/50">
                    #{index + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <h2 className="font-medium truncate">{team.name_team}</h2>

                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <Target size={14} />

                    <span>{team.total} pts</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePoints(team)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <Target size={16} />
                </button>

                <button
                  onClick={() => handleEdit(team.id_team, team.name_team)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => handleDelete(team.id_team, team.name_team)}
                  className="btn btn-ghost btn-sm btn-circle text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-base-300 py-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-base-content/30" />

          <h2 className="font-medium">Nenhuma equipe cadastrada</h2>

          <p className="text-sm text-base-content/60 mt-1">
            Adicione equipes para iniciar o evento.
          </p>
        </div>
      )}

      {/* Modals */}
      <ModalInput
        ref={modalEditRef}
        title="Editar equipe"
        description="Digite o novo nome da equipe."
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
      />

      <ModalConfirm
        ref={modalDeleteRef}
        title="Excluir equipe"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
      />

      <ModalPoints ref={modalPointsRef} title="Editar Pontuação" />
    </section>
  );
}
