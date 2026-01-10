"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { RecentAccess } from "./RecentAccess";
import { QuickActions } from "./QuickActions";
import { DashboardStats } from "./DashboardStats";
import DashboardQuickActions from "./DashboardQuickActions";

type LastAccessItem = {
  resource_type: "test" | "event" | "document" | "style";
  resource_id: string;
  title: string;
  last_access: string;
};

interface HubHeroProps {
  session: any;
  username: string;
}

export default function HubHero({ session, username }: HubHeroProps) {
  const [lastAccess, setLastAccess] = useState<LastAccessItem[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [stats, setStats] = useState([
    { label: "Testes Criados", value: 0 },
    { label: "Documentos", value: 0 },
    { label: "Eventos Criados", value: 0 },
    { label: "Estilos Personalizados", value: 0 },
  ]);

  /**
   * Evita múltiplas queries em re-renderizações
   */
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (fetchedRef.current) return;

    fetchedRef.current = true;

    const fetchLastAccessedResources = async () => {
      const { data, error } = await supabase
        .from("user_last_access")
        .select("resource_type, resource_id, title, last_access")
        .eq("user_id", session.user.id)
        .order("last_access", { ascending: false })
        .limit(6);

      if (!error && data) {
        setLastAccess(data);
      }

      setLoadingAccess(false);
    };

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("user_activity_summary")
        .select("total_tests, total_documents, total_eventos, total_themes")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) {
        setStats([
          { label: "Testes Criados", value: data.total_tests },
          { label: "Documentos", value: data.total_documents },
          { label: "Eventos Criados", value: data.total_eventos },
          { label: "Estilos Personalizados", value: data.total_themes },
        ]);
      }
    };

    fetchStats();
    fetchLastAccessedResources();
  }, [session?.user?.id]);

  return (
    <div className="w-full min-h-screen bg-base-200">
      <header className="px-6 pt-4 space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo de volta, <span className="text-primary">{username}</span>
          </h1>

          <p className="text-sm text-base-content/60 max-w-xl">
            Retome suas atividades e acompanhe seus recursos recentes.
          </p>
        </div>
        <RecentAccess items={lastAccess} loading={loadingAccess} />
      </header>

      <div className="divider px-6" />

      {/* Conteúdo futuro */}
      <main className="grid grid-cols-1 lg:grid-cols-6 gap-6 px-6">
        <section className="lg:col-span-6 space-y-6">
          <DashboardStats stats={stats} />
          <DashboardQuickActions session={session} />
        </section>
      </main>

      {/* Footer */}
      <footer className="h-10 flex items-center justify-center border-t border-base-300 mt-6">
        <p className="text-base-content/50 text-sm">
          RoboStage © {new Date().getFullYear()} – v4.0.0
        </p>
      </footer>
    </div>
  );
}
