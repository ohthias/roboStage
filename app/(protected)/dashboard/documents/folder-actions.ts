"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, folders } from "@/db/schema";

export type MutationResult<T = undefined> = {
  success: boolean;
  message?: string;
  data?: T;
};

async function assertMembership(organizationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  const client = await clerkClient();
  const { data } = await client.users.getOrganizationMembershipList({
    userId,
    limit: 100,
  });
  const membership = data.find((m) => m.organization.id === organizationId);

  if (!membership) {
    throw new Error("Você não faz parte desta organização.");
  }

  return { userId, role: membership.role };
}

function revalidateDocuments(organizationId: string) {
  revalidatePath(`/dashboard/organizations/${organizationId}/documents`);
}

export async function createFolderAction(
  organizationId: string,
  parentId: string | null
): Promise<MutationResult<{ id: string }>> {
  try {
    const { userId } = await assertMembership(organizationId);

    if (parentId) {
      const validParent = await folderBelongsToOrganization(parentId, organizationId);
      if (!validParent) {
        return { success: false, message: "Pasta de destino inválida." };
      }
    }

    const [folder] = await db
      .insert(folders)
      .values({
        organizationId,
        parentId,
        name: "Nova pasta",
        icon: "📁",
        createdBy: userId,
      })
      .returning({ id: folders.id });

    revalidateDocuments(organizationId);
    return { success: true, data: { id: folder.id } };
  } catch (error) {
    return {
      success: false,
      message: toMessage(error, "Não foi possível criar a pasta."),
    };
  }
}

export async function updateFolderAction(
  organizationId: string,
  folderId: string,
  data: { name?: string; icon?: string | null; parentId?: string | null }
): Promise<MutationResult> {
  try {
    await assertMembership(organizationId);

    if (data.parentId !== undefined && data.parentId !== null) {
      if (data.parentId === folderId) {
        return {
          success: false,
          message: "Uma pasta não pode ser movida para dentro dela mesma.",
        };
      }

      const validParent = await folderBelongsToOrganization(
        data.parentId,
        organizationId
      );
      if (!validParent) {
        return { success: false, message: "Pasta de destino inválida." };
      }

      const cyclic = await wouldCreateCycle(
        organizationId,
        folderId,
        data.parentId
      );
      if (cyclic) {
        return {
          success: false,
          message:
            "Não é possível mover uma pasta para dentro de uma subpasta dela.",
        };
      }
    }

    await db
      .update(folders)
      .set({
        ...(data.name !== undefined
          ? { name: data.name.trim() || "Nova pasta" }
          : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        updatedAt: new Date(),
      })
      .where(
        and(eq(folders.id, folderId), eq(folders.organizationId, organizationId))
      );

    revalidateDocuments(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toMessage(error, "Não foi possível atualizar a pasta."),
    };
  }
}

export async function deleteFolderAction(
  organizationId: string,
  folderId: string
): Promise<MutationResult> {
  try {
    const { userId, role } = await assertMembership(organizationId);

    const [existing] = await db
      .select({ createdBy: folders.createdBy })
      .from(folders)
      .where(
        and(eq(folders.id, folderId), eq(folders.organizationId, organizationId))
      );

    if (!existing) {
      return { success: false, message: "Pasta não encontrada." };
    }

    if (role !== "org:admin" && existing.createdBy !== userId) {
      return {
        success: false,
        message: "Apenas quem criou a pasta ou um administrador pode excluí-la.",
      };
    }

    // Subpastas são excluídas em cascata (FK). Documentos dentro dela e das
    // subpastas voltam automaticamente para a raiz (FK "set null").
    await db
      .delete(folders)
      .where(
        and(eq(folders.id, folderId), eq(folders.organizationId, organizationId))
      );

    revalidateDocuments(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toMessage(error, "Não foi possível excluir a pasta."),
    };
  }
}

export async function moveDocumentAction(
  organizationId: string,
  documentId: string,
  folderId: string | null
): Promise<MutationResult> {
  try {
    await assertMembership(organizationId);

    if (folderId !== null) {
      const validFolder = await folderBelongsToOrganization(
        folderId,
        organizationId
      );
      if (!validFolder) {
        return { success: false, message: "Pasta inválida." };
      }
    }

    await db
      .update(documents)
      .set({ folderId, updatedAt: new Date() })
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.organizationId, organizationId)
        )
      );

    revalidateDocuments(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toMessage(error, "Não foi possível mover o documento."),
    };
  }
}

async function folderBelongsToOrganization(
  folderId: string,
  organizationId: string
) {
  const [folder] = await db
    .select({ id: folders.id })
    .from(folders)
    .where(
      and(eq(folders.id, folderId), eq(folders.organizationId, organizationId))
    );
  return Boolean(folder);
}

async function wouldCreateCycle(
  organizationId: string,
  folderId: string,
  newParentId: string
): Promise<boolean> {
  const allFolders = await db
    .select({ id: folders.id, parentId: folders.parentId })
    .from(folders)
    .where(eq(folders.organizationId, organizationId));

  const parentById = new Map(allFolders.map((f) => [f.id, f.parentId]));

  let current: string | null = newParentId;
  const visited = new Set<string>();
  while (current) {
    if (current === folderId) return true;
    if (visited.has(current)) break; // proteção extra contra ciclo pré-existente
    visited.add(current);
    current = parentById.get(current) ?? null;
  }
  return false;
}

function toMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
