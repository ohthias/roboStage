"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, useRef
} from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface AuthMeta {
  userId: string;
  isAuthenticated: true;
}

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

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    app_metadata: Record<string, any>;
    user_metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
}

interface UserContextType {
  auth: AuthMeta | null;         // ✅ sem tokens
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  auth: null,
  profile: null,
  loading: true,
  session: null,
  refreshProfile: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthMeta | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false); // evita race condition

  const clearState = useCallback(() => {
    setAuth(null);
    setProfile(null);
    // ✅ Nunca persiste nada em localStorage
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .rpc("get_user_profile", { p_user_id: userId });

      if (error || !data) throw error ?? new Error("Profile not found");

      setAuth({ userId, isAuthenticated: true });
      setProfile(data as Profile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      clearState();
    } finally {
      fetchingRef.current = false;
    }
  }, [clearState]);

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

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          clearState();
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile, clearState]);

  return (
    <UserContext.Provider value={{ auth, profile, session, loading, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);