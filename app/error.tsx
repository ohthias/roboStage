// app/error.tsx
'use client'; // obrigatório

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-lg shadow-lg p-10">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">Algo deu errado!</h2>
      <p className="mb-6 text-lg text-red-700 bg-red-100 px-4 py-2 rounded">{error.message}</p>
      <button
      onClick={() => reset()}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
      Tentar novamente
      </button>
    </div>
  );
}
