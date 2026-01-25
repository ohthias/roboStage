"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface ModalInputRef {
  open: (initialValue: string, onConfirm: (value: string) => void) => void;
}

interface ModalInputProps {
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ModalInput = forwardRef<ModalInputRef, ModalInputProps>(
  (
    {
      title,
      description,
      placeholder = "Digite aqui...",
      confirmLabel = "Salvar",
      cancelLabel = "Cancelar",
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    let confirmFn: ((value: string) => void) | null = null;

    useImperativeHandle(ref, () => ({
      open: (initialValue: string, onConfirm: (value: string) => void) => {
        if (inputRef.current) inputRef.current.value = initialValue;
        confirmFn = onConfirm;
        modalRef.current?.showModal();
      },
    }));

    const closeModal = () => modalRef.current?.close();

    const handleConfirm = () => {
      if (confirmFn && inputRef.current) {
        confirmFn(inputRef.current.value);
      }
      closeModal();
    };

    return (
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          {description && <p className="py-4">{description}</p>}
          <div className="modal-action flex flex-col sm:flex-row gap-2 w-full">
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              className="input input-bordered w-full"
            />
            <div className="flex justify-end gap-2 w-full sm:w-auto">
              <button className="btn" onClick={closeModal}>
                {cancelLabel}
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    );
  }
);

export default ModalInput;
