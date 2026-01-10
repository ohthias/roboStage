"use client";

import Logo from "@/components/UI/Logo";
import { ThemeController } from "@/components/UI/themeController";
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeaderDashboard({
  collapsed,
  onToggleSidebar,
  onLogout,
  onMobileMenu,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onMobileMenu: () => void;
}) {
  const router = useRouter();

  return (
    <header className="col-span-2 h-16 bg-base-100 border-b border-base-300 flex items-center px-6 justify-between">
      <div className="flex items-center gap-2">
        {/* Mobile menu */}
        <button
          className="lg:hidden btn btn-ghost btn-circle"
          onClick={onMobileMenu}
        >
          <Menu size={20} />
        </button>

        {/* Collapse desktop */}
        <button
          className="hidden lg:flex btn btn-ghost btn-circle"
          onClick={onToggleSidebar}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        <button onClick={() => router.push("/dashboard")}>
          <Logo logoSize="md" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 relative">
          <Search size={16} className="opacity-50 absolute transform -translate-y-1/2 left-3 top-1/2 z-10" />
          <input
            type="text"
            placeholder="Buscar..."
            className="input input-sm input-bordered rounded-full w-48 md:w-64 lg:w-80 pl-10"
          />
        </div>
        <button className="btn btn-ghost btn-circle btn-sm">
          <Bell size={20} />
        </button>

        <ThemeController />

        <button
          onClick={onLogout}
          className="btn btn-error btn-soft btn-circle btn-sm"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
