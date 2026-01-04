"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";
import Loader from "@/components/Loader";
import EventSettings from "../configs/EventSettings";
import DangerZone from "../configs/DangerZone";

interface PropsConfiguracoesSection {
  idEvent: number | null;
}

export default function ConfiguracoesSection({
  idEvent,
}: PropsConfiguracoesSection) {
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [season, setSeason] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      if (!idEvent) return;

      setLoading(true);
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id_evento", idEvent)
        .single();

      if (eventError) {
        addToast("Erro ao buscar evento: " + eventError.message, "error");
        setLoading(false);
        return;
      }
      setEventName(eventData.name_event);

      const { data: configData, error: configError } = await supabase
        .from("typeEvent")
        .select("*")
        .eq("id_event", idEvent)
        .single();

      if (configError) {
        addToast("Erro ao buscar configuração: " + configError.message, "error");
        setLoading(false);
        return;
      }

      setCompetitionType(configData.config.base);
      setRounds(configData.config.rodadas);
      setSeason(configData.config.temporada ?? "");
      setLoading(false);
    };

    fetchConfig();
  }, [idEvent]);

  const handleSave = async () => {
    if (!idEvent) return;
    setLoading(true);

    // Atualiza nome do evento
    const { error: updateEventError } = await supabase
      .from("events")
      .update({ name_event: eventName })
      .eq("id_evento", idEvent);

    if (updateEventError) {
      addToast("Erro ao atualizar nome: " + updateEventError.message, "error");
      setLoading(false);
      return;
    }

    // Atualiza config do evento
    const { error: updateConfigError } = await supabase
      .from("typeEvent")
      .update({
        config: {
          base: competitionType,
          rodadas: rounds,
          temporada: competitionType === "FLL" ? season : "",
        },
      })
      .eq("id_event", idEvent);

    if (updateConfigError) {
      addToast("Erro ao atualizar configuração: " + updateConfigError.message, "error");
      setLoading(false);
      return;
    }

    // Busca equipes para preservar pontos já lançados
    const { data: teams, error: fetchTeamsError } = await supabase
      .from("team")
      .select("id_team, points")
      .eq("id_event", idEvent);

    if (fetchTeamsError) {
      addToast("Erro ao buscar equipes: " + fetchTeamsError.message, "error");
      setLoading(false);
      return;
    }

    // Para cada equipe, mescla os pontos existentes com os rounds novos
    for (const team of teams || []) {
      const currentPoints = team.points || {};
      const newPoints = { ...currentPoints };

      for (const r of rounds) {
        if (!(r in newPoints)) {
          newPoints[r] = -1; // só adiciona se não existir
        }
      }

      const { error: updateTeamError } = await supabase
        .from("team")
        .update({ points: newPoints })
        .eq("id_team", team.id_team);

      if (updateTeamError) {
        addToast(
          "Erro ao atualizar pontos da equipe: " + updateTeamError.message,
          "error"
        );
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    addToast("Configuração salva e pontuação padronizada!", "success");
  };

  // Handlers drag-and-drop nativo
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    const newRounds = [...rounds];
    const [movedItem] = newRounds.splice(draggingIndex, 1);
    newRounds.splice(index, 0, movedItem);
    setRounds(newRounds);
    setDraggingIndex(index);
  };

  if (!idEvent) return <p className="text-red-500">Evento inválido.</p>;
  if (loading) return <div className="h-screen flex justify-center"><Loader /></div>;

  return (
    <div className="px-4 md:px-8">
      <h2 className="font-bold text-primary text-3xl mb-4">
        Configurações do Evento
      </h2>

      {/* Nome do evento */}
      <div className="bg-base-200 border border-base-300 rounded-lg p-4">
        <label className="block text-md font-medium text-base-content mb-2">
          Nome do Evento
        </label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 mt-2">
        {/* Tipo de competição */}
        <div>
          <label className="block text-sm font-medium text-base-content mb-2">
            Tipo de Competição
          </label>
          <select
            value={competitionType}
            onChange={(e) => setCompetitionType(e.target.value)}
            className="input input-bordered w-full"
            disabled={true}
          >
            <option value="">Selecione</option>
            <option value="FLL">FIRST LEGO League</option>
          </select>
        </div>

        {competitionType === "FLL" && (
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Temporada
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="input input-bordered w-full"
            >
              <option value="">Selecione</option>
              <option value="UNEARTHED">UNEARTHED</option>
              <option value="SUBMERGED">SUBMERGED</option>
              <option value="MASTERPIECE">MASTERPIECE</option>
            </select>
          </div>
        )}
      </div>

      {/* Rodadas */}
      <div className="p-2">
        <hr className="w-full my-4 border-base-200" />
        <label className="block text-md font-medium text-base-content mb-2">
          Rodadas
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={roundInput}
            onChange={(e) => setRoundInput(e.target.value)}
            placeholder="Nova rodada"
            className="input input-bordered w-full"
          />
          <button
            type="button"
            onClick={() => {
              if (roundInput.trim()) {
                setRounds([...rounds, roundInput.trim()]);
                setRoundInput("");
              }
            }}
            className="btn btn-default"
          >
            Adicionar
          </button>
        </div>

        {/* Lista de rodadas com drag-and-drop nativo */}
        <ul className="mt-4 space-y-2">
          {rounds.map((r, i) => (
            <li
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              className="flex justify-between items-center bg-base-100 p-2 rounded border border-base-200 cursor-move"
            >
              <span className="text-base-content">{r}</span>
              <button
                onClick={() => {
                  if (rounds.length <= 1) {
                    alert("Não é possível remover a única rodada!");
                    return;
                  }
                  setRounds(rounds.filter((_, idx) => idx !== i));
                }}
                className="btn btn-ghost btn-error"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mr-2 mt-2">
        <button onClick={handleSave} className="btn btn-accent btn-dash">
          <i className="fi fi-rr-check"></i>
          Salvar Configurações
        </button>
      </div>

      <DangerZone eventId={String(idEvent)} />
    </div>
  );
}
