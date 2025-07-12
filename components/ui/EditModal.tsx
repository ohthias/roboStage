import React from "react";

interface EditModalProps {
  nameModal: string;
  descriptionModal: string;
  onClose: () => void;
  onSave: (novoNome: string) => void;
  initialValue: string;
}

export default function EditModal({
  nameModal,
  descriptionModal,
  onClose,
  onSave,
  initialValue,
}: EditModalProps) {
  const [inputValue, setInputValue] = React.useState(initialValue);

  return (
    <div
      className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h2
            id="modalTitle"
            className="text-xl font-bold text-red-600 sm:text-2xl"
          >
            {nameModal}
          </h2>

          <button
            type="button"
            className="-me-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-2">
          <p className="text-pretty text-gray-700">{descriptionModal}</p>

          <label htmlFor="Confirm" className="mt-2 block">
            <span className="text-sm font-medium text-gray-500">
              Clique em "Confirmar" para salvar as alterações.
            </span>
            <input
              type="text"
              id="Confirm"
              className="mt-4 w-full rounded border-2 border-gray-300 shadow py-2 px-4 text-zinc-900 text-lg bg-gray-100 focus:border-red-600 transition outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </label>
        </div>

        <footer className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-gray-300 cursor-pointer"
            onClick={() => onClose()}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 cursor-pointer"
            onClick={() => onSave(inputValue)}
          >
            Confirmar
          </button>
        </footer>
      </div>
    </div>
  );
}
