"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EventModal } from "@/components/EventModal";
import Loader from "@/components/loader";
import { useUser } from "../../context/UserContext";
import { useEvents } from "@/hooks/useEventsLoad";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
    router.push("/join");
    return null;
  }

  const sessionBackground = (temporada: string) => {
    switch (temporada) {
      case "UNEARTHED":
        return "/images/showLive/banners/banner_uneartherd.webp";
      case "SUBMERGED":
        return "/images/showLive/banners/banner_submerged.webp";
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
        seasonFilter === "all"
          ? true
          : event.config?.temporada === seasonFilter
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
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            Show<span className="text-primary">Live</span>
          </h2>
          <p className="text-sm text-base-content">
            Gerencie seus eventos de robótica ao vivo aqui.
          </p>
        </div>
        <button
          className="btn btn-accent"
          onClick={() => setShowModal(true)}
        >
          Criar Evento
        </button>
      </section>

      {/* 🔍 Filtros */}
      <section className="flex flex-col sm:flex-row gap-4 mt-4 mb-4 items-start sm:items-center">
        <input
          type="text"
          className="input input-bordered w-full sm:w-64 flex-1"
          placeholder="Buscar evento por nome..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

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
            {filteredEvents.map((event) => (
              <div
                key={event.id_evento}
                className="card w-full sm:w-[525px] h-42 bg-base-200 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-row overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Logo da Temporada */}
                <figure className="w-1/3 h-full overflow-hidden flex items-center justify-center bg-base-300 rounded-lg">
                  <img
                    src={sessionBackground(event.config?.temporada)}
                    alt="Evento"
                    className="object-cover h-full w-full transition-transform duration-500 hover:scale-105"
                  />
                </figure>

                {/* Conteúdo */}
                <div className="card-body flex flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title text-lg font-semibold">
                      {event.name_event}
                    </h2>
                    <div className="badge badge-success badge-sm">Ativo</div>
                  </div>

                  <div className="text-sm text-base-content mt-1 flex flex-col gap-1">
                    <p>
                      Categoria:{" "}
                      {event.config?.base === "FLL"
                        ? "FIRST LEGO League"
                        : "Robótica"}
                    </p>
                    {event.config?.base === "FLL" && (
                      <p>Temporada: {event.config?.temporada}</p>
                    )}
                  </div>

                  <div className="card-actions justify-end mt-2">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/showlive/${event.code_event}`)
                      }
                      className="btn btn-primary btn-sm flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                    >
                      Acessar Hub
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {showModal && (
        <EventModal session={session} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
