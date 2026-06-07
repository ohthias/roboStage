"use client";

import { useState } from "react";
import { authService } from "@/server/services/auth.service";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function useProfile(profileId: string) {
  const [saving, setSaving] = useState(false);

  async function uploadAvatar(file: File) {
    const fileName = `avatar-${Date.now()}.webp`;
    const filePath = `${profileId}/${fileName}`;

    const { error } = await supabase.storage
      .from("photos")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(filePath);

    return publicUrl;
  }

  async function updateProfile(data: {
    username?: string;
    bio?: string;
    avatarFile?: File | null;
  }) {
    try {
      setSaving(true);

      let avatar_url: string | undefined;

      if (data.avatarFile) {
        avatar_url = await uploadAvatar(data.avatarFile);
      }

      await authService.updateProfile(profileId, {
        username: data.username,
        bio: data.bio,
        avatar_url,
      });

      return true;
    } finally {
      setSaving(false);
    }
  }

  return {
    saving,
    updateProfile,
  };
}