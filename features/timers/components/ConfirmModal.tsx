import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="modal modal-open">
        <div className="modal-box max-w-md rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-warning/20 text-warning border border-warning/30">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-base-content">
              Sair do Timer?
            </h3>
          </div>

          <p className="text-base-content/70 mb-8 text-base leading-relaxed">
            O cronômetro está rodando. Se você voltar ao menu agora, a contagem
            será perdida.
          </p>

          <div className="modal-action justify-end gap-3">
            <button onClick={onCancel} className="btn btn-ghost">
              Cancelar
            </button>
            <button onClick={onConfirm} className="btn btn-error">
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
