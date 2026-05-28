// auth.service.ts
import { authRepository } from "@/repositories/auth.repository";

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await authRepository.login(email, password);

    if (error) {
      throw error;
    }

    return data;
  },

  async register(email: string, password: string) {
    const { data, error } = await authRepository.register(email, password);

    if (error) {
      throw error;
    }

    return data;
  },

  async forgotPassword(email: string) {
    const { data, error } = await authRepository.forgotPassword(email);

    if (error) {
      throw error;
    }

    return data;
  },

  async resetPassword(password: string) {
    const { data, error } = await authRepository.updatePassword(password);

    if (error) {
      throw error;
    }

    return data;
  },

  async getCurrentUserWithProfile() {
    const {
      data: { user },
      error,
    } = await authRepository.getUser();

    if (error || !user) {
      return {
        user: null,
        profile: null,
      };
    }

    const { data: profile } = await authRepository.getProfile(user.id);

    return {
      user,
      profile,
    };
  },

  async updateProfile(
    userId: string,
    data: {
      username?: string;
      bio?: string;
      avatar_url?: string;
    },
  ) {
    if (data.username && data.username.length < 3) {
      throw new Error("Username muito curto");
    }

    if (data.bio && data.bio.length > 160) {
      throw new Error("Bio muito longa");
    }

    const { data: profile, error } = await authRepository.updateProfile(
      userId,
      data,
    );

    if (error) {
      throw error;
    }

    return profile;
  },

  async completeOnboarding(data: {
    full_name: string;
    platform_goal: string;
    user_role: string;
  }) {
    const current = await this.getCurrentUserWithProfile();

    if (!current.user) {
      throw new Error("Usuário não autenticado");
    }

    const { error } = await authRepository.completeOnboarding(
      current.user.id,
      data,
    );

    if (error) {
      throw error;
    }
  },

  async logout() {
    await authRepository.logout();
  },
};
