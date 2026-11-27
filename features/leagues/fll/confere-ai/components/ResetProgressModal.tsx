"use client";

import { ToolConfirmDialog } from "@/components/stage";

interface ResetProgressModalProps {
  open: boolean;
  variant: "progress" | "restore-defaults" | "mark-all";
  onClose: () => void;
  onConfirm: () => void;
}

const COPY = {
  progress: {
    title: "Limpar progresso?",
    body: "Todos os itens marcados neste dispositivo serão desmarcados.",
    confirmLabel: "Limpar",
    intent: "danger",
  },
  "restore-defaults": {
    title: "Restaurar padrão?",
    body:
      "Isso vai desmarcar o progresso e também remover os itens e checklists personalizados criados neste dispositivo.",
    confirmLabel: "Restaurar",
    intent: "danger",
  },
  "mark-all": {
    title: "Marcar tudo como conferido?",
    body: "Todos os itens deste modo serão marcados como concluídos.",
    confirmLabel: "Marcar tudo",
    intent: "default",
  },
} as const;

export default function ResetProgressModal({ open, variant, onClose, onConfirm }: ResetProgressModalProps) {
  const copy = COPY[variant];

  return (
    <ToolConfirmDialog
      open={open}
      title={copy.title}
      message={copy.body}
      confirmLabel={copy.confirmLabel}
      intent={copy.intent}
      onCancel={onClose}
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
    />
  );
}
