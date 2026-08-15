"use client";

import {
  Camera,
  Check,
  ChevronRight,
  KeyRound,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function SettingsPage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error">
            <ShieldCheck size={22} />
          </div>

          <h1 className="mt-4 font-semibold">Acesso necessário</h1>

          <p className="mt-1 text-sm text-base-content/50">
            Você precisa estar logado para acessar as configurações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-info/5" />

        <div className="relative flex flex-col gap-3 p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Configurações
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/55">
            Gerencie seu perfil, métodos de acesso e segurança da sua conta.
          </p>
        </div>
      </section>

      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href="#perfil"
          className="group flex items-center gap-3 rounded-xl border border-base-300 bg-base-200 p-3 transition hover:border-primary/30 hover:bg-base-300/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Perfil</p>
            <p className="truncate text-[10px] text-base-content/40">
              Informações pessoais
            </p>
          </div>
        </a>

        <a
          href="#email"
          className="group flex items-center gap-3 rounded-xl border border-base-300 bg-base-200 p-3 transition hover:border-info/30 hover:bg-base-300/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
            <Mail size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium">E-mail</p>
            <p className="truncate text-[10px] text-base-content/40">
              Endereços vinculados
            </p>
          </div>
        </a>

        <a
          href="#seguranca"
          className="group flex items-center gap-3 rounded-xl border border-base-300 bg-base-200 p-3 transition hover:border-success/30 hover:bg-base-300/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <ShieldCheck size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Segurança</p>
            <p className="truncate text-[10px] text-base-content/40">
              Acesso e sessões
            </p>
          </div>
        </a>

        <a
          href="#zona-de-risco"
          className="group flex items-center gap-3 rounded-xl border border-base-300 bg-base-200 p-3 transition hover:border-error/30 hover:bg-base-300/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <Trash2 size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Conta</p>
            <p className="truncate text-[10px] text-base-content/40">
              Ações permanentes
            </p>
          </div>
        </a>
      </nav>

      {/* Configurações */}
      <div className="flex flex-col gap-6">
        <div id="perfil">
          <ProfileSection />
        </div>

        <div id="email">
          <EmailSection />
        </div>

        <div id="seguranca">
          <SecuritySection />
        </div>

        <div id="zona-de-risco">
          <DangerZone />
        </div>
      </div>
    </div>
  );
}

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
    firstName !== (currentUser.firstName ?? "") ||
    lastName !== (currentUser.lastName ?? "");

  async function handleSave() {
    setSaving(true);
    setFeedback(null);

    try {
      await currentUser.update({
        firstName,
        lastName,
      });

      setFeedback("Perfil atualizado com sucesso.");
    } catch {
      setFeedback("Não foi possível salvar as alterações.");
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
      setFeedback("Foto atualizada.");
    } catch {
      setFeedback("Não foi possível atualizar a foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
      <SectionHeader
        icon={UserRound}
        title="Perfil"
        description="Suas informações pessoais e identificação."
      />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* Avatar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="avatar">
              <div className="w-20 rounded-2xl ring-1 ring-base-300 ring-offset-2 ring-offset-base-200">
                <img src={user.imageUrl} alt="Foto de perfil" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Foto de perfil</p>

              <p className="mt-1 text-xs text-base-content/45">
                JPG, PNG ou GIF. Escolha uma imagem para identificar sua conta.
              </p>

              <button
                type="button"
                className="btn btn-outline btn-xs mt-3 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Camera size={13} />
                )}

                {uploading ? "Enviando..." : "Alterar foto"}
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

          <div className="h-px bg-base-300" />

          {/* Nome */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-base-content/70">
                Nome
              </span>

              <input
                type="text"
                className="input input-bordered w-full bg-base-100"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-base-content/70">
                Sobrenome
              </span>

              <input
                type="text"
                className="input input-bordered w-full bg-base-100"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5">
              {feedback && (
                <span className="text-xs text-base-content/55">{feedback}</span>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
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
      </div>
    </section>
  );
}

function EmailSection() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  if (!user) return null;

  const primaryEmail = user.primaryEmailAddress?.emailAddress;

  return (
    <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
      <SectionHeader
        icon={Mail}
        title="E-mail"
        description="Gerencie os endereços associados à sua conta."
      />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-base-300 bg-base-300/20 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
              <Mail size={17} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{primaryEmail}</p>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-success">
                <Check size={12} />
                <span>E-mail verificado</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            onClick={() => openUserProfile()}
          >
            Gerenciar
            <ChevronRight size={14} />
          </button>
        </div>

        <p className="mt-3 text-xs text-base-content/40">
          Você pode adicionar outros endereços de e-mail através do
          gerenciamento da conta.
        </p>
      </div>
    </section>
  );
}

function SecuritySection() {
  const { openUserProfile, signOut } = useClerk();

  return (
    <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
      <SectionHeader
        icon={ShieldCheck}
        title="Segurança"
        description="Controle como sua conta é protegida e acessada."
      />

      <div className="divide-y divide-base-300">
        <SettingRow
          icon={KeyRound}
          title="Senha e autenticação"
          description="Altere sua senha ou gerencie a autenticação em duas etapas."
          action={
            <button
              type="button"
              className="btn btn-outline btn-sm gap-2"
              onClick={() => openUserProfile()}
            >
              Gerenciar
              <ChevronRight size={14} />
            </button>
          }
        />

        <SettingRow
          icon={MonitorSmartphone}
          title="Sessões ativas"
          description="Encerre o acesso da sua conta em outros dispositivos."
          action={
            <button
              type="button"
              className="btn btn-ghost btn-sm text-base-content/60 hover:text-base-content"
              onClick={() => signOut()}
            >
              Sair de todos
            </button>
          }
        />
      </div>
    </section>
  );
}

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
    } catch {
      setDeleting(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-error/30 bg-error/5">
      <div className="border-b border-error/20 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-error/10 text-error">
            <Trash2 size={17} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-error">Zona de risco</h2>

            <p className="mt-0.5 text-xs text-base-content/45">
              Ações permanentes que afetam sua conta.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-medium">Excluir conta</p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-base-content/50">
            Essa ação remove permanentemente sua conta e não pode ser desfeita.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-error btn-outline btn-sm shrink-0 gap-2"
          onClick={() => dialogRef.current?.showModal()}
        >
          <Trash2 size={14} />
          Excluir conta
        </button>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/10 text-error">
              <Trash2 size={18} />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Excluir sua conta</h3>

              <p className="text-xs text-base-content/45">
                Essa ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-error/20 bg-error/5 p-4">
            <p className="text-sm leading-6 text-base-content/70">
              Todos os dados associados à sua conta serão removidos
              permanentemente.
            </p>
          </div>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-xs font-medium">
              Digite <span className="font-mono text-error">excluir</span> para
              confirmar
            </span>

            <input
              type="text"
              className="input input-bordered w-full"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="excluir"
              autoComplete="off"
            />
          </label>

          <div className="modal-action">
            <form method="dialog">
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

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-300/60 text-base-content/60">
        <Icon size={17} />
      </div>

      <div>
        <h2 className="text-sm font-semibold">{title}</h2>

        <p className="mt-0.5 text-xs text-base-content/45">{description}</p>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof KeyRound;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-300/60 text-base-content/50">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-base-content/45">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}
