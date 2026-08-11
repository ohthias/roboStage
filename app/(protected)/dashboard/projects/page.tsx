import {
  FolderKanban,
  Plus,
  Clock3,
} from "lucide-react";

const projects: any[] = [];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Projetos
          </h1>

          <p className="mt-2 text-base-content/70">
            Todos os seus projetos ficam organizados aqui.
          </p>
        </div>

        <button className="btn btn-primary gap-2">
          <Plus size={18} />
          Novo projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-base-300 bg-base-100 py-24">
          <div className="rounded-full bg-base-200 p-5">
            <FolderKanban size={40} />
          </div>

          <h2 className="mt-6 text-xl font-semibold">
            Nenhum projeto encontrado
          </h2>

          <p className="mt-2 max-w-md text-center text-base-content/60">
            Crie seu primeiro projeto para começar a utilizar
            os módulos da RoboStage.
          </p>

          <button className="btn btn-primary mt-8">
            <Plus size={18} />
            Criar projeto
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id}></div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-base-200 p-4">
        <div className="flex items-center gap-3">
          <Clock3 size={18} />

          <span className="text-sm">
            Em breve: QuickBrick Studio, LabTest, ShowLive e
            StyleLab poderão ser vinculados a um projeto.
          </span>
        </div>
      </div>
    </div>
  );
}