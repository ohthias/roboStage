"use client";

import ShowLiveHub from "./hashPages/showLiveHub";
import AccountSettings from "./hashPages/AccountSettings";
import { useUser } from "../context/UserContext";
import { StyleLab } from "@/app/dashboard/hashPages/StyleLab";
import LabTestPage from "./hashPages/LabTestPage";
import { logout } from "@/utils/logout";
import { useHashSection } from "@/hooks/useHashSection";
import Navbar from "@/components/ui/dashboard/Navbar";
import HubHero from "@/components/ui/dashboard/HubHero";

export default function Dashboard() {
  const { session, profile } = useUser();
  const currentSection = useHashSection("hub");

  // Conteúdo da seção atual
  const currentSectionContent = () => {
    switch (currentSection) {
      case "hub":
        return <HubHero />
      case "showLive":
        return <ShowLiveHub />;
      case "labTest":
        return <LabTestPage />;
      case "styleLab":
        return <StyleLab />;
      case "profile":
        return <AccountSettings />;
    }
  };

  return (
    <div className="">
      <Navbar
        profile={profile}
        session={session}
        handleLogout={logout}
        children={currentSectionContent()}
      />
    </div>
  );
}
