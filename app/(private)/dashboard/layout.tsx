"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/app/context/UserContext";
import HeaderDashboard from "@/components/Dashboard/UI/Header";
import Sidebar from "@/components/Dashboard/UI/Sidebar";
import { NAV_ITEMS } from "./routes";
import { useLogout } from "@/hooks/useLogout";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";
import '../../globals.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, profile, loading } = useUser();
  const router = useRouter();
  const logout = useLogout();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [WorkspacePathBool, setWorkspacePathBool] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    setWorkspacePathBool(path.includes("/dashboard/workspace"));
  }, []);

  const modalLogoutRef = useRef<ModalConfirmRef>(null);

  useEffect(() => {
    if (!loading && (!session || !profile)) {
      router.replace("/auth/login");
    }
  }, [loading, session, profile, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="h-screen flex items-center justify-center">
        Redirecionando...
      </div>
    );
  }

  const handleLogout = async () => {
    modalLogoutRef.current?.open("Tem certeza que deseja sair?", logout);
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

      <aside className="row-span-1">
        <Sidebar
          profile={profile}
          collapsed={collapsed}
          items={NAV_ITEMS}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => {setMobileSidebarOpen(false);}}
        />
      </aside>

      <main className={`overflow-y-auto w-full ${WorkspacePathBool ? "p-0" : "p-6 "}`}>{children}</main>

      <ModalConfirm
        ref={modalLogoutRef}
        title="Confirmar Logout"
        confirmLabel="Sim"
        cancelLabel="Não"
      />
    </div>
  );
}
