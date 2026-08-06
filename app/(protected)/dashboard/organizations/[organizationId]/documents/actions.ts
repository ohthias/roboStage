"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import type { SerializedEditorState } from "lexical";
import { db } from "@/db";
import { documents } from "@/db/schema";

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

export async function createDocumentAction(
  organizationId: string
): Promise<MutationResult<{ id: string }>> {
  try {
    const { userId } = await assertMembership(organizationId);

    const [document] = await db
      .insert(documents)
      .values({
        organizationId,
        title: "Sem título",
        content: null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning({ id: documents.id });

    revalidatePath(`/dashboard/organizations/${organizationId}/documents`);
    return { success: true, data: { id: document.id } };
  } catch (error) {
    return {
      success: false,
      message: toMessage(error, "Não foi possível criar o documento."),
    };
  }
}

export async function updateDocumentAction(
  organizationId: string,
  documentId: string,
  data: { title?: string; content?: SerializedEditorState }
): Promise<MutationResult> {
  try {
    const { userId } = await assertMembership(organizationId);

    await db
      .update(documents)
      .set({
        ...(data.title !== undefined
          ? { title: data.title.trim() || "Sem título" }
          : {}),
        ...(data.content !== undefined
          ? { content: data.content as unknown as Record<string, unknown> }
          : {}),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.organizationId, organizationId)
        )
      );

    revalidatePath(`/dashboard/organizations/${organizationId}/documents`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toMessage(error, "Não foi possível salvar o documento."),
    };
  }
}

export async function deleteDocumentAction(
  organizationId: string,
  documentId: string
): Promise<MutationResult> {
  try {
    const { userId, role } = await assertMembership(organizationId);

    const [existing] = await db
      .select({ createdBy: documents.createdBy })
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.organizationId, organizationId)
        )
      );

    if (!existing) {
      return { success: false, message: "Documento não encontrado." };
    }

    if (role !== "org:admin" && existing.createdBy !== userId) {
      return {
        success: false,
        message:
          "Apenas o autor do documento ou um administrador pode excluí-lo.",
      };
    }

    await db
      .delete(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.organizationId, organizationId)
        )
      );

    revalidatePath(`/dashboard/organizations/${organizationId}/documents`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: toMessage(error, "Não foi possível excluir o documento."),
    };
  }
}

function toMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
