import React, { useState } from "react";

interface Props {
  codigo_sala: string;
}

export default function CardDeliberationRound({ codigo_sala }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) hideModal();
  };

  return (
    <>
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
          </div>
        </div>
      )}
      <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">
            Deliberação dos Resultados
          </h2>
          <p className="text-sm text-gray-500">
            Modo de deliberação: <strong>Automático</strong>
          </p>
          <i className="text-xs text-gray-500 line-clamp-2">
            Para alterar modo de deliberação, ative nas configurações, no painel
            de Geração de Cronograma & Outros
          </i>
        </div>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-primary-dark hover:text-white transition-colors cursor-pointer w-full"
          onClick={showModal}
        >
          Visualizar
        </button>
      </div>
    </>
  );
}
