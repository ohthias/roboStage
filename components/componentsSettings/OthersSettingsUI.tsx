"use client";
import React, { useState } from "react";
import { useEffect } from "react";

interface Props {
  codigoSala: string;
}

export default function OthersSettingsUI({ codigoSala }: Props) {
  interface Premio {
    nome: string;
    descricao: string;
  }

  const [premios, setPremios] = useState<Premio[]>([]);
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

        setPremios(
          Array.isArray(data.dados_extras.premios)
            ? data.dados_extras.premios
            : [""]
        );
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
      dados_extras: {
        premios: premios.map((premio) => ({
          nome: premio.nome || "",
          descricao: premio.descricao || "",
        }))
      },
    };

    console.log("Payload enviado:", payload);

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

      alert("Configurações extras atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar configurações extras:", error);
      alert(
        "Não foi possível atualizar as configurações extras. Tente novamente."
      );
    }
  };

  const handleAdicionarPremio = () => {
    setPremios((prev) => [...prev, { nome: "", descricao: "" }]);
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
          <div className="flex flex-col gap-2 mb-2">
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
            <p className="text-sm text-gray-400">
              Essa função ativa a deliberação de avaliações e rounds, permitindo
              que os voluntários deliberem sobre os resultados.
            </p>
          </div>
          <div className="flex flex-col gap-2 mb-2">
            <label className="flex flex-row items-center gap-2 text-md text-gray-700">
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
            <p className="text-sm text-gray-400">
              Essa função ativa para os voluntários atribuirem discursos e
              prêmios às equipes participantes.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 rounded-lg p-6 px-4 bg-light-smoke">
            <div>
              <span className="font-semibold text-secondary text-lg">
                Prêmios do Evento:
              </span>
              <p className="text-sm text-gray-500">
                Adicione os prêmios que serão entregues aos ganhadores do
                evento.
              </p>
            </div>
            {premios.map((premio: Premio, idx: number) => (
              <div
                key={idx}
                className={`flex justify-around items-end gap-2 text-md text-gray-500 transition-all duration-1000 ease-out mb-2 p-2 rounded border border-gray-300 hover:bg-gray-100`}
              >
                <label className="flex-1">
                  Nome do Premio:
                  <input
                    type="text"
                    className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-secondary-light focus:border-secondary-dark transition-colors"
                    value={premio.nome}
                    onChange={(e) => {
                      const newPremios = [...premios];
                      newPremios[idx].nome = e.target.value;
                      setPremios(newPremios);
                    }}
                    placeholder={`Prêmio ${idx + 1}`}
                  />
                </label>
                <label className="flex-1">
                  Descrição do Premio:
                  <input
                    type="text"
                    className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-secondary-light focus:border-secondary-dark transition-colors"
                    value={premio.descricao}
                    onChange={(e) => {
                      const newPremios = [...premios];
                      newPremios[idx].descricao = e.target.value;
                      setPremios(newPremios);
                    }}
                    placeholder={`Descrição do prêmio ${idx + 1}`}
                  />
                </label>
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
