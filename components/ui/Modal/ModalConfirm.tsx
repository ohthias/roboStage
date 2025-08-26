"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface ModalConfirmRef {
  open: (message: string, onConfirm: () => void) => void;
}

interface ModalConfirmProps {
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ModalConfirm = forwardRef<ModalConfirmRef, ModalConfirmProps>(
  ({ title, confirmLabel = "Confirmar", cancelLabel = "Cancelar" }, ref) => {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    let confirmFn: (() => void) | null = null;

    useImperativeHandle(ref, () => ({
      open: (message: string, onConfirm: () => void) => {
        if (messageRef.current) messageRef.current.textContent = message;
        confirmFn = onConfirm;
        modalRef.current?.showModal();
      },
    }));

    const closeModal = () => modalRef.current?.close();

    const handleConfirm = () => {
      if (confirmFn) confirmFn();
      closeModal();
    };

    return (
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          <p ref={messageRef} className="py-4" />
          <div className="modal-action flex gap-2">
            <button className="btn" onClick={closeModal}>
              {cancelLabel}
            </button>
            <button className="btn btn-error" onClick={handleConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    );
  }
);

export default ModalConfirm;
