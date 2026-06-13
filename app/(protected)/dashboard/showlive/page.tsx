"use client";

import Image from "next/image";
import { useMemo, useState, useDeferredValue, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRightIcon, PlusIcon, Radio, Search } from "lucide-react";

import { EventModal } from "@/components/showLive/EventModal";
import { EventCardSkeleton } from "@/components/UI/Cards/EventCardSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEventsLoad";
import { eventService } from "@/server/services/event.service";

const seasonBackgrounds: Record<string, string> = {
  UNEARTHED: "/images/showLive/banners/banner_uneartherd.webp",
  SUBMERGED: "/images/showLive/banners/banner_submerged.webp",
  MASTERPIECE: "/images/showLive/banners/banner_masterpiece.webp",
};

export default function ShowLiveHub() {
  const router = useRouter();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
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

  const recentEvent = useMemo(() => {
    if (events.length === 0) return null;

    return [...events].sort((a, b) => {
      const dateA = new Date(a.last_access ?? a.created_at).getTime();
      const dateB = new Date(b.last_access ?? b.created_at).getTime();

      return dateB - dateA;
    })[0];
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
    <div className="relative space-y-6">
      {/* HERO */}
      <section className="hero overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm">
        <div className="hero-content w-full flex-col justify-between py-10 lg:flex-row">
          <div>
            <h1 className="text-4xl font-black md:text-5xl">ShowLive</h1>
            <p className="mt-4 max-w-2xl text-base-content/70">
              Crie, organize e acompanhe eventos em tempo real. Gerencie
              temporadas, transmissões e resultados em uma única plataforma.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-md mt-6 lg:mt-0"
          >
            <PlusIcon size={18} className="mr-2" />
            Criar Evento
          </button>
        </div>
      </section>

      {/* CONTINUE DE ONDE PAROU */}
      {!loadingEvents && recentEvent && (
        <section className="card border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm">
          <div className="card-body">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="badge badge-primary mb-3">
                  Continue de onde parou
                </div>

                <h2 className="text-2xl font-black md:text-3xl">
                  {recentEvent.name_event}
                </h2>

                <p className="mt-2 text-base-content/60">
                  Retorne rapidamente ao último evento acessado.
                </p>
              </div>

              <button
                onClick={() =>
                  handleOpenEvent(recentEvent.id_evento, recentEvent.code_event)
                }
                className="btn btn-primary btn-outline btn-sm gap-2"
              >
                Abrir Evento
                <ArrowUpRightIcon size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {!loadingEvents && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="stat rounded-box border border-base-300 bg-base-100">
            <div className="stat-title">Eventos</div>
            <div className="stat-value text-primary">{events.length}</div>
          </div>

          <div className="stat rounded-box border border-base-300 bg-base-100">
            <div className="stat-title">Ativos</div>
            <div className="stat-value text-success">
              {events.filter((e) => e.event_active).length}
            </div>
          </div>

          <div className="stat rounded-box border border-base-300 bg-base-100">
            <div className="stat-title">Temporadas</div>
            <div className="stat-value">{seasons.length}</div>
          </div>
        </section>
      )}

      {/* FILTROS */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="input input-bordered flex flex-1 items-center gap-2 rounded-xl w-full py-2 ">
          <Search size={18} className="text-base-content/50" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>

        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="select select-bordered rounded-xl lg:max-w-[220px] px-3 w-full"
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
          className="select select-bordered rounded-xl lg:max-w-[220px] px-3 w-full"
        >
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>
      </div>

      {/* CONTADOR */}
      {!loadingEvents && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/60">
            {filteredEvents.length} evento
            {filteredEvents.length !== 1 && "s"} encontrado
            {filteredEvents.length !== 1 && "s"}
          </p>
        </div>
      )}

      {/* GRID */}
      {loadingEvents ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </section>
      ) : filteredEvents.length === 0 ? (
        <section className="hero min-h-[400px] rounded-box border border-dashed border-base-300 bg-base-100">
          <div className="hero-content text-center">
            <div>
              <Radio className="mx-auto mb-2 h-16 w-16 text-base-content/20" />

              <h2 className="mt-4 text-2xl font-bold">
                Nenhum evento encontrado
              </h2>

              <p className="mx-auto mt-2 max-w-md text-base-content/60">
                Parece que ainda não existem eventos com os filtros
                selecionados. Crie seu primeiro evento para começar.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary btn-lg mt-6"
              >
                Criar Primeiro Evento
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenEvent(event.id_evento, event.code_event);
                  }
                }}
                className="
                    card
                    group
                    cursor-pointer
                    border
                    border-base-300
                    bg-base-100
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-primary/30
                    hover:shadow-xl
                  "
              >
                <figure className="relative h-32 overflow-hidden">
                  <Image
                    src={background}
                    alt={event.name_event}
                    fill
                    unoptimized
                    quality={100}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </figure>

                <div className="card-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div
                        className={`badge ${
                          event.event_active ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {event.event_active ? "Ativo" : "Inativo"}
                      </div>

                      <h2 className="card-title line-clamp-2 text-lg">
                        {event.name_event}
                      </h2>
                    </div>

                    <ArrowUpRightIcon
                      size={18}
                      className="
                          shrink-0
                          opacity-50
                          transition-all
                          duration-300
                          group-hover:translate-x-1
                          group-hover:-translate-y-1
                          group-hover:opacity-100
                        "
                    />
                  </div>

                  <div className="mt-2 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/50">Base</span>
                      <span className="font-medium">
                        {event.config?.base === "FLL"
                          ? "FIRST LEGO League"
                          : "Competição"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/50">Temporada</span>
                      <span className="font-medium">
                        {event.config?.temporada ?? "Não definida"}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions mt-4 items-center justify-between">
                    <span className="text-xs text-base-content/50">
                      {new Date(event.created_at).toLocaleDateString("pt-BR")}
                    </span>

                    <button className="btn btn-primary btn-sm btn-outline">
                      Abrir
                    </button>
                  </div>
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
