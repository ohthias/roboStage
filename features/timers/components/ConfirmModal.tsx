"use client";

import React from "react";
import { ConfirmModal as StageConfirmModal } from "@/components/stage";

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
}

/**
 * Confirmação de saída dos timers — usa o ConfirmModal da Stage UI
 * (Esc fecha, foco preso no diálogo, botão "Cancelar" com foco inicial).
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Sair do timer?",
  message = "O cronômetro está rodando. Se você voltar agora, a contagem será perdida.",
  confirmLabel = "Sair",
}) => (
  <StageConfirmModal
    open={isOpen}
    onClose={onCancel}
    onConfirm={onConfirm}
    title={title}
    message={message}
    intent="warning"
    confirmLabel={confirmLabel}
    cancelLabel="Continuar no timer"
  />
);
