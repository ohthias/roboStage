import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { NavLinks } from "./nav-links";
import Logo from "@/components/UI/Logo";
import { CalendarDays, FoldersIcon, Lock, Menu, PanelLeft } from "lucide-react";
import { ThemeController } from "@/components/UI/themeController";
import { ScopeSwitcher } from "@/components/stagebook/scope-switcher";
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

  return (
    <div className="drawer lg:drawer-open" data-theme="labtest" data-layout-locked={prefs.layoutLocked || undefined}>
      <input id="lt-drawer" type="checkbox" className="drawer-toggle" />
      <SidebarPosition expanded={prefs.sidebarExpanded} locked={prefs.layoutLocked} />

      <div className="drawer-content flex flex-col min-h-screen bg-base-100">
        {/* Navbar */}
        <div className="navbar sticky top-0 z-20 border-b border-base-300 bg-base-100/95 px-4 backdrop-blur">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="lt-drawer"
              aria-label="Abrir menu"
              className="btn btn-square btn-ghost"
            >
              <Menu size={20} />
            </label>
          </div>

          <div className="px-4 text-sm font-medium text-base-content/70 lg:hidden">
            RoboStage
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ScopeSwitcher teams={teams} activeTeamId={activeTeamId} canCreateTeam={canCreateTeam} />
            <Link href="/dashboard/calendar" className="btn btn-ghost btn-sm btn-square relative" title="Abrir seu calendário">
              <CalendarDays size={18} />
            </Link>
            <Link href="/dashboard/folders" className="btn btn-ghost btn-sm btn-square relative" title="Abrir suas pastas">
              <FoldersIcon size={18} />
            </Link>
            <NotificationsBell initialNotifications={notifications} />
            <ThemeController />
            <UserButton />
          </div>
        </div>

        <main className="mx-auto w-full flex-1">
          <LayoutPrefsProvider value={{ locked: prefs.layoutLocked, sidebarExpanded: prefs.sidebarExpanded }}>
            {children}
          </LayoutPrefsProvider>
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-30 is-drawer-close:overflow-visible">
        <label
          htmlFor="lt-drawer"
          aria-label="Fechar menu"
          className="drawer-overlay"
        />

        <aside className="flex min-h-full flex-col border-r border-base-300 bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
          <div className="flex h-16 shrink-0 items-center border-b border-base-300 is-drawer-close:justify-center is-drawer-open:justify-between is-drawer-close:px-2 is-drawer-open:px-5">
            <div className="is-drawer-close:hidden">
              <Logo logoSize="sm" />
            </div>

            {prefs.layoutLocked ? (
              <span
                data-tip="Menu travado — altere em Configurações"
                className="hidden size-8 items-center justify-center text-base-content/35 lg:inline-flex is-drawer-close:tooltip is-drawer-close:tooltip-right"
              >
                <Lock className="size-3.5" aria-label="Menu travado" />
              </span>
            ) : (
              <label
                htmlFor="lt-drawer"
                aria-label="Recolher ou expandir menu"
                data-tip="Expandir menu"
                className="btn btn-square btn-ghost hidden lg:inline-flex is-drawer-close:tooltip is-drawer-close:tooltip-right transition-all duration-150 hover:bg-base-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <PanelLeft className="size-4" />
              </label>
            )}
          </div>

          <div className="flex-1 overflow-visible is-drawer-close:px-2 is-drawer-open:px-3 w-full">
            <NavLinks />
          </div>
        </aside>
      </div>
    </div>
  );
}
