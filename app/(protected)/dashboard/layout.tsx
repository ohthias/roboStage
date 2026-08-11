import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { NavLinks } from "./nav-links";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="drawer lg:drawer-open" data-theme="labtest">
      <input id="lt-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen bg-base-100">
        {/* Navbar */}
        <div className="navbar sticky top-0 z-20 border-b border-base-300 bg-base-100/95 px-4 backdrop-blur">
          <div className="flex-none lg:hidden">
            <label htmlFor="lt-drawer" aria-label="Abrir menu" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>

          <div className="flex-1">
            <span className="flex items-center gap-2 font-mono text-sm tracking-widest text-base-content/60">
              <span className="h-1.5 w-1.5 rounded-full bg-warning shadow-[0_0_8px_1px_theme(colors.warning)]" />
              LABTEST
            </span>
          </div>

          <div className="flex-none">
            <UserButton />
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-30">
        <label htmlFor="lt-drawer" aria-label="Fechar menu" className="drawer-overlay" />
        <aside className="min-h-full w-64 border-r border-base-300 bg-base-200 p-4">
          <div className="flex items-center gap-2 px-2 pb-6">
            <span className="h-2 w-2 rounded-full bg-warning shadow-[0_0_8px_1px_theme(colors.warning)]" />
            <span className="font-bold tracking-tight">LabTest</span>
          </div>
          <NavLinks />
        </aside>
      </div>
    </div>
  );
}