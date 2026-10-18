import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import { ArrowUpRight, Edit, FlaskConical, Plus, Trash } from "lucide-react";

import {
  createThinkLab,
  listThinkLabsByUserId,
  deleteThinkLabAction,
  updateThinkLabDetails,
} from "./actions";
import { ThinkLabThumbnail } from "@/components/thinklab/ThinkLabThumbnail";

export default async function ThinkLabDashboard({
  searchParams,
}: {
  searchParams?: Promise<{ folderId?: string }>;
}) {
  const thinkLabs = await listThinkLabsByUserId();
  const selectedFolderId = (await searchParams)?.folderId ?? null;

  async function create() {
    "use server";

    const created = await createThinkLab(
      "Novo ThinkLab",
      null,
      {},
      selectedFolderId,
    );
    redirect(`/dashboard/thinklab/${created.id}`);
  }

  return (
    <main className="min-h-full bg-base-100 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
              Think<span className="text-primary">Lab</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60 sm:text-base">
              Organize ideias, conecte conceitos e desenvolva soluções para seus
              projetos em um espaço visual.
            </p>
          </div>

          <form action={create}>
            {selectedFolderId && (
              <input type="hidden" name="folderId" value={selectedFolderId} />
            )}
            <button
              type="submit"
              className="btn btn-primary w-full rounded-tl-xl rounded-br-xl sm:w-auto"
            >
              <Plus size={18} />
              Novo quadro
            </button>
          </form>
        </header>
        <div className="h-px bg-gradient-to-r from-primary/30 via-base-300 to-transparent" />
        {thinkLabs.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-tl-3xl rounded-br-3xl border border-dashed border-base-300 bg-base-200/30 px-6 py-12 text-center">
            <div className="mb-5 grid size-16 place-items-center rounded-tl-2xl rounded-br-2xl bg-primary/10 text-primary">
              <FlaskConical size={28} />
            </div>
            <h2 className="text-xl font-bold">Nenhum quadro criado</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-base-content/60">
              Crie seu primeiro quadro para organizar ideias, diagramas e
              evidências do seu projeto.
            </p>
            <form action={create} className="mt-6">
              {selectedFolderId && (
                <input type="hidden" name="folderId" value={selectedFolderId} />
              )}
              <button
                type="submit"
                className="btn btn-primary rounded-tl-xl rounded-br-xl"
              >
                <Plus size={18} />
                Criar primeiro quadro
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {thinkLabs.map((thinkLab) => {
                const deleteAction = deleteThinkLabAction.bind(
                  null,
                  thinkLab.id,
                );

                const config = thinkLab.config as
                  | {
                      elements?: ComponentProps<
                        typeof ThinkLabThumbnail
                      >["elements"];
                    }
                  | null
                  | undefined;
                const elements = config?.elements ?? [];

                const modalId = `edit-thinklab-${thinkLab.id}`;

                return (
                  <article
                    key={thinkLab.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-tl-2xl rounded-br-2xl border border-base-300 bg-base-100 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                  >
                    <Link
                      href={`/dashboard/thinklab/${thinkLab.id}`}
                      className="block overflow-hidden border-b border-base-300 bg-base-200/40"
                      aria-label={`Abrir ${thinkLab.name}`}
                    >
                      <div className="aspect-video overflow-hidden">
                        <ThinkLabThumbnail
                          elements={elements}
                          name={thinkLab.name}
                        />
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="break-words text-lg font-bold leading-snug">
                            {thinkLab.name}
                          </h2>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/60">
                            {thinkLab.description?.trim() ||
                              "Nenhuma descrição adicionada."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-base-300/70 pt-4">
                        <div className="flex items-center gap-1">
                          <form action={deleteAction}>
                            <button
                              type="submit"
                              className="btn btn-square btn-sm btn-ghost text-error hover:bg-error/10"
                              aria-label={`Excluir ${thinkLab.name}`}
                              title="Excluir quadro"
                            >
                              <Trash size={16} />
                            </button>
                          </form>

                          <label
                            htmlFor={modalId}
                            className="btn btn-square btn-sm btn-ghost"
                            aria-label={`Editar ${thinkLab.name}`}
                            title="Editar quadro"
                          >
                            <Edit size={16} />
                          </label>
                        </div>

                        <Link
                          href={`/dashboard/thinklab/${thinkLab.id}`}
                          className="grid size-9 place-items-center rounded-tl-lg rounded-br-lg text-base-content/50 transition-colors hover:bg-primary/10 hover:text-primary"
                          aria-label={`Abrir ${thinkLab.name}`}
                          title="Abrir quadro"
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <div>
              {thinkLabs.map((thinkLab) => {
                const modalId = `edit-thinklab-${thinkLab.id}`;

                const updateAction = updateThinkLabDetails.bind(
                  null,
                  thinkLab.id,
                );

                return (
                  <div key={thinkLab.id}>
                    <input
                      type="checkbox"
                      id={modalId}
                      className="modal-toggle"
                    />

                    <div
                      className="modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby={`${modalId}-title`}
                    >
                      <div className="modal-box w-11/12 max-w-lg rounded-tl-3xl rounded-br-3xl border border-base-300 bg-base-100 p-6 shadow-2xl sm:p-8">
                        <div className="mb-6">
                          <h3
                            id={`${modalId}-title`}
                            className="mt-2 text-2xl font-black tracking-tight"
                          >
                            Editar quadro
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-base-content/60">
                            Altere os dados do quadro. Seus diagramas e
                            elementos serão preservados.
                          </p>
                        </div>

                        <form action={updateAction}>
                          <div className="space-y-5">
                            <label className="form-control w-full">
                              <span className="label pb-2">
                                <span className="label-text font-semibold">
                                  Nome do quadro
                                </span>
                              </span>
                              <input
                                type="text"
                                name="name"
                                defaultValue={thinkLab.name}
                                maxLength={100}
                                required
                                autoComplete="off"
                                placeholder="Nome do quadro"
                                className="input input-bordered w-full focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                              />
                            </label>
                            <label className="form-control w-full">
                              <span className="label pb-2">
                                <span className="label-text font-semibold">
                                  Descrição
                                </span>
                                <span className="label-text-alt text-base-content/45">
                                  Opcional
                                </span>
                              </span>
                              <textarea
                                name="description"
                                defaultValue={thinkLab.description ?? ""}
                                maxLength={1000}
                                rows={4}
                                placeholder="Descreva o objetivo deste quadro..."
                                className="textarea textarea-bordered min-h-28 w-full resize-y leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                              />
                            </label>
                          </div>

                          <div className="modal-action mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <label
                              htmlFor={modalId}
                              className="btn btn-ghost w-full sm:w-auto"
                            >
                              Cancelar
                            </label>
                            <button
                              type="submit"
                              className="btn btn-primary w-full sm:w-auto"
                            >
                              Salvar alterações
                            </button>
                          </div>
                        </form>
                      </div>

                      <label
                        htmlFor={modalId}
                        className="modal-backdrop"
                        aria-label="Fechar modal"
                      >
                        Fechar
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
