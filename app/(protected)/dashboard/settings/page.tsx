"use client";

import { useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

/**
 * Página de Configurações do Usuário
 * Stack: Next.js (App Router) + Clerk + daisyUI
 *
 * Requisitos:
 *  - <ClerkProvider> já envolvendo o app em app/layout.tsx
 *  - daisyUI configurado no tailwind.config.js (ver README)
 *  - Rota protegida por middleware do Clerk (ver README)
 */
export default function SettingsPage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-base-content/60">
          Você precisa estar logado para acessar essa página.
        </p>
      </div>
    );
  }

  return (
    <div className=" w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Gerencie suas informações pessoais, e-mail e segurança da conta.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <ProfileSection />
        <EmailSection />
        <SecuritySection />
        <DangerZone />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Perfil (nome e foto)                                              */
/* ---------------------------------------------------------------- */

function ProfileSection() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!user) return null;
  const currentUser = user;

  const hasChanges =
    firstName !== (currentUser.firstName ?? "") || lastName !== (currentUser.lastName ?? "");

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      await currentUser.update({ firstName, lastName });
      setFeedback("Perfil atualizado.");
    } catch (err) {
      setFeedback("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);
    try {
      await currentUser.setProfileImage({ file });
    } catch (err) {
      setFeedback("Não foi possível atualizar a foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="card bg-base-100 border border-base-300">
      <div className="card-body gap-5">
        <h2 className="card-title text-base">Perfil</h2>

        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
              <img src={user.imageUrl} alt="Foto de perfil" />
            </div>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Alterar foto"
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm">Nome</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm">Sobrenome</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          {feedback && (
            <span className="text-sm text-base-content/60">{feedback}</span>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm ml-auto"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Salvar alterações"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* E-mail                                                            */
/* ---------------------------------------------------------------- */

function EmailSection() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  if (!user) return null;

  const primaryEmail = user.primaryEmailAddress?.emailAddress;

  return (
    <section className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4">
        <h2 className="card-title text-base">E-mail</h2>

        <div className="flex items-center justify-between rounded-lg border border-base-300 px-4 py-3">
          <div>
            <p className="text-sm font-medium">{primaryEmail}</p>
            <p className="text-xs text-base-content/50">E-mail principal</p>
          </div>
          <div className="badge badge-success badge-outline gap-1">
            Verificado
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-ghost self-start"
          onClick={() => openUserProfile()}
        >
          Adicionar ou remover e-mails
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Segurança (senha, 2FA, sessões)                                   */
/* ---------------------------------------------------------------- */

function SecuritySection() {
  const { openUserProfile, signOut } = useClerk();

  return (
    <section className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4">
        <h2 className="card-title text-base">Segurança</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Senha e verificação em duas etapas</p>
            <p className="text-xs text-base-content/50">
              Altere sua senha ou gerencie a autenticação de dois fatores.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => openUserProfile()}
          >
            Gerenciar
          </button>
        </div>

        <div className="divider my-0" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sessões ativas</p>
            <p className="text-xs text-base-content/50">
              Encerre o acesso em outros dispositivos.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => signOut()}
          >
            Sair de todos os dispositivos
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Zona de risco (excluir conta)                                     */
/* ---------------------------------------------------------------- */

function DangerZone() {
  const { user } = useUser();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!user) return null;

  const currentUser = user;

  async function handleDelete() {
    setDeleting(true);
    try {
      await currentUser.delete();
    } catch (err) {
      setDeleting(false);
    }
  }

  return (
    <section className="card border border-error/30 bg-error/5">
      <div className="card-body gap-3">
        <h2 className="card-title text-base text-error">Zona de risco</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Excluir conta</p>
            <p className="text-xs text-base-content/50">
              Essa ação é permanente e não pode ser desfeita.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-error btn-outline"
            onClick={() => dialogRef.current?.showModal()}
          >
            Excluir conta
          </button>
        </div>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-semibold">Excluir sua conta</h3>
          <p className="py-2 text-sm text-base-content/60">
            Digite <span className="font-mono font-semibold">excluir</span> para
            confirmar. Todos os seus dados serão removidos permanentemente.
          </p>
          <input
            type="text"
            className="input input-bordered w-full"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="excluir"
          />
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancelar</button>
            </form>
            <button
              type="button"
              className="btn btn-error"
              disabled={confirmText !== "excluir" || deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Excluir permanentemente"
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>fechar</button>
        </form>
      </dialog>
    </section>
  );
}