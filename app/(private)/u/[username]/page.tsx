"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { User } from "lucide-react";

interface PublicProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  tags: string[];
  followersCount: number;
  followingCount: number;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1️⃣ Perfil base
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, created_at")
        .eq("username", username)
        .single();

      if (error || !profileData) {
        setLoading(false);
        return;
      }

      // 2️⃣ Tags
      const { data: tagsData } = await supabase
        .from("user_tags")
        .select("tag")
        .eq("user_id", profileData.id);

      // 3️⃣ Followers count
      const { count: followersCount } = await supabase
        .from("user_followers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileData.id);

      // 4️⃣ Following count
      const { count: followingCount } = await supabase
        .from("user_followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileData.id);

      setProfile({
        ...profileData,
        tags: tagsData?.map((t) => t.tag) ?? [],
        followersCount: followersCount ?? 0,
        followingCount: followingCount ?? 0,
      });

      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="opacity-60">Loading profile…</p>
      </div>
    );
  }

  if (!profile) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER */}
      <section className="flex items-start gap-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border bg-base-200">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <User size={40} className="opacity-40" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-semibold">
            {profile.username || "Usuário"}
          </h1>

          <div className="flex gap-4 text-sm opacity-70">
            <span>
              <strong>{profile.followersCount}</strong> followers
            </span>
            <span>
              <strong>{profile.followingCount}</strong> following
            </span>
          </div>

          <p className="text-xs opacity-60">
            Member since{" "}
            {new Date(profile.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </section>

      {/* BIO */}
      <section className="border border-base-300 rounded-lg p-4 bg-base-100">
        <h2 className="font-semibold mb-2">Bio</h2>
        <p className="text-sm opacity-80">
          {profile.bio || "Nenhuma bio definida."}
        </p>
      </section>

      {/* TAGS */}
      {profile.tags.length > 0 && (
        <section className="border border-base-300 rounded-lg p-4 bg-base-100">
          <h2 className="font-semibold mb-2">Tags</h2>

          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full text-xs bg-base-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}