"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Dashboard/UI/Navbar";
import Logo from "@/components/UI/Logo";
import { ThemeController } from "@/components/UI/themeController";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/UI/Modal/ModalConfirm";
import {
  Bell,
  Calendar1,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useUser } from "@/app/context/UserContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, profile } = useUser();
  const router = useRouter();
  const logout = useLogout();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const modalLogoutRef = useRef<ModalConfirmRef>(null);

  useEffect(() => {
    if (session === null) {
      router.replace("/auth/login");
    }
  }, [session, router]);

  if (!session) return null;

  return (
    <div className="h-screen grid grid-rows-[64px_1fr] grid-cols-[auto_1fr] bg-base-200">
      <header className="col-span-2 h-16 bg-base-100 border-b border-base-300 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden btn btn-ghost btn-circle"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <button
            className="hidden lg:flex btn btn-ghost btn-circle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>

          <button onClick={() => router.push("/dashboard")}>
            <Logo logoSize="md" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm hidden md:inline-flex btn-soft"
            onClick={() => router.push("/dashboard/projects")}
          >
            Meus Projetos
          </button>
          <button className="btn btn-ghost btn-circle btn-sm">
            <Bell size={20} />
          </button>

          <ThemeController />

          <button
            onClick={() =>
              modalLogoutRef.current?.open(
                "Tem certeza que deseja sair?",
                logout
              )
            }
            className="btn btn-error btn-soft btn-circle btn-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={`hidden lg:block bg-base-100 border-r border-base-300 transition-all ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          collapsed={collapsed}
          session={session}
          profile={profile || {}}
        />
      </aside>

      {/* Sidebar Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-base-100 shadow-xl border-r border-base-300 animate-slide-in">
            <Sidebar
              collapsed={false}
              session={session}
              profile={profile || {}}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="overflow-y-auto p-4 sm:p-6">{children}</main>

      <ModalConfirm
        ref={modalLogoutRef}
        title="Confirmar Logout"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
