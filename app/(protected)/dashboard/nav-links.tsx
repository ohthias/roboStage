"use client";

import {
  Book,
  Cuboid,
  Earth,
  FlaskConical,
  Home,
  KanbanSquare,
  Lightbulb,
  Newspaper,
  Settings,
  Tags,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { PinDTO } from "@/types/pins";
import { PinnedSection } from "@/components/stagebook/pinned-nav";

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const MAIN_LINKS: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", Icon: Home },
  { href: "/dashboard/team", label: "Equipe", Icon: Users },
  { href: "/dashboard/labtest", label: "LabTest", Icon: FlaskConical },
  { href: "/dashboard/quickbrick", label: "QuickBrick Studio", Icon: Cuboid },
  { href: "/dashboard/documents", label: "StageBook", Icon: Book },
  { href: "/dashboard/thinklab", label: "ThinkLab", Icon: Lightbulb },
  { href: "/dashboard/kanban", label: "Kanban", Icon: KanbanSquare },
];

const SYSTEM_LINKS: NavItem[] = [
  { href: "/dashboard/settings", label: "Configurações", Icon: Settings },
  { href: "/dashboard/leagues", label: "Ligas e Competições", Icon: Trophy },
  { href: "/dashboard/labels", label: "Tags e milestones", Icon: Tags },
  { href: "/news", label: "Notícias", Icon: Newspaper },
  { href: "/", label: "Voltar ao site", Icon: Earth },
];

const DRAWER_ID = "lt-drawer";
const DESKTOP_QUERY = "(min-width: 1024px)"; // breakpoint lg

/**
 * Fecha o drawer apenas no mobile. No desktop o checkbox controla
 * recolher/expandir a sidebar, então não mexemos nele.
 */
function closeDrawerOnMobile() {
  if (typeof window === "undefined") return;
  if (window.matchMedia(DESKTOP_QUERY).matches) return;

  const toggle = document.getElementById(DRAWER_ID) as HTMLInputElement | null;
  if (toggle?.checked) toggle.checked = false;
}

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
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const Icon = item.Icon;

  return (
    <li
      data-tip={item.label}
      className="lg:is-drawer-close:tooltip lg:is-drawer-close:tooltip-right lg:is-drawer-close:relative lg:is-drawer-close:z-50"
    >
      <Link
        href={item.href}
        onClick={closeDrawerOnMobile}
        aria-current={active ? "page" : undefined}
        className={`
          group relative flex h-11 items-center gap-3 rounded-lg
          px-3 text-sm font-medium lg:h-10
          lg:is-drawer-close:justify-center
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
            ${active ? "bg-primary opacity-100" : "bg-transparent opacity-0"}
          `}
        />

        <Icon
          className={`
            h-[18px] w-[18px] shrink-0 transition-colors
            ${
              active
                ? "text-primary"
                : "text-base-content/45 group-hover:text-base-content/80"
            }
          `}
          strokeWidth={active ? 2.2 : 1.8}
        />

        <span className="min-w-0 truncate lg:is-drawer-close:hidden">
          {item.label}
        </span>

        {active && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary lg:is-drawer-close:hidden" />
        )}
      </Link>
    </li>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <section>
      <div className="mb-2 px-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/35 lg:is-drawer-close:hidden">
          {title}
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </ul>
    </section>
  );
}

export function NavLinks({ pins = [] }: { pins?: PinDTO[] }) {
  const pathname = usePathname();

  // Garante que o drawer feche após qualquer navegação no mobile
  // (inclusive voltar/avançar do navegador).
  useEffect(() => {
    closeDrawerOnMobile();
  }, [pathname]);

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-6 py-4">
      <PinnedSection pins={pins} pathname={pathname} onNavigate={closeDrawerOnMobile} />
      <NavSection title="Principal" items={MAIN_LINKS} pathname={pathname} />
      <NavSection title="Sistema" items={SYSTEM_LINKS} pathname={pathname} />
    </nav>
  );
}