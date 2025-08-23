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
  const [currentSection, setCurrentSection] = useState<string>("hub");

  // Atualiza seção conforme hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setCurrentSection(hash);

    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      if (newHash) setCurrentSection(newHash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!loading && !session) {
      router.push("/join");
    }
  }, [loading, session, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/join");
  };

  // Conteúdo da seção atual
  const currentSectionContent = () => {
    switch (currentSection) {
      case "showLive":
        return <ShowLiveHub />;
      case "labTest":
        return <LabTestForm />;
      case "styleLab":
        return <StyleLab />;
      case "config":
        return <AccountSettings />;
      default:
        return <div>Bem-vindo ao Hub!</div>;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full p-4 gap-4 overflow-y-hidden">
      <Navbar
        profile={profile}
        session={session}
        handleLogout={handleLogout}
        className="flex-shrink-0 w-full md:max-w-[256px]"
      />

      <main className="flex-1 overflow-y-auto">
        {currentSectionContent()}
      </main>
    </div>
  );
}
