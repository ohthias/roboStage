// repositories/auth.repository.ts
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const authRepository = {
  async login(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async register(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  async forgotPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset`,
    });
  },

  async updatePassword(password: string) {
    return await supabase.auth.updateUser({
      password,
    });
  },

  async completeOnboarding(
    userId: string,
    data: {
      full_name: string;
      platform_goal: string;
      user_role: string;
    },
  ) {
    return await supabase
      .from("profiles")
      .update({
        ...data,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  },

  async getUser() {
    return await supabase.auth.getUser();
  },

  async getProfile(userId: string) {
    return await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
  },

  async updateProfile(
    userId: string,
    data: {
      username?: string;
      bio?: string;
      avatar_url?: string;
    },
  ) {
    return await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  },

  async logout() {
    return await supabase.auth.signOut();
  },
};