"use client";

interface GeneralPageProps {
  name_event: string;
  event_data?: {} | null;
  event_config: {
    base: string;
    rodadas: string[];
    temporada?: string;
    preset?: {
      colors: [string, string, string];
      url_background: string;
    };
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
  };

  const seasonLogo = () => {
    switch (event_config?.temporada) {
      case "MASTERPIECE":
        return "/images/logos/Masterpiece.png";
      case "SUBMERGED":
        return "/images/logos/Submerged.webp";
      case "UNEARTHED":
        return "/images/logos/Unearthed.webp";
      default:
        return "/images/logos/Icone.png";
    }
  };

  return (
    <div className="px-4 md:px-6 animate-fadeIn">
      <h1 className="text-primary font-bold text-3xl mb-6">Geral</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card: Banner */}
        <div className="relative card bg-base-100/50 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-2xl overflow-hidden h-52 group animate-slideUp">
          <img
            src={urlBackground()}
            alt={name_event}
            className="absolute inset-0 w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative h-full p-5 flex flex-col justify-end">
            <h2 className="text-white font-semibold text-lg flex items-center justify-between gap-2">
              <span className="drop-shadow">{name_event}</span>

              {event_config?.temporada && (
                <div className="badge badge-secondary badge-sm px-2 py-1 shadow-md animate-fadeIn">
                  {event_config.temporada}
                </div>
              )}
            </h2>
          </div>
        </div>

        {/* Card: Temporada */}
        {event_config?.temporada && (
          <div className="card bg-base-100/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl border border-base-200 animate-slideUp delay-100">
            <div className="card-body items-center text-center">
              <h3 className="card-title text-secondary text-lg font-semibold">
                Temporada
              </h3>

              <img
                src={seasonLogo()}
                alt={event_config.temporada}
                className="w-28 h-auto mt-3 opacity-90 hover:opacity-100 transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Card: Rodadas */}
        {(event_config?.rodadas?.length ?? 0) > 0 && (
          <div className="card bg-base-100/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl border border-base-200 h-52 overflow-auto animate-slideUp delay-200">
            <div className="card-body">
              <h3 className="card-title text-lg font-semibold">Rodadas</h3>

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 mt-3">
                {event_config?.rodadas?.map((rodada, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-lg bg-base-200 border border-base-300 hover:bg-base-300 hover:shadow-md transition-all duration-200 cursor-default text-center text-sm font-medium hover:scale-[1.03]"
                  >
                    {rodada}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card: Preset */}
        {event_config?.preset && (
          <div className="card bg-base-100/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl border border-base-200 overflow-hidden animate-slideUp delay-300">
            {event_config.preset.url_background && (
              <figure className="h-40 overflow-hidden">
                <img
                  src={event_config.preset.url_background}
                  alt="Imagem de Fundo"
                  className="w-full h-full object-cover opacity-90 transition-all duration-500 hover:scale-110"
                />
              </figure>
            )}

            <div className="card-body">
              <h3 className="card-title text-md font-semibold">
                Paleta de Cores
              </h3>

              <div className="flex gap-2 mt-2">
                {event_config.preset.colors.map((color, index) => (
                  <div
                    key={index}
                    style={{ backgroundColor: color }}
                    className="w-9 h-9 rounded-md shadow-sm border border-base-300 hover:scale-110 transition-all duration-300"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
