"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface PropsConfiguracoesSection {
  idEvent: number | null;
}

export default function ConfiguracoesSection({ idEvent }: PropsConfiguracoesSection) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [season, setSeason] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
        setError("Erro ao buscar evento: " + eventError.message);
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
        setError("Erro ao buscar configuração: " + configError.message);
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

    const { error: updateEventError } = await supabase
      .from("events")
      .update({ name_event: eventName })
      .eq("id_evento", idEvent);

    if (updateEventError) {
      setError("Erro ao atualizar nome: " + updateEventError.message);
      setLoading(false);
      return;
    }

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
      setError("Erro ao atualizar configuração: " + updateConfigError.message);
      setLoading(false);
      return;
    }

    setError("");
    setLoading(false);
    alert("Configuração salva com sucesso!");
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

  const handleResetScores = async () => {
    if (!idEvent) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .eq("id_event", idEvent);
    if (error) {
      setError("Erro ao buscar equipes: " + error.message);
      setLoading(false);
      return;
    }
    // Zerar pontuação
    for (const team of data) {
      const emptyPoints = Object.fromEntries(
        Object.keys(team.points).map((round) => [round, 0])
      );
      await supabase
        .from("team")
        .update({ points: emptyPoints })
        .eq("id_team", team.id_team);
    }
    setLoading(false);
    alert("Pontuações resetadas!");
  };

  const handleResetTeams = async () => {
    if (!idEvent) return;
    setLoading(true);
    const { error } = await supabase
      .from("team")
      .delete()
      .eq("id_event", idEvent);
    if (error) {
      setError("Erro ao resetar equipes: " + error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    alert("Todas as equipes foram apagadas.");
  };

  const handleDeleteEvent = async () => {
    if (!idEvent) return;
    if (
      !confirm(
        "Tem certeza que deseja apagar este evento? Essa ação não pode ser desfeita!"
      )
    )
      return;
    setLoading(true);
    // Apaga typeEvent
    await supabase.from("typeEvent").delete().eq("id_event", idEvent);
    // Apaga equipes
    await supabase.from("team").delete().eq("id_event", idEvent);
    // Apaga evento
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id_evento", idEvent);
    if (error) {
      setError("Erro ao apagar evento: " + error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    alert("Evento apagado com sucesso!");
    window.location.href = "/dashboard#showLive";
  };
  if (!idEvent) {
    return <p className="text-red-500">Evento inválido.</p>;
  }
  if (loading) {
    return <p>Carregando configurações...</p>;
  }

  if (!idEvent) return <p className="text-red-500">Evento inválido.</p>;
  if (loading) return <p>Carregando configurações...</p>;

  return (
    <div>
      <h2 className="font-bold text-primary text-3xl mb-4">Configurações do Evento</h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* Nome do evento */}
      <div className="bg-base-200 border border-base-300 rounded-lg p-4">
        <label className="block text-md font-medium text-base-content mb-2">Nome do Evento</label>
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
          <label className="block text-sm font-medium text-base-content mb-2">Tipo de Competição</label>
          <select
            value={competitionType}
            onChange={(e) => setCompetitionType(e.target.value)}
            className="input input-bordered w-full"
          >
            <option value="">Selecione</option>
            <option value="FLL">FIRST LEGO League</option>
          </select>
        </div>

        {competitionType === "FLL" && (
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">Temporada</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="input input-bordered w-full"
            >
              <option value="">Selecione</option>
              <option value="UNEARTHED">UNEARTHED</option>
              <option value="SUBMERGED">SUBMERGED</option>
            </select>
          </div>
        )}
      </div>

      {/* Rodadas */}
      <div className="p-2">
        <hr className="w-full my-4 border-base-200"/>
        <label className="block text-md font-medium text-base-content mb-2">Rodadas</label>
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
              <span className="text-error-content">{r}</span>
              <button
                onClick={() => setRounds(rounds.filter((_, idx) => idx !== i))}
                className="btn btn-ghost btn-error"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mr-2 mt-2">
        <button
          onClick={handleSave}
          className="btn btn-accent btn-dash"
        >
          <i className="fi fi-rr-check"></i>
          Salvar Configurações
        </button>
      </div>

      {/* Ações perigosas */}
      <div className="mt-8 border border-error bg-error/10 rounded-lg p-4">
        <div className="mb-4 flex flex-col gap-2">
          <span className="text-2xl font-bold text-error">
        Zona de Perigo
          </span>
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
          Zera a pontuação de todas as equipes deste evento. Os dados das equipes permanecem.
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
          Remove todas as equipes deste evento. As configurações e pontuações serão apagadas.
        </p>
          </div>
          <div className="flex justify-between items-center flex-row-reverse">
        <button
          onClick={handleDeleteEvent}
          className="btn btn-error"
        >
          Apagar Evento
        </button>
        <p className="text-xs text-base-content mt-1 ml-1">
          Apaga o evento, todas as equipes e configurações permanentemente. Esta ação não pode ser desfeita.
        </p>
          </div>
        </div>
      </div>
    </div>
  );
}
