import { currentUser } from "@clerk/nextjs/server";
import {
  FolderKanban,
  Building2,
  Folder,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Olá, {user?.firstName ?? "Usuário"} 👋
        </h1>

        <p className="mt-2 text-base-content/70">
          Bem-vindo ao painel da RoboStage.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Organizações"
          icon={<Building2 size={22} />}
          href="/dashboard/organizations"
        />

        <Card
          title="Projetos"
          icon={<FolderKanban size={22} />}
          href="/dashboard/projects"
        />

        <Card
          title="Pastas"
          icon={<Folder size={22} />}
          href="/dashboard/folders"
        />

        <Card
          title="Atividade"
          icon={<Activity size={22} />}
          href="#"
        />
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title">
            Continue de onde parou
          </h2>

          <p className="text-base-content/70">
            Em breve aqui serão exibidos seus projetos recentes,
            atividades e documentos.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-base-300 bg-base-100 p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-base-200 p-3">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
        />
      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>
    </Link>
  );
}