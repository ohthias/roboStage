"use client";

import type { ReactNode } from "react";
import { ToolConfirmDialog, ToolDialog } from "@/components/stage";

/**
 * Modal do dashboard — agora o `ToolDialog` da Stage UI (kit ferramenta):
 * foco preso, Esc, trava de rolagem, devolve o foco ao fechar.
 *
 * Mesma API de antes, então todas as telas que usam `Modal` mudam juntas.
 * Os tamanhos continuam os mesmos (sm = 24rem, md = 32rem, lg = 42rem).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Opcional: barra de ações fixa no rodapé (estilo Stage UI). */
  footer?: ReactNode;
}) {
  return (
    <ToolDialog open={open} onClose={onClose} title={title} description={description} size={size} footer={footer}>
      <div className="stage-modal-body pb-2 text-sm">{children}</div>
    </ToolDialog>
  );
}

/** Confirmação destrutiva (substitui `window.confirm`): o `ToolConfirmDialog` da Stage UI. */
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
    <ToolConfirmDialog
      open={open}
      title={title}
      message={description}
      confirmLabel={confirmLabel}
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
