"use client";

import CardDefault from "@/components/ui/Cards/CardDefault";
import CardOverlay from "@/components/ui/Cards/CardOverlay";

interface GeneralPageProps {
  name_event: string;
  event_data?: {} | null;
  event_config: {
    base: string;
    rodadas: string[];
    temporada?: string;
  } | null;
}

export default function GeneralPage({
  name_event,
  event_data,
  event_config,
}: GeneralPageProps) {
  const urlBackground = () => {
    switch (event_config?.temporada) {
      case "MASTERPIECE":
        return "/images/showLive/banners/banner_masterpiece.webp";
      case "SUBMERGED":
        return "/images/showLive/banners/banner_submerged.webp";
      case "UNEARTHED":
        return "/images/showLive/banners/banner_uneartherd.webp";
      default:
        return "/images/showLive/banners/banner_default.webp";
    }
  }

  return (
    <div className="px-4 md:px-6">
      <h1 className="text-primary font-bold text-3xl mb-4">Geral</h1>
      <div className="flex flex-col lg:flex-row gap-4 w-full justify-start">
        <CardOverlay
          bgUrl={urlBackground()}
          title={name_event}
          badge={event_config?.temporada}
          size="lg"
          description={""}
        />
        {event_config?.rodadas && event_config.rodadas.length > 0 && (
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <h3 className="card-title text-lg font-semibold">Rodadas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {event_config.rodadas.map((rodada, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-base-200 border border-base-300 hover:bg-base-300 transition-colors w-full"
                  >
                    <span className="text-sm font-medium">{rodada}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
