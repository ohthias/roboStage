"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  organizationId?: string;
};

export const initialCreateOrganizationState: ActionState = { status: "idle" };

export async function createOrganizationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { status: "error", message: "Você precisa estar autenticado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) {
    return { status: "error", message: "Dê um nome para a organização." };
  }

  try {
    const client = await clerkClient();
    const organization = await client.organizations.createOrganization({
      name,
      slug: slugInput ? slugify(slugInput) : undefined,
      createdBy: userId,
    });

    revalidatePath("/dashboard/organizations");

    return { status: "success", organizationId: organization.id };
  } catch (error) {
    return {
      status: "error",
    };
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function extractClerkErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const first = (
      error as { errors: Array<{ message?: string; longMessage?: string }> }
    ).errors[0];
    return first?.longMessage ?? first?.message ?? fallback;
  }
  return fallback;
}
