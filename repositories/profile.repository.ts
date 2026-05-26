import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const profileRepository = {
  async getProfile(userId: string) {
    return await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
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
    return await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();
  },

  async getTags(userId: string) {
    return await supabase.from("user_tags").select("*").eq("user_id", userId);
  },

  async insertTags(
    payload: {
      user_id: string;
      tag: string;
    }[],
  ) {
    return await supabase.from("user_tags").insert(payload);
  },

  async deleteTags(userId: string, tags: string[]) {
    return await supabase
      .from("user_tags")
      .delete()
      .eq("user_id", userId)
      .in("tag", tags);
  },

  async getFollowers(userId: string) {
    return await supabase
      .from("user_followers")
      .select("*")
      .eq("user_id", userId);
  },

  async followUser(userId: string, followerId: string) {
    return await supabase.from("user_followers").insert({
      user_id: userId,
      follower_id: followerId,
    });
  },

  async unfollowUser(userId: string, followerId: string) {
    return await supabase
      .from("user_followers")
      .delete()
      .eq("user_id", userId)
      .eq("follower_id", followerId);
  },
};
