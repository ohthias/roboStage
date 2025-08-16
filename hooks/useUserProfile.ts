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
      setProfile(data);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (sessionData.session?.user) {
        await fetchProfile(sessionData.session.user.id);
      }

      setLoading(false);
    };

    init();

    // Escuta mudanças na sessão
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, profile, loading };
}
