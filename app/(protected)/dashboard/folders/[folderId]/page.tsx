import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { ArrowLeft, ChevronRight, FileText, Folder } from "lucide-react";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { resolveStagebookScope } from "@/utils/stagebook/scope";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const scope = await resolveStagebookScope();
  const folderScope = scopeWhere(scope, {
    userId: folders.userId,
    teamId: folders.teamId,
  });
  const documentScope = scopeWhere(scope, {
    userId: documents.userId,
    teamId: documents.teamId,
  });

  const [folder] = await db
    .select({
      id: folders.id,
      name: folders.name,
      icon: folders.icon,
      parentId: folders.parentId,
    })
    .from(folders)
    .where(and(eq(folders.id, folderId), folderScope))
    .limit(1);

  if (!folder) notFound();

  const [childFolders, pages] = await Promise.all([
    db
      .select({
        id: folders.id,
        name: folders.name,
        icon: folders.icon,
      })
      .from(folders)
      .where(and(folderScope, eq(folders.parentId, folder.id)))
      .orderBy(asc(folders.position), asc(folders.name)),
    db
      .select({
        id: documents.id,
        title: documents.title,
        icon: documents.icon,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(
        and(
          documentScope,
          eq(documents.folderId, folder.id),
          isNull(documents.parentId),
        ),
      )
      .orderBy(asc(documents.position), asc(documents.title)),
  ]);

  return (
    <section className="mx-auto w-full p-6 lg:p-10">
      <Link
        href="/dashboard/folders"
        className="group mb-6 inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Todas as pastas
      </Link>

      <header className="mb-8">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
            {folder.name}
          </h1>

          {folder.icon && (
            <span className="shrink-0 text-2xl" aria-hidden="true">
              {folder.icon}
            </span>
          )}
        </div>
      </header>

      {childFolders.length === 0 && pages.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-base-300 bg-base-200/60 text-base-content/45">
            <Folder size={27} strokeWidth={1.5} />
          </div>

          <h2 className="text-base font-semibold text-base-content">
            Nenhum conteúdo por aqui
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/55">
            Esta pasta ainda não possui subpastas ou páginas. Crie uma subpasta
            ou organize seus documentos pelo Stagebook.
          </p>

          <Link
            href="/dashboard/folders"
            className="btn btn-outline btn-sm mt-5 gap-2 border-base-300"
          >
            <ArrowLeft size={15} />
            Voltar às pastas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {childFolders.map((child) => (
            <Link
              key={child.id}
              href={`/dashboard/folders/${child.id}`}
              className={[
                "group relative flex min-h-[104px] min-w-0 items-center gap-3",
                "overflow-hidden rounded-xl border border-base-300",
                "bg-base-100 p-4 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/40",
                "hover:bg-base-200/40 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-primary/50",
              ].join(" ")}
            >
              {/* Aba visual da pasta */}
              <div
                aria-hidden="true"
                className="absolute left-4 top-0 h-1 w-10 rounded-b-full bg-primary/50 transition-all duration-200 group-hover:w-14 group-hover:bg-primary"
              />

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                {child.icon ? (
                  <span className="text-xl leading-none" aria-hidden="true">
                    {child.icon}
                  </span>
                ) : (
                  <Folder size={25} strokeWidth={1.7} />
                )}
              </div>

              <div className="min-w-0 flex-1 py-1">
                <h2 className="truncate text-sm font-semibold text-base-content transition-colors group-hover:text-primary">
                  {child.name}
                </h2>

                <p className="mt-1 text-xs text-base-content/50">Subpasta</p>
              </div>

              <ChevronRight
                size={17}
                className="shrink-0 text-base-content/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          ))}

          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/dashboard/documents/${page.id}`}
              className={[
                "group flex min-h-[104px] min-w-0 items-center gap-3",
                "rounded-xl border border-base-300 bg-base-100 p-4",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/40",
                "hover:bg-base-200/40 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-primary/50",
              ].join(" ")}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-base-300 bg-base-200/50 text-base-content/60 transition-colors group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                {page.icon ? (
                  <span className="text-xl leading-none" aria-hidden="true">
                    {page.icon}
                  </span>
                ) : (
                  <FileText size={23} strokeWidth={1.7} />
                )}
              </div>

              <div className="min-w-0 flex-1 py-1">
                <h2 className="truncate text-sm font-semibold text-base-content transition-colors group-hover:text-primary">
                  {page.title}
                </h2>

                <p className="mt-1 text-xs text-base-content/50">Documento</p>
              </div>

              <ChevronRight
                size={17}
                className="shrink-0 text-base-content/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
