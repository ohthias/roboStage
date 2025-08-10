"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Profile {
  username: string;
}

export function useUserProfile() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (sessionData.session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", sessionData.session.user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return { session, profile, loading };
}
