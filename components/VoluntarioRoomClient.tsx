// components/VoluntarioRoomClient.tsx
"use client";

import { useState } from "react";
import AvaliacaoRounds from "@/components/AvaRound";
import RubricaForm from "./RubricaForm";
import Button from "./ui/Button";

export default function VoluntarioRoomClient({
  codigoSala,
}: {
  codigoSala: string;
}) {
  const [view, setView] = useState<"default" | "round" | "sala">("default");

  const renderContent = () => {
    switch (view) {
      case "round":
        return (
          <>
            <button
              className="mt-4 bg-white text-primary-dark px-4 py-2 rounded"
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
              className="mt-4 bg-white text-primary-dark px-4 py-2 rounded"
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
          <div className="flex gap-8 items-center">
            <Button text="Avaliar Round" onClick={() => setView("round")} />
            <Button text="Avaliar Sala" onClick={() => setView("sala")} />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col itens-center justify-center p-6">
      <h1 className="text-2xl font-bold text-primary-dark dark:text-white text-center">
        Sala {codigoSala} - Acesso Voluntário
      </h1>
      <p className="mt-2 text-gray-600 text-center">
        Selecione a opção de avaliação desejada.
      </p>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}
