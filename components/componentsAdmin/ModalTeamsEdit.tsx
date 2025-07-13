import { useState, useEffect, useCallback } from 'react';
import Loader from '@/components/loader';

interface TeamsEditModalProps {
  codigo_sala: string;
  onClose: () => void;
}

interface Equipe {
  nome_equipe: string;
  round1: number;
  round2: number;
  round3: number;
}

export default function TeamsEditModal({ codigo_sala, onClose }: TeamsEditModalProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar equipes ao montar componente
  useEffect(() => {
    const fetchEquipes = async () => {
        setLoading(true);
      try {
        const res = await fetch(`/rooms/${codigo_sala}/get/`);
        if (!res.ok) throw new Error(`(${res.status}) ${res.statusText}`);
        const data = await res.json();
        setEquipes(data.teams || []);
      } catch (error) {
        console.error('Erro ao carregar equipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipes();
  }, [codigo_sala]);

  // Atualizar pontuação
  const atualizarPontuacao = useCallback(
    async (nomeEquipe: string, roundKey: keyof Equipe, pontos: number) => {
      setEquipes((prev) => {
        const updated = prev.map((equipe) =>
          equipe.nome_equipe === nomeEquipe
            ? { ...equipe, [roundKey]: pontos }
            : equipe
        );
        return updated;
      });

      try {
        const res = await fetch(`/rooms/${codigo_sala}/post/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teams: equipes.map((e) =>
              e.nome_equipe === nomeEquipe
                ? { ...e, [roundKey]: pontos }
                : e
            ),
          }),
        });
        if (!res.ok) throw new Error(`(${res.status}) ${res.statusText}`);
        console.log('Pontuação atualizada com sucesso');
      } catch (error) {
        console.error('Erro ao atualizar pontuação:', error);
      }
    },
    [codigo_sala, equipes]
  );

  const rounds: (keyof Equipe)[] = ['round1', 'round2', 'round3'];

  if(loading) {
    return (
        <div
      className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <Loader />
        </div>
        </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h2 id="modalTitle" className="text-xl font-bold text-red-600 sm:text-2xl">
            Editar Pontuação
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="-me-4 -mt-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:outline-none"
            aria-label="Fechar"
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          {equipes.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">Nenhuma equipe encontrada.</p>
          )}

          {equipes.map((equipe) => (
            <div key={equipe.nome_equipe} className="mb-4">
              <h4 className="text-md font-semibold text-zinc-600">{equipe.nome_equipe}</h4>
              <div className="mt-2 flex flex-row gap-2">
                {rounds.map((roundKey, index) => (
                  <div key={roundKey} className="flex flex-col items-start space-x-2">
                    <label htmlFor={`pontuacao-${equipe.nome_equipe}-${roundKey}`} className="text-xs text-left text-gray-600">
                      Round {index + 1}
                    </label>
                    <input
                      type="number"
                      id={`pontuacao-${equipe.nome_equipe}-${roundKey}`}
                      value={equipe[roundKey]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        atualizarPontuacao(equipe.nome_equipe, roundKey, value);
                      }}
                      className="w-20 rounded border border-gray-300 py-1 px-2 text-sm text-zinc-900 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                ))}
              </div>
              <hr className="border-gray-200 mt-4" />
            </div>
          ))}
        </div>

        <footer className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer"
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}