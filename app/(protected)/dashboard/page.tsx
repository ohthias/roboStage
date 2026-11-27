import { getDashboardData } from "@/features/home/dashboard/lib/data";
import { MentorDashboard } from "@/features/home/dashboard/components/mentor-view";
import { CompetitorDashboard } from "@/features/home/dashboard/components/competitor-view";
import { ExplorerDashboard } from "@/features/home/dashboard/components/explorer-view";

/**
 * Home do dashboard — cada tipo de conta (personaType) vê um layout próprio:
 * - mentor_tecnico → acompanhamento da equipe (testes, membros, tarefas)
 * - competidor     → progresso pessoal, anotações e próximos eventos
 * - entusiasta     → exploração de conteúdo e ligas
 * - organizador    → agenda de eventos e tarefas da organização
 */
export default async function DashboardPage() {
  const data = await getDashboardData();

  switch (data.persona) {
    case "mentor_tecnico":
      return <MentorDashboard data={data} />;
    case "competidor":
      return <CompetitorDashboard data={data} />;
    case "organizador":
      return <ExplorerDashboard data={data} variant="organizador" />;
    case "entusiasta":
    default:
      return <ExplorerDashboard data={data} variant="entusiasta" />;
  }
}
