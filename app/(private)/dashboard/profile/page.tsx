"use client";

import { useState, useRef, KeyboardEvent } from "react";
import {
  Mail,
  User,
  Edit2,
  Lock,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { session, profile } = useUser();
  const { addToast } = useToast();
  const router = useRouter();

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [tags, setTags] = useState<string[]>(profile?.tags ?? []);
  const [newTag, setNewTag] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!session || !profile) return null;

  /* ================= HELPERS ================= */

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  /* ================= AVATAR ================= */

  const handleAvatarChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ser menor que 5MB");
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* ================= TAGS ================= */

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setNewTag("");
  };

  const handleKeyDownTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;
      if (avatarFile) {
        const fileName = `avatar-${Date.now()}.webp`;
        const filePath = `${profile.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("photos").getPublicUrl(filePath);

        const { error: avatarError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", profile.id);

        if (avatarError) throw avatarError;
      }
      const { data: currentTags, error: fetchTagsError } = await supabase
        .from("user_tags")
        .select("tag")
        .eq("user_id", profile.id);

      if (fetchTagsError) throw fetchTagsError;

      const currentTagList = currentTags.map((t) => t.tag);

      const tagsToInsert = tags.filter((tag) => !currentTagList.includes(tag));
      const tagsToDelete = currentTagList.filter((tag) => !tags.includes(tag));

      if (tagsToInsert.length > 0) {
        const payload = tagsToInsert.map((tag) => ({
          user_id: profile.id,
          tag,
        }));

        const { error: insertError } = await supabase
          .from("user_tags")
          .insert(payload);

        if (insertError) throw insertError;
      }

      if (tagsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_tags")
          .delete()
          .eq("user_id", profile.id)
          .in("tag", tagsToDelete);

        if (deleteError) throw deleteError;
      }

      addToast("Perfil atualizado com sucesso!", "success");
      setEditingProfile(false);
    } catch (error: any) {
      console.error(error);
      addToast(error?.message || "Erro ao salvar perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteProfile = async () => {
    const confirmed = confirm(
      "Esta ação é irreversível.\n\nDeseja realmente deletar seu perfil?"
    );

    if (!confirmed) return;

    console.log("Delete profile:", profile.id);

    // 🔥 Futuro:
    // 1. Deletar relations (user_tags, user_follows)
    // 2. Deletar profiles
    // 3. Edge Function -> delete auth user
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* HEADER */}
      <section className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border bg-base-200">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <User size={40} className="opacity-40" />
              </div>
            )}
          </div>

          {editingProfile && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-neutral text-neutral-content p-1.5 rounded-full border hover:scale-105 transition"
              title="Alterar avatar"
            >
              <Upload size={14} />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              e.target.files && handleAvatarChange(e.target.files[0])
            }
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          {!editingProfile ? (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">
                  {profile.username || "Usuário"}
                </h1>
                <Edit2
                  size={16}
                  className="opacity-50 cursor-pointer hover:opacity-80"
                  onClick={() => setEditingProfile(true)}
                />
              </div>

              <p className="text-sm opacity-70 flex items-center gap-2">
                <Mail size={14} />
                {session.user.email}
              </p>

              <div className="flex gap-4 text-sm opacity-70">
                <span>
                  <strong>{profile.followersCount ?? 0}</strong> Seguidores
                </span>
                <span>
                  <strong>{profile.followingCount ?? 0}</strong> Seguindo
                </span>
              </div>
            </>
          ) : (
            <input
              type="text"
              className="input input-bordered max-w-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de usuário"
            />
          )}
        </div>
      </section>

      {/* BIO */}
      <section className="border border-base-300 rounded-lg p-4 bg-base-100">
        <h2 className="font-semibold">Bio</h2>
        <p className="text-xs opacity-60">
          Escreva uma breve descrição sobre você.
        </p>

        {!editingProfile ? (
          <p className="text-sm opacity-80 my-2">
            {bio || "Nenhuma bio definida."}
          </p>
        ) : (
          <textarea
            className="textarea textarea-bordered w-full resize-none my-2"
            rows={3}
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        )}

        {/* TAGS */}
        <div className="my-4">
          <h3 className="text-sm font-medium opacity-70">Tags</h3>
          <p className="text-xs opacity-60">
            Adicione tags para descrever seus interesses ou especialidades.
          </p>

          <div className="flex flex-wrap gap-2 my-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full text-xs bg-base-200 flex items-center gap-1"
              >
                {tag}
                {editingProfile && (
                  <X
                    size={12}
                    className="cursor-pointer hover:text-error"
                    onClick={() => handleRemoveTag(tag)}
                  />
                )}
              </span>
            ))}

            {editingProfile && (
              <input
                type="text"
                className="input input-bordered input-xs w-28"
                placeholder="Nova tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDownTag}
              />
            )}
          </div>
        </div>
      </section>

      {/* ACCOUNT */}
      <section className="border border-base-300 rounded-lg p-4 space-y-3 bg-base-100">
        <h2 className="font-semibold">Conta</h2>

        <div className="space-y-1 text-sm">
          <p className="opacity-70">{session.user.email}</p>
          <p className="opacity-60">
            Membro desde {formatDate(profile.created_at)}
          </p>
        </div>

        {!editingProfile && !editingPassword && (
          <button
            className="btn btn-outline btn-sm mt-3 flex gap-2"
            onClick={() => setEditingPassword(true)}
          >
            <Lock size={14} />
            Alterar senha
          </button>
        )}

        {editingPassword && (
          <div className="mt-3 space-y-2 max-w-sm">
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Current password"
            />
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="New password"
            />
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="New password confirmation"
            />

            <div className="flex gap-3">
              <button className="btn btn-primary btn-sm">Save password</button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingPassword(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DANGER ZONE */}
      <section className="border border-error rounded-lg p-4 bg-error/5 space-y-3">
        <div className="flex items-center gap-2 text-error">
          <AlertTriangle size={18} />
          <h2 className="font-semibold">Zona de Perigo</h2>
        </div>

        <p className="text-sm opacity-80">
          Deletar seu perfil removerá permanentemente seus dados, incluindo
          tags, seguidores e informações públicas. Esta ação não pode ser
          desfeita.
        </p>

        <button
          className="btn btn-error btn-outline"
          onClick={handleDeleteProfile}
        >
          Deletar perfil
        </button>
      </section>

      {/* ACTIONS */}
      {editingProfile && (
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={handleSaveProfile}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setEditingProfile(false)}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
