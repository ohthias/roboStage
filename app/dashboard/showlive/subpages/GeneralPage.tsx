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
    <div className="space-y-4">
      {/* Card - Nome evento e imagem */}
      <div className="bg-white shadow-md w-full rounded-lg overflow-hidden mt-4 flex flex-row items-center justify-between p-6">
        <div>
          <h3 className="text-lg font-semibold">
            Nome do evento: {name_event}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Categoria:{" "}
            <span className="font-medium">
              {event_config?.base || "Não especificado"}
            </span>
          </p>
          {event_config?.temporada && (
            <p className="mt-1 text-sm text-slate-500">
              Temporada:{" "}
              <span className="font-medium">{event_config.temporada}</span>
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <img
            src={urlImage()}
            alt="Temporada"
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>

      {/* Rodadas */}
      {event_config?.rodadas && event_config.rodadas.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h4 className="text-md font-semibold mb-2">Rodadas</h4>
          <ul className="list-disc list-inside space-y-1">
            {event_config.rodadas.map((rodada, index) => (
              <li key={index} className="text-sm text-slate-600">
                {rodada}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
