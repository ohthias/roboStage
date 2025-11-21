"use client";

import { useEffect, useState } from "react";
import ShowLiveHub from "./hashPages/showLiveHub";
import AccountSettings from "./hashPages/AccountSettings";
import { useUser } from "../../context/UserContext";
import { StyleLab } from "@/app/(private)/dashboard/hashPages/StyleLab";
import LabTestPage from "./hashPages/LabTestPage";
import HubHero from "@/components/ui/dashboard/HubHero";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/dashboard/Navbar";
import { useHashSection } from "@/hooks/useHashSection";

export default function Dashboard() {
  const { session, profile } = useUser();
  const router = useRouter();
  const [activeSection, setActiveSection] = useHashSection("hub");
  const [collapsed, setCollapsed] = useState(false);

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

  const logout = async () => {
    confirm("Tem certeza que deseja sair?") && (await supabase.auth.signOut());
    document.cookie = "sb-access-token=; path=/; max-age=0";
    document.cookie = "sb-refresh-token=; path=/; max-age=0";
    router.push("/auth/login");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "hub":
        return <HubHero />;
      case "showLive":
        return <ShowLiveHub />;
      case "labTest":
        return <LabTestPage />;
      case "styleLab":
        return <StyleLab />;
      case "profile":
        return <AccountSettings />;
      default:
        return <HubHero />;
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
          className={`flex-1 overflow-y-auto bg-base-200 p-6 transition-all duration-300 ease-in-out ${collapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"}`}
        >
          {renderSection()}
        </main>
      </div>

      <div className="drawer-side">
        <label htmlFor="app-drawer" className="drawer-overlay"></label>

        <Sidebar
          active={activeSection}
          setActive={setActiveSection}
          onLogout={logout}
          profile={profile}
          session={session}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>
    </div>
  );
}
