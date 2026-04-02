import Logo from "@/components/UI/Logo";

export default function MaintenancePage() {
  const currentPhase = 1;

  const phases = [
    {
      id: 1,
      title: "Base FLL",
      description: "Estrutura original da FLL liberada, sem autenticação.",
      badge: "primary",
    },
    {
      id: 2,
      title: "Novas modalidades",
      description: "Inclusão de duas novas competições na plataforma.",
      badge: "secondary",
    },
    {
      id: 3,
      title: "Usuários e ecossistema",
      description: "Retorno com Innolab, equipes e TrainLab.",
      badge: "accent",
    },
    {
      id: 4,
      title: "Tipos de usuários",
      description: "Permissões específicas por modalidade.",
      badge: "info",
    },
    {
      id: 5,
      title: "ShowLive",
      description: "3 modalidades + modo livre de criação.",
      badge: "success",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 via-base-100 to-primary/5 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl">

        {/* HERO */}
        <div className="text-center">
          <h1>
            <Logo logoSize="5xl" />
          </h1>

          <div className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium border border-warning/20">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
            Atualização progressiva
          </div>

          <h2 className="mt-6 text-2xl md:text-4xl font-semibold text-base-content">
            Estamos reconstruindo por fases 🚀
          </h2>

          <p className="mt-4 text-base-content/70 max-w-2xl mx-auto text-sm md:text-base">
            O RoboStage está evoluindo para suportar múltiplas competições,
            novos formatos e um ecossistema completo de robótica.
          </p>
        </div>

        {/* CURRENT PHASE HIGHLIGHT */}
        <div className="mt-10 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-sm text-base-content/60">
            Fase atual
          </p>

          <h3 className="text-xl md:text-2xl font-bold text-primary mt-2">
            Fase {currentPhase} — {phases[currentPhase - 1].title}
          </h3>

          <p className="mt-2 text-base-content/70 text-sm">
            {phases[currentPhase - 1].description}
          </p>
        </div>

        {/* ROADMAP */}
        <div className="mt-12 relative">

          {/* Linha vertical (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-base-300"></div>

          <div className="space-y-6">

            {phases.map((phase, index) => {
              const isActive = phase.id === currentPhase;
              const isPast = phase.id < currentPhase;

              return (
                <div
                  key={phase.id}
                  className={`flex flex-col lg:flex-row items-center gap-4 ${
                    index % 2 === 0 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Card */}
                  <div
                    className={`w-full lg:w-1/2 card transition-all duration-300 ${
                      isActive
                        ? "bg-base-100 border-2 border-primary shadow-lg scale-[1.02]"
                        : isPast
                        ? "bg-base-100 border border-success/30 opacity-80"
                        : "bg-base-100 border border-base-300 opacity-60"
                    }`}
                  >
                    <div className="card-body">
                      <div className="flex items-center justify-between">
                        <div
                          className={`badge badge-${phase.badge} badge-outline`}
                        >
                          Fase {phase.id}
                        </div>

                        {isActive && (
                          <span className="text-xs text-primary font-medium">
                            Em andamento
                          </span>
                        )}

                        {isPast && (
                          <span className="text-xs text-success font-medium">
                            Concluído
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 font-semibold text-base-content">
                        {phase.title}
                      </h3>

                      <p className="text-sm text-base-content/70">
                        {phase.description}
                      </p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="hidden lg:flex items-center justify-center w-10">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        isActive
                          ? "bg-primary scale-125"
                          : isPast
                          ? "bg-success"
                          : "bg-base-300"
                      }`}
                    />
                  </div>

                  <div className="hidden lg:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-14 text-center">
          <p className="text-base-content/60 text-sm">
            Funcionalidades podem ser liberadas gradualmente e sofrer ajustes durante o processo.
          </p>

          <div className="mt-3 text-sm text-base-content/50">
            Status: <span className="text-warning font-medium">reconstrução progressiva</span>
          </div>
        </div>

      </div>
    </div>
  );
}