"use client";

import { useLogout } from "@/hooks/useLogout";
import { useEffect, useState, useRef } from "react";
import ShowLiveHub from "./hashPages/showLiveHub";
import AccountSettings from "./hashPages/AccountSettings";
import { useUser } from "../../context/UserContext";
import { StyleLab } from "@/app/(private)/dashboard/hashPages/StyleLab";
import LabTestPage from "./hashPages/LabTestPage";
import HubHero from "@/components/ui/dashboard/HubHero";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/dashboard/Navbar";
import { useHashSection } from "@/hooks/useHashSection";
import ModalConfirm, { ModalConfirmRef } from "@/components/ui/Modal/ModalConfirm";
import InnoLab from "./hashPages/InnoLab";
import ComingSoon from "@/components/ComingSoon";

export default function Dashboard() {
  const { session, profile } = useUser();
  const router = useRouter();
  const logout = useLogout();
  const [activeSection, setActiveSection] = useHashSection("hub");
  const [collapsed, setCollapsed] = useState(false);
  const modalLogoutRef = useRef<ModalConfirmRef>(null);

  const confirmLogout = () => {
    modalLogoutRef.current?.open("Tem certeza que deseja sair?", logout);
  };

  useEffect(() => {
    const last = localStorage.getItem("roboStage-last-section");
    if (last) {
      setActiveSection(last);
    }
  }, [setActiveSection]);

  useEffect(() => {
    if (activeSection) {
      localStorage.setItem("roboStage-last-section", activeSection);
    }
  }, [activeSection]);

  useEffect(() => {
    if (session === null) {
      router.replace("/auth/login");
    }
  }, [session, router]);

  if (!session) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "hub":
        return (
          <HubHero
            session={session}
            username={
              profile?.username ||
              session?.user?.email?.split("@")[0] ||
              "Usuário"
            }
          />
        );
      case "showLive":
        return <ShowLiveHub />;
      case "labTest":
        return <LabTestPage />;
      case "styleLab":
        return <StyleLab />;
      case "innoLab":
        return <InnoLab />;
      case "profile":
        return <AccountSettings />;
      default:
        return <ComingSoon />;
    }
  };

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <label
          htmlFor="app-drawer"
          className="btn btn-ghost lg:hidden m-3 self-start"
        >
          <i className="fi fi-br-menu-burger text-xl"></i>
        </label>

        <main
          className={`flex-1 overflow-y-auto bg-base-200 p-6 transition-all duration-300 ease-in-out ${
            collapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          }`}
        >
          {renderSection()}
        </main>
      </div>

      <div className="drawer-side">
        <label htmlFor="app-drawer" className="drawer-overlay"></label>

        <Sidebar
          active={activeSection}
          setActive={setActiveSection}
          onLogout={confirmLogout}
          profile={profile}
          session={session}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>
      <ModalConfirm
        ref={modalLogoutRef}
        title="Confirmar Logout"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
