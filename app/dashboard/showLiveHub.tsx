"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { EventModal } from "@/components/EventModal";
import Loader from "@/components/loader";

export default function ShowLiveHub() {
  const { session, loading } = useUserProfile();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [eventsConfig, setEventConfigs] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    router.refresh();
    const fetchEvents = async () => {
      if (!session) return;

      setLoadingEvents(true);

      // 1. Buscar todos os eventos do usuário
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

      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        setLoadingEvents(false);
        return;
      }

      // 2. Buscar todos os configs correspondentes
      const eventIds = eventsData.map((e) => e.id_evento);
      const { data: configsData, error: configsError } = await supabase
        .from("typeEvent")
        .select("id_event, config")
        .in("id_event", eventIds);

      if (configsError) {
        console.error(configsError);
      }

      const merged = eventsData.map((ev) => {
        const cfg = configsData?.find((c) => c.id_event === ev.id_evento);
        return {
          ...ev,
          config: cfg?.config || null,
        };
      });

      setEvents(merged);
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

  const sessionBackground = (session : string) => {
    switch (session) {
      case "UNEARTHED":
        return "/images/background_uneartherd.png";
      case "SUBMERGED":
        return "/images/background_submerged.png";
      default:
        return "/images/background_uneartherd.png";
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            show<span className="text-primary">Live</span> Hub
          </h2>
          <p className="text-sm text-base-content">
            Gerencie seus eventos de robótica ao vivo aqui.
          </p>
        </div>
        <div>
          <button
            className="btn btn-soft btn-accent"
            onClick={() => setShowModal(true)}
          >
            Criar Evento
          </button>
        </div>
      </section>

      <section className="flex gap-4 flex-wrap mt-4">
        {loadingEvents ? (
          <Loader />
        ) : events.length === 0 ? (
          <p className="text-base-content">
            Nenhum evento ao vivo criado ainda.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id_evento}
              className="card w-full md:w-80 bg-base-200 shadow-xl"
            >
              <figure>
                <img
                  src={sessionBackground(event.config?.temporada)}
                  alt="Evento"
                  className="object-cover h-40 w-full"
                />
              </figure>

              <div className="card-body">
                <h2 className="card-title">
                  {event.name_event}
                  <div className="badge badge-success">Ativo</div>
                </h2>

                <p className="text-sm text-base-content">
                  Categoria:{" "}
                  {event.config?.base === "FLL"
                    ? "FIRST LEGO League"
                    : "Robótica"}
                </p>

                {event.config?.base === "FLL" && (
                  <p className="text-sm text-base-content">
                    Temporada: {event.config?.temporada}
                  </p>
                )}

                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/showlive/${event.code_event}`)
                    }
                    className="btn btn-primary"
                  >
                    Acessar Hub
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {showModal && <EventModal session={session}  onClose={() => setShowModal(false)}/>}
    </div>
  );
}
