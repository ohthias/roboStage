// repositories/auth.repository.ts
import { createClient } from "@/utils/supabase/client";
import { validateEmail, validatePassword, validateUUID, validateNonEmptyString } from "@/utils/validation";

const supabase = createClient();

// Explicit column selection to avoid exposing sensitive fields
const PROFILE_SAFE_COLUMNS = `
  id,
  full_name,
  username,
  bio,
  avatar_url,
  platform_goal,
  user_role,
  onboarding_completed,
  created_at,
  updated_at
`;

export const authRepository = {
  async login(email: string, password: string) {
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    return await supabase.auth.signInWithPassword({
      email: validEmail,
      password: validPassword,
    });
  },

  async register(email: string, password: string) {
    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    return await supabase.auth.signUp({
      email: validEmail,
      password: validPassword,
    });
  },

  async forgotPassword(email: string) {
    const validEmail = validateEmail(email);

    return await supabase.auth.resetPasswordForEmail(validEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset`,
    });
  },

  async updatePassword(password: string) {
    const validPassword = validatePassword(password);

    return await supabase.auth.updateUser({
      password: validPassword,
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
    const validUserId = validateUUID(userId, "userId");
    const validFullName = validateNonEmptyString(data.full_name, "full_name", 255);

    return await supabase
      .from("profiles")
      .update({
        full_name: validFullName,
        platform_goal: data.platform_goal,
        user_role: data.user_role,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validUserId)
      .select(PROFILE_SAFE_COLUMNS)
      .single();
  },

  async getUser() {
    return await supabase.auth.getUser();
  },

  async getProfile(userId: string) {
    const validUserId = validateUUID(userId, "userId");

    return await supabase
      .from("profiles")
      .select(PROFILE_SAFE_COLUMNS)
      .eq("id", validUserId)
      .single();
  },

  async updateProfile(
    userId: string,
    data: Partial<{
      username: string;
      bio: string;
      avatar_url: string;
    }>,
  ) {
    const validUserId = validateUUID(userId, "userId");

    return await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validUserId)
      .select(PROFILE_SAFE_COLUMNS)
      .single();
  },

  async logout() {
    return await supabase.auth.signOut();
  },
};
