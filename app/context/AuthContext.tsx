"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "@/server/services/auth.service";

const AuthContext = createContext<any>(null);

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: any;
  initialProfile: any;
}) {
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialProfile);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);

      const data = await authService.getCurrentUserWithProfile();

      setUser(data.user);
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await authService.logout();
    window.location.href = "/auth/login";
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}