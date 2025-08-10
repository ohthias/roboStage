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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Card - Evento */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-row justify-between hover:shadow-md transition">
        {/* Título e Info */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
            🎉 {name_event}
          </h3>

          <p className="text-sm text-slate-600">
            <span className="font-semibold">Categoria:</span>{" "}
            {event_config?.base || "Não especificado"}
          </p>

          {event_config?.temporada && (
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Temporada:</span>{" "}
              {event_config.temporada}
            </p>
          )}
        </div>

        {/* Imagem */}
        <div className="flex items-center justify-center rounded-xl">
          <img
            src={urlImage()}
            alt={`Imagem do evento ${name_event}`}
            className="w-42 h-42 object-contain"
          />
        </div>
      </section>

      {/* Card - Rodadas */}
      {(event_config?.rodadas ?? []).length > 0 && (
        <section className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col hover:shadow-md transition">
          <h4 className="text-lg font-bold text-slate-800 mb-4">🧩 Rodadas</h4>
          <div className="flex flex-wrap gap-2">
            {(event_config?.rodadas ?? []).map((rodada, index) => (
              <span
                key={index}
                className="inline-block bg-slate-200 text-slate-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {rodada}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
