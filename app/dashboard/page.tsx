"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useEffect, useState } from "react";
import { ThemeController } from "@/components/ui/themeController";

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

  if (loading) return <p className="p-4">Carregando...</p>;

  const currentSectionContent = () => {
    switch (currentSection) {
      case "perfil":
        return <h1 className="text-xl font-bold">Perfil</h1>;
      case "config":
        return <h1 className="text-xl font-bold">Configurações</h1>;
      default:
        return (
          <>
            <h1 className="text-xl font-bold">
              Olá, {profile?.username || session?.user?.email || "visitante"}!
            </h1>
            <a href="/showlive">Showlive</a>
          </>
        );
    }
  };

  return (
    <div className="flex gap-4 overflow-y-hidden">
      {/* Menu lateral simples */}
      <aside className="w-32 bg-base-200 p-4 flex flex-col gap-2 h-screen">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => (window.location.hash = "hub")}
        >
          Hub
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => (window.location.hash = "perfil")}
        >
          Perfil
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => (window.location.hash = "config")}
        >
          Configurações
        </button>
        <div className="mt-auto">
          <ThemeController />
          <button
            className="btn btn-error btn-sm w-full"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex gap-4 flex-col w-full flex-1 overflow-y-auto pt-4 px-4">
        {currentSectionContent()}
      </main>
    </div>
  );
}
