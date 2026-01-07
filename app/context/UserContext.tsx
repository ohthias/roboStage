"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
}

interface UserContextType {
  session: any;
  profile: Profile | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  session: null,
  profile: null,
  avatarUrl: null,
  bannerUrl: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= HELPERS ================= */

  const resolvePublicUrl = async (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const { data } = await supabase.storage
      .from("photos")
      .createSignedUrl(path, 300);

    return data?.signedUrl ?? null;
  };

  const applyProfile = async (data: Profile) => {
    setProfile(data);
    localStorage.setItem("userProfile", JSON.stringify(data));

    setAvatarUrl(await resolvePublicUrl(data.avatar_url));
    setBannerUrl(await resolvePublicUrl(data.banner_url));
  };

  /* ================= FETCH ================= */

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, banner_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setProfile(null);
      setAvatarUrl(null);
      setBannerUrl(null);
      localStorage.removeItem("userProfile");
      return;
    }

    await applyProfile(data);
  };

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        const cached = localStorage.getItem("userProfile");
        if (cached) {
          const parsed: Profile = JSON.parse(cached);
          await applyProfile(parsed);
        } else {
          await fetchProfile(data.session.user.id);
        }
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setLoading(true);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          setAvatarUrl(null);
          setBannerUrl(null);
          localStorage.removeItem("userProfile");
        }

        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        session,
        profile,
        avatarUrl,
        bannerUrl,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
