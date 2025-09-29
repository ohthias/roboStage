"use client";

import ShowLiveHub from "./hashPages/showLiveHub";
import AccountSettings from "./hashPages/AccountSettings";
import { useUser } from "../../context/UserContext";
import { StyleLab } from "@/app/(private)/dashboard/hashPages/StyleLab";
import LabTestPage from "./hashPages/LabTestPage";
import { useHashSection } from "@/hooks/useHashSection";
import Navbar from "@/components/ui/dashboard/Navbar";
import HubHero from "@/components/ui/dashboard/HubHero";
import TimerPage from "./hashPages/TimerPage";
import BrainShotPage from "./hashPages/BrainShot";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import InnoLab from "./hashPages/InnoLab";

export default function Dashboard() {
  const { session, profile } = useUser();
  const currentSection = useHashSection("hub");

  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Conteúdo da seção atual
  const currentSectionContent = () => {
    switch (currentSection) {
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
      case "timer":
        return <TimerPage />;
      case "brainShot":
        return <BrainShotPage />;
      case "innoLab":
        return <InnoLab />;
      default:
        return <HubHero />;
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
