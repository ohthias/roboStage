import {
  Activity,
  CalendarDays,
  FolderKanban,
  Users,
  Trophy,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

export default function OrganizationOverviewPage() {
  const stats = [
    {
      title: "Projetos",
      value: 12,
      icon: FolderKanban,
      color: "text-primary",
    },
    {
      title: "Membros",
      value: 18,
      icon: Users,
      color: "text-info",
    },
    {
      title: "Competições",
      value: 4,
      icon: Trophy,
      color: "text-warning",
    },
    {
      title: "Atividades",
      value: 137,
      icon: Activity,
      color: "text-success",
    },
  ];

  const recentActivities = [
    {
      title: "Projeto 'Future Edition' criado",
      description: "Matheus criou um novo projeto.",
      time: "há 15 minutos",
    },
    {
      title: "Novo membro entrou",
      description: "Ana Beatriz entrou na organização.",
      time: "há 2 horas",
    },
    {
      title: "QuickBrick Studio atualizado",
      description: "Mapa da arena foi modificado.",
      time: "Ontem",
    },
    {
      title: "LabTest executado",
      description: "34 testes foram realizados.",
      time: "2 dias atrás",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-3xl border border-base-300 bg-base-100 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">RoboStage Team</h1>

            <p className="mt-2 max-w-2xl text-base-content/70">
              Bem-vindo ao painel da organização. Gerencie membros, projetos e
              acompanhe toda a atividade da equipe em um único lugar.
            </p>
          </div>

          <button className="btn btn-primary">
            Abrir projetos
            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-base-300 bg-base-100 p-5 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl bg-base-200 p-3 ${item.color}`}>
                  <Icon size={22} />
                </div>

                <span className="text-3xl font-bold">{item.value}</span>
              </div>

              <p className="mt-5 text-sm text-base-content/60">{item.title}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {/* Atividades */}
        <div className="xl:col-span-2 rounded-2xl border border-base-300 bg-base-100">
          <div className="border-b border-base-300 px-6 py-5">
            <h2 className="text-lg font-semibold">Atividades recentes</h2>
          </div>

          <div className="divide-y divide-base-300">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex gap-4 px-6 py-5">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />

                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>

                  <p className="mt-1 text-sm text-base-content/60">
                    {activity.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-base-content/50">
                    <Clock3 size={14} />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-primary" size={22} />

              <h2 className="font-semibold">Próximo evento</h2>
            </div>

            <div className="mt-5">
              <h3 className="font-medium">Regional FLL 2026</h3>

              <p className="mt-1 text-sm text-base-content/60">
                14 de Setembro de 2026
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
            <h2 className="font-semibold">Resumo</h2>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/60">Organização criada</span>

                <span>Jan 2026</span>
              </div>

              <div className="flex justify-between">
                <span className="text-base-content/60">Projetos ativos</span>

                <span>8</span>
              </div>

              <div className="flex justify-between">
                <span className="text-base-content/60">Membros online</span>

                <span>6</span>
              </div>

              <div className="flex justify-between">
                <span className="text-base-content/60">Última atividade</span>

                <span>15 min</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
