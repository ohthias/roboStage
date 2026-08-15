"use client";

import {
  Book,
  FlaskConical,
  Grid2X2,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const MAIN_LINKS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Visão geral",
    Icon: Home,
  },
  {
    href: "/dashboard/labtest",
    label: "LabTest",
    Icon: FlaskConical,
  },
  {
    href: "/dashboard/documents",
    label: "Caderno",
    Icon: Book,
  },
  {
    href: "/dashboard/projects",
    label: "Projetos",
    Icon: Grid2X2,
  },
];

const SYSTEM_LINKS: NavItem[] = [
  {
    href: "/dashboard/settings",
    label: "Configurações",
    Icon: Settings,
  },
];

function NavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active =
    item.href === "/dashboard"
      ? pathname === item.href
      : pathname === item.href ||
        pathname.startsWith(`${item.href}/`);

  const Icon = item.Icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`
          group relative flex h-10 items-center gap-3 rounded-lg
          px-3 text-sm font-medium
          transition-all duration-150
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary/40

          ${
            active
              ? "bg-primary/10 text-primary"
              : "text-base-content/60 hover:bg-base-300/60 hover:text-base-content"
          }
        `}
      >
        {/* Indicador ativo */}
        <span
          className={`
            absolute left-0 top-1/2 h-5 w-0.5
            -translate-y-1/2 rounded-full
            transition-all duration-200
            ${
              active
                ? "bg-primary opacity-100"
                : "bg-transparent opacity-0"
            }
          `}
        />

        <Icon
          className={`
            h-[18px] w-[18px] shrink-0
            transition-colors
            ${
              active
                ? "text-primary"
                : "text-base-content/45 group-hover:text-base-content/80"
            }
          `}
          strokeWidth={active ? 2.2 : 1.8}
        />

        <span className="truncate">{item.label}</span>

        {/* Indicador visual sutil */}
        {active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </Link>
    </li>
  );
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="flex flex-col gap-6"
    >
      {/* Principal */}
      <section>
        <div className="mb-2 px-3">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/35">
            Principal
          </span>
        </div>

        <ul className="flex flex-col gap-1">
          {MAIN_LINKS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
            />
          ))}
        </ul>
      </section>

      {/* Sistema */}
      <section>
        <div className="mb-2 px-3">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/35">
            Sistema
          </span>
        </div>

        <ul className="flex flex-col gap-1">
          {SYSTEM_LINKS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
            />
          ))}
        </ul>
      </section>
    </nav>
  );
}