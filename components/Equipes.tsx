"use client";
import { SetStateAction, useEffect, useState } from "react";
import Mensage from "./Mensage";
import EditModal from "./ui/EditModal";

interface EquipesProps {
  codigoSala: string;
  onAtualizacao?: (mensagem: string) => void;
}

type Equipe = {
  nome_equipe: string;
  round1: number;
  round2: number;
  round3: number;
};

export default function Equipes({ codigoSala, onAtualizacao }: EquipesProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [nome_equipe, setNomeEquipe] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [indexEquipeEditando, setIndexEquipeEditando] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  type TipoMensagem = "sucesso" | "erro" | "aviso" | "";
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const carregarEquipes = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get/`);
        const data = await res.json();
        setEquipes(data.teams || []);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
        setMensagem("Erro ao carregar as equipes.");
        setTipoMensagem("erro");
      }
    };

    carregarEquipes();
  }, [codigoSala]);

  const adicionarEquipe = async () => {
    if (!nome_equipe.trim()) {
      setMensagem("Digite o nome da equipe!");
      setTipoMensagem("aviso");
      return;
    }

    const novaEquipe = {
      nome_equipe,
      round1: -1,
      round2: -1,
      round3: -1,
    };

    const novasEquipes = [...equipes, novaEquipe];
    setEquipes(novasEquipes);
    setNomeEquipe("");
    setCarregando(true);

    try {
      const res = await fetch(`/rooms/${codigoSala}/post/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao salvar equipes");

      setMensagem("Equipe salva com sucesso!");
      setTipoMensagem("sucesso");
      onAtualizacao?.(`Equipe "${nome_equipe}" adicionada.`);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar equipe!");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  };

  const removerEquipe = async (index: number) => {
    const novasEquipes = equipes.filter((_, i) => i !== index);
    setEquipes(novasEquipes);
    setCarregando(true);

    try {
      const res = await fetch(`/rooms/${codigoSala}/post/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar equipes");

      setMensagem("Equipe removida com sucesso.");
      setTipoMensagem("sucesso");
    } catch (error) {
      console.error("Erro ao remover equipe:", error);
      setMensagem("Erro ao remover equipe.");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  };

  const editarEquipe = (index: SetStateAction<number | null>) => {
    setIndexEquipeEditando(index);
    setModalOpen(true);
  };

  const alterarNomeEquipe = async (index: number, novoNome: string) => {
    const novasEquipes = [...equipes];
    novasEquipes[index].nome_equipe = novoNome;

    setEquipes(novasEquipes);
    setCarregando(true);

    try {
      const res = await fetch(`/rooms/${codigoSala}/post/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao salvar alteração");

      setMensagem("Equipe renomeada com sucesso!");
      setTipoMensagem("sucesso");
    } catch (error) {
      console.error("Erro ao editar equipe:", error);
      setMensagem("Erro ao renomear equipe.");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  };

  const handleInputKeyDown = (e: { key: string; }) => {
    if (e.key === "Enter") {
      adicionarEquipe();
    }
  };

  useEffect(() => {
    const carregarEquipes = async () => {
      setCarregando(true);
      try {
        const res = await fetch(`/rooms/${codigoSala}/get/`);
        const data = await res.json();
        setEquipes(data.teams || []);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
        setMensagem("Erro ao carregar as equipes.");
        setTipoMensagem("erro");
      } finally {
        setCarregando(false);
      }
    };

    carregarEquipes();
  }, [codigoSala]);

  return (
    <>
      <Mensage
        tipo={tipoMensagem}
        mensagem={mensagem}
        onClose={() => {
          setMensagem("");
          setTipoMensagem("");
        }}
      />
      <div className="flex flex-row gap-4 mb-4">
        <input
          type="text"
          value={nome_equipe}
          placeholder="Nome da Equipe"
          className="p-2 border border-gray-300 rounded w-full"
          onChange={(e) => setNomeEquipe(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={carregando}
        />
        <button
          onClick={adicionarEquipe}
          disabled={carregando}
          className="w-50 bg-primary text-white p-2 rounded hover:bg-primary-dark transition duration-200 cursor-pointer"
        >
          {carregando ? "Salvando..." : "Adicionar Equipe"}
        </button>
      </div>

      <div className="overflow-auto flex-1">
        {carregando ? (
          <div className="flex justify-center items-center flex-col p-8 gap-4">
            <span className="text-primary font-semibold">Carregando...</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 animate-[spin_0.8s_linear_infinite] fill-primary-light block mx-auto"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"
                data-original="#000000"
              />
            </svg>
          </div>
        ) : (
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead className="bg-primary text-white whitespace-nowrap text-left">
              <tr>
                <th className="p-2 w-16 text-center">Nº</th>
                <th className="p-2">Equipe</th>
                <th className="p-2 w-32 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipes.length == 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 p-4">
                    Nenhuma equipe cadastrada.
                  </td>
                </tr>
              ) : (
                equipes.map((eq, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="text-center text-gray-400 p-2">{idx + 1}</td>
                    <td className="p-2">{eq.nome_equipe}</td>
                    <td className="text-center p-2 flex gap-2 justify-center">
                      <button
                        onClick={() => removerEquipe(idx)}
                        disabled={carregando}
                        className="bg-light text-primary-dark px-2 rounded hover:bg-primary-light hover:text-white transition duration-200 cursor-pointer"
                      >
                        Remover
                      </button>
                      <button
                        onClick={() => editarEquipe(idx)}
                        disabled={carregando}
                        className="bg-light text-primary-dark px-2 rounded hover:bg-primary-light hover:text-white transition duration-200 cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {modalOpen && indexEquipeEditando !== null && (
          <EditModal
            onClose={() => setModalOpen(false)}
            onSave={(novoNome) => {
              alterarNomeEquipe(indexEquipeEditando, novoNome);
              setModalOpen(false);
            }}
            descriptionModal="Digite o novo nome da equipe:"
            nameModal="Renomear equipe"
            initialValue={equipes[indexEquipeEditando].nome_equipe}
          />
        )}
      </div>
    </>
  );
}
