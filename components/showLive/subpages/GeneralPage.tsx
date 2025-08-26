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
    <>
      <h1 className="text-primary font-bold text-3xl mb-4 px-4 md:px-8">Geral</h1>
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <CardOverlay
          bgUrl={urlBackground()}
          title={name_event}
          badge={event_config?.temporada}
          size="lg"
          description={""}
        />
        <CardDefault
          title="Rodadas"
          description={
            event_config?.rodadas.length
              ? event_config.rodadas.join(", ")
              : ""
          }
          buttons={[]}
        />
      </div>
    </>
  );
}
