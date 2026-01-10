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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, profile, loading } = useUser();
  const router = useRouter();
  const logout = useLogout();

  const [collapsed, setCollapsed] = useState(false);
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

  const Logout = async () => {
    modalLogoutRef.current?.open("Tem certeza que deseja sair?", logout);
  };

  return (
    <div className="h-screen grid grid-rows-[64px_1fr] grid-cols-[auto_1fr] bg-base-200">
      <HeaderDashboard
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed((v) => !v)}
        onLogout={Logout}
        onMobileMenu={() => {}}
      />
      <Sidebar profile={profile} collapsed={collapsed} items={NAV_ITEMS} />
      <main className="p-6 overflow-y-auto">{children}</main>
      <ModalConfirm
        ref={modalLogoutRef}
        title="Confirmar Logout"
        confirmLabel="Sim"
        cancelLabel="Não"
      />
    </div>
  );
}