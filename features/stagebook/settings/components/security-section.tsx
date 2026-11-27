"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import type { SessionWithActivitiesResource, TOTPResource } from "@clerk/nextjs/types";
import {
  Copy,
  Laptop,
  Loader2,
  LogOut,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";
import { FieldRow, SettingsGroup } from "./settings-card";
import { clerkErrorMessage, wasCancelled } from "../lib/clerk-errors";
import { useReverify } from "./reverify";

export function SecuritySection() {
  return (
    <div className="space-y-12">
      <TwoFactorGroup />
      <SessionsGroup />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sessões
// ---------------------------------------------------------------------------

const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
function timeAgo(date: Date) {
  const diff = (date.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "agora";
  if (abs < 3600) return relative.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(diff / 3600), "hour");
  return relative.format(Math.round(diff / 86400), "day");
}

function useSessionsGroup() {
  const { user } = useUser();
  const { session: currentSession } = useSession();
  const { addToast } = useToast();
  const [sessions, setSessions] = useState<SessionWithActivitiesResource[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revoke = useReverify((s: SessionWithActivitiesResource) => s.revoke());

  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    user
      .getSessions()
      .then((all) => alive && setSessions(all.filter((s) => s.status === "active")))
      .catch((e) => alive && setError(clerkErrorMessage(e, "Não foi possível carregar as sessões.")));
    return () => {
      alive = false;
    };
  }, [user, version]);

  const currentId = currentSession?.id;
  const sorted = [...(sessions ?? [])].sort(
    (a, b) => Number(b.id === currentId) - Number(a.id === currentId) || b.lastActiveAt.getTime() - a.lastActiveAt.getTime(),
  );
  const others = sorted.filter((s) => s.id !== currentId);

  async function end(targets: SessionWithActivitiesResource[], key: string) {
    setBusyId(key);
    setError(null);
    try {
      for (const s of targets) await revoke(s);
      addToast(targets.length > 1 ? "Sessões encerradas." : "Sessão encerrada.", "success");
      setVersion((v) => v + 1);
    } catch (e) {
      if (!wasCancelled(e)) setError(clerkErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  return { sessions, sorted, others, currentId, busyId, error, end };
}

function SessionRows({
  sessions,
  sorted,
  others,
  currentId,
  busyId,
  error,
  end,
}: ReturnType<typeof useSessionsGroup>) {
  return (
    <>
      {sessions === null && !error && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-base-content/40" />
        </div>
      )}
      {sorted.map((s) => {
        const a = s.latestActivity;
        const mine = s.id === currentId;
        const Icon = a?.isMobile ? Smartphone : Laptop;
        const device = [a?.browserName, a?.browserVersion?.split(".")[0]].filter(Boolean).join(" ") || "Navegador";
        const place = [a?.city, a?.country].filter(Boolean).join(", ");
        return (
          <FieldRow
            key={s.id}
            title={`${device}${a?.deviceType ? ` · ${a.deviceType}` : ""}`}
            badge={mine && <span className="badge badge-primary badge-soft badge-sm">Este dispositivo</span>}
            description={
              <span className="flex items-start gap-2">
                <Icon size={15} className="mt-1 shrink-0 opacity-60" />
                <span>
                  {[place, a?.ipAddress].filter(Boolean).join(" · ") || "Local desconhecido"}
                  <br />
                  {mine ? "Ativa agora" : `Último acesso ${timeAgo(s.lastActiveAt)}`}
                </span>
              </span>
            }
          >
            {!mine && (
              <div className="md:text-right">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-2 text-error"
                  disabled={busyId !== null}
                  onClick={() => void end([s], s.id)}
                >
                  {busyId === s.id ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                  Encerrar
                </button>
              </div>
            )}
          </FieldRow>
        );
      })}
      {sessions !== null && others.length === 0 && (
        <p className="flex items-center gap-2 py-4 text-sm text-base-content/55">
          <MonitorSmartphone size={15} /> Nenhuma outra sessão aberta.
        </p>
      )}
      {error && (
        <div role="alert" className="alert alert-error alert-soft my-4 py-2 text-sm">
          {error}
        </div>
      )}
    </>
  );
}

function SessionsGroup() {
  const { sessions, sorted, others, currentId, busyId, error, end } = useSessionsGroup();

  return (
    <SettingsGroup
      title="Sessões ativas"
      description="Dispositivos com a sua conta aberta. Encerre o que você não reconhece."
      action={
        others.length > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            disabled={busyId !== null}
            onClick={() => void end(others, "all")}
          >
            {busyId === "all" ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            Sair dos outros ({others.length})
          </button>
        )
      }
    >
      <SessionRows sessions={sessions} sorted={sorted} others={others} currentId={currentId} busyId={busyId} error={error} end={end} />
    </SettingsGroup>
  );
}

// ---------------------------------------------------------------------------
// Verificação em duas etapas (app autenticador)
// ---------------------------------------------------------------------------

function formatSecret(secret = "") {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

function TwoFactorGroup() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [setup, setSetup] = useState<TOTPResource | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTOTP = useReverify(() => user!.createTOTP());
  const disableTOTP = useReverify(() => user!.disableTOTP());
  const createBackup = useReverify(() => user!.createBackupCode());

  if (!user) return null;
  const current = user;

  async function step(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setError(null);
    try {
      await fn();
    } catch (e) {
      if (!wasCancelled(e)) setError(clerkErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const start = () => step("start", async () => setSetup(await createTOTP()));
  const confirm = () =>
    step("verify", async () => {
      const totp = await current.verifyTOTP({ code });
      setSetup(null);
      setCode("");
      if (totp.backupCodes?.length) setBackupCodes(totp.backupCodes);
      await current.reload();
      addToast("Verificação em duas etapas ativada.", "success");
    });
  const disable = () =>
    step("disable", async () => {
      await disableTOTP();
      setBackupCodes(null);
      await current.reload();
      addToast("Verificação em duas etapas desativada.", "success");
    });
  const regenerate = () =>
    step("backup", async () => {
      const result = await createBackup();
      setBackupCodes(result.codes);
      await current.reload();
    });

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copiado.", "success");
    } catch {
      /* sem permissão: a pessoa copia na mão */
    }
  }

  return (
    <SettingsGroup
      title="Verificação em duas etapas"
      description="Além da senha, pede um código do app autenticador (Google Authenticator, Authy, 1Password…) ao entrar."
    >
      <FieldRow
        title="App autenticador"
        badge={
          current.totpEnabled ? (
            <span className="badge badge-success badge-soft badge-sm gap-1">
              <ShieldCheck size={11} /> Ativo
            </span>
          ) : (
            <span className="badge badge-ghost badge-sm">Desativado</span>
          )
        }
        description={
          current.totpEnabled
            ? "Sua conta pede o código de 6 dígitos ao entrar."
            : "Recomendado para técnicos e organizadores de eventos."
        }
      >
        <div className="flex flex-wrap gap-2 md:justify-end">
          {current.totpEnabled ? (
            <button type="button" className="btn btn-ghost btn-sm gap-2 text-error" disabled={busy !== null} onClick={() => void disable()}>
              {busy === "disable" ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
              Desativar
            </button>
          ) : (
            !setup && (
              <button type="button" className="btn btn-primary btn-sm gap-2" disabled={busy !== null} onClick={() => void start()}>
                {busy === "start" ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Ativar
              </button>
            )
          )}
        </div>

        {setup && (
          <div className="mt-4 max-w-lg space-y-4 rounded-box border border-primary/30 bg-primary/5 p-4">
            <ol className="list-decimal space-y-1 pl-4 text-sm text-base-content/75">
              <li>Abra o app autenticador e escolha “adicionar conta”.</li>
              <li>
                No celular, toque em{" "}
                <a className="link link-primary" href={setup.uri}>
                  abrir no app
                </a>
                . No computador, digite a chave abaixo.
              </li>
              <li>Digite o código de 6 dígitos que o app mostrar.</li>
            </ol>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-field bg-base-100 px-3 py-2 font-mono text-sm tracking-wider">
                {formatSecret(setup.secret)}
              </code>
              <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Copiar chave" onClick={() => void copy(setup.secret ?? "")}>
                <Copy size={14} />
              </button>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void confirm();
              }}
            >
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="input w-full font-mono tracking-[0.4em]"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <button type="button" className="btn btn-ghost" onClick={() => setSetup(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={code.length < 6 || busy !== null}>
                {busy === "verify" && <Loader2 size={14} className="animate-spin" />}
                Confirmar
              </button>
            </form>
          </div>
        )}
      </FieldRow>

      {current.totpEnabled && (
        <FieldRow
          title="Códigos de backup"
          description="Use um destes se perder o celular. Cada código vale uma vez. Gerar novos invalida os antigos."
        >
          <div className="md:text-right">
            <button type="button" className="btn btn-outline btn-sm gap-2" disabled={busy !== null} onClick={() => void regenerate()}>
              {busy === "backup" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Gerar novos códigos
            </button>
          </div>
        </FieldRow>
      )}

      {backupCodes && (
        <div className="my-4 rounded-box border border-warning/40 bg-warning/10 p-4">
          <p className="text-sm font-medium">Guarde estes códigos num lugar seguro. Eles não aparecem de novo.</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-5">
            {backupCodes.map((c) => (
              <li key={c} className="rounded-field bg-base-100 px-2 py-1 text-center">
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn btn-sm gap-2" onClick={() => void copy(backupCodes.join("\n"))}>
              <Copy size={14} /> Copiar todos
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBackupCodes(null)}>
              Já guardei
            </button>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error alert-soft my-4 py-2 text-sm">
          {error}
        </div>
      )}
    </SettingsGroup>
  );
}
