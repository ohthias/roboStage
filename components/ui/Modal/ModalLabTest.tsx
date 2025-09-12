"use client";
import { useRef } from "react";
import LabTestForm from "@/components/LabTest/LabTestForm";

export default function ModalLabTest() {
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const open = () => modalRef.current?.showModal();
  const close = () => modalRef.current?.close();

  return (
    <>
      <button className="btn btn-primary" onClick={open}>
        Novo Teste
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-11/12 max-w-3xl max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold text-xl mb-4 text-primary">
            Criar Novo Teste
          </h3>
          <LabTestForm onSuccess={close} onCancel={close} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Fechar</button>
        </form>
      </dialog>
    </>
  );
}
