"use client";

import { useEffect, useState } from "react";
import { authService } from "@/server/services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUser() {
    try {
      setLoading(true);

      const data = await authService.getCurrentUserWithProfile();

      setUser(data.user);
      setProfile(data.profile);

      return data;
    } catch (err: any) {
      setError(err.message);

      return null;
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);

      await authService.login(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);

      await authService.register(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword(email: string) {
    try {
      setLoading(true);
      setError(null);

      await authService.forgotPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(password: string) {
    try {
      setLoading(true);
      setError(null);

      await authService.resetPassword(password);
      alert("Senha alterada com sucesso!");
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding(data: {
    full_name: string;
    platform_goal: string;
    user_role: string;
  }) {
    await authService.completeOnboarding(data);

    await loadUser();
  }

  async function updateProfile(data: {
    username?: string;
    bio?: string;
    avatar_url?: string;
  }) {
    if (!user) return;

    await authService.updateProfile(user.id, data);

    await loadUser();
  }

  async function logout() {
    await authService.logout();

    window.location.href = "/auth/login";
  }

  useEffect(() => {
    const publicRoutes = [
      "/auth/login",
      "/auth/signup",
      "/auth/forgot-password",
      "/auth/reset",
    ];

    if (!publicRoutes.includes(window.location.pathname)) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    profile,
    loading,
    error,

    login,
    register,

    forgotPassword,
    resetPassword,

    completeOnboarding,
    updateProfile,
    logout,
  };
}