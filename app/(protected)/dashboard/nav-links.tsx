"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/labtest", label: "LabTest" },
  { href: "/dashboard/notebook", label: "Caderno" },
  { href: "/dashboard/leagues", label: "Ligas" },
  { href: "/dashboard/settings", label: "Configurações" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="menu gap-1 px-0">
      {LINKS.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        return (
          <li key={link.href}>
            <Link href={link.href} className={active ? "active" : ""}>
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
