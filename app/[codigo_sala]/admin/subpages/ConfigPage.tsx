"use client";
import RoomDetailsForm from "@/components/RoomDetailsForm";
import FormVoluntarioEvento from "./FormVoluntarioEvento";
import { useState } from "react";

export default function ConfigPage({ codigoSala }: { codigoSala: string }) {
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

  const deletarSala = async () => {
    const confirmacao = confirm(
      "Você tem certeza que deseja deletar este evento?"
    );
    if (!confirmacao || !codigoSala) return;

    const emailAdmin = prompt("Digite seu e-mail para confirmar a exclusão:");

    if (!emailAdmin || !/\S+@\S+\.\S+/.test(emailAdmin)) {
      alert("E-mail inválido. A operação foi cancelada.");
      return;
    }

    try {
      console.log("Deletando sala:", codigoSala, "Email do admin:", emailAdmin);
      const res = await fetch("/rooms/deleteRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigoSala,
          emailAdmin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Erro ao deletar sala: " + (data.error || "Erro desconhecido"));
        return;
      }

      alert("Sala deletada com sucesso! Um e-mail de confirmação foi enviado.");
      window.location.href = "/";
    } catch (error) {
      alert("Erro inesperado ao tentar deletar a sala.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Configurações do Evento</h1>
      <div className="mb-6 flex flex-row gap-4">
        <label className="text-gray-500">
          Código da Sala:
          <input
            type="text"
            value={codigoSala}
            readOnly
            className="border border-gray-300 p-2 rounded w-full mb-4 cursor-not-allowed text-gray-500 text-center"
            placeholder="Código da Sala"
          />
        </label>
        <label className="text-gray-500 w-full">
          Nome do Evento:
          <div className="flex items-center gap-2">
            <input
              type="text"
              value="Nome do Evento"
              readOnly
              className="border border-gray-300 p-2 rounded w-full cursor-not-allowed text-gray-500"
              placeholder="Nome do Evento"
            />
            <button
              type="button"
              className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
              title="Editar Nome"
              // onClick={...} // Adicione a lógica de edição aqui
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0l-9.086 9.086a2 2 0 00-.516.878l-1.414 4.243a1 1 0 001.263 1.263l4.243-1.414a2 2 0 00.878-.516l9.086-9.086a2 2 0 000-2.828zm-2.121 1.415l2.121 2.121-9.086 9.086-2.121-2.121 9.086-9.086z" />
              </svg>
            </button>
          </div>
        </label>
      </div>
      <hr className="my-4 border-gray-300" />
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
          Operação
        </h2>
        <p className="mb-4 text-gray-500">
          Ajuste a operação do evento conforme necessário. Você pode alterar a
          quantidade de arenas, salas de avaliação, horários de início e fim, e
          outras configurações específicas do evento, para geração do cronograma
          e organização das partidas.
        </p>
        <RoomDetailsForm codigoSala={codigoSala} />
      </div>
      <hr className="my-4 border-gray-300" />
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
          Sistema de avaliação
        </h2>
        <p className="mb-4 text-gray-500">
          Configure o sistema de avaliação do evento. Você pode adicionar fichas
          de avaliação, definir critérios e anexar arquivos de avaliação.
          Certifique-se de que as fichas estejam no formato Markdown (.md).
        </p>
        <FormVoluntarioEvento />
      </div>
      <hr className="my-4 border-gray-300" />
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
      <hr className="my-4 border-gray-300" />
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
          Zona de risco
        </h2>
        <p className="mb-4 text-gray-500">
          Qualquer alteração nessa área não tem como se desfazer.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-start flex-col text-gray-500">
              <span className="font-semibold">Deletar Evento</span>
              <p className="text-sm">
                Esta ação é irreversível. Certifique-se de que deseja excluir
                este evento permanentemente.
              </p>
            </div>
            <button
              className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer"
              onClick={deletarSala}
            >
              Deletar Evento
            </button>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-start flex-col text-gray-500">
              <span className="font-semibold">
                Excluir todas as fichas de avaliação
              </span>
              <p className="text-sm">
                Esta ação é irreversível. Certifique-se de que deseja excluir
                todas as fichas de avaliação deste evento permanentemente.
              </p>
            </div>
            <button
              className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer"
              onClick={() => {
                // Implementar lógica de exclusão de fichas de avaliação
                alert(
                  "Funcionalidade de exclusão de fichas de avaliação ainda não implementada."
                );
              }}
            >
              Deletar Fichas
            </button>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-start flex-col text-gray-500">
              <span className="font-semibold">Resetar rounds</span>
              <p className="text-sm">
                Reset todas as rodadas do evento. Esta ação é irreversível e
                removerá todas as informações relacionadas às rodadas.
              </p>
            </div>
            <button className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer">
              Deletar Rounds
            </button>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-start flex-col text-gray-500">
              <span className="font-semibold">Excluir todas as equipes</span>
              <p className="text-sm">
                Esta ação é irreversível. Certifique-se de que deseja excluir
                todas as equipes deste evento permanentemente.
              </p>
            </div>
            <button
              className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer"
              onClick={() => {
                // Implementar lógica de exclusão de equipes
                alert(
                  "Funcionalidade de exclusão de equipes ainda não implementada."
                );
              }}
            >
              Deletar Equipes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
