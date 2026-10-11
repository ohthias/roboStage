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
          isNull(documents.parentId)
        )
      )
      .orderBy(asc(documents.position), asc(documents.title)),
  ]);

  return (
    <section className="mx-auto w-full max-w-5xl p-6 lg:p-10">
      <Link
        href="/dashboard/folders"
        className="btn btn-ghost btn-sm mb-6 gap-2 px-2 text-base-content/60"
      >
        <ArrowLeft size={16} />
        Todas as pastas
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3 text-primary">
          <Folder size={28} />
          <span className="text-2xl">{folder.icon ?? "📁"}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{folder.name}</h1>
        <p className="mt-2 text-sm text-base-content/60">
          Escolha uma pasta ou página para continuar.
        </p>
      </header>

      {childFolders.length === 0 && pages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
          <Folder size={40} className="mx-auto mb-4 text-base-content/25" />
          <h2 className="font-medium">Esta pasta está vazia</h2>
          <p className="mt-1 text-sm text-base-content/55">
            Crie uma subpasta ou adicione uma página pelo Stagebook.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {childFolders.map((child) => (
            <Link
              key={child.id}
              href={`/dashboard/folders/${child.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Folder className="shrink-0 text-primary" size={24} />
              <span className="min-w-0 flex-1 truncate font-medium">
                {child.icon ?? "📁"} {child.name}
              </span>
              <ChevronRight
                size={18}
                className="shrink-0 text-base-content/30 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}

          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/dashboard/documents/${page.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <FileText className="shrink-0 text-base-content/50" size={24} />
              <span className="min-w-0 flex-1 truncate font-medium">
                {page.icon ?? "📝"} {page.title}
              </span>
              <ChevronRight
                size={18}
                className="shrink-0 text-base-content/30 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
