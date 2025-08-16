"use client";

import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import ShowLiveHub from "./showLiveHub";
import Navbar from "./component/Navbar";
import AccountSettings from "./AccountSettings";

export default function Dashboard() {
  const { session, profile, loading } = useUserProfile();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<string>("");

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/join");
  };

  useEffect(() => {
    if (!loading && !session) {
      router.push("/join");
    }
  }, [loading, session, router]);

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  const currentSectionContent = () => {
    switch (currentSection) {
      case "config":
        return <AccountSettings />;
      default:
        return <ShowLiveHub />;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Navbar profile={profile} session={session} handleLogout={handleLogout} />

      {/* Conteúdo principal */}
      <main className="flex gap-4 flex-col w-full flex-1 overflow-y-auto pt-4 px-4">
        {currentSectionContent()}
      </main>
    </div>
  );
}
