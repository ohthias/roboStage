"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EventModal } from "@/components/EventModal";
import Loader from "@/components/loader";
import { useUser } from "@/app/context/UserContext";
import { useEvents } from "@/hooks/useEventsLoad";
import { MagnifyingGlassIcon, SignalIcon } from "@heroicons/react/24/outline";

export default function ShowLiveHub() {
  const router = useRouter();
  const { session, loading } = useUser();
  const { events, loading: loadingEvents } = useEvents(session?.user?.id);

  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [seasonFilter, setSeasonFilter] = useState<"all" | string>("all");

  if (loading) return <Loader />;
  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const sessionBackground = (temporada: string) => {
    switch (temporada) {
      case "UNEARTHED":
        return "/images/background_uneartherd.png";
      case "SUBMERGED":
        return "/images/background_submerged.png";
      case "MASTERPIECE":
        return "/images/showLive/banners/banner_masterpiece.webp";
      default:
        return "/images/icons/Icone.png";
    }
  };

  // Filtragem e ordenação de eventos
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) =>
        event.name_event.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter((event) =>
        seasonFilter === "all" ? true : event.config?.temporada === seasonFilter
      )
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [events, searchText, order, seasonFilter]);

  // Extrair temporadas disponíveis
  const seasons = useMemo(() => {
    const uniqueSeasons = Array.from(
      new Set(events.map((e) => e.config?.temporada).filter(Boolean))
    );
    return uniqueSeasons;
  }, [events]);

  return (
    <div>
      <section className="bg-base-100 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300 mb-4">
        <div className="flex items-center gap-4">
          <SignalIcon className="hidden sm:block size-16 text-primary/75" />
          <div>
            <h2 className="text-base-content font-bold mb-2 text-3xl">
              Show<span className="text-primary">Live</span>
            </h2>
            <p className="text-sm text-base-content">
              Gerencie seus eventos de robótica ao vivo aqui.
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Criar Evento
        </button>
      </section>

      {/* 🔍 Filtros */}
      <section className="flex flex-col gap-3 mt-4 mb-4 w-full sm:flex-row sm:gap-4 sm:items-center">
        <input
          type="text"
          className="input input-bordered w-full sm:w-64 flex-1 py-2"
          placeholder="Buscar evento por nome..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto sm:gap-4">
          <select
            className="select select-bordered w-full sm:w-52"
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
          >
            <option value="all">Todas as temporadas</option>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-full sm:w-52"
            value={order}
            onChange={(e) => setOrder(e.target.value as "desc" | "asc")}
          >
            <option value="desc">Mais recentes primeiro</option>
            <option value="asc">Mais antigos primeiro</option>
          </select>
        </div>
      </section>

      <section className="flex flex-wrap justify-start gap-6 mt-6">
        {loadingEvents ? (
          <Loader />
        ) : (
          <>
            {filteredEvents.length === 0 && (
              <div className="w-full sm:w-72 h-40 flex flex-col justify-center items-center bg-base-100 border border-base-300 rounded-lg shadow-md p-4">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-400 text-lg font-semibold">
                  Nenhum evento encontrado
                </span>
                {events.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    Tente ajustar o nome ou a temporada do filtro.
                  </p>
                )}
              </div>
            )}

            {/* Card de criar novo evento */}
            {events.length === 0 && (
              <div
                className="card w-full sm:w-72 h-40 flex flex-col justify-center items-center bg-base-100 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => setShowModal(true)}
              >
                <span className="text-xl font-semibold text-gray-400">
                  + Criar Novo Evento
                </span>
              </div>
            )}

            {/* Lista de eventos filtrados */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredEvents.map((event) => (
                <div
                  key={event.id_evento}
                  className="card bg-base-100/80 backdrop-blur-md border border-base-200 rounded-xl flex flex-col md:flex-row overflow-hidden shadow-md transition-transform duration-300 hover:scale-103 hover:shadow-lg"
                >
                  {/* Logo da Temporada */}
                  <figure className="w-full md:w-1/3 h-32 md:h-auto flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 rounded-lg overflow-hidden">
                    <img
                      src={sessionBackground(event.config?.temporada)}
                      alt="Evento"
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                    />
                  </figure>

                  {/* Conteúdo */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    {/* Título e status */}
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-base-content truncate">
                        {event.name_event}
                      </h2>
                      <span className="badge badge-success badge-sm flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Ativo
                      </span>
                    </div>

                    {/* Informações */}
                    <div className="text-xs text-base-content flex flex-col gap-1">
                      <p>
                        <span className="font-semibold">Categoria:</span>{" "}
                        {event.config?.base === "FLL"
                          ? "FIRST LEGO League"
                          : "Robótica"}
                      </p>
                      {event.config?.base === "FLL" && (
                        <p>
                          <span className="font-semibold">Temporada:</span>{" "}
                          {event.config?.temporada}
                        </p>
                      )}
                    </div>

                    {/* Botão */}
                    <div className="mt-auto flex justify-end">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/showlive/${event.code_event}`)
                        }
                        className="btn btn-primary btn-sm flex items-center gap-2 transition-transform duration-300 hover:scale-105 hover:bg-primary-focus"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                        Hub
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </section>

      {showModal && (
        <EventModal session={session} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
