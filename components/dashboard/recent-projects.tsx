import Link from "next/link";
import { ArrowRight, Clock, FolderKanban } from "lucide-react";
import CreateProjectModal from "@/components/dashboard/create-project-modal";

const recentProjects: any[] = [];

const statusStyles: Record<string, string> = {
  "Em andamento": "badge-primary",
  "Em revisão": "badge-warning",
  Concluído: "badge-success",
};

export default function RecentProjects() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projetos recentes</h2>
          <p className="text-sm text-base-content/60">
            Retome de onde parou ou comece algo novo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateProjectModal />
          <Link href="/dashboard/projects" className="btn btn-sm btn-outline">
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {recentProjects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
          <FolderKanban className="size-8 text-base-content/40" />
          <p className="text-sm text-base-content/60">
            Nenhum projeto acessado recentemente.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-base-300 rounded-2xl border border-base-300 bg-base-100">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-base-200/50"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-200 text-secondary">
                  <FolderKanban size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium transition-colors group-hover:text-primary">
                    {project.name}
                  </p>
                  <p className="truncate text-xs text-base-content/50">
                    {project.organization}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className={`badge badge-sm ${statusStyles[project.status]}`}>
                  {project.status}
                </span>
                <span className="hidden items-center gap-1 text-xs text-base-content/50 sm:flex">
                  <Clock size={12} />
                  {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
                </span>
                <ArrowRight
                  size={16}
                  className="text-base-content/30 transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>
            </Link>
          )) || (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
              <FolderKanban className="size-8 text-base-content/40" />
              <p className="text-sm text-base-content/60">
                Nenhum projeto acessado recentemente.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
