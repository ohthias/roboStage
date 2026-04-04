import Logo from "@/components/UI/Logo";

export default function MaintenanceBanner() {
  const currentPhase = 1;

  const phases = [
    {
      id: 1,
      title: "Base FLL",
      description: "Estrutura original da FLL liberada, sem autenticação.",
    },
    {
      id: 2,
      title: "Novas modalidades",
      description: "Inclusão de duas novas competições na plataforma.",
    },
    {
      id: 3,
      title: "Usuários e ecossistema",
      description: "Retorno com Innolab, equipes e TrainLab.",
    },
    {
      id: 4,
      title: "Tipos de usuários",
      description: "Permissões específicas por modalidade.",
    },
    {
      id: 5,
      title: "ShowLive",
      description: "3 modalidades + modo livre de criação.",
    },
  ];

  const current = phases[currentPhase - 1];

  return (
    <div className="w-full bg-gradient-to-r from-base-200 via-base-100 to-primary/10 border-b border-base-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-warning text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
              Atualização progressiva
            </div>

            <p className="text-sm text-base-content/70">
              Estamos evoluindo o RoboStage para um novo ecossistema.
            </p>
          </div>
        </div>

        {/* CENTER (fase atual) */}
        <div className="flex flex-col items-center text-center md:text-left">
          <span className="text-xs text-base-content/60">
            Fase atual
          </span>

          <span className="text-sm font-semibold text-primary">
            Fase {current.id} — {current.title}
          </span>

          <span className="text-xs text-base-content/60 max-w-xs">
            {current.description}
          </span>
        </div>

        {/* RIGHT (progress) */}
        <div className="flex items-center gap-2">
          {phases.map((phase) => {
            const isActive = phase.id === currentPhase;
            const isPast = phase.id < currentPhase;

            return (
              <div
                key={phase.id}
                className={`h-2 w-8 rounded-full transition-all ${
                  isActive
                    ? "bg-primary scale-110"
                    : isPast
                    ? "bg-success"
                    : "bg-base-300"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}