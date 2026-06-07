"use client";
import { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  Mail,
  User,
  Edit2,
  Lock,
  Upload,
  X,
  AlertTriangle,
  Loader2,
  Calendar,
  Target,
  BadgeCheck,
  IdCard,
  BookOpen,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";
import { profileService } from "@/server/services/profile.service";
import { authService } from "@/server/services/auth.service";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function ProfilePage() {
  const { session, profile } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  /* PROFILE */
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [platformGoal, setPlatformGoal] = useState("");
  const [userRole, setUserRole] = useState("");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  /* AVATAR */
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  /* TAGS */
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  /* PASSWORD */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username ?? "");
    setFullName(profile.full_name ?? "");
    setBio(profile.bio ?? "");
    setPlatformGoal(profile.platform_goal ?? "");
    setUserRole(profile.user_role ?? "");
    setOnboardingCompleted(profile.onboarding_completed ?? false);
    setAvatarPreview(profile.avatar_url ?? "");
    setTags(profile.tags ?? []);
  }, [profile]);

  if (!session || !profile) return null;

  /* ================= HELPERS ================= */
  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  /* ================= AVATAR ================= */
  const handleAvatarChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast("Arquivo inválido", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Imagem deve ter menos de 5MB", "warning");
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
    if (!tag) return;
    if (tags.includes(tag)) {
      addToast("Tag já adicionada", "warning");
      return;
    }
    setTags((prev) => [...prev, tag]);
    setNewTag("");
  };
  const handleRemoveTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));
  const handleKeyDownTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  /* ================= STORAGE ================= */
  const uploadAvatar = async (file: File) => {
    const fileName = `avatar-${Date.now()}.webp`;
    const filePath = `avatars/${profile.id}/${fileName}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(filePath);
    return publicUrl;
  };

  /* ================= SAVE ================= */
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      let avatar_url: string | undefined;
      if (avatarFile) avatar_url = await uploadAvatar(avatarFile);
      await profileService.updateProfile(profile.id, {
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url,
        platform_goal: platformGoal.trim(),
        user_role: userRole.trim(),
      });
      await profileService.syncTags(profile.id, tags);
      addToast("Perfil atualizado!", "success");
      setEditingProfile(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      addToast(error.message || "Erro ao salvar perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  const goals = [
    {
      label: "Criar eventos de robótica",
      icon: Rocket,
    },
    {
      label: "Realizar testes e estratégias",
      icon: Target,
    },
    {
      label: "Documentar seus avanços",
      icon: BookOpen,
    },
  ];

  const roles = [
    "Competidor",
    "Mentor/Técnico",
    "Estudante",
    "Professor",
    "Outro",
  ];

  /* ================= PASSWORD ================= */
  const handleUpdatePassword = async () => {
    try {
      if (!session?.user?.email) {
        addToast("Usuário inválido", "error");

        return;
      }

      /* VALIDATE CURRENT PASSWORD */
      const { error: validateError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (validateError) {
        addToast("Senha atual incorreta", "error");

        return;
      }

      /* VALIDATE NEW PASSWORD */
      if (newPassword.length < 6) {
        addToast("A senha deve possuir ao menos 6 caracteres", "warning");

        return;
      }

      if (newPassword !== confirmPassword) {
        addToast("As senhas não coincidem", "error");

        return;
      }

      if (currentPassword === newPassword) {
        addToast("A nova senha deve ser diferente da atual", "warning");

        return;
      }

      await authService.resetPassword(newPassword);

      addToast("Senha atualizada com sucesso!", "success");

      setEditingPassword(false);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);

      addToast(error.message || "Erro ao alterar senha", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteProfile = async () => {
    const confirmed = confirm(
      "Deseja realmente deletar sua conta?\n\nEsta ação é irreversível.",
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const response = await fetch("/api/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      addToast("Conta deletada com sucesso", "success");

      await supabase.auth.signOut();

      router.push("/");
    } catch (error: any) {
      console.error(error);

      addToast(error.message || "Erro ao deletar conta", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="relative rounded-3xl overflow-hidden border border-base-300 bg-base-100 shadow-sm">
        <div className="h-44 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20" />

        <div className="px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-16">
            {/* AVATAR */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-base-100 bg-base-200 shadow-xl">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User size={48} className="opacity-40" />
                  </div>
                )}
              </div>

              {saving && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}

              {editingProfile && (
                <button
                  type="button"
                  className="btn btn-circle btn-sm absolute bottom-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
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

            {/* PROFILE INFO */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {profile.username || "Usuário"}
                </h1>

                <button
                  className="btn btn-ghost btn-circle btn-sm"
                  onClick={() => setEditingProfile(true)}
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {session.user.email}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  Desde {formatDate(profile.created_at)}
                </div>

                <div className="flex items-center gap-2">
                  <BadgeCheck size={14} />
                  {onboardingCompleted
                    ? "Onboarding concluído"
                    : "Onboarding pendente"}
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <span>
                  <strong>{profile.followersCount ?? 0}</strong> Seguidores
                </span>

                <span>
                  <strong>{profile.followingCount ?? 0}</strong> Seguindo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* PROFILE DATA */}
        <section className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body space-y-5">
            <h2 className="card-title">Perfil</h2>

            {/* USERNAME */}
            <div>
              <label className="label">Username</label>

              <input
                disabled={!editingProfile}
                className="input input-bordered w-full px-3"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* FULL NAME */}
            <div>
              <label className="label">Nome completo</label>

              <input
                disabled={!editingProfile}
                className="input input-bordered w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* BIO */}
            <div>
              <label className="label">Bio</label>

              <textarea
                disabled={!editingProfile}
                className="textarea textarea-bordered w-full resize-none"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body space-y-5">
            <h2 className="card-title">Plataforma</h2>

            <div>
              <label className="label flex items-center gap-2">
                <IdCard size={14} />
                Cargo/Função
              </label>

              <select
                disabled={!editingProfile}
                className="select select-bordered w-full px-3"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="">Selecione um cargo</option>

                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Target size={14} />
                Objetivo na plataforma
              </label>

              <div className="grid gap-3 mt-2">
                {goals.map((goal) => {
                  const Icon = goal.icon;

                  const active = platformGoal === goal.label;

                  return (
                    <button
                      key={goal.label}
                      type="button"
                      disabled={!editingProfile}
                      onClick={() => setPlatformGoal(goal.label)}
                      className={`border rounded-2xl p-4 transition-all text-left flex items-center gap-3 ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-base-300 hover:border-primary/40"
                      } ${!editingProfile ? "cursor-default" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
                        <Icon size={18} />
                      </div>

                      <div>
                        <p className="font-medium">{goal.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* TAGS */}
      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <div>
            <h2 className="card-title">Tags</h2>

            <p className="text-xs opacity-60">Interesses e áreas de atuação.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag} className="badge badge-lg gap-2">
                {tag}

                {editingProfile && (
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                )}
              </div>
            ))}

            {editingProfile && (
              <input
                type="text"
                className="input input-bordered input-sm w-36"
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
      <section className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Conta</h2>

              <p className="text-xs opacity-60">Segurança da conta</p>
            </div>

            {!editingPassword && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setEditingPassword(true)}
              >
                <Lock size={14} />
                Alterar senha
              </button>
            )}
          </div>

          {editingPassword && (
            <div className="space-y-3 mt-4 max-w-md">
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="text-xs opacity-60">
                A senha deve possuir ao menos 6 caracteres.
              </div>

              <div className="flex gap-3">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleUpdatePassword}
                >
                  Salvar senha
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingPassword(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="card border border-error bg-error/5 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle size={18} />

            <h2 className="font-semibold">Zona de Perigo</h2>
          </div>

          <p className="text-sm opacity-80">
            Esta ação removerá permanentemente todos os dados do usuário.
          </p>

          <div>
            <button
              className="btn btn-error btn-outline"
              onClick={handleDeleteProfile}
            >
              Deletar perfil
            </button>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      {editingProfile && (
        <div className="sticky bottom-4 flex justify-end z-50">
          <div className="bg-base-100 border border-base-300 shadow-xl rounded-2xl p-4 flex gap-3">
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={handleSaveProfile}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => setEditingProfile(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
