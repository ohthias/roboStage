import React from "react";

const AccessModal = ({ visitante, voluntario, admin, onClose }) => {
  return (
    <div
      class="w-full h-screen fixed inset-0 z-50 flex itens-center justify-center bg-[#f3f3f35b] backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div class="w-full max-w-md h-max rounded-lg bg-white p-6 shadow-lg">
        <div class="flex items-start justify-between">
          <h2
            id="modalTitle"
            class="text-xl font-bold text-primary sm:text-2xl"
          >
            Códigos de Acesso
          </h2>

          <button
            type="button"
            class="-me-4 -mt-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="mt-4">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 text-center font-bold text-base">
                <th className="py-2 px-8 border">Tipo</th>
                <th className="py-2 px-8 border">Código</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                <td className="border py-4 px-8 text-lg">Visitante</td>
                <td className="border py-4 px-8 text-lg">{visitante}</td>
              </tr>
              <tr className="text-center">
                <td className="border py-4 px-8 text-lg">Voluntário</td>
                <td className="border py-4 px-8 text-lg">{voluntario}</td>
              </tr>
              <tr className="text-center">
                <td className="border py-4 px-8 text-lg">Admin</td>
                <td className="border py-4 px-8 text-lg">{admin}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessModal;
