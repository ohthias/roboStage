"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import HeaderDashboard from "@/components/Dashboard/UI/Header";
import Sidebar from "@/components/Dashboard/UI/Sidebar";
import ModalConfirm from "@/components/UI/Modal/ModalConfirm";
import { NAV_ITEMS } from "@/app/(private)/dashboard/routes";
import { useAuth } from "@/hooks/useAuth";

interface LayoutShellProps {
  children: React.ReactNode;
  profile: {
    username: string;
    avatar_url: string | null;
    onboarding_completed: boolean;
  };
}

export default function LayoutShell({
  children,
  profile,
}: LayoutShellProps) {
  const pathname = usePathname();

  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const modalLogoutRef = useRef<{
    open: (message: string, onConfirm: () => void) => void;
  }>(null);

  const isWorkspaceRoute = useMemo(() => {
    return pathname.includes("/dashboard/workspace");
  }, [pathname]);

  const handleLogout = () => {
    modalLogoutRef.current?.open(
      "Tem certeza que deseja sair?",
      logout
    );
  };

  return (
    <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[64px_1fr] bg-base-200">
      <header className="col-span-2">
        <HeaderDashboard
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onLogout={handleLogout}
          onMobileMenu={() => setMobileSidebarOpen(true)}
        />
      </header>

      <aside>
        <Sidebar
          profile={profile}
          collapsed={collapsed}
          items={NAV_ITEMS}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </aside>

      <main
        className={`overflow-y-auto w-full ${
          isWorkspaceRoute ? "p-0" : "p-6"
        }`}
      >
        {children}
      </main>

      <ModalConfirm
        ref={modalLogoutRef}
        title="Confirmar Logout"
        confirmLabel="Sim"
        cancelLabel="Não"
      />
    </div>
  );
}