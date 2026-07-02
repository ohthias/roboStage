"use client";

import { useUser } from "@/app/context/UserContext";
import HubHero from "@/components/Dashboard/MainPage";

export default function DashboardPage() {
  const { auth, profile, loading } = useUser();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!auth || !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        Carregando sessão...
      </div>
    );
  }

  return <HubHero />;
}
