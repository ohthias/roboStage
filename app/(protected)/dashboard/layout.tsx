import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { NavLinks } from "./nav-links";
import Logo from "@/components/UI/Logo";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="drawer lg:drawer-open" data-theme="labtest">
      <input id="lt-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen bg-base-100">
        {/* Navbar */}
        <div className="navbar sticky top-0 z-20 border-b border-base-300 bg-base-100/95 px-4 backdrop-blur">
          <div className="flex-none lg:hidden">
            <label htmlFor="lt-drawer" aria-label="Abrir menu" className="btn btn-square btn-ghost">
              <Menu size={20} />
            </label>
          </div>

          <div className="ml-auto">
            <UserButton />
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-30">
        <label htmlFor="lt-drawer" aria-label="Fechar menu" className="drawer-overlay" />
        <aside className="min-h-full w-64 border-r border-base-300 bg-base-200 p-4">
          <Logo logoSize="sm" />
          <NavLinks />
        </aside>
      </div>
    </div>
  );
}