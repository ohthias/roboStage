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
import { useAchievements } from "@/hooks/useAchievements";
import ModalConfirm, {
  ModalConfirmRef,
} from "@/components/ui/Modal/ModalConfirm";
import InnoLab from "./hashPages/InnoLab";
import ComingSoon from "@/components/ComingSoon";
import Logo from "@/components/ui/Logo";
import { ThemeController } from "@/components/ui/themeController";
import {
  Bell,
  Calendar1,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Plus,
} from "lucide-react";
import ProjectSection from "./hashPages/ProjectSection";
import TeamSpacePage from "./hashPages/TeamSpace";
import WorkspacePage from "./hashPages/WorkspacePage";

export default function Dashboard() {
  const { session, profile } = useUser();
  const router = useRouter();
  const logout = useLogout();

  const userId = profile?.id || session?.user?.id;
  const { achievements } = useAchievements(userId);

  const [activeSection, setActiveSection] = useHashSection("hub");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const modalLogoutRef = useRef<ModalConfirmRef>(null);

  const confirmLogout = () => {
    modalLogoutRef.current?.open("Tem certeza que deseja sair?", logout);
  };

  useEffect(() => {
    const last = localStorage.getItem("roboStage-last-section");
    if (last) setActiveSection(last);
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
            achievements={achievements}
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
      case "projects":
        return <ProjectSection />;
      case "workspace":
        return <WorkspacePage />;
      case "calibraBot":
        return <ComingSoon />;
      case "teamSpace":
        return <TeamSpacePage />;
      default:
        return <ComingSoon />;
    }
  };

  return (
    <div className="h-screen grid grid-rows-[64px_1fr] grid-cols-[auto_1fr] bg-base-200">
      {/* ================= Header ================= */}
      <header className="col-span-2 h-16 bg-base-100 border-b border-base-300 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <button
            className="lg:hidden btn btn-ghost btn-circle"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Desktop collapse */}
          <button
            className="hidden lg:flex btn btn-ghost btn-circle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button onClick={() => setActiveSection("hub")}>
            <Logo logoSize="md" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-soft btn-sm hidden md:flex"
            onClick={() => setActiveSection("projects")}
          >
            Meus Projetos
          </button>

          <button className="btn btn-soft btn-sm hidden md:flex gap-2">
            <Plus size={16} /> Criar
          </button>

          <button className="btn btn-ghost btn-circle btn-sm">
            <Calendar1 size={20} />
          </button>

          <button className="btn btn-ghost btn-circle btn-sm">
            <Bell size={20} />
          </button>

          <ThemeController />

          <div className="divider divider-horizontal mx-1" />

          <button
            onClick={confirmLogout}
            className="btn btn-error btn-soft btn-circle btn-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ================= Sidebar Desktop ================= */}
      <aside
        className={`
          hidden lg:block bg-base-100 border-r border-base-300
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        <Sidebar
          active={activeSection}
          setActive={setActiveSection}
          session={session}
          profile={profile || { avatar_url: undefined, username: undefined }}
          collapsed={collapsed}
        />
      </aside>

      {/* ================= Sidebar Mobile ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-base-100 shadow-xl animate-slide-in">
            <Sidebar
              active={activeSection}
              setActive={(section) => {
                setActiveSection(section);
                setMobileOpen(false);
              }}
              session={session}
              profile={profile || { avatar_url: undefined, username: undefined }}
              collapsed={false}
            />
          </aside>
        </div>
      )}

      {/* ================= Main ================= */}
      <main className="overflow-y-auto p-6">{renderSection()}</main>

      <ModalConfirm
        ref={modalLogoutRef}
        title="Confirmar Logout"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
      />
    </div>
  );
}