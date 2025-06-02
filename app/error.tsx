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
    <div className="text-center p-10">
      <h2 className="text-3xl font-semibold">Algo deu errado!</h2>
      <p className="mt-4 text-red-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Tentar novamente
      </button>
    </div>
  );
}
