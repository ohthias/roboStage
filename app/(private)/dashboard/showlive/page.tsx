"use client";

import Image from "next/image";
import { useMemo, useState, useDeferredValue, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EventModal } from "@/components/showLive/EventModal";
import { EventCardSkeleton } from "@/components/UI/Cards/EventCardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEventsLoad";
import { eventService } from "@/services/event.service";
import { ArrowUpRightIcon, ListFilter, Radio, Search } from "lucide-react";

const seasonBackgrounds: Record<string, string> = {
  UNEARTHED: "/images/showLive/banners/banner_uneartherd.webp",
  SUBMERGED: "/images/showLive/banners/banner_submerged.webp",
  MASTERPIECE: "/images/showLive/banners/banner_masterpiece.webp",
};

export default function ShowLiveHub() {
  const router = useRouter();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const deferredSearch = useDeferredValue(searchText);

  const { events, loading: loadingEvents } = useEvents(user?.id);

  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredEvents = useMemo(() => {
    const filtered = events
      .filter((event) =>
        event.name_event?.toLowerCase().includes(normalizedSearch),
      )
      .filter((event) =>
        seasonFilter === "all"
          ? true
          : event.config?.temporada === seasonFilter,
      );

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [events, normalizedSearch, seasonFilter, order]);

  const seasons = useMemo(() => {
    return Array.from(
      new Set(events.map((event) => event.config?.temporada).filter(Boolean)),
    );
  }, [events]);

  const handleOpenEvent = useCallback(
    async (eventId: number, code: string) => {
      try {
        await eventService.updateLastAccess(eventId);
        router.push(`/showlive/${code}`);
      } catch (error) {
        console.error(error);
      }
    },
    [router],
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Radio className="text-primary" width={24} height={24} />
          <h1 className="text-2xl font-bold text-primary">ShowLive</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm btn-square ml-2 md:ml-4 lg:ml-6 ${
              showFilters ? "btn-info" : "btn-default"
            }`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
          >
            <ListFilter width={16} height={16} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm btn-outline ml-auto btn-primary hidden md:inline-flex"
          >
            Criar Evento
          </button>
        </div>
      </header>

      {/* FILTROS */}
      <section
        className={`flex flex-col md:flex-row items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-3 w-full overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-64 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none p-0 border-0 hidden"
        }`}
      >
        <label className="input input-bordered rounded-xl px-3 w-full flex items-center gap-2">
          <Search className="text-base-content/50" />

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
          className="select select-bordered rounded-xl px-3 w-full md:max-w-[200px]"
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
          className="select select-bordered rounded-xl px-3 w-full md:max-w-[200px]"
        >
          <option value="desc">Mais recentes</option>

          <option value="asc">Mais antigos</option>
        </select>
      </section>

      {/* CONTADOR */}
      {!loadingEvents && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-base-content/60">
            {filteredEvents.length} evento
            {filteredEvents.length !== 1 && "s"} encontrado
            {filteredEvents.length !== 1 && "s"}
          </p>
        </div>
      )}

      {/* SKELETON */}
      {loadingEvents ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </section>
      ) : filteredEvents.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-100 py-20 px-6 text-center">
          <Radio className="w-14 h-14 text-base-content/30 mb-4" />
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => {
            const background =
              seasonBackgrounds[event.config?.temporada] ??
              "/images/showLive/banners/banner_default.webp";

            return (
              <article
                key={event.id_evento}
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleOpenEvent(event.id_evento, event.code_event)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleOpenEvent(event.id_evento, event.code_event);
                  }
                }}
                className="group relative h-[350px] rounded-box overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <Image
                  src={background}
                  alt={event.name_event}
                  fill
                  unoptimized
                  quality={100}
                  sizes="(max-width:640px) 100vw,
                         (max-width:1024px) 50vw,
                         25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div
                  className={
                    "absolute inset-0 bg-gradient-to-t " +
                    (event.event_active
                      ? "from-success/40 via-success/20 to-success/0"
                      : "from-warning/40 via-warning/20 to-warning/0")
                  }
                />

                <div className="absolute top-5 left-5 z-10">
                  <div
                    className={
                      "badge px-2 py-1 rounded-full text-xs font-semibold " +
                      (event.event_active ? "badge-success" : "badge-warning")
                    }
                  >
                    {event.event_active ? "Ativo" : "Inativo"}
                  </div>
                </div>

                <div className="absolute top-5 right-5 z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-base-100/10 backdrop-blur-md text-base-content/50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                    <ArrowUpRightIcon width={16} height={16} />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h2 className="font-black text-base-content leading-none line-clamp-2 text-2xl md:text-3xl xl:text-4xl">
                    {event.name_event}
                  </h2>

                  {event.config?.base && (
                    <p className="text-neutral/80 mt-2 text-sm">
                      {event.config.base === "FLL"
                        ? "FIRST LEGO League"
                        : "Competição"}
                    </p>
                  )}
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
