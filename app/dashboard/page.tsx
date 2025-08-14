"use client";

import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useEffect, useState } from "react";
import { ThemeController } from "@/components/ui/themeController";
import Loader from "@/components/loader";
import ShowLiveHub from "./showLiveHub";

export default function Dashboard() {
  const { session, profile, loading } = useUserProfile();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<string>("");

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/join");
  };

  // Se não estiver logado → redireciona
  useEffect(() => {
    if (!loading && !session) {
      router.push("/join");
    }
  }, [loading, session, router]);

  // Controle da seção via hash
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
        return <h1 className="text-xl font-bold">Configurações</h1>;
      default:
        return <ShowLiveHub />;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Menu lateral simples */}
      <nav className="w-full bg-base-200 p-4 flex flex-row max-h-80 items-center shadow-md">
        <h6 className="text-xl font-bold text-primary">
          Olá, {profile?.username || session?.user?.email || "visitante"}!
        </h6>
        <div className="ml-auto space-x-2">
          <ThemeController />
          <button onClick={() => setCurrentSection('hub')} style={{lineHeight: 0}} className="btn btn-dash btn-sm">
            <i className="fi fi-br-home"></i>
            Hub
          </button>
          <button onClick={() => setCurrentSection('config')} style={{lineHeight: 0}} className="btn btn-dash btn-sm">
            <i className="fi fi-br-settings"></i>
            Config.
          </button>
          <button onClick={handleLogout} style={{ lineHeight: 0 }} className="btn btn-dash btn-error btn-sm">
            <i className="fi fi-br-sign-out-alt"></i>Sair
          </button>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex gap-4 flex-col w-full flex-1 overflow-y-auto pt-4 px-4">
        {currentSectionContent()}
      </main>
    </div>
  );
}
