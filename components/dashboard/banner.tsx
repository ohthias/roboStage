import { CalendarDays } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";

  return "Boa noite";
}

export default function DashboardBanner({
  nomeUsuario,
}: {
  nomeUsuario: string;
}) {
  const greeting = getGreeting();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold md:text-5xl">
              {greeting}, <span className="text-primary">{nomeUsuario}</span>.
            </h1>

            <p className="max-w-2xl text-base-content/70 text-base md:text-lg leading-relaxed">
              Seu ambiente está pronto. Gerencie organizações, projetos,
              documentos e acompanhe tudo em um único lugar para tornar sua
              equipe mais produtiva.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <CalendarDays size={16} />
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).toLocaleUpperCase()}
          </div>
        </div>
      </div>
    </section>
  );
}
