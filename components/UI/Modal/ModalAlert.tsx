"use client";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface ModalAlertRef {
  open: (message: string) => void;
}

interface Props {
  title?: string;
  confirmLabel?: string;
}

const ModalAlert = forwardRef<ModalAlertRef, Props>(
  ({ title = "Sucesso", confirmLabel = "OK" }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    useImperativeHandle(ref, () => ({
      open(msg: string) {
        setMessage(msg);
        setIsOpen(true);
      },
    }));

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-md p-6">
          <h2 className="text-lg font-bold text-primary mb-4">{title}</h2>
          <p className="text-base-content mb-6">{message}</p>

          <div className="flex justify-end">
            <button
              className="btn btn-primary"
              onClick={() => setIsOpen(false)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ModalAlert.displayName = "ModalAlert";
export default ModalAlert;
