"use client";

import { useRef, useState } from "react";
import { AtSign, Camera, Loader2, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/app/context/ToastContext";
import { FieldRow, SettingsGroup } from "./settings-card";
import { clerkErrorMessage } from "./clerk-errors";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const USERNAME_RE = /^[a-zA-Z0-9_-]{4,64}$/;

/** Foto, nome e nome de usuário — direto na API do Clerk, sem o modal dele. */
export function ProfileSection() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <SettingsGroup title="Perfil" description="Como você aparece para as equipes e nos eventos do RoboStage.">
      <PhotoRow />
      <NameRow />
      <UsernameRow />
    </SettingsGroup>
  );
}

function PhotoRow() {
  const { user } = useUser();
  const { addToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const current = user;

  async function setImage(file: File | null) {
    setBusy(true);
    setError(null);
    try {
      await current.setProfileImage({ file });
      addToast(file ? "Foto atualizada." : "Foto removida.", "success");
    } catch (e) {
      setError(clerkErrorMessage(e, "Não foi possível atualizar a foto."));
    } finally {
      setBusy(false);
    }
  }

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Escolha um arquivo de imagem.");
    if (file.size > MAX_IMAGE_BYTES) return setError("A imagem precisa ter até 10MB.");
    void setImage(file);
  }

  return (
    <FieldRow title="Foto de perfil" description="PNG, JPG ou GIF, até 10MB. Aparece no menu, nas equipes e no ShowLive.">
      <div className="flex flex-wrap items-center gap-4">
        <div className="avatar">
          <div className="w-16 rounded-2xl ring-1 ring-base-300 ring-offset-2 ring-offset-base-100">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem do Clerk */}
            <img src={user.imageUrl} alt="Foto de perfil" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            Alterar foto
          </button>
          {user.hasImage && (
            <button type="button" className="btn btn-ghost btn-sm gap-2 text-error" onClick={() => void setImage(null)} disabled={busy}>
              <Trash2 size={14} /> Remover
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      )}
    </FieldRow>
  );
}

function NameRow() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const current = user;

  const dirty =
    firstName.trim().length > 0 &&
    (firstName.trim() !== (current.firstName ?? "") || lastName.trim() !== (current.lastName ?? ""));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await current.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      addToast("Nome atualizado.", "success");
    } catch (e) {
      setError(clerkErrorMessage(e, "Não foi possível salvar."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FieldRow title="Nome" description="Seu nome real ou como a equipe te conhece.">
      <form
        className="grid max-w-xl gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="fieldset py-0">
          <span className="fieldset-legend pt-0">Nome</span>
          <input className="input w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={60} autoComplete="given-name" />
        </label>
        <label className="fieldset py-0">
          <span className="fieldset-legend pt-0">Sobrenome</span>
          <input className="input w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={60} autoComplete="family-name" />
        </label>
        <div className="flex items-center justify-between gap-3 sm:col-span-2">
          <p className="min-h-4 text-xs text-error" role="alert">
            {error}
          </p>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!dirty || saving}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </form>
    </FieldRow>
  );
}

function UsernameRow() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const current = user;

  const clean = username.trim().replace(/^@/, "");
  const dirty = clean !== (current.username ?? "");
  const invalid = clean.length > 0 && !USERNAME_RE.test(clean);

  async function save() {
    if (invalid) return;
    setSaving(true);
    setError(null);
    try {
      await current.update({ username: clean || null });
      addToast(clean ? `Agora você é @${clean}.` : "Nome de usuário removido.", "success");
    } catch (e) {
      setError(clerkErrorMessage(e, "Não foi possível salvar o nome de usuário."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FieldRow
      title="Nome de usuário"
      description="Único no RoboStage. Pode ser usado para entrar e para te encontrarem. De 4 a 64 caracteres: letras, números, “_” e “-”."
    >
      <form
        className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-start"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className={`input w-full ${invalid ? "input-error" : ""}`}>
          <AtSign size={15} className="opacity-50" />
          <input
            className="grow"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            maxLength={65}
            autoComplete="username"
            placeholder="sua_equipe"
            aria-invalid={invalid}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-sm sm:mt-1" disabled={!dirty || invalid || saving}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          Salvar
        </button>
      </form>
      <p className="mt-1.5 min-h-4 text-xs text-error" role="alert">
        {invalid ? "Use de 4 a 64 caracteres: letras, números, “_” e “-”." : error}
      </p>
    </FieldRow>
  );
}
