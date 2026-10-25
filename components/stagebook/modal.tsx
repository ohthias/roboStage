"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";

/** Modal do daisyUI controlado por estado, com Esc e clique fora para fechar. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const width = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <dialog className="modal modal-open" aria-labelledby="team-modal-title">
      <div className={`modal-box w-full ${width}`}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
        <h3 id="team-modal-title" className="text-lg font-semibold">
          {title}
        </h3>
        {description && <p className="mt-1 text-sm text-base-content/60">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Fechar" />
    </dialog>
  );
}

/** Confirmação destrutiva (substitui `window.confirm`). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={pending ? () => {} : onCancel} title={title} size="sm">
      <p className="text-sm text-base-content/70">{description}</p>
      <div className="modal-action">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={pending}>
          Cancelar
        </button>
        <button type="button" className="btn btn-error btn-sm" onClick={onConfirm} disabled={pending}>
          {pending && <Loader2 size={14} className="animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
