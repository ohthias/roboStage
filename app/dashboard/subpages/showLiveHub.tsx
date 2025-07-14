"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserProfile } from "@/app/hooks/useUserProfile";

export default function ShowLiveHub() {
  const { session, loading } = useUserProfile();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [nameEvent, setNameEvent] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [rounds, setRounds] = useState<string[]>([]);
  const [roundInput, setRoundInput] = useState("");
  const [season, setSeason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [eventsConfig, setEventConfigs] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!session) return;

      setLoadingEvents(true);

      // Buscar eventos
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id_evento, name_event, code_event")
        .eq("id_responsavel", session.user.id)
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error(eventsError);
        setLoadingEvents(false);
        return;
      }

      setEvents(eventsData || []);

      // Se não houver eventos, nem tenta buscar configs
      if (!eventsData || eventsData.length === 0) {
        setEventConfigs([]);
        setLoadingEvents(false);
        return;
      }

      // Pegar todos os IDs dos eventos
      const eventIds = eventsData.map((e) => e.id_evento);

      // Buscar todos os configs
      const { data: configsData, error: configsError } = await supabase
        .from("typeEvent")
        .select("id_event, config")
        .in("id_event", eventIds);

      if (configsError) console.error(configsError);
      console.log(configsData);

      setEventConfigs(configsData || []);

      setLoadingEvents(false);
    };

    fetchEvents();
  }, [session]);

  if (loading) return <p>Carregando...</p>;

  if (!session)
    return (
      <div className="text-center text-red-500 font-semibold">
        Você precisa estar autenticado para criar eventos.
      </div>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    if (rounds.length === 0) {
      setError("Adicione ao menos uma rodada.");
      setSubmitting(false);
      return;
    }

    if (!nameEvent || !competitionType) {
      setError("Preencha todos os campos obrigatórios.");
      setSubmitting(false);
      return;
    }

    if (competitionType === "FLL" && !season) {
      setError("Selecione a temporada para FLL.");
      setSubmitting(false);
      return;
    }
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert({
          id_responsavel: session.user.id,
          name_event: nameEvent,
          code_event: crypto.randomUUID().slice(0, 6).toUpperCase(),
          code_visit: crypto.randomUUID().slice(0, 6).toUpperCase(),
          code_volunteer: crypto.randomUUID().slice(0, 6).toUpperCase(),
        })
        .select("id_evento, code_event")
        .single();

      if (eventError) throw eventError;

      const config = {
        base: competitionType,
        rodadas: rounds,
        temporada: season,
      };

      const { error: typeError } = await supabase.from("typeEvent").insert({
        id_event: eventData.id_evento,
        config: config,
      });

      if (typeError) throw typeError;

      router.push(`/dashboard/showlive/${eventData.code_event}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao criar evento");
    } finally {
      setSubmitting(false);
    }
  };

  // Facilita acesso por id_evento
  const configsByEventId = Object.fromEntries(
    eventsConfig.map((c) => [c.id_event, c.config])
  );

  return (
    <>
      <section className="bg-red-50 p-4 rounded flex justify-between items-start">
        <div>
          <h2 className="text-zinc-900 font-bold mb-2 text-3xl">
            show<span className="text-red-600">Live</span> Hub
          </h2>
          <p className="text-sm text-gray-600">
            Gerencie seus eventos de robótica ao vivo aqui.
          </p>
        </div>
        <div>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            onClick={() => setShowModal(true)}
          >
            Criar Evento
          </button>
        </div>
      </section>

      <section className="flex gap-4 flex-wrap mt-4">
        {loadingEvents ? (
          <p className="text-gray-600">Carregando eventos...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-600">Nenhum evento ao vivo criado ainda.</p>
        ) : (
          events.map((event) => {
            const config = configsByEventId[event.id_evento];

            return (
              <div
                key={event.id_evento}
                className="flex flex-col bg-white border border-gray-200 rounded shadow w-full md:w-[300px]"
              >
                <img
                  src="https://placehold.co/600x400?text=Evento"
                  alt="Evento"
                  className="w-full h-40 object-cover rounded-t"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                    {event.name_event}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Categoria:{" "}
                    {config?.base === "FLL" ? "FIRST LEGO League" : "Robótica"}
                  </p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-3 w-max">
                    Ativo
                  </span>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/showlive/${event.code_event}`)
                    }
                    className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Acessar Hub
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-gray-50/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-md max-w-3xl w-full flex flex-col px-6 py-4 h-[400px]">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center border-b border-gray-300 py-2 pl-2">
              <h3 className="text-lg font-semibold text-red-600">Criar Evento</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-600 font-bold text-xl cursor-pointer transition"
              >
                <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
              </button>
            </div>

            {/* Formulário */}
            <form
              onSubmit={handleSubmit}
              className="flex gap-6 py-4 pl-2 overflow-hidden justify-between w-full"
            >
              {/* Coluna esquerda */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-gray-600 font-semibold">Nome do Evento</label>
                  <input
                    type="text"
                    required
                    value={nameEvent}
                    onChange={(e) => setNameEvent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Digite o nome do evento"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold">
                    Tipo de competição
                  </label>
                  <select
                    required
                    value={competitionType}
                    onChange={(e) => setCompetitionType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="" >Selecione o tipo de competição</option>
                    <option value="FLL">FIRST LEGO League</option>
                    <option value="SR">Segue-linha com resgate</option>
                  </select>
                </div>
                {competitionType === "FLL" && (
                  <div>
                    <label className="block text-gray-600 font-semibold">Temporada</label>
                    <select
                      required
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Selecione a temporada</option>
                      <option value="UNEARTHED">UNEARTHED</option>
                      <option value="SUBMERGED">SUBMERGED</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Coluna direita */}
              <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto">
                <label className="block text-gray-600 font-semibold">Rodadas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={roundInput}
                    onChange={(e) => setRoundInput(e.target.value)}
                    placeholder="Digite o nome da rodada"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (roundInput.trim() !== "") {
                        setRounds([...rounds, roundInput.trim()]);
                        setRoundInput("");
                      }
                    }}
                    className="bg-transparent border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                {rounds.length > 0 && (
                  <ul className="space-y-1">
                    {rounds.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded"
                      >
                        <span className="text-gray-700">{r}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setRounds(rounds.filter((_, index) => index !== i))
                          }
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            
            {/* Rodapé */}
            <div className="flex justify-end gap-4 border-t border-gray-300 pt-4">
              {error && (
                <div className="text-red-500 text-sm mr-auto">{error}</div>
              )}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-transparent border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-ppointer"
              >
                {submitting ? "Criando..." : "Criar Evento"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </>
  );
}
