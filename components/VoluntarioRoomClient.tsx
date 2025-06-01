// components/VoluntarioRoomClient.tsx
"use client";

import { useState } from "react";
import AvaliacaoRounds from "@/components/AvaRound";
import Button from "./ui/Button";

export default function VoluntarioRoomClient({
  codigoSala,
}: {
  codigoSala: string;
}) {
  const [view, setView] = useState<"default" | "round">("default");

  const renderContent = () => {
    switch (view) {
      case "round":
        return (
          <>
            <button
              className="mt-4 bg-white text-primary-dark px-4 py-2 rounded cursor-pointer hover:bg-light-smoke transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
              onClick={() => setView("default")}
            >
              Voltar
            </button>
            <AvaliacaoRounds codigo_sala={codigoSala} />
          </>
        );
      default:
        return (
          <div className="flex gap-8 items-center">
            <Button text="Avaliar Round" onClick={() => setView("round")} />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {view === "default" && (
        <>
          <h1 className="text-2xl font-bold text-primary-dark text-center">
            Evento {codigoSala} - Acesso Voluntário
          </h1>
          <p className="mt-2 text-gray-600 text-center">
            Selecione a opção de avaliação desejada.
          </p>
        </>
      )}
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}
