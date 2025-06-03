"use client";
import { useState } from "react";

export default function OthersSettingsUI() {
  const [gerarPpt, setGerarPpt] = useState(false);
  const [premios, setPremios] = useState<string[]>([""]);
  const handleAdicionarPremio = () => {
    setPremios((prev: any) => [...prev, ""]);
  };
  const handleRemoverPremio = (index: number) => {
    setPremios((prev: any[]) =>
      prev.filter((_: any, idx: number) => idx !== index)
    );
  };
  const handlePremioChange = (index: number, value: string) => {
    setPremios((prev: any[]) =>
      prev.map((premio: any, idx: number) => (idx === index ? value : premio))
    );
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
          Sistema de rounds
        </h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
            />
            Habilitar semi-finais e finais
          </label>
        </div>
      </div>
      <hr className="my-4 border-gray-300" />
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
          Geração de cronograma & outros
        </h2>
        <p className="mb-4 text-gray-500">
          Habilite a geração automática do cronograma do evento. O sistema
          criará um cronograma baseado nas configurações de arenas, salas de
          avaliação e outros parâmetros definidos.
        </p>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
            />
            Habilitar geração automática de cronograma
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
            />
            Habilitar deliberação de avaliações/rounds
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
            />
            Habilitar discursos de premiação
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
              checked={gerarPpt}
              onChange={() => setGerarPpt((v: any) => !v)}
            />
            Gerar <i>.ppt</i> de ganhadores do evento
          </label>
          {gerarPpt && (
            <div className="flex flex-col gap-2 border rounded p-4 bg-gray-50">
              <span className="font-semibold mb-2">Prêmios do Evento:</span>
              {premios.map((premio: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded p-2 w-full"
                    value={premio}
                    onChange={(e) => handlePremioChange(idx, e.target.value)}
                    placeholder={`Prêmio ${idx + 1}`}
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 px-2"
                    onClick={() => handleRemoverPremio(idx)}
                    disabled={premios.length === 1}
                    title="Remover prêmio"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-3 py-1 rounded bg-primary-light text-white hover:bg-primary-dark transition-colors"
                onClick={handleAdicionarPremio}
              >
                Adicionar prêmio
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
