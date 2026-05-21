"use client";

interface EventConfig {
  base: string;
  rodadas: string[];
  temporada?: string;
  preset?: {
    colors: [string, string, string];
    url_background: string;
  };
}

interface GeneralPageProps {
  name_event: string;
  event_data?: Record<string, unknown> | null;
  event_config: EventConfig | null;
}

const SEASON_ASSETS: Record<string, { banner: string; logo: string }> = {
  MASTERPIECE: {
    banner: "/images/showLive/banners/banner_masterpiece.webp",
    logo: "/images/logos/Masterpiece.png",
  },
  SUBMERGED: {
    banner: "/images/showLive/banners/banner_submerged.webp",
    logo: "/images/logos/Submerged.webp",
  },
  UNEARTHED: {
    banner: "/images/showLive/banners/banner_uneartherd.webp",
    logo: "/images/logos/Unearthed.webp",
  },
};

const DEFAULT_ASSETS = {
  banner: "/images/showLive/banners/banner_default.webp",
  logo: "/images/logos/Icone.png",
};

function getSeasonAssets(temporada?: string) {
  return temporada ? (SEASON_ASSETS[temporada] ?? DEFAULT_ASSETS) : DEFAULT_ASSETS;
}

export default function GeneralPage({ name_event, event_config }: GeneralPageProps) {
  const { banner, logo } = getSeasonAssets(event_config?.temporada);
  const hasRodadas = (event_config?.rodadas?.length ?? 0) > 0;
  const hasPreset = Boolean(event_config?.preset);

  return (
    <div className="px-4 md:px-6">
      <h1 className="text-primary font-bold text-3xl mb-5">Geral</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Event banner */}
        <div className="relative rounded-xl overflow-hidden h-48 shadow-sm border border-base-300">
          <img src={banner} alt={name_event} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-semibold text-sm mb-1.5">{name_event}</p>
            {event_config?.temporada && (
              <span className="inline-block text-xs font-mono bg-white/15 border border-white/25 text-white px-2 py-0.5 rounded backdrop-blur-sm tracking-wider">
                {event_config.temporada}
              </span>
            )}
          </div>
        </div>

        {/* Season */}
        {event_config?.temporada && (
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body items-center justify-center py-4">
              <p className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
                Temporada
              </p>
              <img
                src={logo}
                alt={event_config.temporada}
                className="w-28 h-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Rounds */}
        {hasRodadas && (
          <div className="card bg-base-100 border border-base-300 shadow-sm h-48">
            <div className="card-body py-4 overflow-y-auto">
              <p className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
                Rodadas
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {event_config!.rodadas.map((rodada) => (
                  <div
                    key={rodada}
                    className="bg-base-200 border border-base-300 rounded-lg px-3 py-2 text-xs font-medium text-center hover:bg-base-300 transition-colors"
                  >
                    {rodada}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preset */}
        {hasPreset && (
          <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
            {event_config!.preset!.url_background && (
              <figure className="h-28 overflow-hidden">
                <img
                  src={event_config!.preset!.url_background}
                  alt="Imagem de fundo do preset"
                  className="w-full h-full object-cover"
                />
              </figure>
            )}
            <div className="card-body py-3 px-4">
              <p className="text-xs uppercase tracking-widest text-base-content/50 mb-2">
                Paleta de cores
              </p>
              <div className="flex gap-2 items-center">
                {event_config!.preset!.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-md border border-base-300 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <span className="text-xs text-base-content/40 font-mono ml-1">
                  {event_config!.preset!.colors.join(" · ")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}