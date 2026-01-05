'use client';
import { useUser } from "@/app/context/UserContext";
import HubHero from "@/components/Dashboard/HubPage";
import { useAchievements } from "@/hooks/useAchievements";

export default function DashboardPage() {
  const { session, profile } = useUser();
  const username = profile?.username || "User";
  const { achievements } = useAchievements(profile?.id || "");
  
  return <HubHero session={session} username={username} key={username} achievements={achievements} />;
}