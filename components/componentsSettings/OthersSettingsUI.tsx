"use client";
import React, { useState } from "react";
import { useEffect } from "react";

interface Props {
  codigoSala: string;
}

export default function OthersSettingsUI({ codigoSala }: Props) {
  const [premios, setPremios] = useState<string[]>([""]);
  const [formDataRounds, setFormDataRounds] = useState({
    check_eventos_rounds: false,
    check_desafio_rounds: false,
    check_gerar_cronograma: false,
    check_deliberacao_resultados: false,
    check_discursos_premiacao: false,
    check_gerar_ppt: false,
  });

  useEffect(() => {
    const buscarConfiguracoes = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/others`);
        if (!res.ok) throw new Error("Erro ao buscar configurações");

        const data = await res.json();
        console.log("Dados recebidos:", data);
        
        setFormDataRounds({
          check_eventos_rounds: data.check_eventos_round ?? false,
          check_desafio_rounds: data.check_desafios_round ?? false,
          check_gerar_cronograma: data.check_gerar_cronograma ?? false,
          check_deliberacao_resultados:
            data.check_deliberacao_resultados ?? false,
          check_discursos_premiacao: data.check_discursos_premiacao ?? false,
          check_gerar_ppt: data.check_gerar_ppt_premiacao ?? false,
        });

        setPremios(Array.isArray(data.dados_extras) ? data.dados_extras : [""]);
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        alert("Não foi possível carregar os dados do banco.");
      }
    };

    buscarConfiguracoes();
  }, [codigoSala]);

  const atualizarSistemaRounds = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const payload = {
      codigoSala,
      check_eventos_rounds: formDataRounds.check_eventos_rounds,
      check_desafio_rounds: formDataRounds.check_desafio_rounds,
    };

    try {
      const res = fetch(`/rooms/${codigoSala}/rounds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      res
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao atualizar sistema de rounds");
          }
          return response.json();
        })
        .then((data) => {
          alert("Sistema de rounds atualizado com sucesso!");
        });
    } catch (error) {
      console.error("Erro ao atualizar sistema de rounds:", error);
      alert("Não foi possível atualizar o sistema de rounds. Tente novamente.");
    }
  };

  const atualizarOtrosSettings = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const payload = {
      codigoSala,
      check_gerar_cronograma: formDataRounds.check_gerar_cronograma,
      check_deliberacao_resultados: formDataRounds.check_deliberacao_resultados,
      check_discursos_premiacao: formDataRounds.check_discursos_premiacao,
      check_gerar_ppt: formDataRounds.check_gerar_ppt,
      dados_extras: `'premios': '${premios.filter((premio) => premio.trim() !== "").join(", ")}'`,
    };

    try {
      const res = await fetch(`/rooms/${codigoSala}/others`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar configurações extras");
      }

      const data = await res.json();
      alert("Configurações extras atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar configurações extras:", error);
      alert(
        "Não foi possível atualizar as configurações extras. Tente novamente."
      );
    }
  };

  const handleAdicionarPremio = () => {
    if (premios.some((p) => p.trim() === "")) {
      alert("Preencha os prêmios existentes antes de adicionar novos.");
      return;
    }
    setPremios((prev) => [...prev, ""]);
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
        <h2 className="text-2xl font-semibold text-primary-dark">
          Sistema de rounds
        </h2>
        <p className="mb-4 text-gray-500">
          Configure o sistema de rounds do evento. Você pode habilitar
          semi-finais e finais, além de desafios de alianças para eventos com
          mais de 8 equipes.
        </p>
        <div className="flex flex-col gap-4 mt-2">
          <form className="w-full flex flex-col gap-2">
            <label className="flex flex-row gap-2 text-md text-gray-500 items-center">
              <input
                type="checkbox"
                className="accent-primary h-4 w-4 rounded border-gray-300"
                checked={formDataRounds.check_eventos_rounds}
                onChange={() =>
                  setFormDataRounds((prev) => ({
                    ...prev,
                    check_eventos_rounds: !prev.check_eventos_rounds,
                  }))
                }
                title="Habilitar semi-finais e finais"
              />
              Habilitar semi-finais e finais
            </label>
            <label className="flex flex-row gap-2 text-md text-gray-500 items-center">
              <input
                type="checkbox"
                className="accent-primary h-4 w-4 rounded border-gray-300"
                checked={formDataRounds.check_desafio_rounds}
                onChange={() =>
                  setFormDataRounds((prev) => ({
                    ...prev,
                    check_desafio_rounds: !prev.check_desafio_rounds,
                  }))
                }
                title="Habilitar desafio de alianças"
              />
              Habilitar desafio de alianças{" "}
              <i>(para eventos com mais de 8 equipes)</i>
            </label>
            <button
              type="button"
              className="mt-2 ml-auto px-3 py-1 rounded bg-primary-light text-white hover:bg-primary-dark transition-colors cursor-pointer"
              onClick={atualizarSistemaRounds}
              title="Salvar configurações do sistema de rounds"
            >
              Salvar
            </button>
          </form>
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
        <form className="flex flex-col gap-4">
          <label className="flex flex-row items-center gap-2 text-md text-gray-500">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
              checked={formDataRounds.check_gerar_cronograma}
              onChange={() =>
                setFormDataRounds((prev) => ({
                  ...prev,
                  check_gerar_cronograma: !prev.check_gerar_cronograma,
                }))
              }
            />
            Habilitar geração automática de cronograma
          </label>
          <label className="flex flex-row items-center gap-2 text-md text-gray-500">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
              checked={formDataRounds.check_deliberacao_resultados}
              onChange={() =>
                setFormDataRounds((prev) => ({
                  ...prev,
                  check_deliberacao_resultados:
                    !prev.check_deliberacao_resultados,
                }))
              }
            />
            Habilitar deliberação de avaliações/rounds
          </label>
          <label className="flex flex-row items-center gap-2 text-md text-gray-500">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
              checked={formDataRounds.check_discursos_premiacao}
              onChange={() =>
                setFormDataRounds((prev) => ({
                  ...prev,
                  check_discursos_premiacao: !prev.check_discursos_premiacao,
                }))
              }
            />
            Habilitar discursos de premiação
          </label>
          <label className="flex flex-row items-center gap-2 text-md text-gray-500">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4 rounded border-gray-300"
              checked={formDataRounds.check_gerar_ppt}
              onChange={() =>
                setFormDataRounds((prev) => ({
                  ...prev,
                  check_gerar_ppt: !prev.check_gerar_ppt,
                }))
              }
            />
            Gerar <i className="bg-gray-100 p-1 text-sm px-4 rounded">.ppt</i>{" "}
            de ganhadores do evento
          </label>
          {formDataRounds.check_gerar_ppt && (
            <div className="flex flex-col gap-2 rounded p-6 px-4 pb-4 bg-light-smoke">
              <span className="font-semibold mb-2 text-secondary text-lg">Prêmios do Evento:</span>
              {premios.map((premio: string, idx: number) => (
                <div
                  key={idx}
                  className={`flex flex-row gap-2 text-md text-gray-500 transition-all duration-1000 ease-out
                  ${premios.length - 1 === idx ? "animate-in fade-in-down duration-1000" : ""}
                  `}
                >
                  <input
                  type="text"
                  className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-secondary-light focus:border-secondary-dark transition-colors"
                  value={premio}
                  onChange={(e) => handlePremioChange(idx, e.target.value)}
                  placeholder={`Prêmio ${idx + 1}`}
                  />
                  <button
                  type="button"
                  className="text-gray-500 hover:text-white h-10 w-10 rounded bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
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
                className="mt-2 px-3 py-1 w-max mx-auto rounded bg-secondary text-white hover:bg-secondary-dark transition-colors cursor-pointer"
                onClick={handleAdicionarPremio}
              >
                Adicionar prêmio
              </button>
            </div>
          )}
          <button
            type="button"
            className="mt-4 ml-auto px-3 py-1 rounded bg-primary-light text-white hover:bg-primary-dark transition-colors cursor-pointer"
            onClick={atualizarOtrosSettings}
            title="Salvar configurações de outros ajustes"
          >
            Salvar
          </button>
        </form>
      </div>
    </>
  );
}
