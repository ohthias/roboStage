"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { EmailAddressResource } from "@clerk/nextjs/types";
import { BadgeCheck, CircleAlert, Loader2, Mail, Plus, Star, Trash2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { FieldRow, SettingsGroup } from "./settings-card";
import { clerkErrorMessage, wasCancelled } from "./clerk-errors";
import { useReverify } from "./reverify";

/**
 * E-mails da conta: adicionar, verificar por código, tornar principal e remover.
 * Tudo pela API do Clerk; as ações sensíveis passam pela reverificação nativa.
 */
export function EmailSection() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createEmail = useReverify((email: string) => user!.createEmailAddress({ email }));
  const makePrimary = useReverify((id: string) => user!.update({ primaryEmailAddressId: id }));
  const destroyEmail = useReverify((address: EmailAddressResource) => address.destroy());

  if (!user) return null;
  const current = user;
  const primaryId = current.primaryEmailAddressId;
  const addresses = [...current.emailAddresses].sort((a, b) => Number(b.id === primaryId) - Number(a.id === primaryId));

  async function add() {
    const email = newEmail.trim();
    if (!email) return;
    setBusyId("new");
    setError(null);
    try {
      const created = await createEmail(email);
      await created.prepareVerification({ strategy: "email_code" });
      await current.reload();
      setNewEmail("");
      setAdding(false);
      setVerifyingId(created.id);
      addToast(`Enviamos um código para ${email}.`, "info");
    } catch (e) {
      if (!wasCancelled(e)) setError(clerkErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  async function run(id: string, fn: () => Promise<unknown>, ok: string) {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await current.reload();
      addToast(ok, "success");
    } catch (e) {
      if (!wasCancelled(e)) setError(clerkErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SettingsGroup
      title="E-mail"
      description="Endereços ligados à sua conta. O principal recebe avisos, convites de equipe e códigos de acesso."
      action={
        !adding && (
          <button type="button" className="btn btn-primary btn-sm gap-2" onClick={() => setAdding(true)}>
            <Plus size={14} /> Adicionar e-mail
          </button>
        )
      }
    >
      {addresses.map((address) => {
        const isPrimary = address.id === primaryId;
        const verified = address.verification?.status === "verified";
        const busy = busyId === address.id;
        return (
          <FieldRow
            key={address.id}
            title={address.emailAddress}
            badge={
              <>
                {isPrimary && <span className="badge badge-primary badge-soft badge-sm">Principal</span>}
                {verified ? (
                  <span className="badge badge-success badge-soft badge-sm gap-1">
                    <BadgeCheck size={11} /> Verificado
                  </span>
                ) : (
                  <span className="badge badge-warning badge-soft badge-sm gap-1">
                    <CircleAlert size={11} /> Não verificado
                  </span>
                )}
              </>
            }
            description={
              isPrimary
                ? "Usado para entrar e para receber avisos."
                : verified
                  ? "Pode ser usado para entrar na conta."
                  : "Verifique para poder usar este endereço."
            }
          >
            <div className="flex flex-wrap gap-2 md:justify-end">
              {!verified && verifyingId !== address.id && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm gap-2"
                  disabled={busy}
                  onClick={() =>
                    run(
                      address.id,
                      async () => {
                        await address.prepareVerification({ strategy: "email_code" });
                        setVerifyingId(address.id);
                      },
                      "Código enviado.",
                    )
                  }
                >
                  <Mail size={14} /> Verificar
                </button>
              )}
              {verified && !isPrimary && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm gap-2"
                  disabled={busy}
                  onClick={() => run(address.id, () => makePrimary(address.id), "E-mail principal atualizado.")}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  Tornar principal
                </button>
              )}
              {!isPrimary && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-2 text-error"
                  disabled={busy}
                  onClick={() => run(address.id, () => destroyEmail(address), "E-mail removido.")}
                >
                  <Trash2 size={14} /> Remover
                </button>
              )}
            </div>
            {verifyingId === address.id && (
              <CodeForm
                address={address}
                onDone={async () => {
                  setVerifyingId(null);
                  await current.reload();
                  addToast("E-mail verificado.", "success");
                }}
                onCancel={() => setVerifyingId(null)}
              />
            )}
          </FieldRow>
        );
      })}

      {adding && (
        <FieldRow title="Novo e-mail" description="Vamos enviar um código de 6 dígitos para confirmar que o endereço é seu.">
          <form
            className="flex max-w-xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              void add();
            }}
          >
            <input
              type="email"
              required
              autoFocus
              className="input w-full"
              placeholder="voce@equipe.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm sm:mt-1" onClick={() => setAdding(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm sm:mt-1" disabled={busyId === "new" || !newEmail.trim()}>
                {busyId === "new" && <Loader2 size={14} className="animate-spin" />}
                Enviar código
              </button>
            </div>
          </form>
        </FieldRow>
      )}

      {error && (
        <div role="alert" className="alert alert-error alert-soft my-4 py-2 text-sm">
          {error}
        </div>
      )}
    </SettingsGroup>
  );
}

function CodeForm({
  address,
  onDone,
  onCancel,
}: {
  address: EmailAddressResource;
  onDone: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const result = await address.attemptVerification({ code });
      if (result.verification?.status === "verified") await onDone();
      else setError("Código incorreto.");
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await address.prepareVerification({ strategy: "email_code" });
      setResent(true);
    } catch (e) {
      setError(clerkErrorMessage(e));
    }
  }

  return (
    <form
      className="mt-4 max-w-md rounded-box border border-primary/30 bg-primary/5 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="text-sm font-medium">Digite o código enviado para {address.emailAddress}</p>
      <div className="mt-3 flex gap-2">
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          className="input w-full font-mono tracking-[0.4em]"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <button type="submit" className="btn btn-primary" disabled={busy || code.length < 6}>
          {busy && <Loader2 size={14} className="animate-spin" />}
          Verificar
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className={error ? "text-error" : "text-base-content/50"} role="alert">
          {error ?? (resent ? "Novo código enviado." : "O código vale por 10 minutos.")}
        </span>
        <span className="flex gap-3">
          <button type="button" className="link link-primary" onClick={() => void resend()}>
            Reenviar
          </button>
          <button type="button" className="link" onClick={onCancel}>
            Depois
          </button>
        </span>
      </div>
    </form>
  );
}
