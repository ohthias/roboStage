"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import { useEffect, useState } from "react";
import DashboardNavigation from "@/components/dashboardNavgation";
import DashboardHubPage from "./subpages/dashboardHub";
import ShowLiveHub from "./subpages/showLiveHub";
import ProfilePage from "./subpages/profile";
import SettingsPage from "./subpages/settings";

export default function Dashboard() {
  const { session, profile, loading } = useUserProfile();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<string>("");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    setCurrentSection(hash);

    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      setCurrentSection(newHash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  if (loading) return <p>Carregando...</p>;

  const currentSectionContent = () => {
    switch (currentSection) {
      case "showLive":
        return <ShowLiveHub />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardHubPage profile={profile} session={session} />;
    }
  };

  return (
    <div className="p-4 flex gap-4 overflow-y-hidden">
      <DashboardNavigation handleLogout={handleLogout} />
      <main className="flex gap-4 flex-col w-full flex-1 overflow-y-auto">
          {currentSectionContent()}
      </main>
    </div>
  );
}