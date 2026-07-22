import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

type MembershipWithOrganization = {
  role?: string | null;
  organization: {
    id: string;
    name: string;
    slug?: string | null;
    imageUrl?: string | null;
    createdAt?: number | null;
  };
};

export default async function OrganizationsPage() {
  const { userId, orgId, isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated || !userId) {
    return redirectToSignIn();
  }

  const { data: memberships, totalCount } =
    await (await clerkClient()).users.getOrganizationMembershipList({
      userId,
      limit: 100,
    });

  const organizations = (memberships as MembershipWithOrganization[]).map(
    (membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      imageUrl: membership.organization.imageUrl,
      createdAt: membership.organization.createdAt,
      role: membership.role ?? "member",
      active: membership.organization.id === orgId,
    })
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Suas organizações</h2>
            <p className="text-sm text-base-content/60">
              Clique em uma organização para abrir sua página individual.
            </p>
          </div>
        </div>

        {organizations.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {organizations.map((organization) => (
              <Link
                key={organization.id}
                href={`/dashboard/organizations/${organization.id}`}
                className={[
                  "group relative overflow-hidden rounded-2xl border bg-base-100 p-5 shadow-sm transition-all duration-300",
                  organization.active
                    ? "border-primary/40 ring-1 ring-primary/20"
                    : "border-base-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl",
                ].join(" ")}
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-100" />

                <div className="relative flex h-full flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-200">
                      {organization.imageUrl ? (
                        <img
                          src={organization.imageUrl}
                          alt={organization.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {getInitials(organization.name)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                          {organization.name}
                        </h3>

                        {organization.active && (
                          <span className="badge badge-primary badge-sm">
                            Atual
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-primary">
                      Abrir organização
                    </span>

                    <div className="rounded-full bg-base-200 p-2 transition-all group-hover:bg-primary group-hover:text-primary-content">
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>

                  {organization.createdAt ? (
                    <p className="text-xs text-base-content/50">
                      Criada em {formatDate(organization.createdAt)}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="badge badge-outline gap-2">
                  <Sparkles size={14} />
                  Sem organizações
                </div>

                <h3 className="text-2xl font-semibold">
                  Nenhuma organização disponível
                </h3>

                <p className="max-w-2xl text-sm text-base-content/65">
                  Quando uma organização for criada ou compartilhada com você,
                  ela aparecerá aqui como um card clicável.
                </p>
              </div>

              <div className="rounded-2xl bg-base-200 p-4 text-sm text-base-content/70">
                Você ainda pode usar o seletor do Clerk para criar ou alternar
                organizações.
              </div>
            </div>
          </div>
        )}
      </section>
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