"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EventModal } from "@/components/showLive/EventModal";
import { useUser } from "@/app/context/UserContext";
import { useEvents } from "@/hooks/useEventsLoad";
import { MagnifyingGlassIcon, SignalIcon } from "@heroicons/react/24/outline";
import { EventCardSkeleton } from "@/components/UI/Cards/EventCardSkeleton";
import { supabase } from "@/utils/supabase/client";

export default function ShowLiveHub() {
  const router = useRouter();
  const { session } = useUser();
  const { events, loading: loadingEvents } = useEvents(session?.user?.id);

  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [seasonFilter, setSeasonFilter] = useState<"all" | string>("all");

  if (!session) {
    router.push("/auth/login");
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
        return "/images/showLive/banners/banner_default.webp";
    }
  };

  const updateEventLastAccess = async (id_evento: number) => {
    await supabase
      .from("events")
      .update({ last_acess: new Date().toISOString() })
      .eq("id_evento", id_evento);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-base-300/10 p-6 flex flex-col sm:flex-row  items-start sm:items-center justify-between gap-4">
        {/* Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <SignalIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">LabTest</h1>
            <p className="text-sm text-base-content/70 max-w-lg">
              Gerencie seus testes de missões e visualize os resultados de forma
              eficiente.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <SignalIcon className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </div>

      {/* 🔍 Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 bg-base-100/60 border border-base-300 rounded-xl p-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Buscar evento..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="input input-sm input-bordered w-full flex-1"
        />

        {/* Season */}
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="select select-sm select-bordered w-full px-2 rounded-box flex-1"
        >
          <option value="all">Todas as temporadas</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              Temporada {season}
            </option>
          ))}
        </select>

        {/* Order */}
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          className="select select-sm select-bordered w-full px-2 rounded-box flex-1"
        >
          <option value="desc">Mais recentes primeiro</option>
          <option value="asc">Mais antigos primeiro</option>
        </select>
      </div>

      <section className="flex flex-wrap justify-start gap-6">
        {loadingEvents ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </section>
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
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {filteredEvents.map((event) => (
                <div
                  key={event.id_evento}
                  className="
        group relative overflow-hidden rounded-2xl
        bg-base-100 border border-base-200
        shadow-sm hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
      "
                >
                  {/* Header visual */}
                  <div className="relative h-36 w-full overflow-hidden">
                    <img
                      src={sessionBackground(event.config?.temporada)}
                      alt="Evento"
                      className="
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-110
          "
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-base-100/90 via-base-100/30 to-transparent" />

                    {/* Status */}
                    <span className="absolute top-3 right-3 badge badge-success badge-sm gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Ativo
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5 flex flex-col gap-4">
                    {/* Título */}
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-base-content leading-tight line-clamp-2">
                        {event.name_event}
                      </h2>

                      <p className="text-xs text-base-content/60">
                        {event.config?.base === "FLL"
                          ? "FIRST LEGO League"
                          : "Evento de Robótica"}
                      </p>
                    </div>

                    {/* Metadados */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {event.config?.base === "FLL" && (
                        <span className="badge badge-outline">
                          Temporada {event.config?.temporada}
                        </span>
                      )}
                    </div>

                    {/* Ação */}
                    <button
                      onClick={() =>
                        updateEventLastAccess(event.id_evento).then(() =>
                          router.push(`/showlive/${event.code_event}`)
                        )
                      }
                      className="
            mt-2 btn btn-primary btn-sm w-full
            gap-2
            transition-all duration-300
            group-hover:gap-3
          "
                    >
                      Acessar Hub
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
                    </button>
                  </div>

                  {/* Borda animada no hover */}
                  <div
                    className="
        absolute inset-0 rounded-2xl
        ring-1 ring-transparent
        group-hover:ring-primary/40
        transition-all duration-300
        pointer-events-none
      "
                  />
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
