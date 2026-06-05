import { createClient } from "@/utils/supabase/client";
import { validateUUID, validateNonEmptyString } from "@/utils/validation";

const supabase = createClient();

// Safe column selection for profiles - excludes sensitive fields
const PROFILE_SAFE_COLUMNS = `
  id,
  full_name,
  username,
  bio,
  avatar_url,
  platform_goal,
  user_role,
  created_at,
  updated_at
`;

// Columns for user_tags
const USER_TAGS_COLUMNS = `
  user_id,
  tag,
  created_at
`;

// Columns for user_followers
const USER_FOLLOWERS_COLUMNS = `
  user_id,
  follower_id,
  created_at
`;

export const profileRepository = {
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
      full_name: string;
    }>,
  ) {
    const validUserId = validateUUID(userId, "userId");

    if (!data || typeof data !== "object") {
      throw new Error("Invalid profile data");
    }

    if (data.username) {
      data.username = validateNonEmptyString(data.username, "username", 100);
    }

    if (data.full_name) {
      data.full_name = validateNonEmptyString(data.full_name, "full_name", 255);
    }

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

  async getTags(userId: string) {
    const validUserId = validateUUID(userId, "userId");

    return await supabase
      .from("user_tags")
      .select(USER_TAGS_COLUMNS)
      .eq("user_id", validUserId);
  },

  async insertTags(
    payload: {
      user_id: string;
      tag: string;
    }[],
  ) {
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error("Tags payload must be a non-empty array");
    }

    // Validate each tag
    const validPayload = payload.map((item) => ({
      user_id: validateUUID(item.user_id, "user_id"),
      tag: validateNonEmptyString(item.tag, "tag", 100),
    }));

    return await supabase.from("user_tags").insert(validPayload);
  },

  async deleteTags(userId: string, tags: string[]) {
    const validUserId = validateUUID(userId, "userId");

    if (!Array.isArray(tags) || tags.length === 0) {
      throw new Error("Tags array must not be empty");
    }

    return await supabase
      .from("user_tags")
      .delete()
      .eq("user_id", validUserId)
      .in("tag", tags);
  },

  async getFollowers(userId: string) {
    const validUserId = validateUUID(userId, "userId");

    return await supabase
      .from("user_followers")
      .select(USER_FOLLOWERS_COLUMNS)
      .eq("user_id", validUserId);
  },

  async followUser(userId: string, followerId: string) {
    const validUserId = validateUUID(userId, "userId");
    const validFollowerId = validateUUID(followerId, "followerId");

    if (validUserId === validFollowerId) {
      throw new Error("Cannot follow yourself");
    }

    return await supabase.from("user_followers").insert({
      user_id: validUserId,
      follower_id: validFollowerId,
    });
  },

  async unfollowUser(userId: string, followerId: string) {
    const validUserId = validateUUID(userId, "userId");
    const validFollowerId = validateUUID(followerId, "followerId");

    return await supabase
      .from("user_followers")
      .delete()
      .eq("user_id", validUserId)
      .eq("follower_id", validFollowerId);
  },
};
