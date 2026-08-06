"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, NotebookPen, Settings, Users } from "lucide-react";

export function OrganizationTabs({
  organizationId,
}: {
  organizationId: string;
}) {
  const pathname = usePathname();
  const base = `/dashboard/organizations/${organizationId}`;

  const tabs = [
    { href: base, label: "Visão geral", icon: LayoutGrid, exact: true },
    { href: `${base}/members`, label: "Membros", icon: Users, exact: false },
    {
      href: `${base}/documents`,
      label: "Documentos",
      icon: NotebookPen,
      exact: false,
    },
    {
      href: `${base}/settings`,
      label: "Configurações",
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <div role="tablist" className="tabs tabs-boxed w-fit bg-base-200">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname?.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            className={["tab gap-2", isActive ? "tab-active" : ""].join(" ")}
          >
            <tab.icon size={15} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
