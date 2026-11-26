"use client";

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
  },
  "restore-defaults": {
    title: "Restaurar padrão?",
    body:
      "Isso vai desmarcar o progresso e também remover os itens e checklists personalizados criados neste dispositivo.",
    confirmLabel: "Restaurar",
  },
  "mark-all": {
    title: "Marcar tudo como conferido?",
    body: "Todos os itens deste modo serão marcados como concluídos.",
    confirmLabel: "Marcar tudo",
  },
} as const;

export default function ResetProgressModal({
  open,
  variant,
  onClose,
  onConfirm,
}: ResetProgressModalProps) {
  if (!open) return null;

  const copy = COPY[variant];

  return (
    <dialog className="modal modal-open" aria-labelledby="reset-progress-title">
      <div className="modal-box">
        <h3 id="reset-progress-title" className="text-lg font-bold">
          {copy.title}
        </h3>
        <p className="mt-2 text-sm text-base-content/70">{copy.body}</p>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {copy.confirmLabel}
          </button>
        </div>
      </div>
      <button type="button" aria-label="Fechar" className="modal-backdrop" onClick={onClose}>
        close
      </button>
    </dialog>
  );
}
