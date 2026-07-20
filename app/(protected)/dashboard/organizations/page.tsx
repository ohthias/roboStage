import {
  OrganizationList,
  OrganizationSwitcher,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  Building2,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";

export default async function OrganizationsPage() {
  const { orgId } = await auth();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Organizações
        </h1>

        <p className="mt-2 text-base-content/70">
          Gerencie equipes, membros e permissões da plataforma.
        </p>
      </div>

      {/* Organização ativa */}
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">
                Organização atual
              </h2>

              <p className="text-base-content/60">
                Selecione uma organização para continuar.
              </p>
            </div>

            <OrganizationSwitcher
              hidePersonal={false}
              afterSelectOrganizationUrl="/dashboard/organizations"
              afterCreateOrganizationUrl="/dashboard/organizations"
              appearance={{
                elements: {
                  organizationSwitcherTrigger:
                    "rounded-xl border border-base-300 px-3 py-2",
                },
              }}
            />
          </div>

          {orgId ? (
            <div className="mt-6 rounded-xl bg-success/10 p-4 text-success">
              Organização selecionada.
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-warning/10 p-4 text-warning">
              Nenhuma organização selecionada.
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          icon={<Building2 size={22} />}
          title="Organizações"
          description="Gerencie várias equipes."
        />

        <StatCard
          icon={<Users size={22} />}
          title="Membros"
          description="Convide participantes."
        />

        <StatCard
          icon={<Shield size={22} />}
          title="Permissões"
          description="Controle acessos."
        />
      </div>

      {/* Lista */}
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="card-title">
                Suas organizações
              </h2>

              <p className="text-sm text-base-content/60">
                Crie uma nova organização ou entre em uma existente.
              </p>
            </div>
          </div>

          <OrganizationList
            hidePersonal={false}
            afterCreateOrganizationUrl="/dashboard/organizations"
            afterSelectOrganizationUrl="/dashboard/organizations"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
              },
            }}
          />
        </div>
      </div>

      {/* Informação */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Sparkles size={22} />
          </div>

          <div>
            <h3 className="font-semibold">
              Dica
            </h3>

            <p className="mt-1 text-sm text-base-content/70">
              Cada organização representa uma equipe de robótica.
              Dentro dela você poderá criar projetos, compartilhar
              arquivos, utilizar o QuickBrick Studio, LabTest,
              StyleLab e outros módulos da RoboStage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/20 hover:shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-base-content/60">
        {description}
      </p>
    </div>
  );
}