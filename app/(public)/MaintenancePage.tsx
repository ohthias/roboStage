import Logo from "@/components/UI/Logo";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Nome */}
        <p>
          <Logo logoSize="4xl" />
        </p>

        {/* Status */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium border border-warning/20">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
          Plataforma em atualização
        </div>

        {/* Headline */}
        <h2 className="mt-8 text-2xl md:text-3xl font-semibold text-base-content">
          Estamos preparando o próximo nível da competição 🤖
        </h2>

        {/* Descrição */}
        <p className="mt-4 text-base-content/70 text-base md:text-lg leading-relaxed">
          O RoboStage está passando por uma reestruturação importante para se
          tornar uma plataforma mais robusta, escalável e preparada para o
          futuro.
        </p>

        {/* Expansão estratégica */}
        <div className="mt-6 bg-base-100 border border-base-300 rounded-xl p-5 text-left">
          <h3 className="text-base-content font-medium">O que vem por aí</h3>
          <ul className="mt-3 text-base-content/70 text-sm space-y-2">
            <li>• Expansão para múltiplas competições de robótica</li>
            <li>• Suporte a diferentes regras e formatos de torneio</li>
            <li>• Melhor gestão de equipes, missões e pontuações</li>
            <li>• Novas ferramentas para organização e análise</li>
          </ul>
        </div>

        {/* Aviso */}
        <p className="mt-6 text-base-content/60 text-sm">
          Durante esse período, a plataforma ficará indisponível por tempo
          indeterminado.
        </p>

        {/* Tempo */}
        <div className="mt-4 text-base-content/50 text-sm">
          Status: <span className="text-warning font-medium">em progresso</span>
        </div>

        {/* Footer */}
        <p className="mt-10 text-base-content/40 text-xs">
          Estamos trabalhando para entregar algo maior, mais completo e pronto
          para o futuro da robótica competitiva.
        </p>
      </div>
    </div>
  );
}
