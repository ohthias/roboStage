import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { NavFooter, NavLinks } from "./nav-links";
import Logo from "@/components/UI/Logo";
import {
  CalendarDays,
  EllipsisVertical,
  FoldersIcon,
  Lock,
  Menu,
  PanelLeft,
  X,
} from "lucide-react";
import { ThemeController } from "@/components/UI/themeController";
import { SidebarSpaceSwitcher } from "@/components/stagebook/sidebar-space-switcher";
import { getPinsForScope } from "@/utils/stagebook/pins-core";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NotificationsBell } from "@/components/stagebook/notifications-bell";
import { resolveStagebookScope } from "@/utils/stagebook/scope";
import { listMyTeams, canCurrentUserCreateTeam } from "@/utils/stagebook/actions/teams";
import { listUnreadNotifications } from "@/utils/stagebook/actions/notifications";
import { getUserPreferences } from "@/utils/stagebook/actions/preferences";
import { LayoutPrefsProvider, SidebarPosition } from "@/components/stagebook/layout-prefs";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [scope, teams, notifications, canCreateTeam, prefs] = await Promise.all([
    resolveStagebookScope(),
    listMyTeams(),
    listUnreadNotifications(),
    canCurrentUserCreateTeam(),
    getUserPreferences(),
  ]);
  const activeTeamId = scope.type === "team" ? scope.teamId : null;
  const activeTeam = teams.find((t) => t.id === activeTeamId) ?? null;
  const [pins, me] = await Promise.all([
    getPinsForScope(scope).catch(() => []),
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, scope.userId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ]);

  return (
    <div
      className="drawer lg:drawer-open"
      data-theme="labtest"
      data-layout-locked={prefs.layoutLocked || undefined}
    >
      <input id="lt-drawer" type="checkbox" className="drawer-toggle" />
      <SidebarPosition expanded={prefs.sidebarExpanded} locked={prefs.layoutLocked} />

      <div className="drawer-content flex min-h-screen min-w-0 flex-col bg-base-100">
        {/* Navbar */}
        <div className="navbar sticky top-0 z-20 min-h-14 flex-nowrap gap-1 border-b border-base-300 bg-base-100/95 px-2 backdrop-blur sm:gap-2 sm:px-4">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="lt-drawer"
              aria-label="Abrir menu"
              className="btn btn-square btn-ghost btn-sm sm:btn-md"
            >
              <Menu size={20} />
            </label>
          </div>

          {/* Espaço ativo (no celular a troca fica no menu lateral). */}
          <label
            htmlFor="lt-drawer"
            className="min-w-0 cursor-pointer truncate px-2 text-sm font-medium text-base-content/70 lg:hidden"
          >
            {activeTeam ? activeTeam.name : "Espaço pessoal"}
          </label>

          <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
            {/* Atalhos visíveis a partir de sm */}
            <Link
              href="/dashboard/calendar"
              className="btn btn-ghost btn-sm btn-square hidden sm:inline-flex"
              title="Abrir seu calendário"
              aria-label="Calendário"
            >
              <CalendarDays size={18} />
            </Link>
            <Link
              href="/dashboard/folders"
              className="btn btn-ghost btn-sm btn-square hidden sm:inline-flex"
              title="Abrir suas pastas"
              aria-label="Pastas"
            >
              <FoldersIcon size={18} />
            </Link>

            {/* Atalhos agrupados no mobile */}
            <div className="dropdown dropdown-end shrink-0 sm:hidden">
              <div
                tabIndex={0}
                role="button"
                aria-label="Mais opções"
                className="btn btn-ghost btn-sm btn-square"
              >
                <EllipsisVertical size={18} />
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-50 mt-2 w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
              >
                <li>
                  <Link href="/dashboard/calendar">
                    <CalendarDays size={16} />
                    Calendário
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/folders">
                    <FoldersIcon size={16} />
                    Pastas
                  </Link>
                </li>
              </ul>
            </div>

            <div className="shrink-0">
              <NotificationsBell initialNotifications={notifications} />
            </div>
            <div className="shrink-0">
              <ThemeController />
            </div>
            <div className="flex shrink-0 items-center">
              <UserButton />
            </div>
          </div>
        </div>

        <main className="mx-auto w-full min-w-0 flex-1">
          <LayoutPrefsProvider
            value={{ locked: prefs.layoutLocked, sidebarExpanded: prefs.sidebarExpanded }}
          >
            {children}
          </LayoutPrefsProvider>
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-30 lg:is-drawer-close:overflow-visible">
        <label htmlFor="lt-drawer" aria-label="Fechar menu" className="drawer-overlay" />

        <aside className="flex h-full min-h-full w-72 max-w-[85vw] flex-col border-r border-base-300 bg-base-200 lg:max-w-none lg:is-drawer-close:w-14 lg:is-drawer-open:w-64">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-base-300 px-4 lg:is-drawer-close:justify-center lg:is-drawer-close:px-2 lg:is-drawer-open:px-5">
            <div className="lg:is-drawer-close:hidden">
              <Logo logoSize="sm" />
            </div>

            {/* Fechar (mobile) */}
            <label
              htmlFor="lt-drawer"
              aria-label="Fechar menu"
              className="btn btn-square btn-ghost btn-sm lg:hidden"
            >
              <X className="size-4" />
            </label>

            {/* Recolher/expandir (desktop) */}
            {prefs.layoutLocked ? (
              <span
                data-tip="Menu travado — altere em Configurações"
                className="hidden size-8 items-center justify-center text-base-content/35 lg:inline-flex lg:is-drawer-close:tooltip lg:is-drawer-close:tooltip-right"
              >
                <Lock className="size-3.5" aria-label="Menu travado" />
              </span>
            ) : (
              <label
                htmlFor="lt-drawer"
                aria-label="Recolher ou expandir menu"
                data-tip="Expandir menu"
                className="btn btn-square btn-ghost hidden transition-all duration-150 hover:bg-base-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:inline-flex lg:is-drawer-close:tooltip lg:is-drawer-close:tooltip-right"
              >
                <PanelLeft className="size-4" />
              </label>
            )}
          </div>

          {/* Troca de espaço (pessoal ↔ equipes) */}
          <div className="shrink-0 px-3 pt-3 lg:is-drawer-close:px-2">
            <SidebarSpaceSwitcher
              teams={teams.map((t) => ({ id: t.id, name: t.name, role: t.role }))}
              activeTeamId={activeTeamId}
              canCreateTeam={canCreateTeam}
              userName={me?.name ?? null}
            />
          </div>

          {/* Rola no mobile; overflow visível só no desktop recolhido (tooltips) */}
          <div className="w-full min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 lg:is-drawer-close:overflow-visible lg:is-drawer-close:px-2">
            <NavLinks pins={pins} />
          </div>

          {/* Rodapé: Configurações + Mais */}
          <div className="shrink-0 border-t border-base-300/70 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:is-drawer-close:px-2">
            <NavFooter />
          </div>
        </aside>
      </div>
    </div>
  );
}