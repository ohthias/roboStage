"use client";

import { useUser } from "@/app/context/UserContext";
import HubHero from "@/components/Dashboard/HubPage";

export default function DashboardPage() {
  const { session, profile, loading } = useUser();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        Carregando sessão...
      </div>
    );
  }

  return (
    <HubHero
      session={session}
      username={profile.username ?? "Usuário"}
    />
  );
}