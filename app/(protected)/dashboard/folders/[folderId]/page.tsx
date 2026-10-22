import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, folders } from "@/db/schema";
import { tests } from "@/db/schema/labtest";
import { thinklab } from "@/db/schema/thinklab";
import { scopeWhere } from "@/utils/stagebook/permissions";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { getResourcesTags } from "@/utils/stagebook/actions/tags";
import type { TagDTO } from "@/types/labels";
import { FolderExplorer } from "./folder-explorer";
import type { Crumb, ExplorerEntry } from "./explorer-types";

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
  const testScope =
    scope.type === "team"
      ? eq(tests.teamId, scope.teamId)
      : and(eq(tests.userId, scope.userId), isNull(tests.teamId));
  const thinkLabScope =
    scope.type === "team"
      ? eq(thinklab.teamId, scope.teamId)
      : and(eq(thinklab.userId, scope.userId), isNull(thinklab.teamId));

  // Todas as pastas do scope (leves): usadas para achar a pasta atual e o
  // caminho de ancestrais exibido na barra de endereço.
  const allFolders = await db
    .select({
      id: folders.id,
      name: folders.name,
      icon: folders.icon,
      color: folders.color,
      parentId: folders.parentId,
    })
    .from(folders)
    .where(folderScope);

  const byId = new Map(allFolders.map((f) => [f.id, f]));
  const folder = byId.get(folderId);
  if (!folder) notFound();

  const crumbs: Crumb[] = [];
  const seen = new Set<string>([folder.id]);
  let cursor = folder.parentId ? byId.get(folder.parentId) : undefined;
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    crumbs.unshift({ id: cursor.id, name: cursor.name });
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  const [childFolders, pages, savedTests, savedDiagrams] = await Promise.all([
    db
      .select({
        id: folders.id,
        name: folders.name,
        icon: folders.icon,
        color: folders.color,
        updatedAt: folders.updatedAt,
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
    db
      .select({ id: tests.id, name: tests.name, updatedAt: tests.updatedAt })
      .from(tests)
      .where(and(testScope, eq(tests.folderId, folder.id)))
      .orderBy(asc(tests.name)),
    db
      .select({
        id: thinklab.id,
        name: thinklab.name,
        updatedAt: thinklab.updatedAt,
      })
      .from(thinklab)
      .where(and(thinkLabScope, eq(thinklab.folderId, folder.id)))
      .orderBy(asc(thinklab.name)),
  ]);

  // Tags universais de cada tipo de recurso (um lote por tipo).
  const [docTags, testTags, diagramTags] = await Promise.all([
    getResourcesTags("document", pages.map((p) => p.id)).catch(
      () => ({}) as Record<string, TagDTO[]>,
    ),
    getResourcesTags("labtest", savedTests.map((t) => t.id)).catch(
      () => ({}) as Record<string, TagDTO[]>,
    ),
    getResourcesTags("thinklab", savedDiagrams.map((d) => d.id)).catch(
      () => ({}) as Record<string, TagDTO[]>,
    ),
  ]);

  const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null);

  const entries: ExplorerEntry[] = [
    ...childFolders.map(
      (child): ExplorerEntry => ({
        id: child.id,
        kind: "folder",
        name: child.name,
        icon: child.icon,
        color: child.color,
        href: `/dashboard/folders/${child.id}`,
        updatedAt: iso(child.updatedAt),
        tags: [],
      }),
    ),
    ...pages.map(
      (page): ExplorerEntry => ({
        id: page.id,
        kind: "document",
        name: page.title,
        icon: page.icon,
        href: `/dashboard/documents/${page.id}`,
        updatedAt: iso(page.updatedAt),
        tags: docTags[page.id] ?? [],
      }),
    ),
    ...savedTests.map(
      (test): ExplorerEntry => ({
        id: test.id,
        kind: "labtest",
        name: test.name,
        icon: null,
        href: `/dashboard/labtest/${test.id}`,
        updatedAt: iso(test.updatedAt),
        tags: testTags[test.id] ?? [],
      }),
    ),
    ...savedDiagrams.map(
      (diagram): ExplorerEntry => ({
        id: diagram.id,
        kind: "thinklab",
        name: diagram.name,
        icon: null,
        href: `/dashboard/thinklab/${diagram.id}`,
        updatedAt: iso(diagram.updatedAt),
        tags: diagramTags[diagram.id] ?? [],
      }),
    ),
  ];

  // Tags realmente usadas por itens desta pasta (sem duplicatas, em ordem alfabética).
  const tagMap = new Map<string, TagDTO>();
  for (const entry of entries) {
    for (const tag of entry.tags) tagMap.set(tag.id, tag);
  }
  const availableTags = [...tagMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
  );

  return (
    <FolderExplorer
      folderId={folder.id}
      folderName={folder.name}
      folderIcon={folder.icon}
      folderColor={folder.color}
      parentId={folder.parentId}
      crumbs={crumbs}
      entries={entries}
      availableTags={availableTags}
    />
  );
}
