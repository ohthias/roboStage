"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Profile {
  username: string;
  id: string;
}

interface UserContextType {
  session: any;
  profile: Profile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  session: null,
  profile: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", userId)
      .single();

    if (!error && data) {
      localStorage.setItem("userProfile", JSON.stringify(data));
      setProfile(data);
    } else {
      setProfile(null);
      localStorage.removeItem("userProfile");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (sessionData.session?.user) {
        const cachedProfile = localStorage.getItem("userProfile");
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
        } else {
          await fetchProfile(sessionData.session.user.id);
        }
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const cachedProfile = localStorage.getItem("userProfile");
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
          } else {
            await fetchProfile(newSession.user.id);
          }
        } else {
          setProfile(null);
          localStorage.removeItem("userProfile");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ session, profile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
