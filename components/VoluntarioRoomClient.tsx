// components/VoluntarioRoomClient.tsx
"use client";

import { useState } from "react";
import AvaliacaoRounds from "@/components/AvaRound";
import RubricaForm from "./RubricaForm";

export default function VoluntarioRoomClient({ codigoSala }: { codigoSala: string }) {
  const [view, setView] = useState<"default" | "round" | "sala">("default");

  const renderContent = () => {
    switch (view) {
      case "round":
        return (
          <>
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setView("default")}
            >
              Voltar
            </button>
            <AvaliacaoRounds codigo_sala={codigoSala} />
          </>
        );
      case "sala":
        return (
          <>
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setView("default")}
            >
              Voltar
            </button>
            <div className="mt-4">
              <RubricaForm />
            </div>
          </>
        );
      default:
        return (
          <>
            <button
              className="mt-4 bg-pink-500 text-white px-4 py-2 rounded"
              onClick={() => setView("round")}
            >
              Avaliar Round
            </button>
            <button
              className="mt-4 ml-2 bg-pink-500 text-white px-4 py-2 rounded"
              onClick={() => setView("sala")}
            >
              Avaliar Sala
            </button>
          </>
        );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Sala {codigoSala} - Acesso Voluntário</h1>
      <p className="mt-2 text-gray-600">Selecione a opção de avaliação desejada.</p>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}
