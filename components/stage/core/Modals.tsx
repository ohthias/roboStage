"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Info, Trash2, TriangleAlert, X } from "lucide-react";
import { cn, type Tone } from "../lib";
import { Button } from "./Button";
import { Field, Input } from "./Form";
import { Modal, useDialogBehavior } from "./Interactive";
import { Starburst } from "../decor/Stickers";

/* ------------------------------------------------------------------ */
/*  Modais prontos, todos sobre o <Modal /> base:                      */
/*  Confirm · Alert · Input · Result · Steps · Sheet (painel lateral)  */
/*  e useConfirm() — confirmação por Promise, sem refs.                */
/* ------------------------------------------------------------------ */

type Intent = "info" | "success" | "warning" | "danger";

const intentMeta: Record<Intent, { tone: Tone; icon: ReactNode; button: "primary" | "success" | "accent" }> = {
  info: { tone: "info", icon: <Info size={22} />, button: "primary" },
  success: { tone: "success", icon: <CheckCircle2 size={22} />, button: "success" },
  warning: { tone: "accent", icon: <TriangleAlert size={22} />, button: "accent" },
  danger: { tone: "primary", icon: <Trash2 size={20} />, button: "primary" },
};

/* ========================================================== CONFIRM */

export type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  /** Pode ser assíncrono: o botão mostra "carregando" até terminar. */
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: ReactNode;
  intent?: Intent;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Exige digitar esta palavra para liberar o botão (ex.: "EXCLUIR"). */
  requireText?: string;
  /** Desenha parado na página (vitrine/documentação). */
  inline?: boolean;
};

/** ConfirmModal — substitui o ModalConfirm (sem ref, aceita ação assíncrona). */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  intent = "danger",
  confirmLabel = intent === "danger" ? "Excluir" : "Confirmar",
  cancelLabel = "Cancelar",
  requireText,
  inline,
}: ConfirmModalProps) {
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const meta = intentMeta[intent];
  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const confirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  const locked = !!requireText && typed.trim() !== requireText;

  return (
    <Modal
      inline={inline}
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      kicker={intent === "danger" ? "Ação permanente" : "Confirmação"}
      icon={meta.icon}
      iconTone={meta.tone}
      size="sm"
      sticker={false}
      footer={
        <>
          <Button tone="ghost" onClick={onClose} disabled={busy} data-autofocus>
            {cancelLabel}
          </Button>
          <Button tone={meta.button} onClick={confirm} loading={busy} disabled={locked}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <div className="text-sm leading-relaxed text-base-content/75">{message}</div>}
      {requireText && (
        <Field label={`Digite ${requireText} para confirmar`} className="mt-4">
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={requireText} autoComplete="off" />
        </Field>
      )}
    </Modal>
  );
}

/* ============================================================ ALERT */

/** AlertModal — aviso com um botão (substitui o ModalAlert). */
export function AlertModal({
  open,
  onClose,
  title,
  message,
  intent = "info",
  buttonLabel = "Entendi",
  inline,
}: {
  inline?: boolean;
  open: boolean;
  onClose: () => void;
  title: string;
  message?: ReactNode;
  intent?: Intent;
  buttonLabel?: string;
}) {
  const meta = intentMeta[intent];
  const icon = intent === "danger" ? <AlertCircle size={22} /> : meta.icon;
  return (
    <Modal
      inline={inline}
      open={open}
      onClose={onClose}
      title={title}
      icon={icon}
      iconTone={meta.tone}
      size="sm"
      sticker={false}
      footer={
        <Button tone={meta.button} onClick={onClose} data-autofocus className="w-full sm:w-auto">
          {buttonLabel}
        </Button>
      }
    >
      {message && <div className="text-sm leading-relaxed text-base-content/75">{message}</div>}
    </Modal>
  );
}

/* ============================================================ INPUT */

/** InputModal — pede um valor (substitui o ModalInput). */
export function InputModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  label,
  placeholder,
  defaultValue = "",
  submitLabel = "Salvar",
  validate,
  inline,
}: {
  inline?: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  /** Retorne a mensagem de erro, ou nada se estiver ok. */
  validate?: (value: string) => string | undefined;
}) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const formId = useId();
  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setError(undefined);
    }
  }, [open, defaultValue]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate?.(value) ?? (value.trim() ? undefined : "Preencha este campo.");
    setError(err);
    if (err) return;
    try {
      setBusy(true);
      await onSubmit(value.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      inline={inline}
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      sticker={false}
      footer={
        <>
          <Button tone="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={busy}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate>
        <Field label={label} error={error}>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} data-autofocus aria-invalid={!!error} />
        </Field>
      </form>
    </Modal>
  );
}

/* =========================================================== RESULT */

/** ResultModal — fim de partida: pontuação grande e detalhamento (substitui CompletionModal/ModalPoints). */
export function ResultModal({
  open,
  onClose,
  title = "Fim de partida!",
  score,
  unit = "pts",
  subtitle,
  breakdown,
  record,
  actions,
  inline,
}: {
  inline?: boolean;
  open: boolean;
  onClose: () => void;
  title?: string;
  score: number;
  unit?: string;
  subtitle?: ReactNode;
  breakdown?: { label: string; value: ReactNode }[];
  /** Mostra o selo "Novo recorde". */
  record?: boolean;
  actions?: ReactNode;
}) {
  return (
    <Modal inline={inline} open={open} onClose={onClose} title={title} kicker="Resultado" size="sm" footer={actions}>
      <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden border-b border-base-300 bg-primary px-6 py-8 text-center text-primary-content stage-texture stage-grid-on-color">
        {record && (
          <span className="absolute right-4 top-4">
            <Starburst size={70} tone="accent" motion="spin">
              <span className="text-[11px] leading-none">
                NOVO
                <br />
                RECORDE
              </span>
            </Starburst>
          </span>
        )}
        <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-80">Pontuação</p>
        <p className="mt-1 text-7xl font-black leading-none tracking-tight tabular-nums">
          {score}
          <span className="ml-1 text-2xl opacity-80">{unit}</span>
        </p>
        {subtitle && <p className="mt-3 text-sm opacity-85">{subtitle}</p>}
      </div>
      {breakdown && (
        <dl className="divide-y divide-dashed divide-base-300">
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-baseline justify-between gap-4 py-2 text-sm">
              <dt className="text-base-content/65">{b.label}</dt>
              <dd className="font-black tabular-nums">{b.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  );
}

/* ============================================================ STEPS */

export type Step = { title: string; description?: string; content: ReactNode; canNext?: boolean };

/** StepsModal — assistente em etapas (criar projeto, configurar evento, onboarding). */
export function StepsModal({
  open,
  onClose,
  onFinish,
  title,
  steps,
  finishLabel = "Concluir",
  inline,
  initialStep = 0,
}: {
  inline?: boolean;
  /** Etapa mostrada ao abrir (útil na vitrine). */
  initialStep?: number;
  open: boolean;
  onClose: () => void;
  onFinish: () => void | Promise<void>;
  title: string;
  steps: Step[];
  finishLabel?: string;
}) {
  const [i, setI] = useState(initialStep);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open && !inline) setI(initialStep);
  }, [open, inline, initialStep]);
  const step = steps[i];
  const last = i === steps.length - 1;

  const next = async () => {
    if (!last) return setI(i + 1);
    try {
      setBusy(true);
      await onFinish();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      inline={inline}
      open={open}
      onClose={onClose}
      title={title}
      kicker={`Etapa ${i + 1} de ${steps.length}`}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button tone="ghost" onClick={() => setI(i - 1)} disabled={i === 0} iconLeft={<ArrowLeft size={16} />}>
            Voltar
          </Button>
          <Button onClick={next} loading={busy} disabled={step?.canNext === false} iconRight={!last ? <ArrowRight size={16} /> : undefined}>
            {last ? finishLabel : "Continuar"}
          </Button>
        </div>
      }
    >
      <ol className="mb-6 flex gap-2" aria-label="Etapas">
        {steps.map((s, k) => (
          <li key={s.title} className="flex-1">
            <span
              className={cn(
                "block h-1.5 rounded-full transition-colors duration-300",
                k < i ? "bg-success" : k === i ? "bg-primary" : "bg-base-300",
              )}
            />
            <span className={cn("mt-2 hidden text-xs font-semibold sm:block", k === i ? "text-base-content" : "text-base-content/45")}>
              {String(k + 1).padStart(2, "0")} · {s.title}
            </span>
          </li>
        ))}
      </ol>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
          <h3 className="text-lg font-black tracking-tight">{step?.title}</h3>
          {step?.description && <p className="mt-1 text-sm text-base-content/60">{step.description}</p>}
          <div className="mt-5">{step?.content}</div>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}

/* ============================================================ SHEET */

/**
 * Sheet — painel que entra pela lateral (desktop) ou por baixo (celular).
 * Bom para detalhes de equipe, filtros e edição rápida sem sair da tela.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  side = "right",
  inline,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: "right" | "left";
  /** Desenha parado na página (vitrine/documentação). */
  inline?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogBehavior(open && !inline, onClose, panelRef);
  const fromX = side === "right" ? "100%" : "-100%";
  const body = (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-base-300 px-6 py-5">
        <div>
          <h2 id={titleId} className="text-xl font-black tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-base-content/60">{description}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar" className="btn btn-circle btn-ghost btn-sm rounded-full! hover:rotate-90">
          <X size={18} />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
      {footer && <footer className="flex justify-end gap-3 border-t border-base-300 px-6 py-4">{footer}</footer>}
    </>
  );
  const panelCls = (extra: string) =>
    cn(
      "stage-paper flex w-full max-w-md flex-col bg-base-100 outline-none",
      side === "right" ? "rounded-tl-[2rem] border-l border-base-300" : "rounded-br-[2rem] border-r border-base-300",
      extra,
    );

  if (inline)
    return (
      <aside role="group" aria-labelledby={titleId} className={panelCls("stage-shadow-lg border-y")}>
        {body}
      </aside>
    );

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: fromX }}
            animate={{ x: 0 }}
            exit={{ x: fromX }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className={panelCls(cn("absolute inset-y-0 shadow-2xl", side === "right" ? "right-0" : "left-0"))}
          >
            {body}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ======================================================= useConfirm */

type ConfirmOptions = Omit<ConfirmModalProps, "open" | "onClose" | "onConfirm">;
const ConfirmCtx = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);

/** Coloque uma vez no layout; depois `const confirm = useConfirm()`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((res) => (resolver.current = res));
  }, []);

  const finish = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <ConfirmModal
        open={!!opts}
        title={opts?.title ?? ""}
        {...(opts ?? {})}
        onClose={() => finish(false)}
        onConfirm={() => finish(true)}
      />
    </ConfirmCtx.Provider>
  );
}

/** `if (await confirm({ title: "Excluir teste?" })) { … }` */
export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm deve ser usado dentro do <ConfirmProvider>");
  return ctx;
}

