import Link from "next/link";
import { Building2, Users, Settings } from "lucide-react";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const tabs = [
    {
      name: "Visão Geral",
      href: `/dashboard/organizations/${organizationId}`,
      icon: Building2,
    },
    {
      name: "Membros",
      href: `/dashboard/organizations/${organizationId}/members`,
      icon: Users,
    },
    {
      name: "Configurações",
      href: `/dashboard/organizations/${organizationId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-base-300">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                <Icon size={17} />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
