"use client";

import { useRef, useState } from "react";
import { Camera, Check, ChevronRight, Loader2, Mail, UserRound } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useToast } from "@/app/context/ToastContext";
import { SettingsCard } from "./settings-card";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function ProfileSection() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  if (!user) return null;
  const current = user;
  const dirty =
    (firstName.trim() !== (current.firstName ?? "") || lastName.trim() !== (current.lastName ?? "")) &&
    firstName.trim().length > 0;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await current.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      addToast("Perfil atualizado com sucesso.", "success");
    } catch {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function changeAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Escolha um arquivo de imagem.");
    if (file.size > MAX_IMAGE_BYTES) return setError("A imagem precisa ter até 10MB.");

    setUploading(true);
    setError(null);
    try {
      await current.setProfileImage({ file });
      addToast("Foto atualizada.", "success");
    } catch {
      setError("Não foi possível atualizar a foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <SettingsCard icon={UserRound} title="Perfil" description="Suas informações pessoais e identificação.">
      <div className="space-y-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="avatar">
            <div className="w-20 rounded-2xl ring-1 ring-base-300 ring-offset-2 ring-offset-base-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- imagem do Clerk */}
              <img src={user.imageUrl} alt="Foto de perfil" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Foto de perfil</p>
            <p className="mt-1 text-xs text-base-content/50">PNG, JPG ou GIF, até 10MB.</p>
            <button
              type="button"
              className="btn btn-outline btn-xs mt-3 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
              {uploading ? "Enviando…" : "Alterar foto"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={changeAvatar} />
          </div>
        </div>

        <form
          className="grid gap-3 border-t border-base-300 pt-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="fieldset">
            <span className="fieldset-legend">Nome</span>
            <input className="input w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={60} />
          </label>
          <label className="fieldset">
            <span className="fieldset-legend">Sobrenome</span>
            <input className="input w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={60} />
          </label>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <p className="min-h-4 text-xs text-error" role="alert">
              {error}
            </p>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!dirty || saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </SettingsCard>
  );
}

export function EmailSection() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  if (!user) return null;

  const primary = user.primaryEmailAddress;
  const verified = primary?.verification?.status === "verified";

  return (
    <SettingsCard icon={Mail} title="E-mail" description="Endereços associados à sua conta.">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{primary?.emailAddress ?? "Sem e-mail principal"}</p>
          {primary && (
            <p className={`mt-1 flex items-center gap-1.5 text-xs ${verified ? "text-success" : "text-warning"}`}>
              <Check size={12} />
              {verified ? "E-mail verificado" : "E-mail não verificado"}
            </p>
          )}
        </div>
        <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => openUserProfile()}>
          Gerenciar <ChevronRight size={14} />
        </button>
      </div>
    </SettingsCard>
  );
}
