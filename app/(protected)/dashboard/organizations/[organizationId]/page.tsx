import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  NotebookPen,
  Shield,
  Users,
} from "lucide-react";

export default async function OrganizationOverviewPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const client = await clerkClient();

  const [organization, membershipList, invitationList] = await Promise.all([
    client.organizations.getOrganization({ organizationId }),
    client.organizations.getOrganizationMembershipList({
      organizationId,
      limit: 6,
    }),
    client.organizations
      .getOrganizationInvitationList({
        organizationId,
        status: ["pending"],
        limit: 100,
      })
      .catch(() => ({ data: [], totalCount: 0 })),
  ]);

  const stats = [
    { label: "Membros", value: String(membershipList.totalCount), icon: Users },
    {
      label: "Convites pendentes",
      value: String(invitationList.totalCount ?? 0),
      icon: Mail,
    },
    {
      label: "Criada em",
      value: formatDate(organization.createdAt),
      icon: CalendarDays,
    },
    { label: "Plano", value: "Padrão", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-base-300 bg-base-100 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                {stat.label}
              </span>
              <stat.icon size={16} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Membros recentes</h2>
            <Link
              href={`/dashboard/organizations/${organizationId}/members`}
              className="link link-primary flex items-center gap-1 text-sm"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          <ul className="mt-4 divide-y divide-base-200">
            {membershipList.data.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-base-200 text-sm font-semibold">
                    {member.publicUserData?.imageUrl &&
                    !member.publicUserData.imageUrl.includes("default") ? (
                      <img
                        src={member.publicUserData.imageUrl}
                        alt={getMemberName(member)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getMemberInitials(member)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getMemberName(member)}
                    </p>
                    <p className="text-xs text-base-content/50">
                      {member.publicUserData?.identifier}
                    </p>
                  </div>
                </div>
                <span className="badge badge-ghost badge-sm">
                  {member.role === "org:admin" ? "Admin" : "Membro"}
                </span>
              </li>
            ))}

            {membershipList.data.length === 0 && (
              <li className="py-6 text-center text-sm text-base-content/50">
                Nenhum membro encontrado.
              </li>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href={`/dashboard/organizations/${organizationId}/members`}
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/40 hover:shadow-md"
          >
            <Users size={18} className="text-primary" />
            <p className="mt-3 font-semibold">Gerenciar membros</p>
            <p className="text-sm text-base-content/60">
              Convide pessoas, altere papéis ou remova acessos.
            </p>
          </Link>

          <Link
            href={`/dashboard/organizations/${organizationId}/documents`}
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/40 hover:shadow-md"
          >
            <NotebookPen size={18} className="text-primary" />
            <p className="mt-3 font-semibold">Caderno da equipe</p>
            <p className="text-sm text-base-content/60">
              Crie documentos e anotações compartilhadas da organização.
            </p>
          </Link>

          <Link
            href={`/dashboard/organizations/${organizationId}/settings`}
            className="group rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/40 hover:shadow-md"
          >
            <Shield size={18} className="text-primary" />
            <p className="mt-3 font-semibold">Configurações</p>
            <p className="text-sm text-base-content/60">
              Atualize nome, identificador e logotipo da organização.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

type MemberPublicData = {
  publicUserData?: {
    firstName?: string | null;
    lastName?: string | null;
    identifier?: string;
  } | null;
};

function getMemberName(member: MemberPublicData) {
  const first = member.publicUserData?.firstName ?? "";
  const last = member.publicUserData?.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || member.publicUserData?.identifier || "Usuário";
}

function getMemberInitials(member: MemberPublicData) {
  const name = getMemberName(member);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase() || "??";
}

function formatDate(timestamp?: number | null) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}