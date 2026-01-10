"use client";

import { useUser } from "@/app/context/UserContext";
import HubHero from "@/components/Dashboard/HubPage";

export default function DashboardPage() {
  const { session, profile } = useUser();

  if (!session || !profile) return null;

  return (
    <HubHero
      session={session}
      username={profile.username ?? "Usuário"}
    />
  );
}
