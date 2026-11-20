"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Eye, EyeOff, KeyRound, Loader2, MailCheck } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { FieldRow, SettingsGroup } from "./settings-card";
import { clerkErrorMessage, wasCancelled } from "./clerk-errors";
import { useReverify, useVerifyNow } from "./reverify";

/** Força simples: só para dar retorno visual; quem decide é o Clerk. */
function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}
const STRENGTH = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
const STRENGTH_TONE = ["progress-error", "progress-error", "progress-warning", "progress-success", "progress-success"];

/**
 * Trocar, criar ou redefinir a senha sem o modal do Clerk. "Esqueci a senha"
 * confirma a identidade com um código no e-mail e libera a troca sem a atual.
 */
export function PasswordSection() {
  return <PasswordSectionContent />;
}

function PasswordSectionContent() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { addToast } = useToast();
  const verifyNow = useVerifyNow();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePassword = useReverify((params: { currentPassword?: string; newPassword: string; signOutOfOtherSessions: boolean }) =>
    user!.updatePassword(params),
  );

  if (!user) return null;
  const hasPassword = user.passwordEnabled;
  const needsCurrent = hasPassword && !resetMode;
  const score = strength(newPassword);
  const mismatch = confirm.length > 0 && confirm !== newPassword;
  const canSubmit =
    newPassword.length >= 8 && confirm === newPassword && (!needsCurrent || currentPassword.length > 0) && !busy;

  async function forgot() {
    setError(null);
    const ok = await verifyNow(true);
    if (ok) {
      setResetMode(true);
      setCurrentPassword("");
      addToast("Identidade confirmada. Escolha a nova senha.", "success");
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await updatePassword({
        currentPassword: needsCurrent ? currentPassword : undefined,
        newPassword,
        signOutOfOtherSessions: signOutOthers,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setResetMode(false);
      addToast(hasPassword ? "Senha alterada." : "Senha criada.", "success");
    } catch (e) {
      if (!wasCancelled(e)) setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const type = show ? "text" : "password";

  return (
    <SettingsGroup
      title="Senha"
      description={
        hasPassword
          ? "Troque sua senha. Use pelo menos 8 caracteres e evite repetir senhas de outros sites."
          : "Você entra com Google ou outro provedor. Crie uma senha para também poder entrar com e-mail."
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {hasPassword && (
          <FieldRow
            title="Senha atual"
            description={resetMode ? "Identidade confirmada por e-mail: não precisa da senha atual." : "Para confirmar que é você."}
          >
            {resetMode ? (
              <p className="flex items-center gap-2 text-sm text-success">
                <MailCheck size={16} /> Verificado por código
              </p>
            ) : (
              <div className="max-w-md">
                <input
                  type={type}
                  className="input w-full"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button type="button" className="link link-primary mt-2 text-xs" onClick={() => void forgot()}>
                  Esqueci minha senha
                </button>
              </div>
            )}
          </FieldRow>
        )}

        <FieldRow title="Nova senha" description="Mínimo de 8 caracteres. Misture letras, números e símbolos.">
          <div className="max-w-md">
            <label className="input w-full">
              <KeyRound size={15} className="opacity-50" />
              <input
                type={type}
                className="grow"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Esconder senhas" : "Mostrar senhas"}
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </label>
            {newPassword && (
              <div className="mt-2 flex items-center gap-3">
                <progress className={`progress h-1.5 flex-1 ${STRENGTH_TONE[score]}`} value={score + 1} max={5} />
                <span className="w-20 text-right text-xs text-base-content/55">{STRENGTH[score]}</span>
              </div>
            )}
          </div>
        </FieldRow>

        <FieldRow title="Confirmar nova senha">
          <div className="max-w-md">
            <input
              type={type}
              className={`input w-full ${mismatch ? "input-error" : ""}`}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {mismatch && <p className="mt-1.5 text-xs text-error">As senhas não são iguais.</p>}
          </div>
        </FieldRow>

        <FieldRow title="Outros dispositivos" description="Recomendado se você acha que alguém sabe a sua senha.">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={signOutOthers}
              onChange={(e) => setSignOutOthers(e.target.checked)}
            />
            <span className="text-sm">Sair de todos os outros dispositivos</span>
          </label>
        </FieldRow>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-5">
          <p className="min-h-4 text-sm text-error" role="alert">
            {error}
          </p>
          <div className="flex gap-2">
            {resetMode && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setResetMode(false)}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit}>
              {busy && <Loader2 size={14} className="animate-spin" />}
              {hasPassword ? "Atualizar senha" : "Criar senha"}
            </button>
          </div>
        </div>
        {resetMode && error && (
          <p className="mt-3 text-xs text-base-content/55">
            Ainda sem sucesso?{" "}
            <button type="button" className="link link-primary" onClick={() => void signOut({ redirectUrl: "/sign-in" })}>
              Sair e redefinir pela tela de login
            </button>
            .
          </p>
        )}
      </form>
    </SettingsGroup>
  );
}
