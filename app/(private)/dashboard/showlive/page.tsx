"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, SignalIcon } from "@heroicons/react/24/outline";
import { EventModal } from "@/components/showLive/EventModal";
import { EventCardSkeleton } from "@/components/UI/Cards/EventCardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEventsLoad";

import { eventService } from "@/services/event.service";

const seasonBackgrounds: Record<string, string> = {
  UNEARTHED: "/images/showLive/banners/banner_uneartherd.webp",
  SUBMERGED: "/images/showLive/banners/banner_submerged.webp",
  MASTERPIECE: "/images/showLive/banners/banner_masterpiece.webp",
};

export default function ShowLiveHub() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const { events, loading: loadingEvents } = useEvents(user?.id);

  const filteredEvents = useMemo(() => {
    const filtered = events
      .filter((event) =>
        event.name_event?.toLowerCase().includes(searchText.toLowerCase()),
      )
      .filter((event) =>
        seasonFilter === "all"
          ? true
          : event.config?.temporada === seasonFilter,
      );

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [events, searchText, order, seasonFilter]);

  const seasons = useMemo(() => {
    return Array.from(
      new Set(events.map((event) => event.config?.temporada).filter(Boolean)),
    );
  }, [events]);

  const handleOpenEvent = async (eventId: number, code: string) => {
    try {
      await eventService.updateLastAccess(eventId);

      router.push(`/showlive/${code}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");

    return null;
  }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section
        className="
          relative overflow-hidden
          rounded-3xl
          border border-base-300
          bg-gradient-to-br
          from-primary/10
          via-base-100
          to-base-200/40
          p-6 md:p-8
        "
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="
                hidden sm:flex
                h-14 w-14
                rounded-2xl
                bg-primary/10
                text-primary
                items-center justify-center
              "
            >
              <SignalIcon className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div>
                <h1 className="text-2xl font-bold">ShowLive</h1>
                <p className="text-sm text-base-content/60 max-w-2xl mt-1">
                  Gerencie eventos, acompanhe rodadas e transmita resultados em
                  tempo real.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="badge badge-primary badge-outline">
                  {events.length} eventos
                </div>
                <div className="badge badge-outline">Tempo real</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="
              btn btn-primary
              rounded-2xl
              gap-2
              shadow-sm
            "
          >
            <SignalIcon className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </section>

      {/* FILTERS */}
      <section
        className="
          grid grid-cols-1 md:grid-cols-3
          gap-3
          rounded-2xl
          border border-base-300
          bg-base-100
          p-3 w-full
        "
      >
        <label className="input input-bordered flex items-center gap-2 rounded-xl w-full">
          <MagnifyingGlassIcon className="w-4 h-4 opacity-60" />
          <input
            type="text"
            placeholder="Buscar evento..."
            className="grow"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>

        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="select select-bordered rounded-xl px-3 w-full"
        >
          <option value="all">Todas temporadas</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          className="select select-bordered rounded-xl px-3 w-full"
        >
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>
      </section>

      {/* CONTENT */}
      {loadingEvents ? (
        <section
          className="
            grid grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </section>
      ) : filteredEvents.length === 0 ? (
        <section
          className="
            flex flex-col items-center justify-center
            rounded-3xl
            border border-dashed border-base-300
            bg-base-100
            py-20 px-6
            text-center
          "
        >
          <MagnifyingGlassIcon className="w-14 h-14 text-base-content/30 mb-4" />
          <h2 className="text-lg font-semibold">Nenhum evento encontrado</h2>
          <p className="text-sm text-base-content/50 mt-1 max-w-md">
            Tente alterar os filtros ou crie um novo evento para começar.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary mt-6"
          >
            Criar Evento
          </button>
        </section>
      ) : (
        <section
          className="
            grid grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >
          {filteredEvents.map((event) => {
            const background =
              seasonBackgrounds[event.config?.temporada] ??
              "/images/showLive/banners/banner_default.webp";

            return (
              <article
                key={event.id_evento}
                className="
                  group relative overflow-hidden
                  rounded-3xl
                  border border-base-200
                  bg-base-100
                  hover:shadow-xl
                  transition-all duration-300
                  hover:-translate-y-1
                "
              >
                {/* COVER */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={background}
                    alt={event.name_event}
                    className="
                      w-full h-full object-cover
                      transition-transform duration-500
                      group-hover:scale-105
                    "
                  />

                  <div
                    className="
                      absolute inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-black/10
                      to-transparent
                    "
                  />

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`badge badge-sm ${
                          event.event_active ? "badge-success" : "badge-error"
                        }`}
                      >
                        {event.event_active ? "🟢 Ativo" : "🔴 Inativo"}
                      </span>
                      {event.config?.temporada && (
                        <span className="badge badge-outline badge-sm bg-base-100/80 backdrop-blur">
                          {event.config?.temporada}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-5 space-y-5">
                  <div>
                    <h2
                      className="
                        text-lg font-bold
                        line-clamp-2
                      "
                    >
                      {event.name_event}
                    </h2>
                    <p className="text-sm text-base-content/50 mt-1">
                      {event.config?.base === "FLL"
                        ? "FIRST LEGO League"
                        : "Competição"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleOpenEvent(event.id_evento, event.code_event)
                    }
                    className="
                      btn btn-primary
                      w-full rounded-2xl
                    "
                  >
                    Acessar Evento
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <EventModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
