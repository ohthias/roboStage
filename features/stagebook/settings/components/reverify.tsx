"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useReverification, useSession } from "@clerk/nextjs";
import { KeyRound, Loader2, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { clerkErrorMessage } from "../lib/clerk-errors";

/**
 * Reverificação nativa. Ações sensíveis do Clerk (senha, e-mails, sessões, 2FA)
 * podem exigir que a pessoa confirme a identidade de novo. Por padrão o Clerk
 * abre o modal dele; aqui `onNeedsReverification` abre o nosso diálogo, que
 * conversa direto com `session.startVerification` e afins.
 */

type Level = "first_factor" | "second_factor" | "multi_factor";
type Request = { level: Level | undefined; preferEmail?: boolean; complete: () => void; cancel: () => void };

const RequestContext = createContext<((r: Request) => void) | null>(null);

export function ReverifyProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  return (
    <RequestContext.Provider value={setRequest}>
      {children}
      {request && <ReverifyDialog request={request} onDone={() => setRequest(null)} />}
    </RequestContext.Provider>
  );
}

function useRequest() {
  const request = useContext(RequestContext);
  if (!request) throw new Error("useReverify precisa de <ReverifyProvider>.");
  return request;
}

/** Igual a `useReverification` do Clerk, mas com o diálogo do RoboStage. */
export function useReverify<F extends (...args: any[]) => Promise<any>>(fetcher: F) {
  const request = useRequest();
  return useReverification(fetcher, {
    onNeedsReverification: ({ level, complete, cancel }) => request({ level, complete, cancel }),
  });
}

/**
 * Pede a verificação já, sem esperar o servidor recusar. Usado em "Esqueci a
 * senha": confirma pelo código no e-mail e depois troca a senha sem a atual.
 */
export function useVerifyNow() {
  const request = useRequest();
  return useCallback(
    (preferEmail = true) =>
      new Promise<boolean>((resolve) =>
        request({ level: "first_factor", preferEmail, complete: () => resolve(true), cancel: () => resolve(false) }),
      ),
    [request],
  );
}

type Step =
  | { kind: "loading" }
  | { kind: "password" }
  | { kind: "email"; emailAddressId: string; safeIdentifier: string }
  | { kind: "second"; strategy: "totp" | "backup_code" | "phone_code"; phoneNumberId?: string; safeIdentifier?: string }
  | { kind: "unsupported" };

type FirstFactor = { strategy: string; emailAddressId?: string; safeIdentifier?: string };
type SecondFactor = { strategy: string; phoneNumberId?: string; safeIdentifier?: string };

function ReverifyDialog({ request, onDone }: { request: Request; onDone: () => void }) {
  const { session } = useSession();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const settled = useRef(false);
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [firstFactors, setFirstFactors] = useState<FirstFactor[]>([]);
  const [secondFactors, setSecondFactors] = useState<SecondFactor[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = useCallback(
    (ok: boolean) => {
      if (settled.current) return;
      settled.current = true;
      if (ok) request.complete();
      else request.cancel();
      dialogRef.current?.close();
      onDone();
    },
    [request, onDone],
  );

  const goSecond = useCallback((factors: SecondFactor[]) => {
    setSecondFactors(factors);
    const pick = factors.find((f) => f.strategy === "totp") ?? factors.find((f) => f.strategy === "phone_code") ?? factors[0];
    if (!pick) return setStep({ kind: "unsupported" });
    setValue("");
    if (pick.strategy === "phone_code" && pick.phoneNumberId) {
      session
        ?.prepareSecondFactorVerification({ strategy: "phone_code", phoneNumberId: pick.phoneNumberId })
        .catch((e) => setError(clerkErrorMessage(e)));
    }
    setStep({
      kind: "second",
      strategy: pick.strategy as "totp" | "backup_code" | "phone_code",
      phoneNumberId: pick.phoneNumberId,
      safeIdentifier: pick.safeIdentifier,
    });
  }, [session]);

  const chooseFirst = useCallback(
    (factors: FirstFactor[], preferEmail: boolean) => {
      const password = factors.find((f) => f.strategy === "password");
      const email = factors.find((f) => f.strategy === "email_code" && f.emailAddressId);
      const pickEmail = email && (preferEmail || !password);
      setValue("");
      if (pickEmail) {
        setStep({ kind: "email", emailAddressId: email.emailAddressId!, safeIdentifier: email.safeIdentifier ?? "" });
        session
          ?.prepareFirstFactorVerification({ strategy: "email_code", emailAddressId: email.emailAddressId! })
          .catch((e) => setError(clerkErrorMessage(e)));
      } else if (password) {
        setStep({ kind: "password" });
      } else {
        setStep({ kind: "unsupported" });
      }
    },
    [session],
  );

  useEffect(() => {
    dialogRef.current?.showModal();
    if (!session) return;
    let alive = true;
    session
      .startVerification({ level: request.level ?? "first_factor" })
      .then((v) => {
        if (!alive) return;
        if (v.status === "complete") return finish(true);
        if (v.status === "needs_second_factor") return goSecond((v.supportedSecondFactors ?? []) as SecondFactor[]);
        const factors = (v.supportedFirstFactors ?? []) as FirstFactor[];
        setFirstFactors(factors);
        chooseFirst(factors, Boolean(request.preferEmail));
      })
      .catch((e) => alive && (setError(clerkErrorMessage(e)), setStep({ kind: "unsupported" })));
    return () => {
      alive = false;
    };
    // Só na abertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendEmailCode(emailAddressId: string) {
    if (!session) return;
    setError(null);
    try {
      await session.prepareFirstFactorVerification({ strategy: "email_code", emailAddressId });
    } catch (e) {
      setError(clerkErrorMessage(e));
    }
  }

  async function submit() {
    if (!session || !value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      let v;
      if (step.kind === "password") {
        v = await session.attemptFirstFactorVerification({ strategy: "password", password: value });
      } else if (step.kind === "email") {
        v = await session.attemptFirstFactorVerification({ strategy: "email_code", code: value.trim() });
      } else if (step.kind === "second") {
        v = await session.attemptSecondFactorVerification({ strategy: step.strategy, code: value.trim() });
      } else return;

      if (v.status === "complete") finish(true);
      else if (v.status === "needs_second_factor") goSecond((v.supportedSecondFactors ?? []) as SecondFactor[]);
    } catch (e) {
      setError(clerkErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const hasPassword = firstFactors.some((f) => f.strategy === "password");
  const emailFactor = firstFactors.find((f) => f.strategy === "email_code" && f.emailAddressId);

  return (
    <dialog ref={dialogRef} className="modal" onCancel={() => finish(false)}>
      <div className="modal-box max-w-md">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Confirme que é você</h3>
            <p className="mt-1 text-sm text-base-content/60">Por segurança, essa ação pede uma verificação rápida.</p>
          </div>
        </div>

        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {step.kind === "loading" && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-base-content/40" />
            </div>
          )}

          {step.kind === "password" && (
            <label className="fieldset">
              <span className="fieldset-legend">
                <KeyRound size={13} /> Sua senha
              </span>
              <input
                type="password"
                className="input w-full"
                autoComplete="current-password"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </label>
          )}

          {step.kind === "email" && (
            <label className="fieldset">
              <span className="fieldset-legend">
                <Mail size={13} /> Código enviado para {step.safeIdentifier || "seu e-mail"}
              </span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                className="input w-full font-mono tracking-[0.4em]"
                maxLength={6}
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
              />
              <button type="button" className="link link-primary w-fit text-xs" onClick={() => void sendEmailCode(step.emailAddressId)}>
                Reenviar código
              </button>
            </label>
          )}

          {step.kind === "second" && (
            <label className="fieldset">
              <span className="fieldset-legend">
                <Smartphone size={13} />
                {step.strategy === "totp"
                  ? "Código do app autenticador"
                  : step.strategy === "backup_code"
                    ? "Código de backup"
                    : `Código enviado para ${step.safeIdentifier ?? "seu celular"}`}
              </span>
              <input
                autoComplete="one-time-code"
                className="input w-full font-mono tracking-[0.3em]"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value.trim())}
              />
              {secondFactors.some((f) => f.strategy === "backup_code") && step.strategy !== "backup_code" && (
                <button
                  type="button"
                  className="link link-primary w-fit text-xs"
                  onClick={() => (setValue(""), setStep({ kind: "second", strategy: "backup_code" }))}
                >
                  Usar um código de backup
                </button>
              )}
            </label>
          )}

          {step.kind === "unsupported" && !error && (
            <p className="text-sm text-base-content/60">
              Não há um jeito de verificar sua conta por aqui. Saia e entre de novo para continuar.
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}

          {step.kind === "password" && emailFactor && (
            <button type="button" className="link link-primary text-xs" onClick={() => chooseFirst(firstFactors, true)}>
              Esqueceu a senha? Receber código por e-mail
            </button>
          )}
          {step.kind === "email" && hasPassword && !request.preferEmail && (
            <button type="button" className="link link-primary text-xs" onClick={() => setStep({ kind: "password" })}>
              Usar minha senha
            </button>
          )}

          <div className="modal-action mt-4">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => finish(false)}>
              Cancelar
            </button>
            {step.kind !== "loading" && step.kind !== "unsupported" && (
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !value.trim()}>
                {busy && <Loader2 size={14} className="animate-spin" />}
                Confirmar
              </button>
            )}
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={() => finish(false)}>
          fechar
        </button>
      </form>
    </dialog>
  );
}
