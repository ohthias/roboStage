"use client";

import { useState } from "react";

export default function DeleteModal({
  textBox = "este item",
  onConfirm,
  onDelete
}: {
  textBox?: string;
  onConfirm?: (email: any) => boolean | Promise<boolean>;
  onDelete?: (email: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showModal = () => setIsOpen(true);
  const hideModal = () => {
    setIsOpen(false);
    setShowEmailInput(false);
    setEmail("");
    setIsLoading(false);
    setMessage("");
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) hideModal();
  };

  const handleConfirm = async () => {
    if (!email) return;

    setIsLoading(true);
    setMessage("");

    try {
      if (onConfirm) {
        const result = await onConfirm(email);
        if (result === false) {
          setMessage("Não foi possível confirmar. Tente novamente.");
          setIsLoading(false);
          return;
        }
      }
      if (onDelete) {
        await onDelete(email);
      }
      setMessage("Confirmação enviada com sucesso!");
      setIsLoading(false);
    } catch (error) {
      setMessage("Não foi possível confirmar. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] overflow-auto"
          onClick={handleOutsideClick}
        >
          <div className="fixed inset-0 w-full h-full bg-[rgba(0,0,0,0.5)]" />

          <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 relative z-10">
            {/* Fechar modal */}
            <svg
              onClick={hideModal}
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
              viewBox="0 0 320.591 320.591"
            >
              <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" />
              <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" />
            </svg>

            {/* Conteúdo do modal */}
            <div className="my-10 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 fill-primary inline"
                viewBox="0 0 286.054 286.054"
              >
                <path
                  fill="#e2574c"
                  d="M143.027 0C64.04 0 0 64.04 0 143.027c0 78.996 64.04 143.027 143.027 143.027 78.996 0 143.027-64.022 143.027-143.027C286.054 64.04 222.022 0 143.027 0zm0 259.236c-64.183 0-116.209-52.026-116.209-116.209S78.844 26.818 143.027 26.818s116.209 52.026 116.209 116.209-52.026 116.209-116.209 116.209zm.009-196.51c-10.244 0-17.995 5.346-17.995 13.981v79.201c0 8.644 7.75 13.972 17.995 13.972 9.994 0 17.995-5.551 17.995-13.972V76.707c-.001-8.43-8.001-13.981-17.995-13.981zm0 124.997c-9.842 0-17.852 8.01-17.852 17.86 0 9.833 8.01 17.843 17.852 17.843s17.843-8.01 17.843-17.843c-.001-9.851-8.001-17.86-17.843-17.86z"
                />
              </svg>

              <h4 className="text-lg text-slate-900 font-semibold mt-6">
                Você deseja deletar isso permanentemente?
              </h4>
              <p className="text-sm text-slate-500 mt-2">
                Deletar o(a) {textBox}, excluirá todos os dados associados dentro do sistema.
              </p>
            </div>

            <div className="flex max-sm:flex-col gap-4">
              {!showEmailInput ? (
                <>
                  <button
                    type="button"
                    onClick={hideModal}
                    className="px-2 py-2.5 rounded-lg w-full text-sm font-medium bg-gray-200 hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-2 py-2.5 rounded-lg w-full text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                    onClick={() => setShowEmailInput(true)}
                  >
                    Sim
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Digite seu email para confirmar"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-dark transition-colors w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={hideModal}
                      className="px-2 py-2.5 rounded-lg w-full text-sm font-medium bg-gray-200 hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isLoading || !email}
                      onClick={handleConfirm}
                      className={`px-2 py-2.5 rounded-lg w-full text-sm font-medium text-white bg-secondary hover:bg-primary-dark flex justify-center items-center transition-colors ${
                        (!email || isLoading) &&
                        "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      ) : (
                        "Enviar confirmação"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
          <div className="bg-light-smoke rounded-xl shadow-lg p-8 text-center flex flex-col items-center gap-4">
            <span className="text-gray-900 text-lg font-semibold">
              {message}
            </span>
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
              onClick={() => window.location.reload()}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={showModal}
        className="mx-auto block px-4 py-2 rounded-lg text-sm font-medium bg-none border border-2 border-primary-dark text-primary-dark hover:bg-primary-dark transition-colors cursor-pointer hover:text-white"
      >
        Deletar {textBox}
      </button>
    </div>
  );
}
