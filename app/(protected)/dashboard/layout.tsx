import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { NavLinks } from "./nav-links";
import Logo from "@/components/UI/Logo";
import { Menu, PanelLeft } from "lucide-react";
import { ThemeController } from "@/components/UI/themeController";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="drawer lg:drawer-open" data-theme="labtest">
      <input id="lt-drawer" type="checkbox" className="drawer-toggle" />

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
            <ThemeController />
            <UserButton />
          </div>
        </div>

        <main className="mx-auto w-full flex-1">{children}</main>
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

            <label
              htmlFor="lt-drawer"
              aria-label="Recolher ou expandir menu"
              data-tip="Expandir menu"
              className="btn btn-square btn-ghost hidden lg:inline-flex is-drawer-close:tooltip is-drawer-close:tooltip-right transition-all duration-150 hover:bg-base-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PanelLeft className="size-4" />
            </label>
          </div>

          <div className="flex-1 overflow-visible is-drawer-close:px-2 is-drawer-open:px-3 w-full">
            <NavLinks />
          </div>
        </aside>
      </div>
    </div>
  );
}
