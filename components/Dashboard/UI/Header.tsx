"use client";

import Logo from "@/components/UI/Logo";
import { ThemeController } from "@/components/UI/themeController";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";

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
  return (
    <header className="h-16 bg-base-100 border-b border-base-300 flex items-center px-3 sm:px-6 justify-between col-span-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          className="lg:hidden btn btn-ghost btn-circle"
          onClick={onMobileMenu}
        >
          <Menu size={20} />
        </button>

        <button
          className="hidden lg:flex btn btn-ghost btn-circle"
          onClick={onToggleSidebar}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        <Logo logoSize="md" />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">   
      <div className="hidden sm:block">
          <ThemeController />
        </div>

        <button
          onClick={onLogout}
          className="btn btn-error btn-soft btn-circle btn-sm"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
