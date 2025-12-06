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
    <div className="px-4 md:px-6">
      <h1 className="text-primary font-bold text-3xl mb-4">Geral</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div
          className={`relative card shadow-lg flex flex-col justify-between overflow-hidden 
        w-full h-52 transition-all duration-300`}
        >
          <div className="absolute inset-0">
            <img
              src={urlBackground()}
              alt={name_event}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          <div className="card-body relative flex flex-col justify-between h-full p-3 sm:p-4">
            <h2 className="card-title flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-white text-base sm:text-lg">
                {name_event}
              </span>
              <div className="badge badge-secondary">
                {event_config?.temporada}
              </div>
            </h2>
          </div>
        </div>
        {event_config?.temporada && (
          <div className="card bg-base-100 shadow-md border border-base-300 overflow-y-auto">
            <div className="card-body">
              <h3 className="card-title text-lg font-semibold text-secondary">
                Temporada
              </h3>
              <img
                src={seasonLogo()}
                alt={event_config.temporada}
                className="w-32 h-auto mx-auto"
              />
            </div>
          </div>
        )}
        {event_config?.rodadas && event_config.rodadas.length > 0 && (
          <div className="card bg-base-100 shadow-md border border-base-300 h-52 overflow-y-auto">
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

        {event_config?.preset && (
          <div className="card bg-base-100/80 shadow-sm rounded-xl border border-base-200 overflow-hidden">
            {/* Imagem de fundo como header moderno */}
            {event_config.preset.url_background && (
              <figure className="max-h-44 overflow-hidden">
                <img
                  src={event_config.preset.url_background}
                  alt="Imagem de Fundo"
                  className="w-full h-44 object-cover"
                />
              </figure>
            )}

            <div className="card-body">
              <h3 className="card-title text-md font-semibold">
                Paleta de Cores
              </h3>
              <div className="flex gap-2">
                {event_config.preset.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-lg border border-base-300 shadow-sm"
                    style={{ backgroundColor: color }}
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
