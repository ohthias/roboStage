"use client";
import { Navbar } from "@/components/ui/Navbar";
import TabelaEquipes from "@/components/TabelaEquipes";
import { Footer } from "@/components/ui/Footer";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { ArrowsPointingInIcon } from "@heroicons/react/24/solid";

interface Preset {
  colors: string[];
  url_background: string;
}

export default function VisitPage() {
  const params = useParams();
  const code_event = params?.code_event as string;
  const router = useRouter();

  const [eventName, setEventName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<string>("");
  const [id_evento, setId_event] = useState<string>("");
  const [preset, setPreset] = useState<Preset | null>(null);

  const mainRef = useRef<HTMLElement | null>(null);

  const defaultPresets: Record<string, Preset> = {
    UNEARTHED: {
      colors: ["#ff9900", "#ffcc00", "#ffffff"],
      url_background: "/images/background_uneartherd.png",
    },
    SUBMERGED: {
      colors: ["#006699", "#33ccff", "#ffffff"],
      url_background: "/images/background_submerged.png",
    },
    MASTERPIECE: {
      colors: ["#3312ab", "#56b0d7", "#ffffff"],
      url_background: "/images/showLive/banners/banner_masterpiece.webp",
    },
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!code_event) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("name_event, id_evento")
          .eq("code_event", code_event)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setEventName(data.name_event);
          setId_event(data.id_evento);

          const { data: dataEvent, error: errorEvent } = await supabase
            .from("typeEvent")
            .select("config")
            .eq("id_event", data.id_evento)
            .maybeSingle();

          if (errorEvent) throw errorEvent;

          const config = dataEvent?.config ?? {};
          setSeason(config.temporada ?? "");

          if (config.preset) {
            setPreset(config.preset);
          } else if (config.temporada && defaultPresets[config.temporada]) {
            setPreset(defaultPresets[config.temporada]);
          } else {
            setPreset({
              colors: ["#000", "#fff", "#ccc"],
              url_background: "/images/background_default.png",
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [code_event]);

  const handleInteraction = () => {
    sessionStorage.removeItem("event_access");
    document.cookie =
      "event_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/universe");
  };

  const handleFullscreen = () => {
    if (!mainRef.current) return;
    if (!document.fullscreenElement) {
      mainRef.current.requestFullscreen().catch((err) => {
        console.error("Erro ao ativar fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const backgroundUrl = preset?.url_background ?? "/images/fundoPadrao.gif";
  const primaryColor = preset?.colors?.[0] ?? "#fff";
  const secondaryColor = preset?.colors?.[1] ?? "#ccc";
  const textColor = preset?.colors?.[2] ?? "#000";

  return (
    <div className="min-h-full flex flex-col justify-between">
      <main
        ref={mainRef}
        className="flex-1 flex flex-col items-center justify-center w-full p-4 min-h-screen relative"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0 bg-black opacity-60 pointer-events-none"
          style={{ zIndex: 0 }}
        />
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button
            className="btn btn-error btn-sm rounded"
            onClick={handleInteraction}
          >
            Sair
          </button>
          <button
            className="btn btn-neutral btn-sm rounded p-1"
            onClick={handleFullscreen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          </button>
        </div>
        <div className="relative z-10 w-full flex flex-col items-center">
          {loading ? (
            <p
              className="text-lg font-medium"
              style={{ color: secondaryColor }}
            >
              Carregando evento...
            </p>
          ) : (
            <>
              <h1
                className="text-5xl font-black mb-4 z-10"
                style={{
                  color: primaryColor,
                  WebkitTextStroke: `1px ${secondaryColor}`,
                }}
              >
                {eventName}
              </h1>
              <div className="max-w-5xl w-full">
                <TabelaEquipes
                  idEvent={id_evento}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  textColor={textColor}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
