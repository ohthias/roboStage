"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface PropsConfiguracoesSection {
  idEvent: number | null;
}

interface EventConfig {
  base: string;
  rodadas: string[];
  temporada?: string;
}

export default function ConfiguracoesSection({
  idEvent,
}: PropsConfiguracoesSection) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [season, setSeason] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");

  const route = useRouter();

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

    // 1) Atualiza nome do evento
    const { error: updateEventError } = await supabase
      .from("events")
      .update({ name_event: eventName })
      .eq("id_evento", idEvent);

    if (updateEventError) {
      setError("Erro ao atualizar nome: " + updateEventError.message);
      setLoading(false);
      return;
    }

    // 2) Atualiza configuração
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

    // 3) Atualiza pontos das equipes
    const { data: teams, error: teamsFetchError } = await supabase
      .from("team")
      .select("id_team, points")
      .eq("id_event", idEvent);

    if (teamsFetchError) {
      setError("Erro ao buscar equipes: " + teamsFetchError.message);
      setLoading(false);
      return;
    }

    for (const team of teams || []) {
      const oldPoints = team.points || {};

      // Novo objeto points:
      const newPoints: Record<string, number> = {};

      rounds.forEach((round) => {
        // Se já existia, mantém pontuação
        if (oldPoints.hasOwnProperty(round)) {
          newPoints[round] = oldPoints[round];
        } else {
          // Senão, inicia com 0
          newPoints[round] = 0;
        }
      });

      const { error: updateTeamError } = await supabase
        .from("team")
        .update({ points: newPoints })
        .eq("id_team", team.id_team);

      if (updateTeamError) {
        setError("Erro ao atualizar equipes: " + updateTeamError.message);
        setLoading(false);
        return;
      }
    }

    setError("");
    setLoading(false);
    alert("Configuração salva com sucesso!");
    route.refresh();
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
    route.refresh();
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
    route.refresh();
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

    await supabase.from("event").delete().eq("id_evento", idEvent);

    setLoading(false);
    alert("Evento apagado com sucesso!");
    route.push("/dashboard#showLive");
  };

  if (!idEvent) {
    return <p className="text-red-500">Evento inválido.</p>;
  }

  if (loading) {
    return <p>Carregando configurações...</p>;
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-screen">
      <h2 className="font-bold text-gray-500 text-3xl">
        Configurações do Evento
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* Nome do evento */}
      <div className="bg-neutral-50 rounded p-2">
        <label className="block text-sm font-medium text-gray-500">
          Nome do Evento
        </label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded outline-none focus:border-red-600 focus:ring-red-600 transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        {/* Tipo de competição */}
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Tipo de Competição
          </label>
          <select
            value={competitionType}
            onChange={(e) => setCompetitionType(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded outline-none focus:border-red-600 focus:ring-red-600 transition"
          >
            <option value="">Selecione</option>
            <option value="FLL">FIRST LEGO League</option>
            <option value="SR">Segue-linha com Resgate</option>
          </select>
        </div>

        {/* Temporada */}
        {competitionType === "FLL" && (
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Temporada
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded outline-none focus:border-red-600 focus:ring-red-600 transition"
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
        <label className="block text-sm font-medium text-gray-700">
          Rodadas
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={roundInput}
            onChange={(e) => setRoundInput(e.target.value)}
            placeholder="Nova rodada"
            className="p-2 w-full border border-gray-300 rounded outline-none focus:border-red-600 focus:ring-red-600 transition"
          />
          <button
            type="button"
            onClick={() => {
              if (roundInput.trim()) {
                setRounds([...rounds, roundInput.trim()]);
                setRoundInput("");
              }
            }}
            className="bg-transparent border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            Adicionar
          </button>
        </div>
        <ul className="mt-4 space-y-1">
          {rounds.map((r, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-gray-50 p-2 rounded"
            >
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
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-max"
        >
          Salvar Configurações
        </button>
      </div>

      {/* Ações perigosas */}
      <div className="mt-8 border border-red-300 bg-red-50 rounded-lg p-4">
        <div className="mb-4 flex items-start gap-2 flex-col">
          <span className="text-2xl font-bold text-red-600">
            Zona de Perigo
          </span>
          <span className="text-zinc-900 text-sm">
            Ações irreversíveis. Tenha certeza antes de prosseguir.
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-row-reverse">
            <button
              onClick={handleResetScores}
              className="bg-transparent border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white w-max cursor-pointer transition"
            >
              Resetar Pontuações
            </button>
            <p className="text-xs text-gray-600 mt-1 ml-1">
              Zera a pontuação de todas as equipes deste evento. Os dados das
              equipes permanecem.
            </p>
          </div>
          <div className="flex justify-between items-center flex-row-reverse">
            <button
              onClick={handleResetTeams}
              className="bg-transparent border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white w-max cursor-pointer transition"
            >
              Resetar Equipes
            </button>
            <p className="text-xs text-gray-600 mt-1 ml-1">
              Remove todas as equipes deste evento. As configurações e
              pontuações serão apagadas.
            </p>
          </div>
          <div className="flex justify-between items-center flex-row-reverse">
            <button
              onClick={handleDeleteEvent}
              className="bg-transparent border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white w-max cursor-pointer transition"
            >
              Apagar Evento
            </button>
            <p className="text-xs text-gray-600 mt-1 ml-1">
              Apaga o evento, todas as equipes e configurações permanentemente.
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
