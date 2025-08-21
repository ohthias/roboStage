"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Profile {
  username: string;
}

export function useUserProfile() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
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
      } else {
        setProfile(null);
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

  return { session, profile, loading };
}
