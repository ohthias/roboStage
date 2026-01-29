"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { ArrowLeft } from "lucide-react";

type PublicProfile = {
  id: string;
  username: string;
  avatar_url: string;
  bio: string | null;
  created_at: string;
};

interface UserPublicPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserPublicPage({ params }: UserPublicPageProps) {
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    }

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!username) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio, created_at")
        .eq("username", username)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-xl font-semibold">
          Usuário não encontrado {username && `- ${username}`}
        </h1>
        <button
          onClick={() => router.back()}
          className="btn btn-outline btn-sm"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">@{profile.username}</h1>
      </div>

      {/* Card */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover border"
          />

          <div className="flex-1">
            <h2 className="text-xl font-bold">@{profile.username}</h2>

            {profile.bio && (
              <p className="mt-2 text-sm opacity-80 whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            <div className="mt-4 text-xs opacity-60">
              Usuário desde{" "}
              {new Date(profile.created_at).toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}