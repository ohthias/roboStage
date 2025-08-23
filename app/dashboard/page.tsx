"use client";

import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import ShowLiveHub from "./showLiveHub";
import Navbar from "./component/Navbar";
import AccountSettings from "./AccountSettings";
import { useUser } from "../context/UserContext";
import { StyleLab } from "@/components/StyleLab";
import LabTestForm from "@/components/LabTestForm";

export default function Dashboard() {
  const { session, profile, loading } = useUser();
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


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  const currentSectionContent = () => {
    switch (currentSection) {
      case "showLive":
        return <ShowLiveHub />;
      case "labTest":
        return <div>
          <LabTestForm /> 
        </div>;
      case "styleLab":
        return <StyleLab />;
      case "config":
        return <AccountSettings />;
      default:
        return <></>;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <Navbar profile={profile} session={session} handleLogout={handleLogout} />

      {/* Conteúdo principal */}
      <main className="flex gap-4 flex-col w-full flex-1 overflow-y-auto pt-4">
        {currentSectionContent()}
      </main>
    </div>
  );
}
