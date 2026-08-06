"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { extractClerkErrorMessage } from "../actions";

export type MutationResult = { success: boolean; message?: string };
export type OrgRole = "org:admin" | "org:member";

async function assertIsAdmin(organizationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado.");

  const client = await clerkClient();
  const { data } = await client.users.getOrganizationMembershipList({
    userId,
    limit: 100,
  });
  const membership = data.find((m) => m.organization.id === organizationId);

  if (!membership || membership.role !== "org:admin") {
    throw new Error("Apenas administradores podem executar esta ação.");
  }

  return { client, userId };
}

function revalidateOrganizationPaths(organizationId: string) {
  revalidatePath(`/dashboard/organizations/${organizationId}`);
  revalidatePath(`/dashboard/organizations/${organizationId}/members`);
  revalidatePath(`/dashboard/organizations/${organizationId}/settings`);
  revalidatePath("/dashboard/organizations");
}

export async function inviteMemberAction(
  organizationId: string,
  email: string,
  role: OrgRole
): Promise<MutationResult> {
  try {
    const { client, userId } = await assertIsAdmin(organizationId);

    await client.organizations.createOrganizationInvitation({
      organizationId,
      emailAddress: email,
      role,
      inviterUserId: userId,
    });

    revalidateOrganizationPaths(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export async function revokeInvitationAction(
  organizationId: string,
  invitationId: string
): Promise<MutationResult> {
  try {
    const { client, userId } = await assertIsAdmin(organizationId);

    await client.organizations.revokeOrganizationInvitation({
      organizationId,
      invitationId,
      requestingUserId: userId,
    });

    revalidateOrganizationPaths(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export async function updateMemberRoleAction(
  organizationId: string,
  userId: string,
  role: OrgRole
): Promise<MutationResult> {
  try {
    const { client } = await assertIsAdmin(organizationId);

    await client.organizations.updateOrganizationMembership({
      organizationId,
      userId,
      role,
    });

    revalidateOrganizationPaths(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export async function removeMemberAction(
  organizationId: string,
  userId: string
): Promise<MutationResult> {
  try {
    const { client } = await assertIsAdmin(organizationId);

    await client.organizations.deleteOrganizationMembership({
      organizationId,
      userId,
    });

    revalidateOrganizationPaths(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export async function updateOrganizationAction(
  organizationId: string,
  data: { name: string; slug?: string }
): Promise<MutationResult> {
  try {
    const { client } = await assertIsAdmin(organizationId);

    await client.organizations.updateOrganization(organizationId, data);

    revalidateOrganizationPaths(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export async function updateOrganizationLogoAction(
  organizationId: string,
  formData: FormData
): Promise<MutationResult> {
  try {
    const { client } = await assertIsAdmin(organizationId);

    const file = formData.get("logo");
    if (!(file instanceof File)) {
      return { success: false, message: "Selecione uma imagem válida." };
    }

    await client.organizations.updateOrganizationLogo(organizationId, {
      file,
    });

    revalidateOrganizationPaths(organizationId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export async function deleteOrganizationAction(
  organizationId: string
): Promise<MutationResult> {
  try {
    const { client } = await assertIsAdmin(organizationId);

    await client.organizations.deleteOrganization(organizationId);

    revalidatePath("/dashboard/organizations");
    return { success: true };
  } catch (error) {
    return {
      success: false,
    };
  }
}
