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
import ComingSoon from "@/components/ComingSoon";
import LabTestPage from "@/components/LabTestPage";

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="">
      <Navbar
        profile={profile}
        session={session}
        handleLogout={handleLogout}
        children={currentSectionContent()}
      />
    </div>
  );
}
