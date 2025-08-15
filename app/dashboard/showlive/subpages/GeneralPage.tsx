"use client";

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
  const urlImage = () => {
    switch (event_config?.temporada) {
      case "SUBMERGED":
        return "https://i0.wp.com/firstroboticsbc.org/wp-content/uploads/2024/04/FIRST_DIVE-submerged-PatchLogo.webp?resize=447%2C447&ssl=1";
      case "UNEARTHED":
        return "https://info.firstinspires.org/hs-fs/hubfs/2026%20Season/Season%20Assets/first_age_fll_unearthed_logo_vertical_rgb_fullcolor.png?width=334&height=334&name=first_age_fll_unearthed_logo_vertical_rgb_fullcolor.png";
      default:
        return "https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FLL-Vertical.png";
    }
  };

  return (
    <>
      <h1 className="text-primary font-bold text-3xl mb-4">Geral</h1>
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Card principal do evento */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Imagem */}
            <div className="flex-shrink-0">
              <img
                src={urlImage()}
                alt={event_config?.temporada || "Logo evento"}
                className="w-28 h-28 object-contain rounded-lg p-2"
              />
            </div>

            {/* Informações */}
            <div className="flex-1">
              <h2 className="card-title text-xl font-bold">{name_event}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge badge-primary badge-lg">
                  {event_config?.base || "Categoria não especificada"}
                </span>
                {event_config?.temporada && (
                  <span className="badge badge-secondary badge-lg">
                    {event_config.temporada}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card das rodadas */}
        {event_config?.rodadas && event_config.rodadas.length > 0 && (
          <div className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <h3 className="card-title text-lg font-semibold">Rodadas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {event_config.rodadas.map((rodada, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-base-200 border border-base-300 hover:bg-base-300 transition-colors"
                  >
                    <span className="text-sm font-medium">{rodada}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
