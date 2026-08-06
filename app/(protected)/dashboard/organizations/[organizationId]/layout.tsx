import { notFound, redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { ReactNode } from "react";
import { OrganizationTabs } from "./organization-tabs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const { userId, isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated || !userId) {
    return redirectToSignIn();
  }

  const client = await clerkClient();

  const [organization, membershipList, membershipRecord] = await Promise.all([
    client.organizations.getOrganization({ organizationId }).catch(() => null),
    client.organizations
      .getOrganizationMembershipList({ organizationId, limit: 1 })
      .catch(() => null),
    client.users
      .getOrganizationMembershipList({ userId, limit: 100 })
      .then(({ data }) =>
        data.find((m) => m.organization.id === organizationId),
      ),
  ]);

  if (!organization) {
    notFound();
  }

  if (!membershipRecord) {
    // Usuário autenticado, mas não é membro desta organização.
    redirect("/dashboard/organizations");
  }

  const role =
    membershipRecord.role === "org:admin" ? "Administrador" : "Membro";
  const membersCount = membershipList?.totalCount ?? 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4 border border-base-content/10 rounded-2xl">
          <img
            src={organization.hasImage ? organization.imageUrl : undefined}
            alt={organization.name}
            className="flex h-16 w-16 items-center justify-center rounded-box bg-base-300 text-lg font-semibold text-base-content"
          />
          <div className="flex flex-col pr-4">
            <h1 className="text-lg font-semibold text-primary">
              {organization.name}
            </h1>
            <p className="text-sm text-base-content">
              {role} • {membersCount}{" "}
              {membersCount === 1 ? "membro" : "membros"}
            </p>
          </div>
        </div>
        <Link href="/dashboard/organizations" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Link>
      </header>
      <OrganizationTabs organizationId={organizationId} />

      <div>{children}</div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

function formatDate(timestamp?: number | null) {
  if (!timestamp) return "data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}
