const roadmapItems = [
  {
    title: "Espaço de Equipes",
    description:
      "Perfis completos, gestão de membros, documentos, histórico de temporadas e acompanhamento de atividades.",
  },
  {
    title: "InnoLab & LabTest 2.0",
    description:
      "Criação e gerenciamento de projetos, tarefas, testes, relatórios, indicadores de evolução e laboratório de desenvolvimento.",
  },
  {
    title: "Novas Competições",
    description:
      "Expansão para FTC, FRC, OBR, WRO, torneios internos e outras iniciativas de tecnologia e inovação.",
  },
  {
    title: "ShowLive Next",
    description:
      "Transmissão de eventos em tempo real, páginas personalizadas para torneios, estatísticas, resultados e centro de mídia.",
  },
];

export default function FLLRoadmap() {
  return (
    <section className="w-full cursor-default mt-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl min-h-[420px] shadow-xl">
          <img
            src="/images/fll/fll_banner.jpg"
            alt="Banner FLL"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/65" />

          <div className="relative z-10 flex min-h-[420px] items-center justify-center text-center px-6">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-black text-white">
                A FLL está mudando.
                <span className="block text-primary">
                  O RoboStage também!
                </span>
              </h2>

              <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed">
                Estamos construindo a próxima geração do RoboStage. Além de
                acompanhar a evolução da FIRST® LEGO® League, estamos expandindo
                a plataforma para novas competições e iniciativas, fortalecendo
                os palcos da robótica educacional.
              </p>
            </div>
          </div>
          <p className="text-xs z-10 absolute bottom-[10px] right-[10px] text-white">Foto: FIRST® Championship / FIRST® Inspires</p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mt-16">
          <ul className="timeline timeline-snap-icon timeline-vertical">
            {roadmapItems.map((item, index) => (
              <li key={item.title}>
                {index > 0 && <hr className="bg-base-content/30" />}

                <div className="timeline-middle">
                  <div className="badge badge-primary badge-sm" />
                </div>

                <div
                  className={`${
                    index % 2 === 0
                      ? "timeline-start md:text-end"
                      : "timeline-end"
                  } mb-10`}
                >
                  <div className="card bg-base-200 hover:shadow-md transition-shadow">
                    <div className="card-body p-5">
                      <h3 className="font-bold text-xl">{item.title}</h3>

                      <p className="text-md text-base-content/70 leading-6">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {index < roadmapItems.length - 1 && (
                  <hr className="bg-base-content/30" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full h-[20px] bg-gradient-to-t from-neutral to-base-200/0"></div>
    </section>
  );
}