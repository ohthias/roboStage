import { profileRepository } from "@/repositories/profile.repository";

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await profileRepository.getProfile(userId);

    if (error) throw error;

    return data;
  },

  async updateProfile(
    userId: string,
    data: {
      username?: string;
      bio?: string;
      avatar_url?: string;
      platform_goal?: string;
      full_name?: string;
      user_role?: string;
    },
  ) {
    if (data.username && data.username.length < 3) {
      throw new Error("Username muito curto");
    }

    if (data.bio && data.bio.length > 160) {
      throw new Error("Bio muito longa");
    }

    if (data.full_name && data.full_name.length > 50) {
      throw new Error("Nome completo muito longo");
    }

    if (data.platform_goal && data.platform_goal.length > 100) {
      throw new Error("Objetivo na plataforma muito longo");
    }
    
    const { data: profile, error } = await profileRepository.updateProfile(
      userId,
      data,
    );

    if (error) throw error;

    return profile;
  },

  async syncTags(userId: string, tags: string[]) {
    const { data: currentTags, error } =
      await profileRepository.getTags(userId);

    if (error) throw error;

    const current = currentTags.map((t) => t.tag);

    const toInsert = tags.filter((tag) => !current.includes(tag));

    const toDelete = current.filter((tag) => !tags.includes(tag));

    if (toInsert.length > 0) {
      await profileRepository.insertTags(
        toInsert.map((tag) => ({
          user_id: userId,
          tag,
        })),
      );
    }

    if (toDelete.length > 0) {
      await profileRepository.deleteTags(userId, toDelete);
    }
  },

  async followUser(userId: string, followerId: string) {
    const { error } = await profileRepository.followUser(userId, followerId);

    if (error) throw error;
  },

  async unfollowUser(userId: string, followerId: string) {
    const { error } = await profileRepository.unfollowUser(userId, followerId);

    if (error) throw error;
  },
};
