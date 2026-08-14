"use client";

import { Book, Grid2X2, Home, Icon, PieChart, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Visão geral", Icon: Home },
  { href: "/dashboard/labtest", label: "LabTest", Icon: PieChart },
  { href: "/dashboard/documents", label: "Caderno", Icon: Book },
  { href: "/dashboard/projects", label: "Projetos", Icon: Grid2X2 },
  { href: "/dashboard/settings", label: "Configurações", Icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="menu gap-1 px-0 w-full">
      {LINKS.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        return (
          <li key={link.href} className="w-full">
            <Link
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-base-200 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                active
                  ? "bg-primary text-primary-content shadow-sm hover:bg-primary hover:text-primary-content"
                  : "text-base-content/80"
              }`}
            >
              <link.Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
