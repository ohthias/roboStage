"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  bio: string | null;
  platform_goal: string | null;
  user_role: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
  tags: string[];
  followersCount: number;
  followingCount: number;
  documentsCount?: number;
  foldersCount?: number;
  teamsCount?: number;
  testsCount?: number;
}

interface UserContextType {
  session: any;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
}

const UserContext = createContext<UserContextType>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  clearProfile: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = (data: Profile) => {
    setProfile(data);
    localStorage.setItem("userProfile", JSON.stringify(data));
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem("userProfile");
  };

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) throw profileError;

      const { data: tagsData } = await supabase.from("user_tags").select("tag").eq("user_id", userId);
      const tags = tagsData?.map((tag) => tag.tag) ?? [];

      const { count: followersCount } = await supabase
        .from("user_followers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: followingCount } = await supabase
        .from("user_followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      const { count: documentsCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: foldersCount } = await supabase
        .from("folders")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId);

      const { count: testsCount } = await supabase
        .from("tests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: teamsCount } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const aggregatedProfile: Profile = {
        ...profileData,
        tags,
        followersCount: followersCount ?? 0,
        followingCount: followingCount ?? 0,
        documentsCount: documentsCount ?? 0,
        foldersCount: foldersCount ?? 0,
        testsCount: testsCount ?? 0,
        teamsCount: teamsCount ?? 0,
      };

      applyProfile(aggregatedProfile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      clearProfile();
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await fetchProfile(session.user.id);
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          const cached = localStorage.getItem("userProfile");
          if (cached) {
            try {
              applyProfile(JSON.parse(cached));
            } catch {
              await fetchProfile(session.user.id);
            }
          } else {
            await fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) await fetchProfile(newSession.user.id);
      else clearProfile();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{ session, profile, loading, refreshProfile, clearProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
