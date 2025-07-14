"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PropsConfiguracoesSection {
  idEvent: number | null;
}

interface EventConfig {
  base: string;
  rodadas: string[];
  temporada?: string;
}

export default function ConfiguracoesSection({ idEvent }: PropsConfiguracoesSection) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [season, setSeason] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      if (!idEvent) return;

      setLoading(true);
      // Busca evento
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

      // Busca configuração
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

    // Atualiza nome
    const { error: updateEventError } = await supabase
      .from("events")
      .update({ name_event: eventName })
      .eq("id_evento", idEvent);

    if (updateEventError) {
      setError("Erro ao atualizar nome: " + updateEventError.message);
      setLoading(false);
      return;
    }

    // Atualiza configuração
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
    if (!confirm("Tem certeza que deseja apagar este evento? Essa ação não pode ser desfeita!")) return;

    setLoading(true);

    // Apaga typeEvent
    await supabase.from("typeEvent").delete().eq("id_event", idEvent);
    // Apaga equipes
    await supabase.from("team").delete().eq("id_event", idEvent);
    // Apaga evento
    const { error } = await supabase.from("events").delete().eq("id_evento", idEvent);

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

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-semibold">Configurações do Evento</h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* Nome do evento */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do Evento</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="mt-1 p-2 w-full border rounded"
        />
      </div>

      {/* Tipo de competição */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de Competição</label>
        <select
          value={competitionType}
          onChange={(e) => setCompetitionType(e.target.value)}
          className="mt-1 p-2 w-full border rounded"
        >
          <option value="">Selecione</option>
          <option value="FLL">FIRST LEGO League</option>
          <option value="SR">Segue-linha com Resgate</option>
        </select>
      </div>

      {/* Temporada */}
      {competitionType === "FLL" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Temporada</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="mt-1 p-2 w-full border rounded"
          >
            <option value="">Selecione</option>
            <option value="UNEARTHED">UNEARTHED</option>
            <option value="SUBMERGED">SUBMERGED</option>
          </select>
        </div>
      )}

      {/* Rodadas */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Rodadas</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={roundInput}
            onChange={(e) => setRoundInput(e.target.value)}
            placeholder="Nova rodada"
            className="p-2 w-full border rounded"
          />
          <button
            type="button"
            onClick={() => {
              if (roundInput.trim()) {
                setRounds([...rounds, roundInput.trim()]);
                setRoundInput("");
              }
            }}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>
        <ul className="space-y-1">
          {rounds.map((r, i) => (
            <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span>{r}</span>
              <button
                onClick={() => setRounds(rounds.filter((_, idx) => idx !== i))}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Salvar alterações */}
      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
      >
        Salvar Configurações
      </button>

      {/* Ações perigosas */}
      <div className="mt-6 space-y-2">
        <button
          onClick={handleResetScores}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
        >
          Resetar Pontuações
        </button>
        <button
          onClick={handleResetTeams}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
        >
          Resetar Equipes
        </button>
        <button
          onClick={handleDeleteEvent}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
        >
          Apagar Evento
        </button>
      </div>
    </div>
  );
}
