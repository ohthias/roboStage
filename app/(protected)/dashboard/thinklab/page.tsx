import { createThinkLab, listThinkLabsByUserId } from "./actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThinkLabThumbnail } from "@/components/thinklab/ThinkLabThumbnail";
import { CanvasElement } from "@/types/thinklab.types";

export default async function ThinkLabDashboard() {
  const thinkLabs = await listThinkLabsByUserId();

  async function create() {
    "use server";
    const created = await createThinkLab();
    redirect(`/dashboard/thinklab/${created.id}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-base-100">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/8 via-base-100/50 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
              Think<span className="text-primary">Lab</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/65 sm:text-base">
              Seus diagramas e ideias organizadas em um só lugar. Transforme
              pensamentos em projetos visuais.
            </p>
          </div>

          <form action={create} className="shrink-0">
            <button
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl bg-primary px-5 py-3 text-sm font-bold text-primary-content shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 sm:w-auto"
              type="submit"
            >
              <span className="text-lg leading-none">+</span>
              Novo quadro
            </button>
          </form>
        </header>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />

        {/* Boards */}
        {thinkLabs.length > 0 ? (
          <section
            aria-label="Seus quadros ThinkLab"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6"
          >
            {thinkLabs.map((thinkLab) => {
              const config = thinkLab.config as {
                elements?: CanvasElement[];
              } | null;

              const elements = Array.isArray(config?.elements)
                ? config.elements
                : [];

              return (
                <Link
                  key={thinkLab.id}
                  href={`/dashboard/thinklab/${thinkLab.id}`}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300/80 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden border-b border-base-300/70 bg-base-200/50">
                    <div className="transition-transform duration-500 group-hover:scale-[1.02]">
                      <ThinkLabThumbnail
                        elements={elements}
                        name={thinkLab.name}
                      />
                    </div>

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-100/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-base-300/70 bg-base-100/90 px-3 py-1.5 text-xs font-semibold text-base-content/70 shadow-sm backdrop-blur-sm">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {elements.length}{" "}
                      {elements.length === 1 ? "item" : "itens"}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-base-content transition-colors group-hover:text-primary">
                      {thinkLab.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-base-content/60">
                      {thinkLab.description || "Sem descrição"}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-base-300/70 pt-4">
                      <span className="text-xs font-semibold text-base-content/45">
                        Quadro ThinkLab
                      </span>

                      <span className="flex size-8 items-center justify-center rounded-tl-lg rounded-br-lg bg-base-200 text-base-content/60 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-content">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="size-4"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl border border-dashed border-base-300 bg-base-200/20 px-5 py-12 sm:px-10 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full border-[28px] border-primary/5"
            />

            <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
              <div className="mb-5 grid size-16 place-items-center rounded-tl-2xl rounded-br-2xl border border-primary/15 bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="size-8"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M8 9h8M8 13h5" />
                  <path d="M16 17h3" />
                </svg>
              </div>

              <h2 className="text-xl font-black tracking-tight text-base-content sm:text-2xl">
                Seu espaço começa aqui
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-base-content/60 sm:text-base">
                Você ainda não criou nenhum quadro. Comece a organizar suas
                ideias, diagramas e evidências em seu primeiro ThinkLab.
              </p>

              <form action={create} className="mt-6">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-tl-xl rounded-br-xl bg-primary px-5 py-3 text-sm font-bold text-primary-content transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  type="submit"
                >
                  <span className="text-lg leading-none">+</span>
                  Criar primeiro quadro
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
