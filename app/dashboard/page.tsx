"use client";

import Loader from "@/components/loader";
import ShowLiveHub from "./showLiveHub";
import AccountSettings from "./AccountSettings";
import { useUser } from "../context/UserContext";
import { StyleLab } from "@/components/StyleLab";
import LabTestPage from "./LabTestPage";
import { logout } from "@/utils/logout";
import { useHashSection } from "@/hooks/useHashSection";
import Navbar from "@/components/ui/dashboard/Navbar";

export default function Dashboard() {
  const { session, profile } = useUser();
  const currentSection = useHashSection("hub");

  // Conteúdo da seção atual
  const currentSectionContent = () => {
    switch (currentSection) {
      case "hub":
        return (
            <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-8 bg-neutral rounded-box shadow-xl md:h-[calc(50vh-2rem)]">
            <div className="mb-4 md:mb-0 md:mr-8 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-content mb-2">Bem-vindo ao Hub!</h1>
              <p className="text-neutral-content text-base md:text-lg">Explore os recursos disponíveis e aproveite a experiência.</p>
            </div>
            <img
              src="/images/icons/DashboardBanner.png"
              alt="Banner do Hub"
              className="w-auto max-w-xs md:max-w-md h-auto md:h-full mb-4 md:mb-6"
            />
            </div>
        );
      case "showLive":
        return <ShowLiveHub />;
      case "labTest":
        return <LabTestPage />;
      case "styleLab":
        return <StyleLab />;
      case "config":
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
