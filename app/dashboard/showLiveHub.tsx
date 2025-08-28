"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventModal } from "@/components/EventModal";
import Loader from "@/components/loader";
import { useUser } from "../context/UserContext";
import { useEvents } from "@/hooks/useEventsLoad";

export default function ShowLiveHub() {
  const router = useRouter();
  const { session, loading } = useUser();
  const { events, loading: loadingEvents } = useEvents(session?.user?.id);

  const [showModal, setShowModal] = useState(false);

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
        return "/images/showLive/banners/banner_default.webp";
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            show<span className="text-primary">Live</span>
          </h2>
          <p className="text-sm text-base-content">
            Gerencie seus eventos de robótica ao vivo aqui.
          </p>
        </div>
        <button
          className="btn btn-soft btn-accent"
          onClick={() => setShowModal(true)}
        >
          Criar Evento
        </button>
      </section>
      <section className="flex flex-wrap justify-start gap-6 mt-6">
        {events.length === 0 && (
          <div
            className="card w-full sm:w-72 h-80 flex flex-col justify-center items-center bg-base-100 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={() => setShowModal(true)}
          >
            <span className="text-xl font-semibold text-gray-400">
              + Criar Novo Evento
            </span>
          </div>
        )}

        {loadingEvents ? (
          <Loader />
        ) : (
          events.map((event) => (
            <div
              key={event.id_evento}
              className="card w-full sm:w-72 h-80 bg-base-200 shadow-lg rounded-lg grayscale-80 hover:grayscale-0 transform transition-all duration-300"
            >
              <figure className="overflow-hidden rounded-t-lg h-40">
                <img
                  src={sessionBackground(event.config?.temporada)}
                  alt="Evento"
                  className="object-cover h-full w-full transition-transform duration-300 hover:scale-110"
                />
              </figure>

              <div className="card-body flex flex-col justify-between">
                <h2 className="card-title justify-between items-center">
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
                    className="btn btn-primary btn-sm"
                  >
                    Acessar Hub
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {showModal && (
        <EventModal session={session} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
