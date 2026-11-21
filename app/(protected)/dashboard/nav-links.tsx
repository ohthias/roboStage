"use client";

import {
  Book,
  Cuboid,
  Earth,
  Ellipsis,
  FlaskConical,
  Home,
  KanbanSquare,
  Lightbulb,
  LogOut,
  Newspaper,
  Radio,
  Settings,
  Tags,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { PinDTO } from "@/types/pins";
import { PinnedSection } from "@/components/stagebook/pinned-nav";

type NavItem = { href: string; label: string; Icon: LucideIcon };

/** Ferramentas: o que se usa todo dia. */
const TOOL_LINKS: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", Icon: Home },
  { href: "/dashboard/team", label: "Equipe", Icon: Users },
  { href: "/dashboard/labtest", label: "LabTest", Icon: FlaskConical },
  { href: "/dashboard/quickbrick", label: "QuickBrick", Icon: Cuboid },
  { href: "/dashboard/documents", label: "StageBook", Icon: Book },
  { href: "/dashboard/thinklab", label: "ThinkLab", Icon: Lightbulb },
  { href: "/dashboard/kanban", label: "Kanban", Icon: KanbanSquare },
  { href: "/dashboard/showlive", label: "ShowLive", Icon: Radio },
];

/** Raramente usados: ficam atrás do "Mais", no rodapé. */
const MORE_LINKS: NavItem[] = [
  { href: "/dashboard/leagues", label: "Ligas e competições", Icon: Trophy },
  { href: "/dashboard/labels", label: "Tags e marcos", Icon: Tags },
  { href: "/news", label: "Notícias", Icon: Newspaper },
  { href: "/", label: "Voltar ao site", Icon: Earth },
];

const SETTINGS: NavItem = {
  href: "/dashboard/settings",
  label: "Configurações",
  Icon: Settings,
};

const DRAWER_ID = "lt-drawer";
const DESKTOP_QUERY = "(min-width: 1024px)"; // breakpoint lg

/**
 * Fecha o drawer apenas no mobile. No desktop o checkbox controla
 * recolher/expandir a sidebar, então não mexemos nele.
 */
export function closeDrawerOnMobile() {
  if (typeof window === "undefined") return;
  if (window.matchMedia(DESKTOP_QUERY).matches) return;
  const toggle = document.getElementById(DRAWER_ID) as HTMLInputElement | null;
  if (toggle?.checked) toggle.checked = false;
}

const isActive = (href: string, pathname: string) =>
  href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Linha da barra. Expandida: ícone + rótulo. Recolhida: só o ícone,
 * centralizado. O rótulo vai em `data-tip` e é exibido pelo
 * <SidebarTooltips /> (tooltip flutuante, não cortado pela rolagem).
 */
export const ROW =
  "group relative flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:is-drawer-close:justify-center lg:is-drawer-close:px-0";

function NavRow({
  item,
  pathname,
  className = "",
}: {
  item: NavItem;
  pathname: string;
  className?: string;
}) {
  const active = isActive(item.href, pathname);
  const { Icon } = item;
  return (
    <li data-tip={item.label} className={className}>
      <Link
        href={item.href}
        onClick={closeDrawerOnMobile}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        className={`${ROW} ${
          active
            ? "bg-base-100 font-semibold text-base-content shadow-sm"
            : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content"
        }`}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute -left-3 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary lg:is-drawer-close:-left-2"
          />
        )}
        <Icon
          className={`size-[18px] shrink-0 ${active ? "text-primary" : "text-base-content/45 group-hover:text-base-content/80"}`}
          strokeWidth={active ? 2.2 : 1.8}
        />
        <span className="min-w-0 truncate lg:is-drawer-close:hidden">
          {item.label}
        </span>
      </Link>
    </li>
  );
}

/** Corpo da barra: ferramentas e fixados. */
export function NavLinks({
  pins = [],
  showliveUrl = null,
}: {
  pins?: PinDTO[];
  showliveUrl?: string | null;
}) {
  const pathname = usePathname();

  // Fecha o drawer após qualquer navegação no mobile (inclusive voltar/avançar).
  useEffect(() => {
    closeDrawerOnMobile();
  }, [pathname]);

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-4 py-3">
      <ul className="flex flex-col gap-0.5">
        {TOOL_LINKS.map((item) => (
          <NavRow key={item.href} item={item} pathname={pathname} />
        ))}
        {showliveUrl && (
          <li data-tip="ShowLive">
            <a
              href={showliveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ShowLive (abre em nova aba)"
              className={`${ROW} text-base-content/60 hover:bg-base-300/50 hover:text-base-content`}
            >
              <Radio
                className="size-[18px] shrink-0 text-base-content/45 group-hover:text-primary"
                strokeWidth={1.8}
              />
              <span className="min-w-0 truncate lg:is-drawer-close:hidden">
                ShowLive
              </span>
              <span className="badge badge-primary badge-soft badge-xs ml-auto lg:is-drawer-close:hidden">
                ao vivo
              </span>
            </a>
          </li>
        )}
      </ul>
      <PinnedSection
        pins={pins}
        pathname={pathname}
        onNavigate={closeDrawerOnMobile}
      />
    </nav>
  );
}

function closeMenus() {
  (document.activeElement as HTMLElement | null)?.blur();
}

/** Rodapé fixo: Configurações + "Mais" (ligas, tags, notícias, site). */
export function NavFooter() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const moreActive = MORE_LINKS.some(
    (l) => l.href !== "/" && isActive(l.href, pathname),
  );

  return (
    <ul className="flex flex-col gap-0.5 lg:is-drawer-open:flex-row lg:is-drawer-open:items-center">
      <NavRow
        item={SETTINGS}
        pathname={pathname}
        className="lg:is-drawer-open:flex-1"
      />
      <li data-tip="Mais">
        <div className="dropdown dropdown-top dropdown-end w-full lg:is-drawer-close:dropdown-right lg:is-drawer-close:dropdown-end">
          <div
            tabIndex={0}
            role="button"
            aria-label="Mais opções"
            className={`${ROW} lg:is-drawer-open:w-9 lg:is-drawer-open:justify-center lg:is-drawer-open:px-0 ${
              moreActive
                ? "text-primary"
                : "text-base-content/55 hover:bg-base-300/50 hover:text-base-content"
            }`}
          >
            <Ellipsis className="size-[18px] shrink-0" />
            <span className="lg:hidden">Mais</span>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-50 mb-2 w-56 rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl lg:is-drawer-close:bottom-0 lg:is-drawer-close:left-full lg:is-drawer-close:top-auto lg:is-drawer-close:m-0 lg:is-drawer-close:ml-4"
          >
            {MORE_LINKS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => {
                    closeMenus();
                    closeDrawerOnMobile();
                  }}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-base-200 ${
                    href !== "/" && isActive(href, pathname)
                      ? "font-semibold text-primary"
                      : "text-base-content/75"
                  }`}
                >
                  <Icon className="size-4 shrink-0 opacity-70" />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  closeDrawerOnMobile();
                  void signOut({ redirectUrl: "/" });
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-base-content/75 hover:bg-base-200"
              >
                <LogOut className="size-4 shrink-0 opacity-70" />
                Sair da conta
              </button>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  );
}
